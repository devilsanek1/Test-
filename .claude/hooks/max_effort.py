#!/usr/bin/env python3
"""Owner rule: ALL delegated work runs at MAX effort (playbook, Process: "EFFORT IS ALWAYS MAX").

As a Claude Code PreToolUse hook (`.claude/settings.json`), it reads the hook JSON on stdin and denies, with the fix:
- an Agent (or Task) call without effort "max" (a "fork" inherits the session's effort and passes);
- a Workflow run whose script has an agent() call without `effort: 'max'` (the lines are named);
- a helper session (claude-code-remote create_session) whose first prompt is not exactly "/effort max".
Any other input passes. The hook fails open: unreadable input or an unknown tool shape never blocks work.

As a lint: python3 .claude/hooks/max_effort.py --lint context/workflows/*.js
prints every agent() call without `effort: 'max'` and exits 1 if there is any; --fix instead of --lint repairs the
files in place first (sets the options object's effort, adds one, or wraps an options variable), then lints them.
"""
import json
import os
import re
import sys

RULE = 'Owner rule (playbook, Process: "EFFORT IS ALWAYS MAX"): all delegated work runs at max effort.'
REGEX_BEFORE = set('(,=:[!&|?{};+-*%<>~^')
REGEX_KEYWORDS = {'return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'yield', 'await'}


def _template(src, i, kind, strings):
    """Scan a template literal starting at the backtick src[i]; its ${...} parts are code."""
    n, j, simple = len(src), i + 1, True
    kind[i] = 's'
    while j < n:
        c = src[j]
        if c == '\\':
            kind[j:j + 2] = 's' * len(kind[j:j + 2])
            j += 2
            continue
        if c == '`':
            kind[j] = 's'
            if simple:
                strings[i] = (j + 1, src[i + 1:j])
            return j + 1
        if c == '$' and j + 1 < n and src[j + 1] == '{':
            simple = False
            kind[j] = kind[j + 1] = 's'
            end = _code(src, j + 2, kind, strings, in_template=True)
            if end < n:
                kind[end] = 's'
            j = end + 1
            continue
        kind[j] = 's'
        j += 1
    return n


def _code(src, i, kind, strings, in_template=False):
    """Mark code (c), string (s), comment (m) and regex (r) characters from src[i]; record plain string literals."""
    n, depth, prev = len(src), 0, ''
    while i < n:
        ch = src[i]
        if ch in '\'"':
            j = i + 1
            while j < n and src[j] != ch and src[j] != '\n':
                j += 2 if src[j] == '\\' else 1
            end = min(j + 1, n)
            kind[i:end] = 's' * (end - i)
            strings[i] = (end, src[i + 1:j])
            i, prev = end, 'x'
            continue
        if ch == '`':
            i, prev = _template(src, i, kind, strings), 'x'
            continue
        if src.startswith('//', i):
            j = src.find('\n', i)
            j = n if j < 0 else j
            kind[i:j] = 'm' * (j - i)
            i = j
            continue
        if src.startswith('/*', i):
            j = src.find('*/', i + 2)
            j = n if j < 0 else j + 2
            kind[i:j] = 'm' * (j - i)
            i = j
            continue
        if ch == '/' and (prev == '' or prev in REGEX_BEFORE):
            j, in_class = i + 1, False
            while j < n and src[j] != '\n':
                c = src[j]
                if c == '\\':
                    j += 2
                    continue
                if c == '[':
                    in_class = True
                elif c == ']':
                    in_class = False
                elif c == '/' and not in_class:
                    break
                j += 1
            j += 1
            while j < n and src[j].isalpha():
                j += 1
            j = min(j, n)
            kind[i:j] = 'r' * (j - i)
            i, prev = j, 'x'
            continue
        if in_template:
            if ch == '{':
                depth += 1
            elif ch == '}':
                if depth == 0:
                    return i
                depth -= 1
        if ch.isalnum() or ch in '_$':
            j = i
            while j < n and (src[j].isalnum() or src[j] in '_$'):
                j += 1
            prev = '(' if src[i:j] in REGEX_KEYWORDS else 'x'
            i = j
            continue
        if not ch.isspace():
            prev = ch
        i += 1
    return i


def _calls(src):
    """Yield (start, open_paren, close_paren, has_max, kind, strings) for every agent() call in code."""
    kind, strings = ['c'] * len(src), {}
    _code(src, 0, kind, strings)
    for m in re.finditer(r'(?<![\w$])agent\s*\(', src):
        a = m.start()
        if kind[a] != 'c' or re.search(r'function\s*\*?\s*$', src[max(0, a - 24):a]):
            continue
        depth, j, end = 0, m.end() - 1, len(src)
        while j < len(src):
            if kind[j] == 'c':
                if src[j] in '([{':
                    depth += 1
                elif src[j] in ')]}':
                    depth -= 1
                    if depth == 0:
                        end = j
                        break
            j += 1
        ok = False
        for e in re.finditer(r'effort\s*:\s*', src[m.end():end]):
            s, q = m.end() + e.start(), m.end() + e.end()
            if kind[s] == 'c' and q in strings and strings[q][1] == 'max':
                ok = True
                break
        yield a, m.end() - 1, end, ok, kind, strings


def lint(src):
    """Return the 1-based line of every agent() call whose arguments carry no `effort: 'max'` in code."""
    return [src.count('\n', 0, a) + 1 for a, _, _, ok, _, _ in _calls(src) if not ok]


def fix(src):
    """Give every agent() call `effort: 'max'`: set it in the options object, add one, or wrap an options variable."""
    edits = []
    for a, op, cl, ok, kind, strings in _calls(src):
        if ok or cl >= len(src):
            continue
        depth, cuts = 0, []
        for j in range(op, cl):
            if kind[j] == 'c':
                if src[j] in '([{':
                    depth += 1
                elif src[j] in ')]}':
                    depth -= 1
                elif src[j] == ',' and depth == 1:
                    cuts.append(j)
        starts = [op + 1] + [c + 1 for c in cuts]
        last = src[starts[-1]:cl]
        if not last.strip():                      # a trailing comma: the real last argument is the one before
            starts, cl_arg = starts[:-1], cuts[-1]
            last = src[starts[-1]:cl_arg]
        else:
            cl_arg = cl
        lead = len(last) - len(last.lstrip())
        s0 = starts[-1] + lead
        if len(starts) >= 2 and src[s0] == '{':
            obj_end = cl_arg - (len(last) - len(last.rstrip()))
            body = src[s0:obj_end]
            e = None
            for mm in re.finditer(r'effort\s*:\s*', body):
                if kind[s0 + mm.start()] == 'c':
                    e = mm
                    break
            if e:                                 # effort: 'high' / EFFORT -> 'max'
                v0 = s0 + e.end()
                v1 = strings[v0][0] if v0 in strings else v0 + len(re.match(r'[\w$.]*', src[v0:]).group(0))
                edits.append((v0, v1, "'max'"))
            elif re.match(r'\{\s*\}$', body):
                edits.append((s0, obj_end, "{ effort: 'max' }"))
            else:
                edits.append((s0 + 1, s0 + 1, " effort: 'max'," if src[s0 + 1] in ' \n' else " effort: 'max', "))
        elif len(starts) >= 2:                    # an options variable or expression
            obj_end = cl_arg - (len(last) - len(last.rstrip()))
            edits.append((s0, obj_end, '{ ...(' + src[s0:obj_end] + "), effort: 'max' }"))
        else:                                     # the prompt only
            edits.append((cl_arg, cl_arg, ", { effort: 'max' }"))
    for s, e, text in sorted(edits, reverse=True):
        src = src[:s] + text + src[e:]
    return src


def _deny(reason):
    print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PreToolUse', 'permissionDecision': 'deny',
                                             'permissionDecisionReason': reason}}))


def _workflow_sources(tool_input, cwd):
    """Yield (name, source) for the workflow script(s) a Workflow call would run, whatever its field names."""
    for key, val in tool_input.items():
        if not isinstance(val, str) or not val.strip():
            continue
        path = val if os.path.isabs(val) else os.path.join(cwd, val)
        if len(val) < 1024 and re.search(r'\.(m?js|ts)$', val) and os.path.isfile(path):
            with open(path, encoding='utf-8', errors='replace') as f:
                yield val, f.read()
        elif re.search(r'(?<![\w$])agent\s*\(', val):
            yield f'inline {key}', val


def hook():
    try:
        data = json.load(sys.stdin)
    except Exception:
        return 0
    tool, ti = data.get('tool_name') or '', data.get('tool_input') or {}
    if not isinstance(ti, dict):
        return 0
    if tool in ('Agent', 'Task'):
        if ti.get('subagent_type') != 'fork' and ti.get('effort') != 'max':
            _deny(f'{RULE} Re-issue this {tool} call with effort: "max" (only a "fork" may omit it).')
    elif tool == 'Workflow':
        cwd = data.get('cwd') or os.environ.get('CLAUDE_PROJECT_DIR') or os.getcwd()
        problems = []
        for name, src in _workflow_sources(ti, cwd):
            lines = lint(src)
            if lines:
                problems.append(f'{name}: line {", ".join(map(str, lines))}')
        if problems:
            _deny(f"{RULE} Every agent() call in a workflow passes effort: 'max' in its options "
                  f"(e.g. {{ effort: 'max', label: ... }}). Missing in {'; '.join(problems)}. Fix the script, then run it.")
    elif tool.endswith('create_session') and 'claude-code-remote' in tool:
        if str(ti.get('prompt') or '').strip() != '/effort max':
            _deny(f'{RULE} Create a helper session with the first prompt exactly "/effort max" (from a branch whose '
                  '.claude/settings.json turns ultracode on), send its task with send_message, then check '
                  'effort_level: max with get_session.')
    return 0


def main(argv):
    if argv[:1] == ['--fix']:
        for path in argv[1:]:
            with open(path, encoding='utf-8', errors='replace') as f:
                src = f.read()
            out = fix(src)
            if out != src:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(out)
                print(f'{path}: fixed {len(lint(src)) - len(lint(out))} agent() call(s)')
        argv = ['--lint'] + argv[1:]
    if argv[:1] == ['--lint']:
        total = 0
        for path in argv[1:]:
            with open(path, encoding='utf-8', errors='replace') as f:
                lines = lint(f.read())
            if lines:
                total += len(lines)
                print(f"{path}: agent() without effort: 'max' at line {', '.join(map(str, lines))}")
        print(f"{total} agent() call(s) without effort: 'max' in {len(argv) - 1} file(s)" if total else
              f"OK: every agent() call passes effort: 'max' ({len(argv) - 1} file(s))")
        return 1 if total else 0
    return hook()


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))

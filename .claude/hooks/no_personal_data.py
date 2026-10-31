#!/usr/bin/env python3
"""The owner's privacy: never send the owner's email, name or handle to a web service.

On 2026-10-31 workflow agents fetching reference photos put the owner's email (and handle) into the User-Agent of
Wikimedia Commons requests, because the site asks for a contact there. This PreToolUse hook (`.claude/settings.json`,
matcher Bash|WebFetch) stops a network command that carries an email address, or a User-Agent / From header that
carries the owner's handle. The fix it asks for: identify the tool generically (`-A "video-research/1.0"`); if a site
insists on a personal contact, skip that site. The hook fails open: unreadable input never blocks work.
"""
import json
import re
import sys

ALLOWED_EMAILS = {'noreply@anthropic.com'}
NETWORK = re.compile(r'\b(curl|wget|httpie|http|requests\.|urllib|httpx|aiohttp|fetch\(|urlopen)\b|https?://', re.I)
EMAIL = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')
HEADER = re.compile(r'(?:-A\s|--user-agent|user-agent|\bfrom:|["\']from["\']\s*:)[^\n]{0,160}', re.I)
HANDLE = re.compile(r'devilsanek', re.I)
REPO = re.compile(r'(?:github\.com[/:])?devilsanek1/Test-', re.I)  # the repo's own path is not personal data

MESSAGE = ('The owner\'s privacy: never send the owner\'s email, name or handle to a web service (a User-Agent or From '
           'header, a URL, a form, an API body). This call carries {what}. Identify the tool generically instead '
           '(e.g. -A "video-research/1.0"); if a site insists on a personal contact, skip that site.')


def check(text):
    if not text or not NETWORK.search(text):
        return None
    emails = {e for e in EMAIL.findall(text) if e.lower() not in ALLOWED_EMAILS}
    if emails:
        return 'an email address'
    for m in HEADER.finditer(text):
        if HANDLE.search(m.group(0)):
            return 'the owner\'s handle in a request header'
    if HANDLE.search(REPO.sub('', text)):
        return 'the owner\'s handle'
    return None


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        return 0
    tool = data.get('tool_name') or ''
    inp = data.get('tool_input') or {}
    text = inp.get('command') if tool == 'Bash' else (inp.get('url') or '') + ' ' + (inp.get('prompt') or '')
    what = check(text if isinstance(text, str) else '')
    if what:
        print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PreToolUse', 'permissionDecision': 'deny',
                                                 'permissionDecisionReason': MESSAGE.format(what=what)}}))
    return 0


if __name__ == '__main__':
    sys.exit(main())

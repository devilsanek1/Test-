// grid.js: lays out a list of options (stills/emphasis_options.js) as a column of labelled crops on one 1080 x 1920
// still: each option is drawn on its own full frame (the background and the words at full size), then cropped to the
// band (cropY .. cropY + cropH) and scaled, so every option is seen at the same moment and nearly the phone's size.
//   GRID.render({bg: '{{BG_DUSK}}', options: EMPH.dusk, cropY: 280, cropH: 316, scale: 0.8, labelH: 21, gap: 0, mark: 'C'})
// The grid pages clear the layout log (no _layout.json): check_stills.py measures single frames, not grids.
(function () {
  function render(g) {
    const stage = document.getElementById('stage');
    const W = 1080 * g.scale, H = g.cropH * g.scale, x = Math.round((1080 - W) / 2);
    let y = g.top || 0;
    g.options.forEach((op, i) => {
      const lab = document.createElement('div');
      lab.textContent = op.label + (g.mark && op.key === g.mark ? '   ← recommended' : '');
      lab.style.cssText = `position:absolute;left:${x + 6}px;top:${y}px;width:${W - 12}px;height:${g.labelH}px;` +
        `line-height:${g.labelH}px;font-family:'Jost';font-weight:400;font-size:${g.labelSize || 17}px;letter-spacing:0.02em;` +
        `color:${g.mark && op.key === g.mark ? '#FFD58C' : 'rgba(255,240,222,0.80)'};white-space:nowrap;overflow:hidden`;
      stage.appendChild(lab);
      y += g.labelH;
      const cell = document.createElement('div');
      cell.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${W}px;height:${H}px;overflow:hidden`;
      const host = document.createElement('div');
      host.id = `opt_${i}`;
      host.style.cssText = `position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:0 0;` +
        `transform:scale(${g.scale}) translateY(${-g.cropY}px);background:url('${g.bg}') center/cover no-repeat`;
      cell.appendChild(host);
      stage.appendChild(cell);
      op.draw(TYPE.stage(host.id));
      y += H + (g.gap || 0);
    });
  }
  window.GRID = {render};
})();

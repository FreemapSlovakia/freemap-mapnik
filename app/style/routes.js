/* eslint-disable indent */

const routeColors = ['red', 'blue', 'green', 'yellow', 'black'];

module.exports = (map) => map
  .style('routes')
    .doInStyle(routes('hiking'))
    .doInStyle(routes('bicycle'));

function routes(type) {
  const isHiking = type === 'hiking';
  const matchFn = isHiking ? osmcMatch : colourMatch;
  const colors = isHiking ? [...routeColors.map(c => `0${c}`), ...routeColors.map(c => `1${c}`)] : routeColors;

  return (style) => {
    for (let colorIdx = 0; colorIdx < colors.length; colorIdx++) {
      const m = new Map();
      for (let x = 0; x < 1 << colorIdx; x++) {
        const ones = (x.toString(2).match(/1/g) || []).length;
        let q = m.get(ones);
        if (!q) {
          q = [];
          m.set(ones, q);
        }
        q.push(x.toString(2).padStart(colorIdx, '0'));
      }

      m.forEach((combs, ones) => {
        const ors = !colorIdx ? [] : combs.map(
          (comb) => comb
            .split('')
            .map((x, i) => condNot(matchFn(colors[i]), x === '0'))
            .join(' and ')
        );
        const typeCond = isHiking ? "([type] = 'hiking' or [type] = 'foot')" : "([type] = 'bicycle' or [type] = 'mtb')";
        const filter = `${typeCond} and ${matchFn(colors[colorIdx])}${ors.length ? ` and (${ors.map(or => `(${or})`).join(' or ')})` : ''}`;
        for (let a = 0; a < 2; a++) {
          style
            .rule({ filter, minZoom: a === 0 ? 12 : 9, maxZoom: a === 0 ? undefined : 11 })
              .lineSymbolizer({
                stroke: isHiking ? colors[colorIdx].slice(1) : colors[colorIdx],
                strokeWidth: isHiking ? 2 : 3,
                strokeLinejoin: 'round',
                offset: ((a === 0 ? 3 : 1) + ones * (isHiking ? 2 : 3)) * (isHiking ? 1 : -1),
                ...(isHiking ? (colors[colorIdx][0] === '1' ? { strokeDasharray: '6,4' } : {}) : { strokeDasharray: '3,3' }),
              });
        }
      });
    }
  };
}

function osmcMatch(color) {
  return `[osmc_colour].match('.*/${color}/.*')`;
}

function colourMatch(color) {
  return `[colour].match('.*/${color}/.*')`;
}

function condNot(expr, negate) {
  return negate ? `not(${expr})` : expr;
}

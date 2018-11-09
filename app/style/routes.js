const routeColors = ['red', 'blue', 'green', 'yellow', 'black'];

module.exports = (map) => map
  .addStyle('routes')
    .doInStyle(routes('hiking'))
    .doInStyle(routes('bicycle'));

function routes(type) {
  const matchFn = type === 'hiking' ? osmcMatch : colourMatch;
  const colors = type === 'hiking' ? [...routeColors.map(c => `0${c}`), ...routeColors.map(c => `1${c}`)] : routeColors;

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
        const filter = `[type] = '${type}' and ${matchFn(colors[colorIdx])}${ors.length ? ` and (${ors.map(or => `(${or})`).join(' or ')})` : ''}`;
        for (let a = 0; a < 2; a++) {
          style
            .addRule({ filter, minZoom: a === 0 ? 12 : 9, maxZoom: a === 0 ? undefined : 11 })
              .addLineSymbolizer({
                stroke: type === 'hiking' ? colors[colorIdx].slice(1) : colors[colorIdx],
                strokeWidth: 2,
                strokeLinejoin: 'round',
                offset: ((a === 0 ? 3 : 1) + ones * 2) * (type === 'hiking' ? 1 : -1),
                ...(type === 'hiking' ? (colors[colorIdx][0] === '1' ? { strokeDasharray: '6,6' } : {}) : { strokeDasharray: '2,2' }),
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

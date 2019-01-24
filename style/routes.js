/* eslint-disable indent */

const routeColors = ['red', 'blue', 'green', 'yellow', 'black'];

module.exports = {
  routes,
  routeGlows,
};

function routeGlows() {
  return (style) => {
    const m = new Map();

    for (let i = 1; i < Math.pow(2, routeColors.length * 2); i++) {
      const comb = i.toString(2);
      const ones = (comb.match(/1/g) || []).length;
      let q = m.get(ones);
      if (!q) {
        q = [];
        m.set(ones, q);
      }
      q.push(comb.padStart(routeColors.length * 2, '0'));
    }

    [...m].reverse().forEach(([ones, q]) => {
      const f = q.map(
        x => x.split('').map(
          (v, i) => (v === '1' ? osmcMatch(Math.floor(i / routeColors.length) + routeColors[i % routeColors.length]) : false)
        ).filter(x => x).join(' and ')
      ).map(x => `(${x})`).join(' or ');

      style
        .rule({ filter: `([type] = 'hiking' or [type] = 'foot') and (${f})` })
          .lineSymbolizer({
            stroke: 'white',
            strokeOpacity: 0.5,
            strokeWidth: 2 + ones * 2,
            strokeLinejoin: 'round',
            strokeLinecap: 'butt',
            offset: 2 + ones,
          });

    });
  };
}

function routes(type) {
  const isHiking = type === 'hiking'; // otherwise bicycle (color prefix 0) or ski (color prefix 1)
  const matchFn = isHiking ? osmcMatch : colourMatch;
  const colors = [...routeColors.map(c => `0${c}`), ...routeColors.map(c => `1${isHiking ? c : c.replace('black', 'white') /*ski*/}`)];

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
        const typeCond = isHiking ? "([type] = 'hiking' or [type] = 'foot')" : "([type] = 'bicycle' or [type] = 'mtb' or [type] = 'ski' or [type] = 'piste')";
        const filter = `${typeCond} and ${matchFn(colors[colorIdx])}${ors.length ? ` and (${ors.map(or => `(${or})`).join(' or ')})` : ''}`;
        for (let zoomVar = 0; zoomVar < 2; zoomVar++) {
          style
            .rule({ filter, minZoom: zoomVar === 0 ? 12 : 9, maxZoom: zoomVar === 0 ? undefined : 11 })
              .doInRule((rule) => {
                if (!isHiking && colors[colorIdx][0] === '1') {
                  return rule.linePatternSymbolizer({
                    file: `images/piste_${colors[colorIdx].slice(1)}.svg`,
                    offset: ((zoomVar === 0 ? 3 : 1) + ones * (isHiking ? 2 : 4)) * (isHiking ? 1 : -1) + (isHiking ? 0 : -1),
                    ...(isHiking ? (colors[colorIdx][0] === '1' ? { strokeDasharray: '6,4' } : {}) : { strokeDasharray: '0.001,6' }),
                  });
                } else {
                  return rule.lineSymbolizer({
                    stroke: mapColor(colors[colorIdx].slice(1)),
                    strokeWidth: isHiking ? 2 : 4,
                    strokeLinejoin: 'round',
                    strokeLinecap: isHiking ? 'butt' : colors[colorIdx][0] === '1' ? 'square' : 'round',
                    offset: ((zoomVar === 0 ? 3 : 1) + ones * (isHiking ? 2 : 4)) * (isHiking ? 1 : -1) + (isHiking ? 0 : -1),
                    ...(isHiking ? (colors[colorIdx][0] === '1' ? { strokeDasharray: '6,4' } : {}) : { strokeDasharray: '0.001,6' }),
                  });
                }
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

const colorMap = {
  red: 'red',
  blue: '#4040ff',
  green: '#00a000',
  yellow: '#f0f000',
  black: 'black',
  white: 'white',
};

function mapColor(color) {
  return colorMap[color] || color;
}

/* eslint-disable indent */

// NOTE more colors slows rendering rapidly; maybe we should try to move the combination computation to SQL
// black ski is missing (but would bake it slow)
const routeColors = ['red', 'blue', 'green', 'yellow', 'black'];

const RP = {
  GLOBAL_HIKING: '0',
  LOCAL_HIKING: '1',
  BICYCLE: '2',
  SKI: '3',
};

module.exports = {
  routes,
  RP,
};

// 0 - global hiking, 1 - local hiking, 2 - bicycle, 3 - ski
// types 'hiking' or combination of ['bicycle', 'ski']
function routes(...types) {
  const isHiking = types.includes('hiking');
  const isBicycle = types.includes('bicycle');
  const isSki = types.includes('ski');

  const matchFn = isHiking ? osmcMatch : colourMatch;
  const colors = [
    ...isHiking || isBicycle ? routeColors.map(c => `${isHiking ? RP.GLOBAL_HIKING : RP.BICYCLE}${c}`) : [],
    ...isHiking || isSki ? routeColors.map(c => `${isHiking ? RP.LOCAL_HIKING : RP.SKI}${isHiking ? c : c.replace('black', 'white') /*ski*/}`) : []];

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

        const filter = `${matchFn(colors[colorIdx])}${ors.length ? ` and (${ors.map(or => `(${or})`).join(' or ')})` : ''}`;

        for (let zoomVar = 0; zoomVar < 2; zoomVar++) {
          style
            .rule({ filter, minZoom: zoomVar === 0 ? 12 : 9, maxZoom: zoomVar === 0 ? undefined : 11 })
              .doInRule((rule) => {
                const prefix = colors[colorIdx][0];
                const color = colors[colorIdx].slice(1);

                if (prefix === RP.GLOBAL_HIKING || prefix === RP.LOCAL_HIKING) {
                  rule.lineSymbolizer({
                    stroke: mapColor(color),
                    strokeWidth: 2,
                    strokeLinejoin: 'round',
                    strokeLinecap: 'butt',
                    offset: (zoomVar === 0 ? 3 : 1) + ones * 2,
                    ...prefix === RP.LOCAL_HIKING ? { strokeDasharray: '6,4' } : {},
                  });
                } else if (prefix === RP.SKI) {
                  rule.linePatternSymbolizer({
                    file: `images/piste_${color}.svg`,
                    offset: -((zoomVar === 0 ? 3 : 1) + ones * 4) - 1,
                  });
                } else if (prefix === RP.BICYCLE) {
                  rule.lineSymbolizer({
                    stroke: mapColor(color),
                    strokeWidth: 4,
                    strokeLinejoin: 'round',
                    strokeLinecap: 'round',
                    offset: -((zoomVar === 0 ? 3 : 1) + ones * 4) - 1,
                    strokeDasharray: '0.001,6',
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

/* eslint-disable indent */

const routeColors = ['purple', 'orange', 'white', 'black', 'yellow', 'green', 'blue', 'red'];

module.exports = {
  routes,
};

const { hsl } = require('./colors');

// types 'hiking' or combination of ['bicycle', 'ski']
function routes(glows, ...types) {
  const isHiking = types.includes('hiking');
  const isBicycle = types.includes('bicycle');
  const isSki = types.includes('ski');
  const isHorse = true; // types.includes('horse');

  return (style) => {
    for (let zoomVar = 0; zoomVar < 2; zoomVar++) {
      const zoomParams = { minZoom: zoomVar === 0 ? 12 : 9, maxZoom: zoomVar === 0 ? undefined : 11 };
      const zo = zoomVar === 0 ? 3 : 1;
      const wf = zoomVar === 0 ? 2 : 1.5;

      for (const color of routeColors) {
        // (maybe) order of route types influences drawing order (last = highest prio)

        if (isHorse) {
          // horse riding

          const offset = `(${zo} + ([r_${color}] - 1) * ${wf * 1.5}) + 1`;

          const rRule = style.rule({ filter: `[r_${color}] > 0`, ...zoomParams });
          if (glows) {
            rRule.lineSymbolizer({
              stroke: hsl(40, 50, 40),
              strokeWidth: wf * 2,
              strokeLinejoin: 'round',
              strokeLinecap: 'butt',
              offset,
              strokeOpacity: 0.75,
            });
          } else {
            rRule.lineSymbolizer({
              stroke: mapColor(color),
              strokeWidth: wf,
              strokeLinejoin: 'round',
              strokeLinecap: 'butt',
              offset,
              strokeDasharray: `${wf * 2},${wf * 2}`,
            });
          }
        }

        if (isSki) {
          const offset = `-(${zo} + ([s_${color}] - 1) * ${wf * 1.5}) - 1`;

          const sRule = style.rule({ filter: `[s_${color}] > 0`, ...zoomParams });
          if (glows) {
            sRule.lineSymbolizer({
              stroke: 'orange',
              strokeWidth: wf * 2,
              strokeLinejoin: 'round',
              strokeLinecap: 'butt',
              offset,
              strokeOpacity: 0.75,
            });
          } else {
            sRule.lineSymbolizer({
              stroke: mapColor(color),
              strokeWidth: wf,
              strokeLinejoin: 'round',
              strokeLinecap: 'butt',
              offset,
              strokeDasharray: `${wf * 2},${wf * 2}`,
            });
          }
        }

        if (isBicycle && !glows) {
          // bicycle
          style.rule({ filter: `[b_${color}] > 0`, ...zoomParams }).lineSymbolizer({
            stroke: mapColor(color),
            strokeWidth: wf * 2,
            strokeLinejoin: 'round',
            strokeLinecap: 'round',
            offset: `-(${zo} + ([b_${color}] - 1) * ${wf * 2}) - 1`,
            strokeDasharray: `0.001,${wf * 3}`,
          });
        }

        if (isHiking) {
          const o1 = `${zo} + ([h_${color}] - 1) * ${wf * 1.5} + 1`;

          // major hiking
          const hRule = style.rule({ filter: `[h_${color}] > 0`, ...zoomParams });
          if (glows) {
            hRule.lineSymbolizer({
              stroke: 'white',
              strokeWidth: wf * 2,
              strokeLinejoin: 'round',
              strokeLinecap: 'butt',
              offset: o1,
              strokeOpacity: 0.75,
            });
          } else {
            hRule.lineSymbolizer({
              stroke: mapColor(color),
              strokeWidth: wf,
              strokeLinejoin: 'round',
              strokeLinecap: 'butt',
              offset: o1,
            });
          }

          const o2 = `${zo} + ([h_${color}_loc] - 1) * ${wf * 1.5} + 1`;

          // local hiking
          const lhRule = style.rule({ filter: `[h_${color}_loc] > 0`, ...zoomParams });
          if (glows) {
            lhRule.lineSymbolizer({
              stroke: 'white',
              strokeWidth: wf * 2,
              strokeLinejoin: 'round',
              strokeLinecap: 'butt',
              offset: o2,
              strokeOpacity: 0.75,
            });
          } else {
            lhRule.lineSymbolizer({
              stroke: mapColor(color),
              strokeWidth: wf,
              strokeLinejoin: 'round',
              strokeLinecap: 'butt',
              offset: o2,
              strokeDasharray: `${wf * 3},${wf * 1}`,
            });
          }
        }

      }
    }
  };
}


const colorMap = {
  red: 'red',
  blue: '#4040ff',
  green: '#008000',
  yellow: '#f0f000',
  black: 'black',
  white: 'white',
  purple: '#b000b0',
};

function mapColor(color) {
  return colorMap[color] || color;
}

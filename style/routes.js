/* eslint-disable indent */
const os = require('os');
const path = require('path');
const fs = require('fs').promises;

const routeColors = ['none', 'purple', 'orange', 'white', 'black', 'yellow', 'green', 'blue', 'red'];

async function initIcons() {
  const [horseSvg, skiSvg] = await Promise.all([
    fs.readFile('images/horse.svg', { encoding: 'UTF-8' }),
    fs.readFile('images/ski.svg', { encoding: 'UTF-8' }),
  ]);

  return Promise.all(
    routeColors.map(
      color => Promise.all([
        // TODO u
        fs.writeFile(path.resolve(os.tmpdir(), `ski-${color}.svg`), skiSvg.replaceAll('#ff00ff', mapColor(color))),
        fs.writeFile(path.resolve(os.tmpdir(), `horse-${color}.svg`), horseSvg.replaceAll('#ff00ff', mapColor(color))),
      ]),
    ),
  );
}

module.exports = {
  routes,
  initIcons,
};

// types 'hiking' or combination of ['bicycle', 'ski']
function routes(glows, ...types) {
  const isHiking = types.includes('hiking');
  const isBicycle = types.includes('bicycle');
  const isSki = types.includes('ski');
  const isHorse = types.includes('horse');

  return (style) => {
    for (let zoomVar = 0; zoomVar < 2; zoomVar++) {
      const zoomParams = { minZoom: zoomVar === 0 ? 12 : 9, maxZoom: zoomVar === 0 ? undefined : 11 };
      const zo = zoomVar === 0 ? 3 : 1;
      const wf = zoomVar === 0 ? 2 : 1.5;

      const df = 1.25;

      const glowStyle = {
        stroke: 'white',
        strokeLinejoin: 'round',
        strokeLinecap: 'butt',
        strokeOpacity: 0.33,
      };

      for (const color of routeColors) {
        // (maybe) order of route types influences drawing order (last = highest prio)

        if (isHorse) {
          // horse riding

          const offset = `(${zo} + ([r_${color}] - 1) * ${wf} * ${df}) + 0.5`;

          const rRule = style.rule({ filter: `[r_${color}] > 0`, ...zoomParams });
          if (glows) {
            rRule.lineSymbolizer({
              ...glowStyle,
              strokeWidth: wf + 1,
              offset,
            });
          } else {
            rRule.linePatternSymbolizer({
              file: `/tmp/horse-${color}.svg`,
              offset,
              transform: `scale(${wf / 2})`,
            });

            // rRule.lineSymbolizer({
            //   stroke: mapColor(color),
            //   strokeWidth: wf,
            //   strokeLinejoin: 'round',
            //   strokeLinecap: 'butt',
            //   offset,
            //   strokeDasharray: `${wf * 3},${wf * 2}`,
            // });
          }
        }

        if (isSki) {
          const offset = `-(${zo} + ([s_${color}] - 1) * ${wf * 2}) - 1`;

          const sRule = style.rule({ filter: `[s_${color}] > 0`, ...zoomParams });
          if (glows) {
            sRule.lineSymbolizer({
              ...glowStyle,
              strokeWidth: wf * 1.5 + 1,
              offset,
            });
          } else {
            sRule.linePatternSymbolizer({
              file: `/tmp/ski-${color}.svg`,
              offset,
              transform: `scale(${wf / 2})`,
            });

            // sRule.lineSymbolizer({
            //   stroke: mapColor(color),
            //   strokeWidth: wf,
            //   strokeLinejoin: 'round',
            //   strokeLinecap: 'butt',
            //   offset,
            //   strokeDasharray: `${wf * 3},${wf * 2}`,
            // });
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
          const o1 = `${zo} + ([h_${color}] - 1) * ${wf} * ${df} + 0.5`;

          // major hiking
          const hRule = style.rule({ filter: `[h_${color}] > 0`, ...zoomParams });
          if (glows) {
            hRule.lineSymbolizer({
              ...glowStyle,
              strokeWidth: wf + 2,
              offset: o1,
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

          const o2 = `${zo} + ([h_${color}_loc] - 1) * ${wf} * ${df} + 0.5`;

          // local hiking
          const lhRule = style.rule({ filter: `[h_${color}_loc] > 0`, ...zoomParams });
          if (glows) {
            lhRule.lineSymbolizer({
              ...glowStyle,
              strokeWidth: wf + 2,
              offset: o2,
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
  red: '#ff3030',
  blue: '#5050ff',
  green: '#00a000',
  yellow: '#f0f000',
  orange: '#ff8000',
  black: 'black',
  white: 'white',
  purple: '#b000b0',
  none: '#ff57ff',
};

function mapColor(color) {
  return colorMap[color] || color;
}

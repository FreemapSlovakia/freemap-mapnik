/* eslint-disable indent */

// NOTE more colors slows rendering rapidly; maybe we should try to move the combination computation to SQL
// black ski is missing (but would bake it slow)
const routeColors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'orange', 'purple'];

module.exports = {
  routes,
};

// types 'hiking' or combination of ['bicycle', 'ski']
function routes(...types) {
  const isHiking = types.includes('hiking');
  const isBicycle = types.includes('bicycle');
  const isSki = types.includes('ski');

  return (style) => {
    for (let zoomVar = 0; zoomVar < 2; zoomVar++) {
      const zoomParams = { minZoom: zoomVar === 0 ? 12 : 9, maxZoom: zoomVar === 0 ? undefined : 11 };
      const zo = zoomVar === 0 ? 3 : 1;

      for (const color of routeColors) {
        if (isHiking) {
          // major hiking
          style.rule({ filter: `[h_${color}] > 0`, ...zoomParams }).lineSymbolizer({
            stroke: mapColor(color),
            strokeWidth: 2,
            strokeLinejoin: 'round',
            strokeLinecap: 'butt',
            offset: `${zo} + ([h_${color}] - 1) * 2`,
          });

          // local hiking
          style.rule({ filter: `[h_${color}_loc] > 0`, ...zoomParams }).lineSymbolizer({
            stroke: mapColor(color),
            strokeWidth: 2,
            strokeLinejoin: 'round',
            strokeLinecap: 'butt',
            offset: `${zo} + ([h_${color}_loc] - 1) * 2`,
            strokeDasharray: '6,4',
          });
        }

        if (isBicycle) {
          // bicycle
          style.rule({ filter: `[b_${color}] > 0`, ...zoomParams }).lineSymbolizer({
            stroke: mapColor(color),
            strokeWidth: 4,
            strokeLinejoin: 'round',
            strokeLinecap: 'round',
            offset: `-(${zo} + ([b_${color}] - 1) * 4) - 1`,
            strokeDasharray: '0.001,6',
          });
        }

        if (isSki) {
          const offset = `-(${zo} + ([s_${color}] - 1) * 4) - 1`;

          style.rule({ filter: `[s_${color}] > 0`, ...zoomParams })
            .lineSymbolizer({
              stroke: 'orange',
              strokeWidth: 4,
              strokeLinejoin: 'round',
              strokeLinecap: 'round',
              offset,
            })
            .lineSymbolizer({
              stroke: mapColor(color),
              strokeWidth: 2,
              strokeLinejoin: 'round',
              strokeLinecap: 'butt',
              offset,
              strokeDasharray: '6,2',
            });
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

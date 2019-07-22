const convert = require('color-convert');

const colors = {
  contour: 'black',
  water: hsl(210, 65, 65),
  waterLabelHalo: hsl(210, 30, 100),
  building: hsl(0, 0, 50),
  ruin: hsl(0, 0, 60),
  track: hsl(0, 33, 25),
  road: hsl(40, 60, 50),
  forest: hsl(120, 40, 78),
  heath: hsl(85, 60, 80),
  farmyard: hsl(50, 44, 80),
  farmland: hsl(60, 70, 95),
  wetland: hsl(200, 80, 90),
  scrub: hsl(100, 40, 65),
  grassy: hsl(100, 85, 90),
  orchard: hsl(70, 55, 60),
  allotments: hsl(50, 45, 85),
  landfill: hsl(0, 30, 60),
  brownfield: hsl(30, 30, 60),
};

function hsl(h, s, l) {
  return `#${convert.hsl.hex(h, s, l)}`;
}

module.exports = {
  colors,
  hsl,
};

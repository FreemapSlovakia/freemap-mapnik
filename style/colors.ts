import convert from "color-convert";

export const colors = {
  allotments: hsl(50, 45, 85),
  areaLabel: hsl(0, 0, 33),
  brownfield: hsl(30, 30, 60),
  building: hsl(0, 0, 50),
  contour: "black",
  farmland: hsl(60, 70, 95),
  farmyard: hsl(50, 44, 80),
  forest: hsl(120, 40, 82),
  grassy: hsl(100, 85, 92),
  heath: hsl(85, 60, 83),
  landfill: hsl(0, 30, 70),
  orchard: hsl(80, 60, 80),
  road: hsl(40, 60, 50),
  ruin: hsl(0, 0, 60),
  scrub: hsl(85, 35, 75),
  track: hsl(0, 33, 25),
  water: hsl(216, 65, 65),
  waterLabel: hsl(216, 100, 50),
  waterLabelHalo: hsl(216, 30, 100),
};

export function hsl(h: number, s: number, l: number) {
  return `#${convert.hsl.hex(h, s, l)}`;
}

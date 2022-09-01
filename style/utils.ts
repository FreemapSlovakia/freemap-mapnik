export function seq(from: number, toIncl: number) {
  return Array.from({ length: toIncl + 1 - from }, (_, i) => i + from);
}

export function types(...type: string[]) {
  return type.map((x) => `[type] = '${x.replace("'", "\\'")}'`).join(' or ');
}

export const zoomDenoms = [
  1000000000,
  500000000,
  200000000,
  100000000,
  50000000,
  25000000,
  12500000,
  6500000,
  3000000,
  1500000,
  750000, // 10
  400000,
  200000,
  100000,
  50000,
  25000,
  12500,
  5000,
  2500,
  1500,
  750, // 20
  500,
  250,
  100,
  50,
  25,
  12.5,
];

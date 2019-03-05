#!/usr/bin/env node

const color = /^#?([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/.exec(process.argv[2]);
const r = Number.parseInt(color[1], 16);
const g = Number.parseInt(color[2], 16);
const b = Number.parseInt(color[3], 16);
const intensity = Number.parseFloat(process.argv[3]);

console.log(`1 ${r} ${g} ${b} ${Math.round(intensity * 255)}`);
console.log(`255 ${r} ${g} ${b} 1`);


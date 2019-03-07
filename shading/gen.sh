#!/bin/bash

gen_relief() {
  gdaldem hillshade hgt_warped.tiff _$1.tiff -az $2 -igor -z 2.1
}

gen_relief a -120
gen_relief b   60
gen_relief c  -45

a='0.50 * (255 - A)'
b='0.65 * (255 - B)'
c='1.00 * (255 - C)'

gdal_calc.py -A _a.tiff -B _b.tiff -C _c.tiff --outfile=R.tiff \
  --calc="(${a} * 0x20 + ${b} * 0xFF + ${c} * 0x00) / (0.01 + ${a} + ${b} + ${c})"
gdal_calc.py -A _a.tiff -B _b.tiff -C _c.tiff --outfile=G.tiff \
  --calc="(${a} * 0x40 + ${b} * 0xEE + ${c} * 0x00) / (0.01 + ${a} + ${b} + ${c})"
gdal_calc.py -A _a.tiff -B _b.tiff -C _c.tiff --outfile=B.tiff \
  --calc="(${a} * 0xB0 + ${b} * 0x00 + ${c} * 0x00) / (0.01 + ${a} + ${b} + ${c})"
gdal_calc.py -A _a.tiff -B _b.tiff -C _c.tiff --outfile=A.tiff \
  --calc="255.0 - 255.0 * ((1.0 - ${a} / 255.0) * (1.0 - ${b} / 255.0) * (1.0 - ${c} / 255.0))"

rm final.tiff _a.tiff _b.tiff _c.tiff

gdal_merge.py -separate -o final.tiff R.tiff G.tiff B.tiff A.tiff

rm R.tiff G.tiff B.tiff A.tiff

#!/bin/bash

# intensity, color, az, out
gen_relief() {
  ./gen_ramp.js $2 $1 > shade.ramp \
    && gdaldem hillshade hgt_warped.tiff shade.tiff -az $3 -igor -z 1.5 \
    && gdaldem color-relief shade.tiff shade.ramp $4 -alpha \
    && rm shade.ramp shade.tiff
}

echo dark

gen_relief 0.8 2040B0 -120 out1.tiff
gen_relief 0.6 FFEE00 60 out2.tiff
gen_relief 0.8 000000 -45 out3.tiff

echo blend

./blend.sh out2.tiff out1.tiff tmp.tiff
./blend.sh out3.tiff tmp.tiff final.tiff

echo light

gen_relief 0.4 2040B0 -120 out1.tiff
gen_relief 0.3 FFEE00 60 out2.tiff
gen_relief 0.5 000000 -45 out3.tiff

echo blend

./blend.sh out2.tiff out1.tiff tmp.tiff
./blend.sh out3.tiff tmp.tiff final_a.tiff

#gdaldem slope hgt_warped.tiff shade.tiff
#gdaldem color-relief shade.tiff color_slope.ramp out4.tiff

# #######
# gdal_translate -of GTiff -co "TILED=YES" -a_ullr 21 48 20 49 -a_srs "+proj=latlong" merged.png output.tif
# gdalwarp -of GTiff -co "TILED=YES" -srcnodata 32767 -t_srs "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs +over" -rcs -order 3 -tr 30 30 -multi output.tif o2.tif


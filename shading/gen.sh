#!/bin/bash

ZOOM=1.5
ALG=igor

### dark

# bluish
gdaldem hillshade hgt_warped.tiff shade.tiff -az -35 -$ALG -z $ZOOM
gdaldem color-relief shade.tiff shade1.ramp out1.tiff -alpha

# yellowish
gdaldem hillshade hgt_warped.tiff shade.tiff -az 135 -$ALG -z $ZOOM
gdaldem color-relief shade.tiff shade2.ramp out2.tiff -alpha

gdaldem hillshade hgt_warped.tiff shade.tiff -az -45 -$ALG -z $ZOOM
gdaldem color-relief shade.tiff shade3.ramp out3.tiff -alpha

# 3|2|1

./blend.sh out2.tiff out1.tiff tmp.tiff
./blend.sh out3.tiff tmp.tiff final.tiff


### light

# gdaldem hillshade hgt_warped.tiff shade.tiff -az -35 -igor -z $ZOOM
# gdaldem color-relief shade.tiff shade1a.ramp out1.tiff -alpha

# gdaldem hillshade hgt_warped.tiff shade.tiff -az 45 -igor -z $ZOOM
# gdaldem color-relief shade.tiff shade2a.ramp out2.tiff -alpha

# gdaldem hillshade hgt_warped.tiff shade.tiff -az -45 -igor -z $ZOOM
# gdaldem color-relief shade.tiff shade3a.ramp out3.tiff -alpha

# # 3|2|1

# ./blend.sh out2.tiff out1.tiff tmp.tiff
# ./blend.sh out3.tiff tmp.tiff final_a.tiff


#gdaldem slope hgt_warped.tiff shade.tiff
#gdaldem color-relief shade.tiff color_slope.ramp out4.tiff


###########
# clear-map
# set-dem-source dmr20
# set-geo-bounds 15.5,47,23.5,50

# set-geo-bounds 20,48,21,49

# # dark
# generate-relief-igor intensity=0.8 sun-azimuth=325 color=#275F9C
# generate-relief-igor intensity=0.4 sun-azimuth=45 color=#FFEE00
# generate-relief-igor intensity=1
# generate-relief-slopeshading intensity=0.6

# # light
# generate-relief-igor intensity=0.4 sun-azimuth=325 color=#275F9C
# generate-relief-igor intensity=0.3 sun-azimuth=45 color=#FFEE00
# generate-relief-igor intensity=0.6
# generate-relief-slopeshading intensity=0.3

# #generate-tiles exclude-partial=true minzoom=12 maxzoom=12
# #######
# gdal_translate -of GTiff -co "TILED=YES" -a_ullr 21 48 20 49 -a_srs "+proj=latlong" merged.png output.tif
# gdalwarp -of GTiff -co "TILED=YES" -srcnodata 32767 -t_srs "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs +over" -rcs -order 3 -tr 30 30 -multi output.tif o2.tif


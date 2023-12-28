build/warped.tif: sk.tif
gdalwarp \
 -overwrite \
 -of GTiff \
 -ot Float32 \
 -co NBITS=16 \
 -co TILED=YES \
 -co PREDICTOR=3 \
 -co COMPRESS=ZSTD \
 -co NUM_THREADS=ALL_CPUS \
 -wo NUM_THREADS=ALL_CPUS \
 -multi \
 -srcnodata -9999 \
 -dstnodata -500 \
 -r cubicspline \
 -order 3 \
 -tr 19.109257071294062687 19.109257071294062687 \
 -tap \
 -s_srs 'EPSG:5514' \
 -t_srs "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs +over" \
 -ct "+proj=pipeline +step +inv +proj=krovak +lat_0=49.5 +lon_0=24.8333333333333 +alpha=30.2881397527778 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +step +inv +proj=hgridshift +grids=Slovakia_JTSK03_to_JTSK.gsb +step +proj=krovak +lat_0=49.5 +lon_0=24.8333333333333 +alpha=30.2881397527778 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +step +inv +proj=krovak +lat_0=49.5 +lon_0=24.8333333333333 +alpha=30.2881397527778 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +step +proj=push +v_3 +step +proj=cart +ellps=bessel +step +proj=helmert +x=485.021 +y=169.465 +z=483.839 +rx=-7.786342 +ry=-4.397554 +rz=-4.102655 +s=0 +convention=coordinate_frame +step +inv +proj=cart +ellps=WGS84 +step +proj=pop +v_3 +step +proj=webmerc +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +ellps=WGS84" \
 sk.tif \
 build/warped.tif

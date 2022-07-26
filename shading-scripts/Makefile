build/hgt.tif: hgt/*.HGT
	mkdir -p build
	gdal_merge.py -a_nodata -500 -o build/hgt.tif hgt/*.HGT

build/warped-hgt.tif: build/hgt_filled.tif
	gdalwarp \
		-srcnodata -500 \
  	-dstnodata -500 \
		-overwrite \
		-of GTiff \
		-ot Float32 \
		-co TILED=YES \
		-co BIGTIFF=YES \
		-co COMPRESS=DEFLATE \
		-co NUM_THREADS=ALL_CPUS \
		-wo NUM_THREADS=ALL_CPUS \
		-multi \
		-r cubicspline \
		-order 3 \
		-tr 19.109257071294062687 19.109257071294062687 \
		-tap \
		-t_srs "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs +over" \
		build/hgt_filled.tif build/warped-hgt.tif

# gdalwarp -srcnodata -500 	-dstnodata -500 -overwrite -of GTiff -ot Float32 -co TILED=YES -co BIGTIFF=YES -co COMPRESS=DEFLATE -co NUM_THREADS=ALL_CPUS -wo NUM_THREADS=ALL_CPUS -multi -r cubicspline -order 3 -tr 19.109257071294062687 19.109257071294062687 -tap -t_srs "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs +over" N47E020.HGT N47E020.tif
# gdalwarp -ot Float32 -overwrite -tr 19.109257071294062687 19.109257071294062687 -tap -t_srs "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs +over"  N47E020.HGT N47E020.tif
# whitebox_tools -r=FeaturePreservingSmoothing -v --wd="." --dem=warped-hgt_filled.tif -o=test.tif --filter=15 --norm_diff=20.0 --num_iter=4

build/retiled/*.tif: build/warped-hgt.tif
	mkdir -p build/retiled
	gdal_retile.py -overlap 40 -ps 10000 10000 -targetDir build/retiled build/warped-hgt.tif

# build/asc/%.asc: build/retiled/%.tif
# 	mkdir -p build/asc
# 	gdal_translate -of AAIGrid $< $@

# asc = $(patsubst build/retiled/%.tif,build/asc/%.asc,$(wildcard build/retiled/*.tif))

denoised = $(patsubst build/retiled/%.tif,build/denoised/%.tif,$(wildcard build/retiled/*.tif))

# build/denoised/%.asc: build/asc/%.asc
# 	mkdir -p build/denoised
# 	mdenoise -i $< -n 15 -t 0.98 -o $@

build/denoised/%.tif: build/retiled/%.tif
	mkdir -p build/denoised
	whitebox_tools -r=FeaturePreservingSmoothing -v --wd="." --dem=$< -o=$@ --filter=15 --norm_diff=20.0 --num_iter=4

# build/denoised.tif: build/warped-hgt.tif
# 	whitebox_tools -r=FeaturePreservingSmoothing -v --wd="build" --dem=warped-hgt.tif -o=denoised.tif --filter=15 --norm_diff=20.0 --num_iter=4

cut = $(patsubst build/denoised/%.tif,build/cut/%.tif,$(wildcard build/denoised/*.tif))

build/cut/%.tif: build/denoised/%.tif
	mkdir -p build/cut
	./cut.sh $< $@

# step1: build/retiled/*.tif

# step2: $(asc)

step3: $(denoised)

# build/denoised.tif: $(cut)
# 	gdal_merge.py -o $@ $^

# build/retiled/%.asc : build/retiled/%.asc
# 	mdenoise -i square.asc -n 3 -t 0.99 -o square_dn.asc

clean:
	rm -rf build

build/sk_warped.tif: sk.tif
	gdalwarp \
		-overwrite	\
		-of GTiff	\
		-ot Float32	\
		-co NBITS=16	\
		-co TILED=YES	\
		-co PREDICTOR=3	\
		-co COMPRESS=ZSTD	\
		-co NUM_THREADS=ALL_CPUS	\
		-wo NUM_THREADS=ALL_CPUS	\
		-multi	\
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
		build/sk_warped.tif

		# -t_srs 'EPSG:3857' \

# build/merged.tif: build/denoised.tif build/sk_warped.tif
# 	gdal_merge.py -o build/merged.tif build/denoised.tif build/sk_warped.tif

build/merged.tif: $(cut) build/sk_warped.tif
	gdal_merge.py -o $@ $^

define gen_relief
	gdaldem hillshade build/merged.tif build/_$(1).tif -az $(2) -igor -compute_edges -z 1.7
endef

build/_a.tif: build/merged.tif
	$(call gen_relief,a,-120)

build/_b.tif: build/merged.tif
	$(call gen_relief,b,60)

build/_c.tif: build/merged.tif
	$(call gen_relief,c,-45)

build/_d.tif: build/slope.tif slope.ramp
	gdaldem color-relief build/slope.tif slope.ramp build/_d.tif

build/slope.tif: build/merged.tif
	gdaldem slope -p build/merged.tif build/slope.tif

a := 0.8 * (255 - A)
b := 0.7 * (255 - B)
c := 1.0 * (255 - C)
d := 0.0 * (255 - D) # note - intensity is zero = not used

contrast := 1.0
brightness := 0.0

define gen_band
	gdal_calc.py --co=BIGTIFF=YES --co=TILED=YES --co=NUM_THREADS=ALL_CPUS --co=COMPRESS=DEFLATE \
	  -A build/_a.tif -B build/_b.tif -C build/_c.tif -D build/_d.tif --outfile=build/$(1).tif \
		--calc="$(contrast) * (($(a) * $(2) + $(b) * $(3) + $(c) * $(4) + $(d) * $(5)) / (0.01 + $(a) + $(b) + $(c) + $(d)) - 128.0) + 128.0 + $(brightness)"
endef

# RGB colors per sub-relief are defined in columns
#          [a]  [b]  [c]  [d]

build/R.tif: build/_a.tif build/_b.tif build/_c.tif build/_d.tif
	$(call gen_band,R,0x20,0xFF,0x00,0x00)

build/G.tif: build/_a.tif build/_b.tif build/_c.tif build/_d.tif
	$(call gen_band,G,0x30,0xEE,0x00,0x00)

build/B.tif: build/_a.tif build/_b.tif build/_c.tif build/_d.tif
	$(call gen_band,B,0x60,0x00,0x00,0x00)

build/A.tif: build/_a.tif build/_b.tif build/_c.tif build/_d.tif
	gdal_calc.py --co=BIGTIFF=YES --co=TILED=YES --co=NUM_THREADS=ALL_CPUS --co=COMPRESS=DEFLATE \
	  -A build/_a.tif -B build/_b.tif -C build/_c.tif -D build/_d.tif --outfile=build/A.tif \
		--calc="255.0 - 255.0 * ((1.0 - $(a) / 255.0) * (1.0 - $(b) / 255.0) * (1.0 - $(c) / 255.0) * (1.0 - $(d) / 255.0))"

# mask for compositing multiple shadings
#build/M.tif: build/A.tif
#  gdal_calc.py --co=BIGTIFF=YES --co=TILED=YES --co=NUM_THREADS=ALL_CPUS --co=COMPRESS=DEFLATE -A build/A.tif --outfile=build/M.tif --NoDataValue=0 --calc="255"

build/stack.vrt: build/R.tif build/G.tif build/B.tif build/A.tif
	gdalbuildvrt -separate build/stack.vrt build/R.tif build/G.tif build/B.tif build/A.tif
	gdal_edit.py -colorinterp_1 red -colorinterp_2 green -colorinterp_3 blue -colorinterp_4 alpha build/stack.vrt

build/final.tif: build/stack.vrt build/R.tif build/G.tif build/B.tif build/A.tif
	gdal_translate -colorinterp red,green,blue,alpha -r cubicspline -of GTiff -co "TILED=YES" build/stack.vrt build/final.tif

build/final.tif.ovr: build/final.tif
	GDAL_CACHEMAX=4096 gdaladdo -r lanczos --config BIGTIFF_OVERVIEW YES --config PREDICTOR_OVERVIEW 2 --config COMPRESS_OVERVIEW DEFLATE --config GDAL_NUM_THREADS ALL_CPUS --config NUM_THREADS_OVERVIEW ALL_CPUS -ro build/final.tif

# see https://stackoverflow.com/questions/62614229/how-to-define-prerequisite-for-automatic-variable-in-makefile/62615490
# make -j24 step1 && make -j24 step2 && make -j24 step3 && make -j24 step4 && make -j24 build/final.tif.ovr


# [19.819335937499961, 48.195387408333389],
# [19.863281249999964, 48.224672649565122]



# 2206278.38 6139422.11
# 2211170.35 6144314.08


# 4891.97 x 4891.97


# 6378137*pi*2

# (6378137 * pi * 2) / (2 ^ 13) / 256 = 19.1092570713  vs 19.093

#gdal_contour -f PostgreSQL -nln cont -i 10 -a height build/merged.tif "PG:host=localhost user=martin password=**** dbname=martin"


# create hgt files from sk.tif
# for merging see https://gist.github.com/zdila/9dc0ffa6712d84470b2846d061b8da7d
# for i in ../../../HGT/*.HGT; do b=$(basename ${i%.HGT}); gdalwarp -ct "+proj=pipeline +step +inv +proj=krovak +lat_0=49.5 +lon_0=24.8333333333333 +alpha=30.2881397527778 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +step +inv +proj=hgridshift +grids=Slovakia_JTSK03_to_JTSK.gsb +step +proj=krovak +lat_0=49.5 +lon_0=24.8333333333333 +alpha=30.2881397527778 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +step +inv +proj=krovak +lat_0=49.5 +lon_0=24.8333333333333 +alpha=30.2881397527778 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +step +proj=push +v_3 +step +proj=cart +ellps=bessel +step +proj=helmert +x=485.021 +y=169.465 +z=483.839 +rx=-7.786342 +ry=-4.397554 +rz=-4.102655 +s=0 +convention=coordinate_frame +step +inv +proj=cart +ellps=WGS84 +step +proj=pop +v_3 +step +proj=unitconvert +xy_in=rad +xy_out=deg" -r bilinear -of GTiff -overwrite -tr 0.0002777777777777777777777 -0.000277777777777777777777 -te $(gdalinfo  -json $i | jq -r '[.cornerCoordinates.upperLeft[0], .cornerCoordinates.lowerLeft[1], .cornerCoordinates.lowerRight[0], .cornerCoordinates.upperRight[1]] | join(" ")') -ot Int16 -dstnodata -32768 -of SRTMHGT sk.tif $b.hgt; done


### dmr5 stuff (SK, PL)

# for SK keep only *.tif files (move auxiliary files away)

## retile (only) big SK tiffs - cut to halves
#  mv r_01_17_s.* r_02_17_s.* r_05_17_s.* r_06_18_s.* r_07_17_s.* r_09_17_s.* r_10_17_s.* r_12_18_s.* r_13_18_s.* r_14_18_s.* r_17_18_s.* r_19_18_s.* r_20_18_s.* r_21_18_s.* r_23_20_s.* r_25_19_s.* r_26_18_s.* oksize/
# gdal_retile.py -ps 500000 30000 -overlap 100 -targetDir oksize/ r_03_17_s.tif
# ALT: python /usr/lib/python3/dist-packages/osgeo_utils/gdal_retile.py -ps 40000 40000 -overlap 100 -targetDir oksize/ LIDAR_UGKK_DEM5_0_JTSK03_1m.tif
# gdal_retile.py -ps 500000 40000 -overlap 100 -targetDir oksize/
# gdal_retile.py -ps 500000 40000 -overlap 100 -targetDir oksize/ r_04_17_s.tif
# gdal_retile.py -ps 35000 40000000 -overlap 100 -targetDir oksize/ r_08_17_s.tif
# gdal_retile.py -ps 100000000 35000 -overlap 100 -targetDir oksize/ r_11_17_s.tif
# gdal_retile.py -ps 100000000 28000 -overlap 100 -targetDir oksize/ r_18_20_s.tif
# gdal_retile.py -ps 40000 100000000 -overlap 100 -targetDir oksize/ r_22_18_s.tif
# gdal_retile.py -ps 40000 100000000 -overlap 100 -targetDir oksize/
# gdal_retile.py -ps 31000 100000000 -overlap 100 -targetDir oksize/ r_29_19_s.tif

## smooth SK
# cd oksize; for i in *.tif; do echo $i; whitebox_tools -r=FeaturePreservingSmoothing --dem=$i --num_iter=3 --norm_diff=30 --filter=11 -o=../smooth-sk/$i --wd=.; done

## smooth PL
# cd pl; find -name '*.tif' | parallel -j 12 whitebox_tools -r=FeaturePreservingSmoothing --dem={} --num_iter=4 --norm_diff=30 --filter=20 -o=../smooth-pl/{} --wd=.

## build SK vrt
# gdalbuildvrt -r cubic smooth-sk.vrt smooth-sk/*.tif

## build PL vrt
# gdalbuildvrt -r cubic smooth-pl.vrt smooth-pl/*.tif

## warp SK (Z17)
# gdalwarp -s_srs 'EPSG:8353' -t_srs 'EPSG:3857' -ct '+proj=pipeline +step +inv +proj=krovak +lat_0=49.5 +lon_0=24.8333333333333 +alpha=30.2881397527778 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +step +proj=push +v_3 +step +proj=cart +ellps=bessel +step +proj=helmert +x=485.021 +y=169.465 +z=483.839 +rx=-7.786342 +ry=-4.397554 +rz=-4.102655 +s=0 +convention=coordinate_frame +step +inv +proj=cart +ellps=WGS84 +step +proj=pop +v_3 +step +proj=webmerc +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +ellps=WGS84' -tr 1.194328566968441 1.194328566968441 -tap -r cubic -of GTiff -co TILED=YES -co BIGTIFF=YES -co COMPRESS=DEFLATE -co PREDICTOR=2 -co NUM_THREADS=ALL_CPUS -wo NUM_THREADS=ALL_CPUS -multi smooth-sk.vrt smooth-sk-warped.tif

## warp PL (Z17)
# gdalwarp -t_srs 'EPSG:3857' -tr 1.194328566968441 1.194328566968441 -tap -r cubic -of GTiff -co TILED=YES -co BIGTIFF=YES -co COMPRESS=DEFLATE -co PREDICTOR=2 -co NUM_THREADS=ALL_CPUS -wo NUM_THREADS=ALL_CPUS -multi smooth-pl.vrt smooth-pl-warped.tif

## Merge SK+PL
# gdalbuildvrt -r cubic merged.vrt smooth-pl-warped.tif smooth-sk-warped.tif

## Create shading
# mkdir build && make -j8 build/final.tif.ovr

## Create mask
# gdal_calc.py --co=BIGTIFF=YES --co=TILED=YES --co=NUM_THREADS=ALL_CPUS --co=COMPRESS=DEFLATE -A build/A.tif --outfile=build/mask.tif --NoDataValue=0 --calc="255"
# gdaladdo -r cubic --config BIGTIFF_OVERVIEW YES --config PREDICTOR_OVERVIEW 2 --config COMPRESS_OVERVIEW DEFLATE -ro mask.tif

## don't use: mapnik is slow with the following solution, we will use mask
# don't use: gdalbuildvrt -resolution highest -r lanczos out.vrt /home/martin/fm/freemap-mapnik/shading/build/final.tif ./build/final.tif

# for contours (PL)
# find -name '*.tif' | parallel -j 12 whitebox_tools -r=FeaturePreservingSmoothing --dem={} --num_iter=4 --norm_diff=30 --filter=20 -o=../smoother/{} --wd=.

### Contours

## SK Z14
# gdalwarp -s_srs 'EPSG:8353' -t_srs 'EPSG:3857' -ct '+proj=pipeline +step +inv +proj=krovak +lat_0=49.5 +lon_0=24.8333333333333 +alpha=30.2881397527778 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +step +proj=push +v_3 +step +proj=cart +ellps=bessel +step +proj=helmert +x=485.021 +y=169.465 +z=483.839 +rx=-7.786342 +ry=-4.397554 +rz=-4.102655 +s=0 +convention=coordinate_frame +step +inv +proj=cart +ellps=WGS84 +step +proj=pop +v_3 +step +proj=webmerc +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +ellps=WGS84' -tr 9.55462853565 9.55462853565 -tap -r cubicspline -of GTiff -co TILED=YES -co BIGTIFF=YES -co COMPRESS=DEFLATE -co PREDICTOR=2 -co NUM_THREADS=ALL_CPUS -wo NUM_THREADS=ALL_CPUS -multi sk2.vrt sk-warped.tif

## PL Z14
# gdalwarp -t_srs 'EPSG:3857' -tr 9.55462853565 9.55462853565 -tap -r cubicspline -of GTiff -co TILED=YES -co BIGTIFF=YES -co COMPRESS=DEFLATE -co PREDICTOR=2 -co NUM_THREADS=ALL_CPUS -wo NUM_THREADS=ALL_CPUS -multi pl.vrt pl-warped.tif

## merge SK+PL
# gdalbuildvrt -r bilinear merged-cont.vrt pl-warped.tif sk-warped.tif

## contours
# gdal_contour -f PostgreSQL -nln cont_dmr -i 10 -a height merged-cont.vrt "PG:host=localhost user=martin password=b0n0 dbname=martin"

## split contours using nodejs utility

# CREATE TABLE cont_dmr_split AS SELECT id, height, wkb_geometry FROM cont_dmr LIMIT 0;
# CREATE INDEX cont_dmr_split_geom_idx ON cont_dmr_split USING GIST  (wkb_geometry);

# pg_dump --username martin --format plain --verbose --file cont_dmr_split.pgdump --table cont_dmr_split
# remove owner SQL from the dump
# import on fm server: psql -h localhost -U freemap -d freemap -1 -f cont_dmr_split.pgdump

## find tiles to re-render
# gdal2tiles.py -r near -z 14 --xyz -x --processes=$(getconf _NPROCESSORS_ONLN) -n -w none mask.tif masktiles
# cd masktiles
# find -name '*.png' | sed -e 's/\.\/\|\.png//g' > ../dirty.tiles

####### simple HS
# gdalbuildvrt -r cubic -allow_projection_difference -a_srs epsg:8353 sk2.vrt d/*.tif
# gdalwarp -t_srs 'EPSG:3857' -tr 0.59716428348 0.59716428348 -tap -r cubic -of GTiff -co TILED=YES -co BIGTIFF=YES -co COMPRESS=DEFLATE -co PREDICTOR=2 -co NUM_THREADS=ALL_CPUS -wo NUM_THREADS=ALL_CPUS -multi sk.vrt sk-warped.tif
# gdaldem hillshade -alg Horn -z 1.5 -co JPEG_QUALITY=95 -co COMPRESS=JPEG -co NUM_THREADS=24 -co TILED=YES -co BIGTIFF=YES sk-warped.tif sk-hs.tif
# gdalwarp -t_srs 'EPSG:3857' -tr 0.59716428348 0.59716428348 -tap -r cubic -of GTiff -co TILED=YES -co BIGTIFF=YES -co COMPRESS=DEFLATE -co PREDICTOR=2 -co NUM_THREADS=ALL_CPUS -wo NUM_THREADS=ALL_CPUS -multi pl.vrt pl-warped.tif
# gdaldem hillshade -alg Horn -z 1.5 -co JPEG_QUALITY=95 -co COMPRESS=JPEG -co NUM_THREADS=24 -co TILED=YES -co BIGTIFF=YES pl-warped.tif pl-hs.tif
# gdalbuildvrt sh.vrt -r nearest pl-hs.tif sk-hs.tif
# gdal2tiles.py -r near -z 17 --xyz --processes=$(getconf _NPROCESSORS_ONLN) -n -w none sh.vrt sh
# find -type d | parallel -j 24 mogrify -format jpg '{}/*.png'


# SI:

gdal_rasterize -burn 255 -init 0 -a_nodata 0 -a_srs EPSG:3857 -of GTiff -co TILED=YES -co BIGTIFF=YES -co COMPRESS=DEFLATE -co PREDICTOR=2 -co NUM_THREADS=ALL_CPUS -tr 1.194328566968441 1.194328566968441 -tap -ot Byte si-sb.gpkg si-mask.tif


### Other DEM sources

https://www.planlaufterrain.com/LiDAR-Data-and-FAQ/
austria: https://data.europa.eu/data/datasets/dtm-austria?locale=en (-> https://drive.google.com/drive/folders/1jbEi-ZI4Fiyk5Qq4VWXUUOTY7yWJGkhX ; https://drive.google.com/drive/folders/1GEXis6pHcqn3MqvsDBuOlRU5kSS1O6Xk)
austria: https://data.opendataportal.at/dataset/dtm-austria

### Slovenia TODO
https://github.com/nejcd/LidarSloveniaDataDownloader/tree/master/data
https://gis.stackexchange.com/questions/338374/problem-processing-slovenian-lidar-dtm-with-gdal-and-qgis-too-many-stepy-val
https://gis.stackexchange.com/questions/389803/how-to-use-gdal-grid-with-ungridded-asc-dtm-files
http://gis.arso.gov.si/evode/profile.aspx?id=atlas_voda_Lidar@Arso&culture=en-US
https://paleoseismicity.org/tutorial-how-to-make-a-dem-from-the-slovenian-lidar-data/
https://arheologija.neocities.org/Lidar_tutorial.html

wget -i ./slovenia/urls
pdal pipeline ./slovenia/pdal_dtm.json
whitebox_tools -r=FeaturePreservingSmoothing --dem=GK_535_153_filled.tif --num_iter=3 --norm_diff=30 --filter=11 -o=./GK_535_153_smooth.tif --wd=.
python /usr/lib/python3/dist-packages/osgeo_utils/gdal_edit.py -a_srs EPSG:3794 GK_535_153_filled.tif


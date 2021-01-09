
# Makefile for lidar shading, contours and cliffs
# using folder make_data, where clipping and tiling geometries are stored
# run (cd make_data && ./tiling.sh) before this makefile !!

# # testing 
# export input_dmr35 = input/DMR35_ZBGIS/DMR3-5_10/dmr3_5_10.tif
# export input_dmr50 = input/DMR50_ZBGIS/data_sjtsk03
# export input_pl = input/polsko-geoportal-dem/tif
# export input_srtm = input/SRTM_1arc_v3
# export make_data = make_data_test

# production
export input_root = e:\mapy
# canot use /e/mapy, windows make wildcard returns nothing
#   or use relative ../ - but not working in my symlink situation
export input_dmr35 = $(input_root)/DMR3-5_ZBGIS_TIFF/DMR3-5_10/dmr3_5_10.tif
export input_dmr50 = $(input_root)/DMR5-0_ZBGIS/data_sjtsk03
export input_pl = $(input_root)/polsko-geoportal-dem/tif
export input_srtm = $(input_root)/SRTM_1arc_v3
export make_data = make_data

shading50files = $(patsubst $(input_dmr50)/%.tif,build/dmr50/%/shading.tif,$(wildcard $(input_dmr50)/*.tif))
cliffs50files = $(patsubst $(input_dmr50)/%.tif,build/dmr50/%/cliffs.gpkg,$(wildcard $(input_dmr50)/*.tif))
contour50files = $(patsubst $(input_dmr50)/%.tif,build/dmr50/%/contours.gpkg,$(wildcard $(input_dmr50)/*.tif))

pl_dem_files = $(patsubst $(make_data)/pl/%.gpkg,build/pl/retiled/%.tif,$(wildcard $(make_data)/pl/*.gpkg))
shadingfiles_pl = $(patsubst $(make_data)/pl/%.gpkg,build/pl/%/shading.tif,$(wildcard $(make_data)/pl/*.gpkg))
cliffsfiles_pl = $(patsubst $(make_data)/pl/%.gpkg,build/pl/%/cliffs.gpkg,$(wildcard $(make_data)/pl/*.gpkg))
contourfiles_pl = $(patsubst $(make_data)/pl/%.gpkg,build/pl/%/contours.gpkg,$(wildcard $(make_data)/pl/*.gpkg))

all: build/cliffs.gpkg build/contours.gpkg 
# all:  build/shading_web.tif.ovr build/cliffs.gpkg build/contours.gpkg build/contours_clipped.gpkg

currdir = $(shell pwd)
export sloperamp = $(currdir)/slope.ramp
# automatic variables
# $@ - target  |  $^ - all prerequisites space delimited | $< - first prerequisite
# $* - stem from implicit rule match "%" | $(@D) - directory part of $@
# https://www.gnu.org/software/make/manual/make.html#Pattern-Rules
# https://www.gnu.org/software/make/manual/html_node/Quick-Reference.html#Quick-Reference

define make_shading
	mkdir -p $(@D)
	cd $(@D) && $(MAKE) -f $(currdir)/makefile-shading \
		input=$(currdir)/$< \
		&& $(MAKE) -f $(currdir)/makefile-shading clean
endef


# DMR 3.5 GKU

build/dmr35/sk_dmr35_cut.tif: $(input_dmr35)
	mkdir -p $(@D)
	gdalwarp \
		-of GTiff -ot Float32 -co COMPRESS=LZW -co TILED=YES -co BIGTIFF=YES \
		-co NUM_THREADS=ALL_CPUS -wo NUM_THREADS=ALL_CPUS -multi \
		-cutline $(make_data)/dmr35-cut.geojson -cl dmr35-cut -crop_to_cutline \
		-r lanczos \
		-tr 10 10 -tap -dstnodata -9999 \
		-t_srs EPSG:8353 $^ $@
	gdalinfo -stats $@

build/dmr35/shading.tif: build/dmr35/sk_dmr35_cut.tif
	$(call make_shading)

# DMR 5.0 GKU

build/dmr50/%/shading.tif: $(input_dmr50)/%.tif
	$(call make_shading)
	# zdroje z GKU nemaju vzdy dobre nastavenu projekciu, override
	gdal_edit.py -a_srs EPSG:8353 $@
	gdal_edit.py -a_srs EPSG:8353 $(@D)/cliffs.tif

# polsko geoportal

$(input_pl)/pl.vrt: $(input_pl)
	cd $(input_pl) && ls *.tif > filelist.txt \
		&& gdalbuildvrt -input_file_list filelist.txt pl.vrt

# # resize old
# build/pl/pl_jtsk.tif: $(input_pl)/pl.vrt
# 	mkdir -p $(@D)
# 	gdalwarp \
# 		-of GTiff -ot Float32 -co COMPRESS=LZW -co TILED=YES -co BIGTIFF=YES \
# 		-co NUM_THREADS=ALL_CPUS -wo NUM_THREADS=ALL_CPUS -multi \
# 		-r cubic -order 3 \
# 		-tr 1 1 -tap \
# 		-t_srs EPSG:8353 $^ $@
# 	gdalinfo -stats $@
# 	gdaladdo \
# 	-r lanczos --config BIGTIFF_OVERVIEW YES --config GDAL_NUM_THREADS ALL_CPUS \
# 	-ro $@
# build/pl/retiled/%.tif : build/pl/pl_jtsk.tif
# 	mkdir -p $(@D)
# 	gdalwarp \
# 		-of GTiff -ot Float32 -co COMPRESS=LZW -co TILED=YES -co BIGTIFF=YES \
# 		-co NUM_THREADS=ALL_CPUS -wo NUM_THREADS=ALL_CPUS -multi \
# 		-cutline $(make_data)/pl_fat/$(basename $(@F)).gpkg -crop_to_cutline \
# 		$^ $@
# 	gdalinfo -stats $@
# 	gdaladdo \
# 	-r lanczos --config BIGTIFF_OVERVIEW YES --config GDAL_NUM_THREADS ALL_CPUS \
# 	-ro $@

# resize new in one step
build/pl/retiled/%.tif: $(input_pl)/pl.vrt
	mkdir -p $(@D)
	gdalwarp \
		-of GTiff -ot Float32 -co COMPRESS=LZW -co TILED=YES -co BIGTIFF=YES \
		-co NUM_THREADS=ALL_CPUS -wo NUM_THREADS=ALL_CPUS -multi \
		-cutline $(make_data)/pl_fat/$(basename $(@F)).gpkg -crop_to_cutline \
		-r cubic -order 3 \
		-tr 1 1 -tap \
		-t_srs EPSG:8353 $^ $@
	gdalinfo -stats $@
	gdaladdo \
	-r lanczos --config BIGTIFF_OVERVIEW YES --config GDAL_NUM_THREADS ALL_CPUS \
	-ro $@

build/pl/pl_jtsk_tiled.vrt: $(pl_dem_files)
	gdalbuildvrt $@ build/pl/retiled/*.tif

build/pl/%/shading.tif: build/pl/retiled/%.tif
	$(call make_shading)
	# no need to cut while merging, overlap not visible

# SRTM

$(input_srtm)/sk_srtm.vrt: $(input_srtm)
	cd $(input_srtm) && gdalbuildvrt sk_srtm.vrt *.hgt

build/srtm/sk_srtm_jtsk.tif: $(input_srtm)/sk_srtm.vrt
	mkdir -p $(@D)
	gdalwarp \
		-of GTiff -ot Float32 -co COMPRESS=LZW -co TILED=YES -co BIGTIFF=YES \
		-co NUM_THREADS=ALL_CPUS -wo NUM_THREADS=ALL_CPUS -multi \
		-cutline $(make_data)/limit-slovensko-buffered.geojson -crop_to_cutline \
		-r lanczos -order 3 \
		-tr 20 20 -tap -dstnodata -9999 \
		-t_srs EPSG:8353 $^ $@
	gdalinfo -stats $@

build/srtm/sk_srtm_jtsk_smooth.tif: build/srtm/sk_srtm_jtsk.tif
	whitebox_tools -r=FeaturePreservingSmoothing -v --wd="."  \
		--dem=$^ -o=$@ \
		--filter=15 --norm_diff=20.0 --num_iter=4

build/srtm/shading.tif: build/srtm/sk_srtm_jtsk_smooth.tif
	$(call make_shading)


# final shading

# with gdalbuildvrt alpha is not used to merge layers, what is convinient here 
# (only nodata like binary yes/no is used)
# order of priority from lowest to highest
# first shadings in lower resolutions with cubic, the rest lanczos
build/shading_lowres_merged.vrt: build/srtm/shading.tif build/dmr35/shading.tif 
	gdalbuildvrt -tr 1 1 -tap -r cubic  $@ $^
build/shading_merged.vrt: build/shading_lowres_merged.vrt $(shadingfiles_pl) $(shading50files) 
	gdalbuildvrt -tr 1 1 -tap -r lanczos  $@ $^

# -nosrcalpha necessary, or else alpha channel resized with nearest
# https://gis.stackexchange.com/questions/378557/gdalwarp-does-not-use-lanczos-resampling-on-image-with-alpha-channel
# PREDICTOR=2 horizontal differencing, =3 floating point pred.
# -wm 9999 window used in memory for caching - allow 10GB 
build/shading_web.tif: build/shading_merged.vrt
	gdalwarp \
		-of GTiff -co TILED=YES -co BIGTIFF=YES -co COMPRESS=LZW -co PREDICTOR=2 \
		-co NUM_THREADS=ALL_CPUS -wo NUM_THREADS=ALL_CPUS -multi \
		-r lanczos -nosrcalpha \
		-tr 1.194328566968441 1.194328566968441 -tap \
		-t_srs EPSG:3857 $^ $@

# input must be without nodata and with undefined color interpretation
# or else transparent and nodata areas are resized with ugly nearest resampling
build/shading_web.tif.ovr: build/shading_web.tif
	gdal_edit.py \
		-unsetnodata \
		-colorinterp_1 undefined \
		-colorinterp_2 undefined \
		-colorinterp_3 undefined \
		-colorinterp_4 undefined $^
	gdaladdo \
	  -r lanczos \
		--config GDAL_NUM_THREADS ALL_CPUS --config BIGTIFF_OVERVIEW YES \
		--config PHOTOMETRIC_OVERVIEW RGB \
		--config COMPRESS_OVERVIEW DEFLATE \
		-ro $^
	gdal_edit.py \
		-unsetnodata \
		-colorinterp_1 red \
		-colorinterp_2 green \
		-colorinterp_3 blue \
		-colorinterp_4 alpha $^


# CLIFFS

# geotiff2shp ; validity ; simplify ; clip
# last: convert to web_mercator ; join all together (should not overlap)
# in postgis:  subdivide ; contours -= cliffs ?

dbconfig = "PG:host=localhost user=osm password=secret dbname=osm"
export OGR_GEOJSON_MAX_OBJ_SIZE=9999
#$(info  $(cliffs50files))
# geotiff2shp (POTRACE):
# -t 1 turdsize  removes one-pixel speckles, default is 2, maybe 0 in rock areas, 
#    to keep thin gully lines
# -a 1.4  is max corner threshold
# -u 100 - output quantization - default 10 - 100 gives smoother fatures, points 
#   count is same, also some invalid geometries are gone
# for big input file size set OGR_GEOJSON_MAX_OBJ_SIZE (in MB)

build/dmr50/area.gpkg: $(make_data)/sk_dmr50_tiling.gpkg
	ogr2ogr $@ $^ -dialect SQLITE -nln sk_dmr50 -sql \
		"select st_union(geom) as geom from sk_dmr50_tiling where present = true "

build/pl/area.gpkg: $(make_data)/pl_tiling.gpkg
	ogr2ogr $@ $^ -dialect SQLITE -nln pl -sql \
		"select st_union(geom) as geom from pl_tiling where present = true "

build/pl/%/cliffs.gpkg: build/pl/%/cliffs.tif build/dmr50/area.gpkg
	./geotiff2shp.sh $< $(@D)/cliffs_wrk.gpkg 'GPKG' '-C #FFFFFF -a 1.4 -t 1 -u 100'
# geometry clipped with adjacent polygons still overlapped, so clip with little thinner one
# https://gis.stackexchange.com/questions/383335/why-do-clipped-polygon-features-clipped-with-adjacent-polygon-tiles-still-over
	ogr2ogr $(@D)/clip_wrk.gpkg $(make_data)/pl/$*.gpkg -dialect SQLITE -sql \
		"select fid, name, st_buffer(geom, -0.00001) as geom, present from $*" \
		-nln $*
# susbtract also slovak dmr5.0 areas from clip area, they are better
	ogr2ogr $(@D)/clip_wrk.gpkg build/dmr50/area.gpkg -append -update
	ogr2ogr $(@D)/clip.gpkg $(@D)/clip_wrk.gpkg -dialect SQLITE -sql \
		"select $*.fid, $*.name, ST_Difference($*.geom, sk_dmr50.geom) as geom, $*.present from $*, sk_dmr50" \
		-nln $*_nosk
	ogr2ogr $@ $(@D)/cliffs_wrk.gpkg -nln cliffs \
		-makevalid -simplify 0.1 \
		-clipdst $(@D)/clip.gpkg -clipsrclayer $*_nosk -nlt PROMOTE_TO_MULTI
	ogrinfo $@ -dialect SQLITE -sql "ALTER TABLE cliffs ADD COLUMN source text"
	ogrinfo $@ -dialect SQLITE -sql "UPDATE cliffs SET source = '$*'"

build/dmr50/%/cliffs.gpkg: build/dmr50/%/cliffs.tif
	./geotiff2shp.sh $< $(@D)/cliffs_wrk.gpkg 'GPKG' '-C #FFFFFF -a 1.4 -t 1 -u 100'
# geometry clipped with adjacent polygons still overlapped, so clip with little thinner one
	ogr2ogr $(@D)/clip.gpkg $(make_data)/sk/$*.gpkg -dialect SQLITE -sql \
		"select fid, name, st_buffer(geom, -0.00001) as geom, present from $*" \
		-nln $*		
	ogr2ogr $@ $(@D)/cliffs_wrk.gpkg -nln cliffs \
		-makevalid -simplify 0.1 \
		-clipdst $(@D)/clip.gpkg -nlt PROMOTE_TO_MULTI
	ogrinfo $@ -dialect SQLITE -sql "ALTER TABLE cliffs ADD COLUMN source text"
	ogrinfo $@ -dialect SQLITE -sql "UPDATE cliffs SET source = '$*'"
		
# -clipsrc $(make_data)/nsk_dmr50_tiling_p.gpkg -clipsrcwhere 'name = "$*"'

build/cliffs.gpkg: $(cliffsfiles_pl) $(cliffs50files)
	rm -f $@
	for gpkg_part in $^ ; do \
		ogr2ogr $@ $$gpkg_part -update -append -t_srs EPSG:3857 -nln cliffs ; \
	done
# ogr2ogr -f PostgreSQL $(dbconfig) build/cliffs.gpkg -nln cliffs_import -lco SPATIAL_INDEX=GIST
# find build -name "*.gpkg" -type f -delete


# CONTOURS

# lidar (dmr50, pl): dem_smooth ; contours ; simplify+clip
# srtm, dmr35: calculate clip areas ; contours ; clip+simplify 
# latest join all together

# make_countours, input_tif, output_gpkg
define make_contours
	gdal_contour -i 10 -a height -nln contours $(1) $(2)
endef

# do note delete smooth DEM intermediate files
.PRECIOUS: build/dmr50/%/dem_smooth.tif build/pl/%/dem_smooth.tif

build/dmr50/%/dem_smooth.tif: $(input_dmr50)/%.tif
	whitebox_tools -r=FeaturePreservingSmoothing -v --wd="." \
		--dem=$^ -o=$@ \
		--filter=20 --norm_diff=30.0 --num_iter=4
	# dem from GKU do not have always correct projection set, override
	gdal_edit.py -a_srs EPSG:8353 $@
build/dmr50/%/contours.gpkg: build/dmr50/%/dem_smooth.tif
	$(call make_contours, $<, $(@D)/contours_wrk1.gpkg)
# clip contours little bit more than cliffs to hide artefacts on cliff boundaries
	ogr2ogr $(@D)/clip_contours.gpkg $(@D)/clip.gpkg -dialect SQLITE -sql \
		"select fid, name, st_buffer(geom, -0.0001) as geom, present from $*"	\
		-nln $*
	ogr2ogr $@ $(@D)/contours_wrk1.gpkg -nln contours \
		-simplify 0.1 \
		-clipdst $(@D)/clip_contours.gpkg -nlt PROMOTE_TO_MULTI		
	ogrinfo $@ -dialect SQLITE -sql "ALTER TABLE contours ADD COLUMN source text"
	ogrinfo $@ -dialect SQLITE -sql "UPDATE contours SET source = '$*'"

build/pl/%/dem_smooth.tif: build/pl/retiled/%.tif
	mkdir -p $(@D)
	whitebox_tools -r=FeaturePreservingSmoothing -v --wd="." \
		--dem=$^ -o=$@ \
		--filter=20 --norm_diff=30.0 --num_iter=4
build/pl/%/contours.gpkg: build/pl/%/dem_smooth.tif
	$(call make_contours, $<, $(@D)/contours_wrk1.gpkg)
# clip contours little bit more than cliffs to hide artefacts on cliff boundaries
	ogr2ogr $(@D)/clip_contours.gpkg $(@D)/clip.gpkg -dialect SQLITE -sql \
		"select fid, name, st_buffer(geom, -0.0001) as geom, present from $*_nosk"	\
		-nln $*_nosk	
	ogr2ogr $@ $(@D)/contours_wrk1.gpkg -nln contours \
		-simplify 0.1 \
		-clipdst $(@D)/clip_contours.gpkg -nlt PROMOTE_TO_MULTI
	ogrinfo $@ -dialect SQLITE -sql "ALTER TABLE contours ADD COLUMN source text"
	ogrinfo $@ -dialect SQLITE -sql "UPDATE contours SET source = '$*'"

# hq_area = dmr50 + pl
build/hq_area.gpkg: build/dmr50/area.gpkg build/pl/area.gpkg
	rm -f $(@D)/hq_area_wrk.gpkg
	ogr2ogr $(@D)/hq_area_wrk.gpkg build/dmr50/area.gpkg -update -append -nln hq_area
	ogr2ogr $(@D)/hq_area_wrk.gpkg build/pl/area.gpkg -update -append -nln hq_area
	ogr2ogr $@ $(@D)/hq_area_wrk.gpkg \
		-nlt PROMOTE_TO_MULTI \
		-dialect SQLITE -nln hq_area -sql \
		"select st_union(geom) as geom from hq_area"
	rm -f $(@D)/hq_area_wrk.gpkg

# dmr35 clip area = dmr35 - hq_area
build/dmr35/area.gpkg: build/hq_area.gpkg $(make_data)/dmr35-cut.geojson
	rm -f $(@D)/area_wrk.gpkg
	ogr2ogr $(@D)/area_wrk.gpkg build/hq_area.gpkg -append -update
	ogr2ogr $(@D)/area_wrk.gpkg $(make_data)/dmr35-cut.geojson -append -update -nln dmr35 -t_srs EPSG:8353
	ogr2ogr $@ $(@D)/area_wrk.gpkg -dialect SQLITE -sql \
		"select ST_Difference(dmr35.geom, hq_area.geom) as geom from hq_area, dmr35" \
		-nln dmr35 -nlt PROMOTE_TO_MULTI
	rm -f $(@D)/area_wrk.gpkg

build/dmr35/contours.gpkg: build/dmr35/sk_dmr35_cut.tif build/dmr35/area.gpkg
	$(call make_contours, $<, $(@D)/contours_wrk1.gpkg)
	ogr2ogr $@ $(@D)/contours_wrk1.gpkg -nln contours \
		-clipsrc build/dmr35/area.gpkg -nlt PROMOTE_TO_MULTI \
		-simplify 0.1
	ogrinfo $@ -dialect SQLITE -sql "ALTER TABLE contours ADD COLUMN source text"
	ogrinfo $@ -dialect SQLITE -sql "UPDATE contours SET source = 'dmr35'"	

# srtm clip area = srtm - dmr35 - hq_area
build/srtm/area.gpkg: build/hq_area.gpkg $(make_data)/dmr35-cut.geojson $(make_data)/limit-slovensko-buffered.geojson
	rm -f $(@D)/area_wrk*.gpkg
	ogr2ogr $(@D)/area_wrk.gpkg $(make_data)/dmr35-cut.geojson -append -update -nln dmr35 -t_srs EPSG:8353
	ogr2ogr $(@D)/area_wrk.gpkg $(make_data)/limit-slovensko-buffered.geojson -append -update -nln srtm -t_srs EPSG:8353	
	ogr2ogr $(@D)/area_wrk2.gpkg $(@D)/area_wrk.gpkg -dialect SQLITE -sql \
		"select ST_Difference(srtm.geom, dmr35.geom) as geom from srtm, dmr35" \
		-nln srtm -nlt PROMOTE_TO_MULTI
	ogr2ogr $(@D)/area_wrk2.gpkg build/hq_area.gpkg -append -update
	ogr2ogr $@ $(@D)/area_wrk2.gpkg -dialect SQLITE -sql \
		"select ST_Difference(srtm.geom, hq_area.geom) as geom from srtm, hq_area" \
		-nln srtm -nlt PROMOTE_TO_MULTI
	rm -f $(@D)/area_wrk*.gpkg

build/srtm/contours.gpkg: build/srtm/sk_srtm_jtsk_smooth.tif build/srtm/area.gpkg
	$(call make_contours, $<, $(@D)/contours_wrk1.gpkg)
	ogr2ogr $@ $(@D)/contours_wrk1.gpkg -nln contours \
		-clipsrc build/srtm/area.gpkg -nlt PROMOTE_TO_MULTI \
		-simplify 0.1
	ogrinfo $@ -dialect SQLITE -sql "ALTER TABLE contours ADD COLUMN source text"
	ogrinfo $@ -dialect SQLITE -sql "UPDATE contours SET source = 'srtm'"		


build/contours.gpkg: $(contour50files) $(contourfiles_pl) build/dmr35/contours.gpkg build/srtm/contours.gpkg
	rm -f $@
	for gpkg_part in $^ ; do \
		ogr2ogr $@ $$gpkg_part -update -append -t_srs EPSG:3857 -nln contours ; \
	done
# ogr2ogr -f PostgreSQL $(dbconfig) build/contours.gpkg -nln contours_import -lco SPATIAL_INDEX=GIST

# # only test with difference contours -= cliffs , very slow
# build/contours_clipped.gpkg: build/contours.gpkg
# 	rm -f $(@D)/contours_clip_wrk.gpkg
# 	ogr2ogr $(@D)/contours_clip_wrk.gpkg $(@D)/cliffs.gpkg -dialect SQLITE -sql \
# 		"SELECT st_collect(geom) as geom from cliffs" \
# 		-nln cliffs
# 	ogr2ogr $(@D)/contours_clip_wrk.gpkg $< -update -append \
# 		-nln contours		
# 	ogr2ogr $@ $(@D)/contours_clip_wrk.gpkg -dialect SQLITE -sql \
# 		"select ST_Difference(contours.geom, cliffs.geom) from contours, cliffs" \
# 		-nln contours -nlt PROMOTE_TO_MULTI

# find build -name "*contours*.gpkg" -type f -delete

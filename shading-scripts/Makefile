build/retiled/*.tif: build/warped.tif
	mkdir -p build/retiled
	gdal_retile.py -overlap 40 -ps 10000 10000 -targetDir build/retiled build/warped.tif

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

# build/merged.vrt: build/denoised.tif build/warped.tif
# 	gdal_merge.py -o build/merged.vrt build/denoised.tif build/warped.tif

build/merged.vrt: $(cut) build/warped.tif
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

a := 0.8 * (255 - A)
b := 0.7 * (255 - B)
c := 1.0 * (255 - C)

contrast := 1.0
brightness := 0.0

define gen_band
	gdal_calc.py --co=BIGTIFF=YES --co=TILED=YES --co=NUM_THREADS=ALL_CPUS --co=COMPRESS=DEFLATE --co=PREDICTOR=2 -A build/_a.tif -B build/_b.tif -C build/_c.tif --outfile=build/$(1).tif \
		--calc="$(contrast) * (($(a) * $(2) + $(b) * $(3) + $(c) * $(4)) / (0.01 + $(a) + $(b) + $(c)) - 128.0) + 128.0 + $(brightness)"
endef

# RGB colors per sub-relief are defined in columns
#          [a]  [b]  [c]

build/R.tif: build/_a.tif build/_b.tif build/_c.tif
	$(call gen_band,R,0x20,0xFF,0x00)

build/G.tif: build/_a.tif build/_b.tif build/_c.tif
	$(call gen_band,G,0x30,0xEE,0x00)

build/B.tif: build/_a.tif build/_b.tif build/_c.tif
	$(call gen_band,B,0x60,0x00,0x00)

build/A.tif: build/_a.tif build/_b.tif build/_c.tif
	gdal_calc.py --co=BIGTIFF=YES --co=TILED=YES --co=NUM_THREADS=ALL_CPUS --co=COMPRESS=DEFLATE --co=PREDICTOR=2 -A build/_a.tif -B build/_b.tif -C build/_c.tif --outfile=build/A.tif \
		--calc="255.0 - 255.0 * ((1.0 - $(a) / 255.0) * (1.0 - $(b) / 255.0) * (1.0 - $(c) / 255.0))"

# mask for compositing multiple shadings
build/mask.tif: build/A.tif
	gdal_calc.py --co=BIGTIFF=YES --co=TILED=YES --co=NUM_THREADS=ALL_CPUS --co=COMPRESS=DEFLATE --co=PREDICTOR=2 -A build/A.tif --outfile=build/M.tif \
		--NoDataValue=0 --calc="255"

build/stack.vrt: build/R.tif build/G.tif build/B.tif build/A.tif
	gdalbuildvrt -separate build/stack.vrt build/R.tif build/G.tif build/B.tif build/A.tif
	gdal_edit.py -colorinterp_1 red -colorinterp_2 green -colorinterp_3 blue -colorinterp_4 alpha build/stack.vrt

build/final.tif: build/stack.vrt build/R.tif build/G.tif build/B.tif build/A.tif
	gdal_translate -colorinterp red,green,blue,alpha -r cubicspline -of GTiff -co "TILED=YES" -co "COMPRESS=DEFLATE" -co "PREDICTOR=2" -co BIGTIFF=YES -co NUM_THREADS=ALL_CPUS build/stack.vrt build/final.tif

build/final.tif.ovr: build/final.tif
	GDAL_CACHEMAX=4096 gdaladdo -ro -r lanczos --config BIGTIFF_OVERVIEW YES --config PREDICTOR_OVERVIEW 2 --config COMPRESS_OVERVIEW DEFLATE --config GDAL_NUM_THREADS ALL_CPUS --config NUM_THREADS_OVERVIEW ALL_CPUS build/final.tif

build/mask.tif.ovr: build/mask.tif
	GDAL_CACHEMAX=4096 gdaladdo -ro -r lanczos --config BIGTIFF_OVERVIEW YES --config PREDICTOR_OVERVIEW 2 --config COMPRESS_OVERVIEW DEFLATE --config GDAL_NUM_THREADS ALL_CPUS --config NUM_THREADS_OVERVIEW ALL_CPUS build/mask.tif

# see https://stackoverflow.com/questions/62614229/how-to-define-prerequisite-for-automatic-variable-in-makefile/62615490
# make -j8 step1 && make -j8 step2 && make -j8 step3 && make -j8 step4 && make -j8 build/final.tif.ovr build/final.mask.ovr

clean:
	rm -rf build

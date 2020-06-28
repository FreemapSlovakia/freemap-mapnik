build/hgt.tif: hgt/*.HGT
	mkdir -p build
	gdal_merge.py -o build/hgt.tif hgt/*.HGT

  	# -dstnodata NaN \

build/wrapped-hgt.tif: build/hgt.tif
	gdalwarp \
		-overwrite \
		-of GTiff \
		-ot Float32 \
		-co NBITS=16 \
		-co TILED=YES \
		-co PREDICTOR=3 \
		-co COMPRESS=ZSTD \
		-co NUM_THREADS=ALL_CPUS \
		-multi \
		-wo NUM_THREADS=ALL_CPUS \
		-srcnodata -9999 \
		-r cubicspline \
		-order 3 \
		-tr 19.109257071294062687 19.109257071294062687 \
		-tap \
		-t_srs "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs +over" \
		build/hgt.tif build/wrapped-hgt.tif

build/retiled/*.tif: build/wrapped-hgt.tif
	mkdir -p build/retiled
	gdal_retile.py -overlap 40 -ps 1000 1000 -targetDir build/retiled build/wrapped-hgt.tif

build/asc/%.asc: build/retiled/%.tif
	mkdir -p build/asc
	gdal_translate -of AAIGrid $< $@

asc = $(patsubst build/retiled/%.tif,build/asc/%.asc,$(wildcard build/retiled/*.tif))

denoised = $(patsubst build/asc/%.asc,build/denoised/%.asc,$(wildcard build/asc/*.asc))

build/denoised/%.asc: build/asc/%.asc
	mkdir -p build/denoised
	mdenoise -i $< -n 15 -t 0.98 -o $@

cut = $(patsubst build/denoised/%.asc,build/cut/%.tif,$(wildcard build/denoised/*.asc))

build/cut/%.tif: build/denoised/%.asc
	mkdir -p build/cut
	./cut.sh $< $@

foo1: build/retiled/*.tif

foo2: $(asc)

foo3: $(denoised)

foo4: $(cut)

build/denoised.tif: build/cut/*.tif
	gdal_merge.py -o build/denoised.tif build/cut/*.tif

build/shading.tif: build/denoised.tif
	gdaldem hillshade -igor build/denoised.tif build/shading.tif

build/not-denoised.tif: build/asc/*.asc
	gdal_merge.py -o build/not-denoised.tif build/asc/*.asc

build/shading2.tif: build/not-denoised.tif
	gdaldem hillshade -igor build/not-denoised.tif build/shading2.tif

batch:
	make foo1 && make foo2 && make foo3 && make foo4 && make all

all: build/shading.tif build/shading2.tif

# build/retiled/%.asc : build/retiled/%.asc
# 	mdenoise -i square.asc -n 3 -t 0.99 -o square_dn.asc

clean:
	rm -rf build

sk:
	gdalwarp \
		-overwrite	\
		-of GTiff	\
		-ot Float32	\
		-co NBITS=16	\
		-co TILED=YES	\
		-co PREDICTOR=3	\
		-co COMPRESS=ZSTD	\
		-co NUM_THREADS=ALL_CPUS	\
		-multi	\
		-wo NUM_THREADS=ALL_CPUS	\
		-srcnodata -9999 \
		-dstnodata NaN \
		-r cubicspline \
		-order 3 \
		-tr 19.109257071294062687 19.109257071294062687 \
		-tap \
		-s_srs 'EPSG:5514' \
		-t_srs "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs +over" \
		-ct "+proj=pipeline +step +inv +proj=krovak +lat_0=49.5 +lon_0=24.8333333333333 +alpha=30.2881397527778 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +step +inv +proj=hgridshift +grids=Slovakia_JTSK03_to_JTSK.gsb +step +proj=krovak +lat_0=49.5 +lon_0=24.8333333333333 +alpha=30.2881397527778 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +step +inv +proj=krovak +lat_0=49.5 +lon_0=24.8333333333333 +alpha=30.2881397527778 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +step +proj=push +v_3 +step +proj=cart +ellps=bessel +step +proj=helmert +x=485.021 +y=169.465 +z=483.839 +rx=-7.786342 +ry=-4.397554 +rz=-4.102655 +s=0 +convention=coordinate_frame +step +inv +proj=cart +ellps=WGS84 +step +proj=pop +v_3 +step +proj=webmerc +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +ellps=WGS84" \
		sk.tiff \
		sk_w.tiff

		# -t_srs 'EPSG:3857' \

# see https://stackoverflow.com/questions/62614229/how-to-define-prerequisite-for-automatic-variable-in-makefile/62615490
# make -j24 foo1 && make -j24 foo2 && make -j24 foo3 && make -j24 foo4 && make -j24 all

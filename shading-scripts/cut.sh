#!/bin/bash
read x y <<< $(gdalinfo $1 | grep 'Size is' | tr -c [:digit:] ' ')

gdal_translate -srcwin 20 20 $((x - 40)) $((y - 40)) $1 $2


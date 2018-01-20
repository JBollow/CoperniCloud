#!/bin/bash
cd /opt/sentinel2
for folder in */; do
    echo "start gentiles for $folder"
    cd /opt/sentinel2/"$folder"GRANULE
    for sfolder in */; do
        cd ./"$sfolder"/IMG_DATA
        for file in ./*.jp2; do
            echo "generate tiles for $file"
            sfile="${file%.*}"
            gdal2tiles.py --profile=mercator -z 3-13 ./"${file##*/}" /opt/tiles/"$folder"/"${sfile: -3}"/ &
        done
        wait
    done
done
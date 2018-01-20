#!/bin/bash
cd Y:/Downloads/Test/sentinel2
for folder in */; do
    echo "start gentiles for $folder"
    cd Y:/Downloads/Test/sentinel2/"$folder"GRANULE
    for sfolder in */; do
        cd ./"$sfolder"/IMG_DATA
        for s2folder in */; do
                cd ./"$s2folder"
                for file in ./*.jp2; do
                    echo "generate tiles for $file"
                    sfile="${file%.*}"
                    s2file="${sfile: -7}"
                    gdal2tiles.py --profile=mercator -z 3-5 ./"${file##*/}" Y:/Downloads/Test/tiles/"$folder"/"$s2folder"/"${s2file::-4}"/ &
                done
                wait
        done
    done
done
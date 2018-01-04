#!/bin/bash
DIR=$PWD
if [ ! -d "$DIR/tiles" ]; then
    mkdir "$DIR/tiles"
    echo "tiles dir created"
fi

cd $DIR/sat_data

for folder in */; do
    echo "start gentiles for $folder"
    cd "$folder"GRANULE
    for sfolder in */; do
        cd ./"$sfolder"/IMG_DATA
        for file in ./*.jp2; do
            echo "generate tiles for $file"
            sfile="${file%.*}"
            gdal2tiles.py --profile=mercator -z 3-13 ./"${file##*/}" "$DIR/sat_data/tiles/$folder"/"${sfile: -3}"/ &
        done
        wait
    done
    echo "done with $folder"
done

echo "finito, all tiles are there"

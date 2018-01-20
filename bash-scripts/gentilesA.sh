#!/bin/bash
cd /opt/sentinel2/S2A_MSIL2A_20170410T103021_N0204_R108_T32TMR_20170410T103020.SAFE/GRANULE
    for sfolder in */; do
        cd ./"$sfolder"/IMG_DATA
        for s2folder in */; do
            cd ./"$s2folder"
            for file in ./*.jp2; do
                echo "generate tiles for $file"
                sfile="${file%.*}"
                s2file="${sfile: -7}"
                gdal2tiles.py --profile=mercator -z 9-11 ./"${file##*/}" /opt/tiles/S2A_MSIL2A_20170410T103021_N0204_R108_T32TMR_20170410T103020.SAFE/"$s2folder"/"${s2file::-4}"/ &
            done
            wait
        done
    done
cd /opt/sentinel2/S2A_MSIL2A_20170420T103021_N0204_R108_T32TMR_20170420T103454.SAFE/GRANULE
    for sfolder in */; do
        cd ./"$sfolder"/IMG_DATA
        for s2folder in */; do
            cd ./"$s2folder"
            for file in ./*.jp2; do
                echo "generate tiles for $file"
                sfile="${file%.*}"
                s2file="${sfile: -7}"
                gdal2tiles.py --profile=mercator -z 9-11 ./"${file##*/}" /opt/tiles/S2A_MSIL2A_20170420T103021_N0204_R108_T32TMR_20170420T103454.SAFE/"$s2folder"/"${s2file::-4}"/ &
            done
            wait
        done
    done
cd /opt/sentinel2/S2A_MSIL2A_20170430T103021_N0205_R108_T32TLS_20170430T103024.SAFE/GRANULE
    for sfolder in */; do
        cd ./"$sfolder"/IMG_DATA
        for s2folder in */; do
            cd ./"$s2folder"
            for file in ./*.jp2; do
                echo "generate tiles for $file"
                sfile="${file%.*}"
                s2file="${sfile: -7}"
                gdal2tiles.py --profile=mercator -z 9-11 ./"${file##*/}" /opt/tiles/S2A_MSIL2A_20170430T103021_N0205_R108_T32TLS_20170430T103024.SAFE/"$s2folder"/"${s2file::-4}"/ &
            done
            wait
        done
    done
cd /opt/sentinel2/S2A_MSIL2A_20170510T103031_N0205_R108_T32TLS_20170510T103025.SAFE/GRANULE
    for sfolder in */; do
        cd ./"$sfolder"/IMG_DATA
        for s2folder in */; do
            cd ./"$s2folder"
            for file in ./*.jp2; do
                echo "generate tiles for $file"
                sfile="${file%.*}"
                s2file="${sfile: -7}"
                gdal2tiles.py --profile=mercator -z 9-11 ./"${file##*/}" /opt/tiles/S2A_MSIL2A_20170510T103031_N0205_R108_T32TLS_20170510T103025.SAFE/"$s2folder"/"${s2file::-4}"/ &
            done
            wait
        done
    done
cd /opt/sentinel2/S2A_MSIL2A_20170517T102031_N0205_R065_T32TLS_20170517T102352.SAFE/GRANULE
    for sfolder in */; do
        cd ./"$sfolder"/IMG_DATA
        for s2folder in */; do
            cd ./"$s2folder"
            for file in ./*.jp2; do
                echo "generate tiles for $file"
                sfile="${file%.*}"
                s2file="${sfile: -7}"
                gdal2tiles.py --profile=mercator -z 9-11 ./"${file##*/}" /opt/tiles/S2A_MSIL2A_20170517T102031_N0205_R065_T32TLS_20170517T102352.SAFE/"$s2folder"/"${s2file::-4}"/ &
            done
            wait
        done
    done
cd /opt/sentinel2/S2A_MSIL2A_20170527T102031_N0205_R065_T32TMR_20170527T102301.SAFE/GRANULE
    for sfolder in */; do
        cd ./"$sfolder"/IMG_DATA
        for s2folder in */; do
            cd ./"$s2folder"
            for file in ./*.jp2; do
                echo "generate tiles for $file"
                sfile="${file%.*}"
                s2file="${sfile: -7}"
                gdal2tiles.py --profile=mercator -z 9-11 ./"${file##*/}" /opt/tiles/S2A_MSIL2A_20170527T102031_N0205_R065_T32TMR_20170527T102301.SAFE/"$s2folder"/"${s2file::-4}"/ &
            done
            wait
        done
    done
cd /opt/sentinel2/S2A_MSIL2A_20170619T103021_N0205_R108_T32TLS_20170619T103021.SAFE/GRANULE
    for sfolder in */; do
        cd ./"$sfolder"/IMG_DATA
        for s2folder in */; do
            cd ./"$s2folder"
            for file in ./*.jp2; do
                echo "generate tiles for $file"
                sfile="${file%.*}"
                s2file="${sfile: -7}"
                gdal2tiles.py --profile=mercator -z 9-11 ./"${file##*/}" /opt/tiles/S2A_MSIL2A_20170619T103021_N0205_R108_T32TLS_20170619T103021.SAFE/"$s2folder"/"${s2file::-4}"/ &
            done
            wait
        done
    done
cd /opt/sentinel2/S2A_MSIL2A_20170706T102021_N0205_R065_T32TLS_20170706T102301.SAFE/GRANULE
    for sfolder in */; do
        cd ./"$sfolder"/IMG_DATA
        for s2folder in */; do
            cd ./"$s2folder"
            for file in ./*.jp2; do
                echo "generate tiles for $file"
                sfile="${file%.*}"
                s2file="${sfile: -7}"
                gdal2tiles.py --profile=mercator -z 9-11 ./"${file##*/}" /opt/tiles/S2A_MSIL2A_20170706T102021_N0205_R065_T32TLS_20170706T102301.SAFE/"$s2folder"/"${s2file::-4}"/ &
            done
            wait
        done
    done
cd /opt/sentinel2/S2A_MSIL2A_20170706T102021_N0205_R065_T32TMS_20170706T102301.SAFE/GRANULE
    for sfolder in */; do
        cd ./"$sfolder"/IMG_DATA
        for s2folder in */; do
            cd ./"$s2folder"
            for file in ./*.jp2; do
                echo "generate tiles for $file"
                sfile="${file%.*}"
                s2file="${sfile: -7}"
                gdal2tiles.py --profile=mercator -z 9-11 ./"${file##*/}" /opt/tiles/S2A_MSIL2A_20170706T102021_N0205_R065_T32TMS_20170706T102301.SAFE/"$s2folder"/"${s2file::-4}"/ &
            done
            wait
        done
    done
cd /opt/sentinel2/S2A_MSIL2A_20170719T103021_N0205_R108_T32TMS_20170719T103023.SAFE/GRANULE
    for sfolder in */; do
        cd ./"$sfolder"/IMG_DATA
        for s2folder in */; do
            cd ./"$s2folder"
            for file in ./*.jp2; do
                echo "generate tiles for $file"
                sfile="${file%.*}"
                s2file="${sfile: -7}"
                gdal2tiles.py --profile=mercator -z 9-11 ./"${file##*/}" /opt/tiles/S2A_MSIL2A_20170719T103021_N0205_R108_T32TMS_20170719T103023.SAFE/"$s2folder"/"${s2file::-4}"/ &
            done
            wait
        done
    done
cd /opt/sentinel2/S2A_MSIL2A_20170805T102031_N0205_R065_T32TLR_20170805T102535.SAFE/GRANULE
    for sfolder in */; do
        cd ./"$sfolder"/IMG_DATA
        for s2folder in */; do
            cd ./"$s2folder"
            for file in ./*.jp2; do
                echo "generate tiles for $file"
                sfile="${file%.*}"
                s2file="${sfile: -7}"
                gdal2tiles.py --profile=mercator -z 9-11 ./"${file##*/}" /opt/tiles/S2A_MSIL2A_20170805T102031_N0205_R065_T32TLR_20170805T102535.SAFE/"$s2folder"/"${s2file::-4}"/ &
            done
            wait
        done
    done
cd /opt/sentinel2/S2A_MSIL2A_20170805T102031_N0205_R065_T32TMR_20170805T102535.SAFE/GRANULE
    for sfolder in */; do
        cd ./"$sfolder"/IMG_DATA
        for s2folder in */; do
            cd ./"$s2folder"
            for file in ./*.jp2; do
                echo "generate tiles for $file"
                sfile="${file%.*}"
                s2file="${sfile: -7}"
                gdal2tiles.py --profile=mercator -z 9-11 ./"${file##*/}" /opt/tiles/S2A_MSIL2A_20170805T102031_N0205_R065_T32TMR_20170805T102535.SAFE/"$s2folder"/"${s2file::-4}"/ &
            done
            wait
        done
    done
cd /opt/sentinel2/S2A_MSIL2A_20170815T102021_N0205_R065_T32TLR_20170815T102513.SAFE/GRANULE
    for sfolder in */; do
        cd ./"$sfolder"/IMG_DATA
        for s2folder in */; do
            cd ./"$s2folder"
            for file in ./*.jp2; do
                echo "generate tiles for $file"
                sfile="${file%.*}"
                s2file="${sfile: -7}"
                gdal2tiles.py --profile=mercator -z 9-11 ./"${file##*/}" /opt/tiles/S2A_MSIL2A_20170815T102021_N0205_R065_T32TLR_20170815T102513.SAFE/"$s2folder"/"${s2file::-4}"/ &
            done
            wait
        done
    done
cd /opt/sentinel2/S2A_MSIL2A_20170815T102021_N0205_R065_T32TMR_20170815T102513.SAFE/GRANULE
    for sfolder in */; do
        cd ./"$sfolder"/IMG_DATA
        for s2folder in */; do
            cd ./"$s2folder"
            for file in ./*.jp2; do
                echo "generate tiles for $file"
                sfile="${file%.*}"
                s2file="${sfile: -7}"
                gdal2tiles.py --profile=mercator -z 9-11 ./"${file##*/}" /opt/tiles/S2A_MSIL2A_20170815T102021_N0205_R065_T32TMR_20170815T102513.SAFE/"$s2folder"/"${s2file::-4}"/ &
            done
            wait
        done
    done
cd /opt/sentinel2/S2A_MSIL2A_20170815T102021_N0205_R065_T32TMS_20170815T102513.SAFE/GRANULE
    for sfolder in */; do
        cd ./"$sfolder"/IMG_DATA
        for s2folder in */; do
            cd ./"$s2folder"
            for file in ./*.jp2; do
                echo "generate tiles for $file"
                sfile="${file%.*}"
                s2file="${sfile: -7}"
                gdal2tiles.py --profile=mercator -z 9-11 ./"${file##*/}" /opt/tiles/S2A_MSIL2A_20170815T102021_N0205_R065_T32TMS_20170815T102513.SAFE/"$s2folder"/"${s2file::-4}"/ &
            done
            wait
        done
    done
cd /opt/sentinel2/S2A_MSIL2A_20170818T103021_N0205_R108_T32TLS_20170818T103421.SAFE/GRANULE
    for sfolder in */; do
        cd ./"$sfolder"/IMG_DATA
        for s2folder in */; do
            cd ./"$s2folder"
            for file in ./*.jp2; do
                echo "generate tiles for $file"
                sfile="${file%.*}"
                s2file="${sfile: -7}"
                gdal2tiles.py --profile=mercator -z 9-11 ./"${file##*/}" /opt/tiles/S2A_MSIL2A_20170818T103021_N0205_R108_T32TLS_20170818T103421.SAFE/"$s2folder"/"${s2file::-4}"/ &
            done
            wait
        done
    done
cd /opt/sentinel2/S2A_MSIL2A_20170825T102021_N0205_R065_T32TLS_20170825T102114.SAFE/GRANULE
    for sfolder in */; do
        cd ./"$sfolder"/IMG_DATA
        for s2folder in */; do
            cd ./"$s2folder"
            for file in ./*.jp2; do
                echo "generate tiles for $file"
                sfile="${file%.*}"
                s2file="${sfile: -7}"
                gdal2tiles.py --profile=mercator -z 9-11 ./"${file##*/}" /opt/tiles/S2A_MSIL2A_20170825T102021_N0205_R065_T32TLS_20170825T102114.SAFE/"$s2folder"/"${s2file::-4}"/ &
            done
            wait
        done
    done
cd /opt/sentinel2/S2A_MSIL2A_20170825T102021_N0205_R065_T32TMS_20170825T102114.SAFE/GRANULE
    for sfolder in */; do
        cd ./"$sfolder"/IMG_DATA
        for s2folder in */; do
            cd ./"$s2folder"
            for file in ./*.jp2; do
                echo "generate tiles for $file"
                sfile="${file%.*}"
                s2file="${sfile: -7}"
                gdal2tiles.py --profile=mercator -z 9-11 ./"${file##*/}" /opt/tiles/S2A_MSIL2A_20170825T102021_N0205_R065_T32TMS_20170825T102114.SAFE/"$s2folder"/"${s2file::-4}"/ &
            done
            wait
        done
    done
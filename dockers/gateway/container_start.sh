#!/bin/bash
set -x

if [ "$#" -eq 0 ]; then
	TARGET_BOARD=esp32c3
else
	TARGET_BOARD=$1
fi

docker container stop $(docker container ls -q --filter name=creator_gateway)
docker container rm creator_gateway

docker build -t creator_gateway . --build-arg TARGET_BOARD=${TARGET_BOARD}
docker run --init -it -v /dev/:/dev/ -p 8080:8080 --name creator_gateway creator_gateway
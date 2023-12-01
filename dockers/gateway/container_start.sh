#!/bin/bash
set -x

docker container stop $(docker container ls -q --filter name=creator_gateway)
docker container rm creator_gateway

docker build -t creator_gateway . --build-arg TARGET_BOARD=esp32c3
docker run --init -it -v /dev/:/dev/ -p 8080:8080 --name creator_gateway creator_gateway
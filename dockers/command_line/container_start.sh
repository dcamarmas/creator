#!/bin/bash
set -x

docker container stop $(docker container ls -q --filter name=creator_cl)
docker container rm creator_cl

docker build -t creator_cl .
docker run --init -it --name creator_cl creator_cl
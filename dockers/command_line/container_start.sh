#!/bin/bash
set -x

docker container stop $(docker container ls -q --filter name=creatorsim/creator_cl)
docker container rm creatorsim/creator_cl

docker build -t creatorsim/creator_cl .
docker run --init -it --name creatorsim/creator_cl creatorsim/creator_cl
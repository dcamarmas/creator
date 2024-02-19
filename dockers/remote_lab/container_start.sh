#!/bin/bash


#
# Main
#

docker pull creatorsim/creator_remote_lab

if [[ -n $(docker container ls -q --filter name=creator_remote_lab) ]]; then
   docker container stop $(docker container ls -q --filter name=creator_remote_lab)
fi

docker container rm creator_remote_lab

if [ $# -ne 0 ]; then
   docker build -t creatorsim/creator_remote_lab .
fi

docker run --init -it -p 5000:5000 --name creator_remote_lab creatorsim/creator_remote_lab /bin/bash

echo " Done."

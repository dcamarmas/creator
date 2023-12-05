#!/bin/bash


#
# Auxiliar functions
#

intro() {
   echo ""
   echo " CREATOR Command Line"
   echo " --------------------"
   echo ""
}


#
# Main
#

intro

docker pull creatorsim/creator_cl

if [[ -n $(docker container ls -q --filter name=creator_cl) ]]; then
   docker container stop $(docker container ls -q --filter name=creator_cl)
fi

docker container rm creator_cl

docker run -it --name creator_cl creatorsim/creator_cl /bin/bash

echo " Done."

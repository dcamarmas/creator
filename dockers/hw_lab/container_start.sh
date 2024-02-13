#!/bin/bash


#
# Default values
#
TARGET_BOARD=esp32c3
TARGET_PORT=/dev/ttyUSB0


#
# Auxiliar functions
#

intro() {
   echo ""
   echo " CREATOR Gateway"
   echo " ---------------"
   echo ""
}

usage() {
   echo " Usage: $0 [--target_board      esp32c3] \\"
   echo "                             [--target_port       /dev/ttyUSB0] \\"
   echo ""
}

info() {
   echo " * Target Board: "${TARGET_BOARD}
   echo " * Target Port:  "${TARGET_PORT}
   echo ""
}

get_opts() {
   # Taken the general idea from https://stackoverflow.com/questions/70951038/how-to-use-getopt-long-option-in-bash-script
   name=$(basename "$0")
   short_opt=b:,p:,h
   long_opt=target_board:,target_port:,help
   TEMP=$(getopt -o $short_opt --long $long_opt --name "$name" -- "$@")
   eval set -- "${TEMP}"

   while :; do
      case "${1}" in
         -b | --target_board     ) TARGET_BOARD=$2;         shift 2 ;;
         -p | --target_port      ) TARGET_PORT=$2;          shift 2 ;;
         -h | --help             ) intro; usage;  exit 0 ;;
         --                      ) shift;         break  ;;
         *                       ) intro; echo " > ERROR: parsing arguments found an error :-/"; usage; exit 1 ;;
      esac
   done
}


#
# Main
#

# Check arguments, and print it
get_opts $@
intro
info

docker pull creatorsim/creator_gateway

if [[ -n $(docker container ls -q --filter name=creator_gateway) ]]; then
   docker container stop $(docker container ls -q --filter name=creator_gateway)
fi

docker container rm creator_gateway

if [ $# -ne 0 ]; then
   docker build -t creatorsim/creator_gateway . --build-arg TARGET_BOARD=${TARGET_BOARD}
fi

docker run --init -it --device=${TARGET_PORT} -p 8080:8080 --name creator_gateway creatorsim/creator_gateway /bin/bash

echo " Done."

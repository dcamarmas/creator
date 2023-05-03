#!/bin/bash
set -x

python3 creator_build.py $1
idf.py build
idf.py -p /dev/cu.usbserial-1110  flash
idf.py  -p /dev/cu.usbserial-1110  monitor


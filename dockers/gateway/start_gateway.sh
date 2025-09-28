#!/bin/bash

#Load espressif environment
export IDF_PATH=/esp/esp-idf/
. /esp/esp-idf/export.sh

#Run gateway
export PYTHONPATH=/usr/local/lib/python3.12/dist-packages:${PYTHONPATH}
cd /drivers
python3 gateway.py
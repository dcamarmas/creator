#!/bin/bash

#Run gateway
export PYTHONPATH=/usr/local/lib/python3.10/dist-packages:${PYTHONPATH}
cd /creator/hw_lab/
python3 hw_lab.py deployment.json
#!/bin/bash

#Run gateway
export PYTHONPATH=/usr/local/lib/python3.10/dist-packages:${PYTHONPATH}
cd /creator/remote_lab/
python3 remote_lab.py deployment.json
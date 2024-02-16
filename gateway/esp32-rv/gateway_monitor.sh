#!/bin/bash

if [ $# -lt 2 ]; then
	exit -1
fi

{
    sleep $2
    kill -9 $$
} &

idf.py -p $1 monitor &> monitor_output.txt

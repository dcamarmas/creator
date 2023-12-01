#!/bin/bash

# welcome
echo ""
echo "  CREATOR docker generator"
echo " -------------------------"
echo ""


# skeleton
echo "  Generating:"
echo "  * Gateway docker..."
echo "  * Command line docker..."
echo ""

cd dockers/gateway

docker container stop $(docker container ls -q --filter name=creator_gateway)
docker container rm creator_gateway
docker build -t creator_gateway .



# the end
echo ""
echo "  CREATOR dockers generated (if no error was shown)."
echo ""


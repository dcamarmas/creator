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

cd dockers

#Build gateway docker
cd gateway
docker container stop $(docker container ls -q --filter name=creatorsim/creator_gateway)
docker container rm creatorsim/creator_gateway
docker build -t creatorsim/creator_gateway .
cd ..

#Build command line docker
cd command_line
docker container stop $(docker container ls -q --filter name=creatorsim/creator_cl)
docker container rm creatorsim/creator_cl
docker build -t creatorsim/creator_cl .
cd ..



# the end
echo ""
echo "  CREATOR dockers generated (if no error was shown)."
echo ""


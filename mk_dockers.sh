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
#docker build --no-cache -t creatorsim/creator_gateway .
 docker buildx build --no-cache --platform linux/amd64,linux/arm64,linux/arm/v7 -t creatorsim/creator_gateway .
cd ..

#Build remote_lab docker
cd remote_lab
docker container stop $(docker container ls -q --filter name=creatorsim/creator_remote_lab)
docker container rm creatorsim/creator_remote_lab
#docker build --no-cache -t creatorsim/creator_remote_lab .
 docker buildx build --no-cache --platform linux/amd64,linux/arm64,linux/arm/v7 -t creatorsim/creator_remote_lab .
cd ..

#Build command line docker
cd command_line
docker container stop $(docker container ls -q --filter name=creatorsim/creator_cl)
docker container rm creatorsim/creator_cl
#docker build        --no-cache                                                 -t creatorsim/creator_cl .
 docker buildx build --no-cache --platform linux/amd64,linux/arm64,linux/arm/v7 -t creatorsim/creator_cl .
cd ..



# the end
echo ""
echo "  CREATOR dockers generated (if no error was shown)."
echo ""


#!/bin/bash

# welcome
echo ""
echo "  CREATOR packer"
echo " ----------------"
echo ""


# skeleton
echo "  Packing:"
echo "  * Gateway zipping..."

cd gateway
rm *.zip

zip -9rq esp32c2.zip esp32c2/
zip -9rq esp32c3.zip esp32c3/
zip -9rq esp32c6.zip esp32c6/
zip -9rq esp32h2.zip esp32h2/
zip -9rq esp32s2.zip esp32s2/
zip -9rq esp32s3.zip esp32s3/
cd ..

echo "  Generating:"
echo "  * Gateway docker..."
echo ""

cd dockers

#Build gateway docker
cd gateway
docker container stop $(docker container ls -q --filter name=creatorsim/creator_gateway)
docker container rm creatorsim/creator_gateway
docker build --no-cache -t creatorsim/creator_gateway .
cd ..


# the end
echo ""
echo "  CREATOR packed (if no error was shown)."
echo ""



FROM ubuntu:22.04

ENV TZ=Europe/Madrid
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

EXPOSE 5000

WORKDIR /

RUN apt update && apt-get install -y \
        sudo \
        wget \
        curl \
        lynx \
        git \
        npm \
        vim \
        aha \
        7zip \
        unrar \
        zip \
        unzip

#Hardware lab dependencies install
RUN apt update && apt-get install -y \
        python3 \
        python3-pip \
        python3-venv

RUN pip3 --no-cache install flask flask_cors requests


#Download CREATOR
RUN git clone https://github.com/creatorsim/creator.git && \
    cd creator && \
    npm install terser jshint colors yargs readline-sync

RUN ln -s /creator/remote_lab/deployment.json deployment.json


#Run web service
COPY start_remote_lab.sh .
CMD ["/usr/bin/sleep","infinity"]
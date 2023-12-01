
FROM ubuntu:22.04

ENV TZ=Europe/Madrid
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

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
        rar \
        unrar \
        zip \
        unzip


#Download CREATOR
RUN git clone https://github.com/creatorsim/creator.git && \
    cd creator && \
    npm install terser jshint colors yargs readline-sync


#Run bash
ENTRYPOINT ["bash"]
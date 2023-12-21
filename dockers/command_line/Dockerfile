
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
        unrar \
        zip \
        unzip


#Download CREATOR
RUN git clone https://github.com/creatorsim/creator.git && \
    cd creator && \
    npm install terser jshint colors yargs readline-sync


#Create workdir
RUN mkdir -p /creator_workdir && \
    cd       /creator_workdir && \
    ln -s    /creator/creator.sh creator.sh && \
    ln -s    /creator/architecture architecture && \
    ln -s    /creator/examples examples && \
    touch    assembly.s && \
    mkdir    shared

WORKDIR /creator_workdir

#Run bash
CMD ["/usr/bin/sleep","infinity"]

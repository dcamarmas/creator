
FROM ubuntu:22.04

ENV TZ=Europe/Madrid
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

EXPOSE 8080

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


#Espressif dependencies install
RUN apt update && apt-get install -y \
        git \
        wget \
        flex \
        bison \
        gperf \
        python3 \
        python3-pip \
        python3-venv \
        cmake ninja-build \
        ccache \
        libffi-dev \
        libssl-dev \
        dfu-util \
        libusb-1.0-0

#Espressif drivers install
RUN mkdir -p /esp && \
        cd /esp && \
        git clone --recursive https://github.com/espressif/esp-idf.git && \
        cd /esp/esp-idf && \
        ./install.sh all


#Download CREATOR
RUN git clone https://github.com/creatorsim/creator.git && \
    cd creator && \
    npm install terser jshint colors yargs readline-sync


#Gateway environment setup
ARG TARGET_BOARD=esp32c3 //Default value provided
RUN pip3 --no-cache install flask flask_cors
RUN mv /creator/gateway/${TARGET_BOARD}.zip . && \
        unzip ${TARGET_BOARD}.zip && \
        mv ${TARGET_BOARD} drivers && \
        rm -f ${TARGET_BOARD}.zip


#Run web service
COPY start_gateway.sh .
CMD ["/usr/bin/sleep","infinity"]
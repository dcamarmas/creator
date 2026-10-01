FROM ubuntu:26.04

ENV TZ=Europe/Madrid
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /

RUN apt update && apt-get install -y \
        sudo \
        wget \
        curl \
        lynx \
        git \
        vim \
        aha \
        7zip \
        unrar \
        zip \
        unzip \
        build-essential


RUN apt update && apt-get install -y \
        nodejs \
        npm


RUN curl -fsSL https://deno.land/install.sh | sh -s -- -y && \
    curl -fsSL https://bun.sh/install | bash && \
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

ENV PATH="/root/.cargo/bin:/root/.deno/bin:/root/.bun/bin:${PATH}"

RUN rustup target add wasm32-unknown-unknown


RUN git clone --recurse-submodules https://github.com/creatorsim/creator.git && \
    cd creator && \
    bun install && \
    bun dev:wasm

RUN mkdir /workspace
WORKDIR /workspace


ENTRYPOINT ["/creator/creator.sh"]
CMD [ "-a", "/creator/architecture/RISCV/RV32IMFD.yml" ]

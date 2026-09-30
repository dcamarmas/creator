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


# OpenSSH: Install
RUN apt-get install -y --no-install-recommends openssh-client openssh-server
RUN mkdir -p /var/run/sshd

# OpenSSH: Allow Root login
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd
RUN sed -i 's/PermitRootLogin prohibit-password/#PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
RUN echo "PermitRootLogin yes" >> /etc/ssh/sshd_config
# OpenSSH: Allow to talk to containers without asking for confirmation
RUN cat /etc/ssh/ssh_config | grep -v StrictHostKeyChecking > /etc/ssh/ssh_config.new && \
    echo "    StrictHostKeyChecking no" >> /etc/ssh/ssh_config.new && \
    mv /etc/ssh/ssh_config.new /etc/ssh/ssh_config
# OpenSSH: keygen
RUN ssh-keygen -q -t rsa -N "" -f /root/.ssh/id_rsa
RUN cp /root/.ssh/id_rsa.pub /root/.ssh/authorized_keys


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

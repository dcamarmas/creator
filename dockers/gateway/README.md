<html>
 <h1 align="center">CREATOR Gateway (RISC-V ESP32)</h1>
</html>

## 1. To deploy CREATOR Gateway

  To run CREATOR Gateway, the following steps must be carried out:

  1. Download the Docker container creatorsim/creator_gateway on each device with a microcontroller connected.
     
     ```
     docker pull creatorsim/creator_gateway:latest
     ```

  2. Run the Docker container.

     ```
     docker run --init -it --device=<target_port> -p 8080:8080 --name creator_gateway creatorsim/creator_gateway /bin/bash
     ```

  3. Run the script start_gateway.sh inside the Docker container to start the web service that will be in charge of communicating with the microcontroller drivers.

     ```
     ./start_gateway.sh
     ```

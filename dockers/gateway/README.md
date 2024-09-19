<html>
 <h1 align="center">CREATOR Gateway (RISC-V ESP32)</h1>
</html>

## 1. To deploy CREATOR Gateway

  To run CREATOR Gateway, the following steps must be carried out:

  1. Download the Docker container creatorsim/creator_gateway on each device with a microcontroller connected.
     
  ```
  docker pull creatorsim/creator_gateway:latest
  ```
  2. Run the Docker container using the script [container_start.sh](/dockers/gateway/container_start.sh)
  3. Run the script [start_gateway.sh](/dockers/gateway/start_gateway.sh) inside the Docker container to start the web service that will be in charge of communicating with the microcontroller drivers.

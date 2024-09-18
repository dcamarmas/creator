<html>
 <h1 align="center">CREATOR Remote Laboratory (RISC-V ESP32)</h1>
</html>

## 1. To deploy CREATOR Remote Laboratory

  First, a CREATOR Gateway must be executed for each microcontroller. To do this, the following steps must be carried out:

  1. Download the Docker container creatorsim/creator_gateway on each device with a microcontroller connected.
     
  ```
  docker pull creatorsim/creator_gateway:latest
  ```
  2. Run the Docker container using the script [container_start.sh](/dockers/gateway/container_start.sh)
  3. Run the script [start_gateway.sh](/dockers/gateway/start_gateway.sh) inside the Docker container to start the web service that will be in charge of communicating with the microcontroller drivers.

  Once you run the containers with the CREATOR Gateway, you have to run the remote laboratory service. To do this, the following steps must be carried out:

  1. Download the Docker container creatorsim/creator_remote_lab on each device with a microcontroller connected.
     
  ```
  docker pull creatorsim/creator_remote_lab:latest
  ```
  2. Run the Docker container using the script [container_start.sh](/dockers/remote_lab/container_start.sh)
  3. The Python 3 program [remote_lab.py](/dockers/remote_lab/remote_lab.py) has to be executed inside the container, passing as argument the laboratory configuration file. This configuration file uses the format JSON to define for each of the device's hardware three parameters: microcontroller model, connection port, and CREATOR URL gateway.

  ```
  {
    "target_1":
    {
      "target_board": "esp32c3",
      "target_port": "/dev/ttyUSB0",
      "target_url": "http://192.168.1.4:8080"
    },
    "target_2":
    {
      "target_board": "esp32c3",
      "target_port": "/dev/ttyUSB0",
      "target_url": "http://192.168.1.5:8080"
    }
  }
  ```
  4. To complete the deployment of the remote laboratory service, the credentials of the E-mail that will be used to send the results of the executions will be requested.

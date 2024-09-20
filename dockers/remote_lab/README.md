<html>
 <h1 align="center">CREATOR Remote Laboratory (RISC-V ESP32)</h1>
</html>

## 1. To deploy CREATOR Remote Laboratory

  To run CREATOR Remote Laboratory, you must run two different Docker containers:

  * CREATOR Gateway Docker
  * CREATOR Remote Laboratory Docker


  ### 1.1. To deploy CREATOR Gateway

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



  ### 1.2. To deploy CREATOR Remote Laboratory

  Once you run the containers with the CREATOR Gateway, you have to run the remote laboratory service. To do this, the following steps must be carried out:

  1. Download the Docker container creatorsim/creator_remote_lab on each device with a microcontroller connected.
     
     ```
     docker pull creatorsim/creator_remote_lab:latest
     ```

  2. Run the Docker container

     ```
     docker run --init -it --name creator_gremote_lab creatorsim/creator_remote_lab /bin/bash
     ```
 
  3. Create the configuration file. This configuration file uses the JSON format to define three parameters for each of the device's hardware: microcontroller model, connection port, and CREATOR URL gateway.

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

  3. The Python 3 program remote_lab.py has to be executed inside the container, passing as argument the laboratory configuration file.

     ```
     python3 remote_lab.py config.json
     ```
  
  4. To complete the deployment of the remote laboratory service, the credentials of the E-mail that will be used to send the results of the executions will be requested.

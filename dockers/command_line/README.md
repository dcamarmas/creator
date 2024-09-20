<html>
 <h1 align="center">CREATOR Command Line</h1>
</html>

## 1. To deploy CREATOR Command Line

  To run CREATOR Command Line, the following steps must be carried out:

  1. Download the Docker container creatorsim/creator_gateway on each device with a microcontroller connected.
     
     ```
     docker pull creatorsim/creator_cl:latest
     ```

  2. Run the Docker container.

     ```
     docker run --init -it --name creator_cl creatorsim/creator_cl /bin/bash
     ```


## How to install the ESP32 software

Follow the instructions from:
[https://docs.espressif.com/projects/esp-idf/en/v4.3.5/esp32/get-started/linux-setup.html](https://docs.espressif.com/projects/esp-idf/en/v4.3.5/esp32/get-started/linux-setup.html)


## Each time you execute an example

Load the environment variable for your board with:
```
. $HOME/esp/esp-idf/export.sh
```

Unzip the driver.zip file and change into the driver directory associated to your board with "cd [esp32c3]", for example:
```
unzip driver.zip
cd esp32c3
```

Execute the gateway web service:
```
python3 gateway.py
```

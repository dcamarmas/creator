
import boardData from "./esp32c3devkit2.json" with { type: "json" };
import { crex_findReg } from "@/core/register/registerLookup.mjs";
import { packExecute } from "@/core/utils/utils.mjs";
import { readRegister, writeRegister } from "@/core/register/registerOperations.mjs";

const hookMap = {
  0xc: function cr_digitalWrite(connections, setLedState, boardElementRef, positions) {
    //const pin = cpu.registerSet.getRegister(10); // a0
    var ret1 = crex_findReg('a0');
    if (ret1.match === 0) {
      throw packExecute(true, "capi_arduino: register a0 not found", 'danger', null);	
    }
    var pin = BigInt.asIntN(32,readRegister(ret1.indexComp, ret1.indexElem));
    //const value = cpu.registerSet.getRegister(11); // a1
    var ret2 = crex_findReg('a1');
    if (ret2.match === 0) {
      throw packExecute(true, "capi_arduino: register a0 not found", 'danger', null);	
    }
    var value = BigInt.asIntN(32,readRegister(ret2.indexComp, ret2.indexElem));
    console.log(`cr_digitalWrite invoked! pin: ${pin}, value: ${value}`);
    const GPIOpin = "GPIO" + pin;
    console.log(GPIOpin);
    // Lógica de funcionamiento
          //setLedState(value);
    if (GPIOpin == 'GPIO30'){
        if (boardElementRef && boardElementRef.value && typeof boardElementRef.value.setGPIO30State === 'function') {
          boardElementRef.value.setGPIO30State(!!value);
        } else {
          console.warn('No se pudo acceder a setGPIO8State');
        }
      }

    if (boardData.pins.includes(GPIOpin)) {
        console.log(connections);
        // Lógica de conexion: patita izq en el GND y patita drcha en un GPIO
        const gpioConnection = connections.find(
          (conn) => conn.fromPinId === GPIOpin && conn.toPinId.endsWith("right")
        );
        const gndConnection = connections.find(
          (conn) => conn.fromPinId.includes("GND") && conn.toPinId.endsWith("left")
        );
        const existsGPIO = !!gpioConnection;
        const existsGND = !!gndConnection;
        console.log(
          "Estado pin drcho",
          existsGPIO,
          ", Estado pin izq:",
          existsGND
        );
        if (existsGPIO == true && existsGND == true) {
          //setLedState(value);
          if (gpioConnection.toPinId.includes("led")) {
            const toPinId = gpioConnection.toPinId;
            console.log("toPinId del LED:", toPinId);
            const lastDashIndex = toPinId.lastIndexOf("-");
            const ledId = toPinId.substring(0, lastDashIndex);
            const toElement = document.getElementById(ledId);
            console.log("Elemento LED:", toElement);
            const wokwiLed = toElement.querySelector("wokwi-led");
            console.log(wokwiLed.value); // ver valor actual
            console.log(value)
            wokwiLed.value = !!value; // fuerza a boolean
            console.log(wokwiLed.value); // ver valor actual}
          }
          // if (gpioConnection.toPinId.includes("buzzer")) {
          //   const toPinId = gpioConnection.toPinId;
          //   console.log("toPinId del Buzzer:", toPinId);
          //   const lastDashIndex = toPinId.lastIndexOf("-");
          //   const ledId = toPinId.substring(0, lastDashIndex);
          //   const toElement = document.getElementById(ledId);
          //   console.log("Elemento Buzzer:", toElement);
          //   const wokwiBuzzer = toElement.querySelector("wokwi-buzzer");
          //   console.log(wokwiBuzzer.hasSignal); // ver valor actual
          //   wokwiBuzzer.hasSignal = !!value; // fuerza a boolean
          //   console.log(wokwiBuzzer.hasSignal); // ver valor actual}
          // }
          if (gpioConnection.toPinId.includes("buzzer")) {
            const toPinId = gpioConnection.toPinId;
            const lastDashIndex = toPinId.lastIndexOf("-");
            const buzzerId = toPinId.substring(0, lastDashIndex);

            // Cambia el estado reactivo en Vue
            console.log(positions)
            const buzzer = positions.value.find(item => item.id === buzzerId);
            if (buzzer) {
              buzzer.compState = !!value;
            }
          }
        } else {
          console.log("Not connected");
        }

      
    }
    //cpu.pc = cpu.registerSet.getRegister(1); // ret
  },
  0x4: function cr_digitalRead(connections) {
    // const pin = cpu.registerSet.getRegister(10); // a0
    var ret1 = crex_findReg('a0');
    if (ret1.match === 0) {
      throw packExecute(true, "capi_arduino: register a0 not found", 'danger', null);	
    }
    var pin = BigInt.asIntN(32,readRegister(ret1.indexComp, ret1.indexElem));
    console.log(`cr_digitalRead invoked! pin: ${pin}`);
    const GPIOpin = "GPIO" + pin;
    console.log(GPIOpin);

    if (!boardData.pins.includes(GPIOpin)) {
      // cpu.registerSet.setRegister(10, 0);
      // cpu.pc = cpu.registerSet.getRegister(1);
      writeRegister(BigInt(1), ret1.indexComp, ret1.indexElem);
      console.log("Not added pin")
      return;
    }

    if (connections.length === 0) {
      // cpu.registerSet.setRegister(10, 0);
      // cpu.pc = cpu.registerSet.getRegister(1);
      writeRegister(BigInt(1), ret1.indexComp, ret1.indexElem);
      console.log("Not connections ")
      return;
    }

    // Helper to check invalid connection cases
    function isInvalidCase(gpioEnd, gndEnd) {
      const gpioConnection = connections.find(
        (conn) => conn.fromPinId === GPIOpin && conn.toPinId.endsWith(gpioEnd)
      );
      const gndConnection = connections.find(
        (conn) => conn.fromPinId.includes("GND") && conn.toPinId.endsWith(gndEnd)
      );
      console.log("gnd: ", gndEnd, "gpio:", gpioEnd, "->", !!gpioConnection, !!gndConnection);
      return !!gpioConnection && !!gndConnection;
    }

    // Lista de casos inválidos
    const invalidCases = [
      ["upleft", "upright"],
      ["downleft", "downright"],
      ["downright", "downleft"],
      ["upright", "upleft"],
    ];

    for (const [gpioEnd, gndEnd] of invalidCases) {
      if (isInvalidCase(gpioEnd, gndEnd)) {
        // cpu.registerSet.setRegister(10, 0);
        // cpu.pc = cpu.registerSet.getRegister(1);
        writeRegister(BigInt(1), ret1.indexComp, ret1.indexElem);
        return;
      }
    }

    // Si hay conexión válida, buscar el botón y actualizar el registro
    const gpioConnection = connections.find(
      (conn) => conn.fromPinId.includes("GPIO")
    );
    if (gpioConnection) {
      executeButton(gpioConnection);
    } else {
      // cpu.registerSet.setRegister(10, 0);
      writeRegister(BigInt(1), ret1.indexComp, ret1.indexElem);
    }
    // cpu.pc = cpu.registerSet.getRegister(1);

    function executeButton(gpioConnection) {
      const toPinId = gpioConnection.toPinId;
      console.log("toPinId del Botón:", toPinId);

      const lastDashIndex = toPinId.lastIndexOf("-");
      const buttonId = toPinId.substring(0, lastDashIndex);

      const toElement = document.getElementById(buttonId);
      console.log("Elemento Boton:", toElement);
      const wokwiButton = toElement.querySelector("wokwi-pushbutton");
      console.log("¿Botón presionado?", wokwiButton.pressed);
      writeRegister(wokwiButton.pressed ? BigInt(1) : BigInt(0), ret1.indexComp, ret1.indexElem);
      // cpu.registerSet.setRegister(10, wokwiButton.pressed ? 1 : 0);
    }
  },
  
};


export default hookMap;

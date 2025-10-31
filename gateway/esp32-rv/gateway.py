#!/usr/bin/env python3


#
#  Copyright 2022-2024 Felix Garcia Carballeira, Diego Carmarmas Alonso, Alejandro Calderon Mateos, Elisa Utrilla Arroyo
#
#  This file is part of CREATOR.
#
#  CREATOR is free software: you can redistribute it and/or modify
#  it under the terms of the GNU Lesser General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  CREATOR is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU Lesser General Public License for more details.
#
#  You should have received a copy of the GNU Lesser General Public License
#  along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
#


import glob
import sys
import threading
from time import sleep, time
from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS, cross_origin
import subprocess, os, signal
import logging
import serial
# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

BUILD_PATH = '.' 
process_holder = {}

#### (*) Cleaning functions
def do_fullclean_request(request):
  """ Full clean the build directory """
  try:
    req_data = request.get_json()
    target_device      = req_data['target_port']
    req_data['status'] = ''
    error = 0
    # flashing steps...
    if error == 0:
      do_cmd_output(req_data, ['idf.py','-C', BUILD_PATH,'fullclean'])  
    if error == 0:
       req_data['status'] += 'Full clean done.\n'    
  except Exception as e:
    req_data['status'] += str(e) + '\n'
  return jsonify(req_data)

def do_eraseflash_request(request):
  """ Erase flash the target device """
  try:
    req_data = request.get_json()
    target_device      = req_data['target_port']
    req_data['status'] = ''
    # flashing steps...
    error = 0
    if error == 0:
      error = do_cmd_output(req_data, ['idf.py','-C', BUILD_PATH,'-p',target_device,'erase-flash'])
    if error == 0:
       req_data['status'] += 'Erase flash done. Please, unplug and plug the cable(s) again\n'
         
  except Exception as e:
    req_data['status'] += str(e) + '\n'    

  return jsonify(req_data) 

def do_stop_monitor_request(request):
  """Shortcut for stopping Monitor / debug """
  try:
    req_data = request.get_json()
    req_data['status'] = ''
    print("Killing Monitor")
    error = kill_all_processes("idf.py")
    if error == 0:
      req_data['status'] += 'Process stopped\n' 
    

  except Exception as e:
    req_data['status'] += str(e) + '\n'

  return jsonify(req_data)

# (1) Get form values
def do_get_form(request):
  try:
    return send_file('gateway.html')
  except Exception as e:
    return str(e)


# Adapt assembly file...
def creator_build(file_in, file_out):
  try:
    # open input + output files
    fin  = open(file_in, "rt")
    fout = open(file_out, "wt")

    # write header
    fout.write(".text\n");
    fout.write(".type main, @function\n")
    fout.write(".globl main\n")

    data = []
    # for each line in the input file...
    for line in fin:
      data = line.strip().split()
      if (len(data) > 0):
        if (data[0] == 'rdcycle'):
          fout.write("#### rdcycle" + data[1] + "####\n")
          fout.write("addi sp, sp, -8\n")
          fout.write("sw ra, 4(sp)\n")
          fout.write("sw a0, 0(sp)\n")
          fout.write("jal ra, _rdcycle\n")
          fout.write("mv "+ data[1] +", a0\n")

          if data[1] != "a0":
            fout.write("lw a0, 0(sp)\n")
          fout.write("lw ra, 4(sp)\n")
          fout.write("addi sp, sp, 8\n")
          fout.write("####################\n")
          continue

      fout.write(line)

    # close input + output files
    fin.close()
    fout.close()
    return 0

  except Exception as e:
    print("Error adapting assembly file: ", str(e))
    return -1

def do_cmd(req_data, cmd_array):
  try:
    result = subprocess.run(cmd_array, capture_output=False, timeout=60)
  except:
    pass

  if result.stdout != None:
    req_data['status'] += result.stdout.decode('utf-8') + '\n'
  if result.returncode != None:
    req_data['error']   = result.returncode

  return req_data['error']


def do_cmd_output(req_data, cmd_array):
  try:
    result = subprocess.run(cmd_array, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=60)
  except:
    pass

  if result.stdout != None:
    req_data['status'] += result.stdout.decode('utf-8') + '\n'
  if result.returncode != None:
    req_data['error']   = result.returncode

  return req_data['error']


# (2) Flasing assembly program into target board
def do_flash_request(request):
  try:
    req_data = request.get_json()
    target_device      = req_data['target_port']
    target_board       = req_data['target_board']
    asm_code           = req_data['assembly']
    req_data['status'] = ''

    # create temporal assembly file
    text_file = open("tmp_assembly.s", "w")
    ret = text_file.write(asm_code)
    text_file.close()

    # Kill debug processes
    if 'openocd' in process_holder:
      logging.debug('Killing OpenOCD')
      kill_all_processes("openocd")
      process_holder.pop('openocd', None)

    if 'gdbgui' in process_holder:
      logging.debug('Killing GDBGUI')
      kill_all_processes("gdbgui")
      process_holder.pop('gdbgui', None)

    # transform th temporal assembly file
    error = creator_build('tmp_assembly.s', "main/program.s");
    if error != 0:
      req_data['status'] += 'Error adapting assembly file...\n'

    # flashing steps...
    if error == 0 :
      error = check_uart_connection(target_device)
    if error != 0:
      req_data['status'] += 'No UART port found.\n'
      logging.error("No UART port found.")
      raise  Exception("No UART port found")
    if error == 0:
      error = do_cmd(req_data, ['idf.py',  'fullclean'])
    # Disable memory protection
    sdkconfig_path = os.path.join(BUILD_PATH, "sdkconfig")
    # 1. Check out previous sdkconfig
    # (*) This configuration is EXCUSIVELY FOR ESP-IDF WITHOUT ARDUINO
    defaults_path = os.path.join(BUILD_PATH, "sdkconfig.defaults")
    if target_board == 'esp32c3':
      with open(defaults_path, "w") as f:
          f.write(
              "# CONFIG_ESP_SYSTEM_MEMPROT_FEATURE is not set\n"
              "# CONFIG_ESP_SYSTEM_MEMPROT_FEATURE_LOCK is not set\n" 
          )
    #TODO: Add other boards here...
    elif target_board == 'esp32c6': 
          with open(defaults_path, "w") as f:
              f.write(
                  "CONFIG_FREERTOS_HZ=1000\n"
                  "# CONFIG_ESP_SYSTEM_PMP_IDRAM_SPLIT is not set\n"
              ) 

    # 2. If previous sdkconfig exists, check if mem protection is disabled (for debug purposes)
    if os.path.exists(sdkconfig_path):
      if target_board == 'esp32c3':
        # Memory Protection
        do_cmd(req_data, [
            'sed', '-i',
            r'/^CONFIG_ESP_SYSTEM_MEMPROT_FEATURE=/c\# CONFIG_ESP_SYSTEM_MEMPROT_FEATURE is not set',
            sdkconfig_path
        ])
        # Memory protection lock
        do_cmd(req_data, [
            'sed', '-i',
            r'/^CONFIG_ESP_SYSTEM_MEMPROT_FEATURE_LOCK=/c\# CONFIG_ESP_SYSTEM_MEMPROT_FEATURE_LOCK is not set',
            sdkconfig_path
        ])
      elif target_board == 'esp32c6':
            #CONFIG_FREERTOS_HZ=1000
            do_cmd(req_data, [
                'sed', '-i',
                r'/^CONFIG_FREERTOS_HZ=/c\CONFIG_FREERTOS_HZ=1000',
                sdkconfig_path
            ])
            # PMP IDRAM split
            do_cmd(req_data, [
                'sed', '-i',
                r'/^CONFIG_ESP_SYSTEM_PMP_IDRAM_SPLIT=/c\# CONFIG_ESP_SYSTEM_PMP_IDRAM_SPLIT is not set',
                sdkconfig_path
            ])   
    #TODO: Add other boards here...           
    if error == 0:
      error = do_cmd(req_data, ['idf.py',  'set-target', target_board])
    if error == 0:
      error = do_cmd(req_data, ['idf.py', 'build'])
    if error == 0:
      error = do_cmd(req_data, ['idf.py', '-p', target_device, 'flash'])

  except Exception as e:
    req_data['status'] += str(e) + '\n'

  return jsonify(req_data)


# (3) Run program into the target board
def do_monitor_request(request):
  try:
    req_data = request.get_json()
    target_device      = req_data['target_port']
    req_data['status'] = ''

    # Kill debug process

    if 'openocd' in process_holder:
      logging.debug('Killing OpenOCD')
      kill_all_processes("openocd")
      process_holder.pop('openocd', None)

    if 'gdbgui' in process_holder:
      logging.debug('Killing GDBGUI')
      kill_all_processes("gdbgui")
      process_holder.pop('gdbgui', None)

    build_root = BUILD_PATH +'/build'
    error = 0
    error = check_uart_connection(target_device)
    if error != 0:
      logging.info("No UART found")
      req_data['status'] += "No UART port found\n"
      return jsonify(req_data)
    if os.path.isdir(build_root) and os.listdir(build_root):
      logging.info("Build found")
      do_cmd(req_data, ['idf.py', '-p', target_device, 'monitor'])
    else:
      req_data['status'] += "No ELF file found in build directory.\n"
      logging.error("No elf found.")
              
  except Exception as e:
    req_data['status'] += str(e) + '\n'

  return jsonify(req_data)


# (4) Debug 

# (4.1) Physical connections check   
def check_uart_connection(board):
    """ Checks UART devices """
    if board.startswith('/dev/ttyUSB'):
      devices = glob.glob('/dev/ttyUSB*')
      logging.debug(f"Found devices: {devices}")
      if "/dev/ttyUSB0" in devices:
          logging.info("Found UART.")
          return 0
      elif devices:
          logging.error("Other UART devices found (Is the name OK?).")
          return 0
      else:
          logging.error("NO UART port found.")
          return 1
    elif board.startswith('rfc2217'):
      try:
          ser = serial.serial_for_url(board, timeout=1)
          ser.close()
          logging.info("Found RFC2217 UART.")
          return 0
      except serial.SerialException as e:
          logging.error(f"NO RFC2217 UART port found: {e}")
          return 1  
    
def check_jtag_connection():
    """ Checks JTAG devices """
    command = ["lsusb"]
    try:
        lsof = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output, errs = lsof.communicate(timeout=5)  
        if output:
            output_text = output.decode(errors="ignore")
            if "JTAG" in output_text:
                logging.info("JTAG found")
                return True
            else:
                logging.warning("JTAG missing")
                return False
    except subprocess.TimeoutExpired:
        lsof.kill()
        output, errs = lsof.communicate()
    except Exception as e:
        logging.error(f"Error checking JTAG: {e}")
        return None
    return False    
# --- (4.2) Debug processes monitoring functions ---

def check_gdb_connection():
    """ Checks gdb status """
    command = ["lsof", "-i", ":3333"]
    try:
        lsof = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output, errs = lsof.communicate(timeout=5) 
        logging.debug("GDB connection output: %s", output.decode())
        return output.decode()
    except subprocess.TimeoutExpired:
        lsof.kill()
        output, errs = lsof.communicate()
        logging.error(" GDB:Timeout waiting for GDB connection.")
    except Exception as e:
        logging.error(f"Error checking GDB: {e}")
        return None
    return False

def monitor_openocd_output(req_data, cmd_args, name):
    logfile_path = os.path.join(BUILD_PATH, f"{name}.log")
    try:
        with open(logfile_path, "a", encoding="utf-8") as logfile:
            process_holder[name] = subprocess.Popen(
                cmd_args,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,  
                universal_newlines=True
            )
            proc = process_holder[name]

            # Logfile
            for line in proc.stdout:
                line = line.rstrip()
                logfile.write(line + "\n")
                logfile.flush()
                logging.debug(f"[{name}] {line}")

            proc.stdout.close()
            retcode = proc.wait()
            logging.debug(f"Process {name} finished with code {retcode}")
            return proc

    except Exception as e:
        logging.error(f"Error executing command {name}: {e}")
        process_holder.pop(name, None)
        return None
    
def kill_all_processes(process_name):
    try:
        if not process_name:
            logging.error("El nombre del proceso no puede estar vacío.")
            return 1

        # Comando para obtener los PIDs de los procesos
        get_pids_cmd = f"ps aux | grep '[{process_name[0]}]{process_name[1:]}' | awk '{{print $2}}'"
        result = subprocess.run(get_pids_cmd, shell=True, capture_output=True, text=True)

        #  PIDs list
        pids = result.stdout.strip().split()
        
        if not pids:
            logging.warning(f"Not processes found '{process_name}'.")
            return 1  # Devuelve 1 para indicar que no se hizo nada

        # Ejecuta kill solo si hay PIDs
        kill_cmd = f"kill -9 {' '.join(pids)}"
        result = subprocess.run(kill_cmd, shell=True, capture_output=True, timeout=120, check=False)

        if result.returncode != 0:
            logging.error(f"Error al intentar matar los procesos {process_name}. Salida: {result.stderr.strip()}")
        else:
            logging.debug(f"Todos los procesos '{process_name}' han sido eliminados.")
        
        return result.returncode

    except subprocess.TimeoutExpired as e:
        logging.error(f"El proceso excedió el tiempo de espera: {e}")
        return 1

    except subprocess.CalledProcessError as e:
        logging.error(f"Error al ejecutar el comando: {e}")
        return 1

    except Exception as e:
        logging.error(f"Ocurrió un error inesperado: {e}")
        return 1

    
# (4.3) OpenOCD Function
def start_openocd_thread(req_data):
    target_board = req_data['target_board']
    script_board = './openocd_scripts/openscript_' + target_board + '.cfg'
    logging.debug(f"OpenOCD script: {script_board}")
    try:
        thread = threading.Thread(
            target=monitor_openocd_output,
            args=(req_data, ['openocd', '-f', script_board], 'openocd'),
            daemon=True
        )
        thread.start()
        logging.debug("Starting OpenOCD thread...")
        return thread
    except Exception as e:
        req_data['status'] += f"Error starting OpenOCD: {str(e)}\n"
        logging.error(f"Error starting OpenOCD: {str(e)}")
        return None
# (4.4) GDBGUI function    
def start_gdbgui(req_data):
    route = os.path.join(BUILD_PATH, 'gdbinit')
    logging.debug(f"GDB route: {route}")
    route = os.path.join(BUILD_PATH, 'gdbinit')
    if os.path.exists(route) and os.path.exists("./gbdscript.gdb"):
        logging.debug(f"GDB route: {route} exists.")
    else:
        logging.error(f"GDB route: {route} does not exist.")
        req_data['status'] += f"GDB route: {route} does not exist.\n"
        return jsonify(req_data)
    req_data['status'] = ''
    if check_uart_connection():
      req_data['status'] += f"No UART found\n"
      return jsonify(req_data)
    
    logging.info("Starting GDBGUI...")
    gdbgui_cmd = ['idf.py', '-C', BUILD_PATH, 'gdbgui', '--gdbinit', route, 'monitor']
    sleep(5)
    try:
        process_holder['gdbgui'] = subprocess.run(
            gdbgui_cmd,
            stdout=sys.stdout,
            stderr=sys.stderr,
            text=True
        )
        if process_holder['gdbgui'].returncode != -9 and process_holder['gdbgui'].returncode != 0:
            logging.error(f"Command failed with return code {process_holder['gdbgui'].returncode}")

    except subprocess.CalledProcessError as e:
        logging.error("Failed to start GDBGUI: %s", e)
        req_data['status'] += f"Error starting GDBGUI (code {e.returncode}): {e.stderr}\n"
        return None
    except Exception as e:
        logging.error("Unexpected error in GDBGUI: %s", e)
        req_data['status'] += f"Unexpected error starting GDBGUI: {e}\n"
        return None
    
    req_data['status'] += f"Finished debug session: {e}\n"
    return jsonify(req_data)
          


def do_debug_request(request):
    global stop_event
    global process_holder
    error = 0
    try:
        req_data = request.get_json()
        target_device = req_data['target_port']
        req_data['status'] = ''
        # Check .elf files in BUILD_PATH
        route = BUILD_PATH +'/build'
        logging.debug(f"Checking for ELF files in {route}")
        elf_files = [f for f in os.listdir(route) if f.endswith(".elf")]
        if not elf_files:
            req_data['status'] += "No ELF file found in build directory.\n"
            logging.error("No ELF file found in build directory.")
            return jsonify(req_data)
        logging.debug("Delete previous work")
        # Clean previous debug system
        if error == 0:
            if 'openocd' in process_holder:
                logging.debug('Killing OpenOCD')
                kill_all_processes("openocd")
                process_holder.pop('openocd', None)
            # Check UART
            if  check_uart_connection():
                req_data['status'] += f"No UART found\n"
                return jsonify(req_data)    
            # Check if JTAG is connected
            if not check_jtag_connection():
                req_data['status'] += "No JTAG found\n"
                return jsonify(req_data)

            # Start OpenOCD
            logging.info("Starting OpenOCD...")
            openocd_thread = start_openocd_thread(req_data)
            while process_holder.get('openocd') is None:
              sleep(1)
              #start_openocd_thread(req_data)

            # Start gdbgui   
            #logging.info("Starting gdbgui")
            error = start_gdbgui(req_data)
            if error != 0:
                req_data['status'] += "Error starting gdbgui\n"
                return jsonify(req_data)   
        else:
            req_data['status'] += "Build error\n"

    except Exception as e:
        req_data['status'] += f"Unexpected error: {str(e)}\n"
        logging.error(f"Exception in do_debug_request: {e}")

    return jsonify(req_data)


# Setup flask and cors:
app  = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# (1) GET / -> send gateway.html
@app.route("/", methods=["GET"])
@cross_origin()
def get_form():
  return do_get_form(request)

# (2) POST /flash -> flash
@app.route("/flash", methods=["POST"])
@cross_origin()
def post_flash():
  try:
    shutil.rmtree('build')
  except Exception as e:
    pass

  return do_flash_request(request)

# (3) POST /monitor -> flash
@app.route("/monitor", methods=["POST"])
@cross_origin()
def post_monitor():
  return do_monitor_request(request)


# (4) POST /fullclean -> clean build directory
@app.route("/fullclean", methods=["POST"])
@cross_origin()
def post_fullclean_flash():
  return do_fullclean_request(request)

# (5) POST /eraseflash -> clean board flash
@app.route("/eraseflash", methods=["POST"])
@cross_origin()
def post_erase_flash():
  return do_eraseflash_request(request)

# (6) POST /debug -> debug
@app.route("/debug", methods=["POST"])
@cross_origin()
def post_debug():
  return do_debug_request(request)

# (7) Stop monitor
@app.route("/stopmonitor", methods=["POST"])
@cross_origin()
def post_stop_monitor():
  return do_stop_monitor_request(request)


# Run
app.run(host='0.0.0.0', port=8080, use_reloader=False, debug=True)

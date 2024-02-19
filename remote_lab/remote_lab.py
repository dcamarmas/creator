#!/usr/bin/env python3


#
#  Copyright 2022-2024 Felix Garcia Carballeira, Diego Carmarmas Alonso, Alejandro Calderon Mateos
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


from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS, cross_origin
from getpass import getpass
from email.message import EmailMessage
import subprocess, os, signal, sys, json, threading, time, requests, smtplib




## Queues ##

# Queue variables
queue_incoming = {'queue': [], 'lock': None, 'size': 0}
queue_outgoing = {'queue': [], 'lock': None, 'size': 0}


# Queue functions
def enqueue_request (queue, request):
  global request_id

  queue['lock'].acquire()

  queue['queue'].append(request)
  queue['size'] = queue['size'] + 1

  queue['lock'].release()

  return request_id

def dequeue_request (queue, target_board):
  request = None

  queue['lock'].acquire()

  for index, item in enumerate(queue['queue']):
    if item['target_board'] == target_board:

      request = queue['queue'][index]
      del queue['queue'][index]
      queue['size'] = queue['size'] - 1

      queue['lock'].release()
      return request

  queue['lock'].release()

  return request

def dequeue_request_byid (queue, request_id):
  request = None

  queue['lock'].acquire()

  for index, item in enumerate(queue['queue']):
    if item['request_id'] == request_id:

      request = queue['queue'][index]
      del queue['queue'][index]
      queue['size'] = queue['size'] - 1

      queue['lock'].release()
      return request

  queue['lock'].release()

  return request

def delete_request (queue, request_id):
  queue['lock'].acquire()

  for index, item in enumerate(queue['queue']):
    if item['request_id'] == request_id:

      del queue['queue'][index]

      queue['lock'].release()
      return 0

  queue['lock'].release()

  return -1

def position_request (queue, request_id):
  for index, item in enumerate(queue['queue']):
    if item['request_id'] == request_id:
      return index + 1

  return -1




## Thread ##

def worker(item):
  global deployment, queue_incoming, queue_outgoing

  while 1:

    ret = dequeue_request (queue_incoming, deployment[item]['target_board'])

    if ret == None:
      time.sleep(20)
    else:
      deployment[item]['status'] = 'busy'

      # Sent to the target post
      url = deployment[item]['target_url']  + "/job"
      msg = {'target_port': deployment[item]['target_port'], 'target_board': ret['target_board'], 'assembly': ret['asm_code']}

      res = requests.post(url, json = msg)
      jres = res.json()

      file = open("results/" + ret['request_id'] + ".txt", "w")
      file.write(jres['status'])
      file.close()

      # Sent email with the results
      receivers = ret['result_email']

      email = EmailMessage()
      email["From"] = sender
      email["To"] = receivers
      email["Subject"] = "[CREATOR] Remote device results"
      message = "Remote device ID=" + ret['request_id'] + " has been successfully completed, the execution results are attached. \n\nSincerely,\nCREATOR Team\n\nhttps://creatorsim.github.io/"
      email.set_content(message, subtype="plain")

      with open("results/" + ret['request_id'] + ".txt", "rb") as f:
        email.add_attachment(
            f.read(),
            filename="remote_device_" + ret['request_id'] + ".txt",
            maintype="text",
            subtype="txt"
        )

      smtpObj = smtplib.SMTP_SSL('smtp.gmail.com', 465)
      smtpObj.login(sender, password)
      smtpObj.sendmail(sender, receivers, email.as_string())
      smtpObj.quit()


      ret["status"] = 'Completed'
      deployment[item]['status'] = 'free'

      enqueue_request (queue_outgoing, ret)




# Main

#Variables initialization
deployment = []
request_id = 0

# (1) Check params
if len(sys.argv) < 2:
  print("Use: python3 remote_lab.py <deployment_file> [port]");
  exit(-1)

port = 5000
if len(sys.argv) == 3:
  port = int(sys.argv[2])


# (2) Get Deployment configuration
print("Enter E-mail:")
sender = input()
password = getpass()

try:
  deployment_file = open(sys.argv[1], 'r')
except Exception as e:
  print("Error opening file " + sys.argv[1])
  exit(-1)

try:
  deployment = json.loads(deployment_file.read())
except Exception as e:
  print("Error reading file " + sys.argv[1])
  deployment_file.close()
  exit(-1)

deployment_file.close()


# (3)Create result directory
try:
  os.mkdir('results')
except Exception as e:
  pass


# (4) Queue management
queue_incoming['lock'] = threading.Lock()
queue_outgoing['lock'] = threading.Lock()

for index, item in enumerate(deployment):
  deployment[item]['status'] = 'free'
  t = threading.Thread(target=worker, name='Daemon', args=(item,))
  t.start()


# (5) Setup flask and cors:
app  = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# (5a) GET / -> send remote_lab.html
@app.route("/", methods=["GET"])
@cross_origin()
def get_status():
  ret = { 'incoming': queue_incoming, 'outgoing': queue_outgoing }
  return json.dumps(ret)

# (5b) GET /targets -> send available targets
@app.route("/target_boards", methods=["GET"])
@cross_origin()
def get_target_boards():
  target_boards = []

  for index, item in enumerate(deployment):
    val = deployment[item]
    if not val['target_board'] in target_boards:
      target_boards.append(val['target_board'])

  return json.dumps(target_boards)

# (5c) POST /enqueue -> enqueue
@app.route("/enqueue", methods=["POST"])
@cross_origin()
def post_enqueue():
  global request_id, queue_incoming

  try:
    req_data = request.get_json()
    target_board       = req_data['target_board']
    result_email       = req_data['result_email']
    asm_code           = req_data['assembly']
    req_data['status'] = ''

    new_request = { "request_id": str(request_id), "result_email": result_email, "target_board": target_board, "asm_code": asm_code }
    req_data['status'] = enqueue_request (queue_incoming, new_request)
    request_id = request_id + 1

  except Exception as e:
    req_data['status'] += str(e) + '\n'

  return jsonify(req_data)

# (5d) POST /delete -> delete
@app.route("/delete", methods=["POST"])
@cross_origin()
def post_delete():
  global queue_incoming

  try:
    req_data = request.get_json()
    req_id   = str(req_data['req_id'])
    req_data['status'] = ''

    req_data['status'] = delete_request (queue_incoming, req_id)

  except Exception as e:
    req_data['status'] += str(e) + '\n'

  return jsonify(req_data)

# (5e) POST /position -> position
@app.route("/position", methods=["POST"])
@cross_origin()
def post_position():
  global queue_incoming

  try:
    req_data = request.get_json()
    req_id   = str(req_data['req_id'])
    req_data['status'] = ''

    req_data['status'] = position_request (queue_incoming, req_id)

  except Exception as e:
    req_data['status'] += str(e) + '\n'

  return jsonify(req_data)

# (5f) POST /status -> status
@app.route("/status", methods=["POST"])
@cross_origin()
def post_status():
  global queue_incoming, queue_outgoing

  try:
    req_data = request.get_json()
    req_id   = str(req_data['req_id'])
    req_data['status'] = ''

    ret = dequeue_request_byid (queue_outgoing, req_id)

    if ret == None:
      req_data['status'] = position_request (queue_incoming, req_id)
    else:
      req_data['status'] = ret['status']

  except Exception as e:
    req_data['status'] += str(e) + '\n'

  return jsonify(req_data)



# Run
app.run(host='0.0.0.0', port=port, use_reloader=False, debug=True)

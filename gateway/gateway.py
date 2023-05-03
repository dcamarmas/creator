
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS, cross_origin
import subprocess

def do_flash_request(request):
    try:
       req_data = request.get_json()
       asm_code = req_data['assembly']

       text_file = open("assembly.s", "w")
       ret = text_file.write(asm_code)
       text_file.close()

       # execute flashing script
       result = subprocess.run(['./flash.sh', 'assembly.s'], stderr=subprocess.PIPE)
       req_data['output'] = result.stdout.decode("utf-8")
       req_data['status'] = 'done'
    except Exception as e:
       req_data['output'] = ''
       req_data['status'] = 'error'

    return jsonify(req_data)


# Setup flask and cors:
app  = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# GET / -> send gateway.html
@app.route("/", methods=["GET"])
@cross_origin()
def get_method():
    try:
        return send_file('gateway.html')
    except Exception as e:
        return str(e)

# POST /flash -> flash
@app.route("/flash", methods=["POST"])
@cross_origin()
def post_method():
    print(request)
    req_data = do_flash_request(request)
    print(req_data)
    return req_data

# Run
app.run(host='0.0.0.0', port=8080, debug=True)


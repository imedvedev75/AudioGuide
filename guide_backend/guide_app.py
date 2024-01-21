from flask import *
from flask_login import LoginManager, login_required, login_user, logout_user, current_user
import sys
import os
my_path = os.path.dirname(os.path.abspath(__file__))
sys.path.append(my_path)
from config import *
from db import *
from login import MyLoginManager, User
from utils import *
from flask_cors import CORS, cross_origin
from uuid import *
from flask_socketio import *
import configparser
from time import *
import sys
from exceptions import *
from pyfcm import FCMNotification
from pymongo import MongoClient

#log = logging.getLogger('werkzeug')
#log.setLevel(logging.ERROR)


app = Flask(__name__)
sio = SocketIO(app)
app.json_encoder = MyJSONEncoder

CORS(app, supports_credentials=True)

#init DB
config = configparser.ConfigParser()
config.read('config.ini')
username = config['settings']['username']
password = config['settings']['password']
server = config['settings']['server']
secret_key = config['settings']['secret_key']
eng = create_engine(f'mysql+mysqldb://username:password@server/guide?charset=utf8mb4', pool_pre_ping=True)
metadata = MetaData(eng)
db = DB(metadata=metadata)

client = MongoClient("mongodb://username:password@server/guides")
mdb = client.guides
guides = mdb.guides
users = mdb.users
buses = mdb.buses

#init login manager
login_manager = MyLoginManager(app, db, eng, users)

# config
app.config.update(DEBUG=True, SECRET_KEY='783f6ab4-a577-4bfa-9f4f-864f5420a874')


def execAndRetMulti(stmt):
    res = eng.execute(stmt)
    return jsonify([dict(r) for r in res]), 200

def execAndRet(stmt):
    res = eng.execute(stmt)
    return jsonify(res), 200


def return_coll(cursor):
    ret = []
    for d in cursor:
        ret.append(d)
    return jsonify(ret), 200


def return_single(d):
    return jsonify(d), 200


#============================== API =================================================
#@login_required
@cross_origin(supports_credentials=True)
@app.route('/', methods=['GET'])
def home():
    return "Welcome to audio guide", 200


@app.route('/add_track', methods=['POST'])
@cross_origin(supports_credentials=True)
def add_track():
    data = request.get_json(force=True)
    eng.execute("INSERT INTO tracks (track_name, track_uuid, ts) VALUES ('{}', '{}', {})"
                           .format(data["track_name"], data["track_uuid"], getTS()))
    return jsonify({}), 200


@app.route('/add_track_data', methods=['POST'])
@cross_origin(supports_credentials=True)
def add_track_data():
    data = request.get_json(force=True)
    track_uuid = data["track_uuid"]
    track_data = data["track_data"]
    conn = eng.connect()
    for d in track_data:
        conn.execute("INSERT INTO tracks_data (track_uuid, lat, lng) VALUES ('{}', {}, {})"
                           .format(track_uuid, d["lat"], d["lng"]))
    return jsonify({}), 200


@app.route('/get_tracks', methods=['POST'])
@cross_origin(supports_credentials=True)
def get_tracks():
    return execAndRetMulti("SELECT * FROM tracks")


@app.route('/get_track_data', methods=['POST'])
@cross_origin(supports_credentials=True)
def get_track_data():
    data = request.get_json(force=True)
    return execAndRetMulti("SELECT lat, lng from tracks_data WHERE track_uuid='{}'".format(data["track_uuid"]))


@app.route('/get_guides', methods=['POST'])
@cross_origin(supports_credentials=True)
def get_guides():
    data = dotdict(request.get_json(force=True))
    cursor = guides.find({})
    ret = []
    searchText = data.searchText.lower() if data.searchText else None
    for d in cursor:
        d = dotdict(d)
        if not data.searchText:
            ret.append(d)
        else:
            if (searchText in d.guide_name.lower()) or (searchText in d.description.lower()):
                ret.append(d)
    return jsonify(ret), 200


@app.route('/get_my_guides', methods=['POST'])
@login_required
@cross_origin(supports_credentials=True)
def get_my_guides():
    ret = guides.find({'user._id': current_user.u._id})
    return return_coll(ret)


@app.route('/get_my_guide', methods=['POST'])
@login_required
@cross_origin(supports_credentials=True)
def get_my_guide():
    data = request.get_json(force=True)
    ret = guides.find_one({'user._id': current_user.u['_id'], 'guide_uuid': data['guide_uuid']})
    return return_single(ret)


@app.route('/delete_guide', methods=['POST'])
@login_required
@cross_origin(supports_credentials=True)
def delete_guide():
    data = request.get_json(force=True)
    guides.delete_one({'guide_uuid': data['guide_uuid']})
    return jsonify({}), 200


@app.route('/get_guide', methods=['POST'])
@cross_origin(supports_credentials=True)
def get_guide():
    data = dotdict(request.get_json(force=True))
    ret = guides.find_one({'guide_uuid': data.guide_uuid})
    return return_single(ret)


@app.route('/upload_file', methods=['POST'])
@cross_origin(supports_credentials=True)
def upload_file():
    file = request.files['file']
    guide_uuid = request.form['guide_uuid']
    dir = DATA_DIR + '/' + guide_uuid
    if not os.path.exists(dir):
        os.mkdir(dir)
    with open(dir + '/' + file.filename, "wb") as f:
        f.write(file.read())
    return jsonify({}), 200


@app.route('/data/<path:path>', methods=['GET'])
@cross_origin(supports_credentials=True)
def send_file(path):
    return send_from_directory(DATA_DIR, path)


@app.route('/delete_file', methods=['POST'])
@login_required
@cross_origin(supports_credentials=True)
def delete_file():
    data = request.get_json(force=True)
    os.remove("data/" + data['guide_uuid'] + "/" + data["file"])
    return jsonify({}), 200


@app.route('/upload_guide', methods=['POST'])
@login_required
@cross_origin(supports_credentials=True)
def upload_guide():
    guide = dotdict(request.get_json(force=True))
    guide._id = ObjectId(guide._id)
    if guide.guide_uuid == '':
        print('WARNING: empty guide_uuid')
        return jsonify({'error': 'empty guide uuid'}), 200
    guide.user = current_user.u
    guides.update({'guide_uuid': guide.guide_uuid}, guide, upsert=True)
    return jsonify({}), 200


@app.route('/check_login', methods=['POST'])
@login_required
@cross_origin(supports_credentials=True)
def check_login():
    return jsonify({}), 200


@app.route('/get_buses', methods=['POST'])
@cross_origin(supports_credentials=True)
def get_buses():
    ret = buses.find({}, {'route': 1})
    return return_coll(ret)


@app.route('/get_bus', methods=['POST'])
@cross_origin(supports_credentials=True)
def get_bus():
    data = dotdict(request.get_json(force=True))
    ret = buses.find_one({'route': str(data.route)})
    return return_single(ret)

#================================== API ==================================================

#@app.errorhandler(Exception)
def handle_error(ex):
    print("Error type: ", type(ex), ", error: ", ex)
    response = jsonify({"type":str(type(ex)), "message":str(ex)})
    response.status_code = 500
    return response


def checkDirs():
    if not os.path.exists(DATA_DIR):
        os.mkdir(DATA_DIR)

def run():
    checkDirs()

    if "HETZNER" in os.environ:
        print('running on server')
        context = ('/etc/letsencrypt/live/www.a-i-m.tech/fullchain.pem',
                   '/etc/letsencrypt/live/www.a-i-m.tech/privkey.pem')
        app.run(host='0.0.0.0', port=5003, debug=True, use_reloader=True,
                     ssl_context=context)
    else:
        print('running locally')
        context = ('cert/cert.pem', 'cert/key.pem')
        app.run(host='0.0.0.0', port=5003, debug=True, use_reloader=True)


#if __name__ == "__main__":
application = app
run()
import pydevd
sys.path.append('pycharm-debug-py3k.egg')
os.environ["PYCHARM_DEBUG"] = "TRUE"

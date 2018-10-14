from flask import *
from flask_socketio import SocketIO, send
from flask_cors import CORS
import json
from bson.json_util import dumps

#from pymongo import MongoClient
from flask_pymongo import PyMongo
# client = MongoClient('localhost', 27017)
# db = client['plamdb']
# collection = db['proyects']
# docc = collection.find({}, {'title':'1'})

class CustomFlask(Flask):
    jinja_options = Flask.jinja_options.copy()
    jinja_options.update(dict(block_start_string='$$',block_end_string='$$',variable_start_string='$',variable_end_string='$',comment_start_string='$#',comment_end_string='#$'))

app = CustomFlask(__name__)
app.config['SECRET_KEY'] = 'secret'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/plamdb'

CORS(app)

mongo = PyMongo(app)

# dbb = mongo.db.proyects.find_one({'owner': 'momantai'},{'_id':0,'task':'1', 'task.work':'1', 'task.status':'1', 'task._id':'1'})

status = ['backlog', 'progress', 'review', 'stop']

socketio = SocketIO(app)

@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template("test.html", db = dbb)

@app.route('/json', methods=['GET'])
def son():
    dbb = mongo.db.proyects.find_one({'owner': 'momantai'},{'_id':0,'task':'1', 'task.work':'1', 'task.status':'1', 'task._id':'1'})
    return dumps(dbb)

@socketio.on('message', namespace='/view')
def headMessage(*msg):
    if msg[0]['typeAction'] == 'change':
        idI = msg[0]['idI']
        statusI = msg[0]['statusI']
        trayectI = msg[0]['trayectI']
        print(statusI)
        if trayectI == 'n':
            statusI = status[status.index(statusI)+1]
        else:
            statusI = status[status.index(statusI)-1]
        
        mongo.db.proyects.update({
            'owner':'momantai','task._id': idI
            }, 
            {
                '$set': {
                        'task.$.status': statusI
                        }
            }, upsert = False)
    else:
        pass
    
    send(msg, broadcast = True)

if __name__ == '__main__':
    socketio.run(app, debug=True)
    # app.run(host='0.0.0.0', debug=True)
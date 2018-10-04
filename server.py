from flask import *
from flask_socketio import SocketIO, send
from flask_cors import CORS


class CustomFlask(Flask):
    jinja_options = Flask.jinja_options.copy()
    jinja_options.update(dict(block_start_string='$$',block_end_string='$$',variable_start_string='$',variable_end_string='$',comment_start_string='$#',comment_end_string='#$'))

app = CustomFlask(__name__)
app.config['SECRET_KEY'] = 'secret'
socketio = SocketIO(app)

@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template("test.html")

@socketio.on('message', namespace='/view')
def headMessage(*msg):
    print(msg)
    send(msg, broadcast = True)

if __name__ == '__main__':
    socketio.run(app, debug=True)
    # app.run(host='0.0.0.0', debug=True)
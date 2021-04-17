import flask
from flask import request, send_file, render_template
import pathlib

app = flask.Flask(__name__)
app.config["DEBUG"] = True


@app.route('/', methods=['GET'])
def home():
    return "prototype"

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        p = pathlib.Path('../login/login.html')
        return send_file(p)

app.run(port="6969")
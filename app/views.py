from app import app

from flask import render_template
import shelve

database = shelve.open("database.db")

@app.route('/')
@app.route('/index')
def index():
    return render_template("new_query.html")

@app.route('/bank')
def bank():
    return render_template("bank.html")

@app.route('/analytics')
def analytics():
    return render_template("analytics.html")

@app.route('/analytics/case')
def case_control():
    return render_template("case_control.html")


from flask import request
from flask_restful import Resource


class RestfulQueryStore(Resource):

    def get(self, query_id):
        return database[query_id]

    def post(self, query_id):
        database[query_id] = request.get_json()
        print database[query_id]
        return database[query_id]
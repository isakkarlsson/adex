import json
import shelve

from flask import render_template

from app import app





@app.route('/')
@app.route('/index')
def index():
    return render_template("my_queries.html")


@app.route('/help')
def help():
    return render_template("help.html")


@app.route('/bank')
def bank():
    return render_template("bank.html")


@app.route('/analytics')
def analytics():
    return render_template("analytics.html")

# @app.route('/analytics/case')
# def case_control():
# return render_template("case_control.html")


from flask import request
from flask_restful import Resource


class AllQueries(Resource):
    def get(self, id):
        l = []
        for k, v in database.iteritems():
            if v is None:
                continue
            l.append({
                'id': k, 'query': v
            })
        return json.dumps(l)

database = shelve.open("database.db")
database_id = len(database) + 1

class RestfulQueryStore(Resource):

    def get(self, query_id):
        print "Getting", query_id
        return database[query_id]

    def delete(self, query_id):
        database[query_id] = None
        database.sync()
        return "success"

    def post(self, query_id):
        global database_id

        try:
            data = request.get_json()
            print "Posting to index", database_id
            print "Getting request", data

            database[str(database_id)] = data
            database.sync()
            database_id += 1
        except:
            print "failed"
        return "success"
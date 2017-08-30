import os
from flask import Flask, render_template, url_for, jsonify, request
from api.geocode import Geocode
from api.darksky import Darksky

app = Flask(__name__, instance_relative_config=True)
app.config.from_pyfile('config.py')


@app.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)


def dated_url_for(endpoint, **values):
    if endpoint == 'static':
        filename = values.get('filename', None)
        if filename:
            file_path = os.path.join(app.root_path,
                                     endpoint, filename)
            values['q'] = int(os.stat(file_path).st_mtime)
    return url_for(endpoint, **values)


@app.route('/', methods=['GET'])
def index():
    return render_template("index.html")

@app.route('/weather', methods=['POST'])
def weather():
    geo = Geocode(app.config["GEOCODE_KEY"], request.json["location"])
    geoData = geo.call()
    if geoData["type"] == "data":
        ds = Darksky(app.config["DARKSKY_KEY"], geoData["output"])
        wxData = ds.call()
        return jsonify(wxData)
    else:
        print geoData["output"]
        return geoData


@app.errorhandler(404)
def page_not_found(e):
    return 'Sorry, Nothing at this URL.', 404


@app.errorhandler(500)
def application_error(e):
    return 'Sorry, unexpected error: {}'.format(e), 500


if __name__ == '__main__':
    app.run(debug=True)

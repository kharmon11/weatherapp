import requests, json
import requests_toolbelt.adapters.appengine

class History():
    def __init__(self, **kwargs):
        self.key = kwargs["key"]
        self.lat = kwargs["lat"]
        self.lon = kwargs["lon"]
        self.timestamp = kwargs["timestamp"]

    def call(self):
        url = "https://api.darksky.net/forecast/" + self.key + "/" + str(self.lat) + "," + str(self.lon) + "," + str(self.timestamp) + "?exclude=currently,flags"
        requests_toolbelt.adapters.appengine.monkeypatch()
        response = requests.get(url)
        return json.loads(response.text)
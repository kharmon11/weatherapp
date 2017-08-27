import requests, json
import requests_toolbelt.adapters.appengine


class Darksky():
    def __init__(self, key, geoData):
        self.key = key
        self.geoData = geoData

    def call(self):
        url = "https://api.darksky.net/forecast/" + self.key + "/" + str(self.geoData['lat']) + "," + str(
            self.geoData['lon']) + "?exclude=minutely,flags"
        requests_toolbelt.adapters.appengine.monkeypatch()
        response = requests.get(url)
        return self.convert_response(response)

    def convert_response(self, response):
        wxData = json.loads(response.text)
        wxData["city"] = self.geoData["city"]
        wxData["state"] = self.geoData["state"]
        wxData["country"] = self.geoData["country"]
        # print self.geoData["zipcode"]
        # wxData["zipcode"] = self.geoData["zipcode"]
        return wxData

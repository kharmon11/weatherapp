import requests, json
import requests_toolbelt.adapters.appengine

class Geocode():
    def __init__(self, key, search_param, location):
        self.key = key
        self.search_param = search_param
        self.location = location

    def call(self):
        url = "https://maps.googleapis.com/maps/api/geocode/json?" + self.search_param + "=" + self.location + "&key=" + self.key
        requests_toolbelt.adapters.appengine.monkeypatch()
        response = requests.get(url)
        return self.get_coords(response)

    def get_coords(self, response):
        geodata = self.data_json(response)
        if geodata["status"] == "OK":
            return {"type": "data", "output": self.parse_geodata(geodata)}
        else:
            return {"type": "error", "output": self.error_handler(geodata["status"])}

    def data_json(self, response):
        return json.loads(response.text)

    def parse_geodata(self, geodata):
        data = {}
        for key, value in geodata["results"][0].iteritems():
            if key == "geometry":
                data["lat"] = value["location"]["lat"]
                data["lon"] = value["location"]["lng"]
            elif key == "address_components":
                for component in value:
                    if "political" in component["types"]:
                        if "locality" in component["types"]:
                            data["city"] = component["short_name"]
                        elif "administrative_area_level_1" in component["types"]:
                            data["state"] = component["short_name"]
                        elif "country" in component["types"]:
                            data["country"] = component["long_name"]
                        else:
                            pass
                    elif "postal_code" in component["types"]:
                        data["zipcode"] = component["short_name"]
                    else:
                        pass
            else:
                pass
        return data

    def error_handler(self, status):
        if status == "ZERO_RESULTS":
            return "No location associated with submitted location."
        elif status == "UNKNOWN_ERROR":
            return "Geocoding External Server Error: Try submitting again."
        else:
            return "Geocoding Error: Can not retrieve data at the moment."

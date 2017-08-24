import requests, json
import requests_toolbelt.adapters.appengine

class Geocode():
    def __init__(self, key, location):
        self.key = key
        self.location = location

    def call(self):
        url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + self.location + "&key=" + self.key
        requests_toolbelt.adapters.appengine.monkeypatch()
        response = requests.get(url)
        if response.status_code == 200:
            return self.get_coords(response)
        else:
            print response.raise_for_status()
            return {"type": "error", "output": "Error: Can not retrieve data at the moment."}

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
        for section in geodata["results"]:
            for key, value in section.iteritems():
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
            return "No location associated with submitted address."
        elif status == "OVER_QUERY_LIMIT" or status == "REQUEST_DENIED" or status == "INVALID_REQUEST":
            return "Error: Can not retrieve data at the moment."
        elif status == "UNKNOWN_ERROR":
            return "External Server Error: Try submitting again."
        else:
            return "Error: Can not retrieve data at the moment."

import requests

class HTTPClient:
    def get(self, url, **kwargs):
        return requests.get(url, **kwargs)

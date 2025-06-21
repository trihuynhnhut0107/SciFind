from bs4 import BeautifulSoup

class HTMLParser:
    def parse(self, html):
        return BeautifulSoup(html, "html.parser")

from bs4 import BeautifulSoup
from flask import abort, Markup

__all__ = ["Document"]

class Document(object):
    """Represents a text document as understood by the server."""

    def __init__(self, docid, author, title, text):
        self.docid = docid
        self.author = author
        self.title = title
        self.text = text

    @property
    def keywords(self):
        if not self.text:
            return []
        keywords = []
        soup = BeautifulSoup(self.text)
        for tag in soup.find_all("span", {"class": "keyword"}):
            keywords.append(tag.get_text())
        return keywords

    @property
    def summary(self):
        if not self.text:
            return None
        base = Markup(self.text.replace("<br>", "\n")).striptags()
        return (base[:197] + u"...") if len(self.text) > 200 else base

    def render_txt(self):
        """Renders the document into a .txt file."""
        return Markup(self.text.replace("<br>", "\n\n")).striptags()

    def render_pdf(self):
        """Renders the document into a .pdf file."""
        abort(503)  # HTTP 503 Service Unavailable

__all__ = ["Document"]

class Document(object):
    """Represents a text document as understood by the server."""

    def __init__(self):
        self.title = None
        self.text = None

    @property
    def keywords(self):
        pass

    def save(self):
        """Saves the document to the database."""
        pass

    def render_txt(self):
        """Renders the document into a .txt file."""
        pass

    def render_pdf(self):
        """Renders the document into a .pdf file."""
        pass
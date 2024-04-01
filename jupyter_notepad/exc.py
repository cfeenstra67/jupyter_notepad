class JupyterNotepadError(Exception):
    """
    Base class for errors
    """


class NoIPythonFound(JupyterNotepadError):
    """ """

    def __init__(self) -> None:
        super().__init__("No ipython found")

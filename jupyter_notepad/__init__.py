from jupyter_notepad import exc
from jupyter_notepad.hooks import (
    _jupyter_labextension_paths,  # noqa: F401
    _jupyter_nbextension_paths,  # noqa: F401
)
from jupyter_notepad.repo import Repo  # noqa: F401
from jupyter_notepad.magics import register_magics  # noqa: F401

try:
    register_magics()
except exc.NoIPythonFound:
    pass

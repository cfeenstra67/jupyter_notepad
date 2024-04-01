import hashlib
import os

from typing import Optional, Any, Dict, Generator

from ipywidgets import DOMWidget
from traitlets import Unicode, Int, Bool

from jupyter_notepad.repo import (
    Repo,
    commit_signal,
    pre_checkout_signal,
    post_checkout_signal,
)


MODULE_NAME = "jupyter-notepad"

MODULE_VERSION = "0.0.2"

DEFAULT_HEIGHT = 18

MISSING = object()


def get_extension(path: str) -> str:
    """
    Get the extension for the current path, defaulting to ""
    """
    filename = os.path.basename(path)

    parts = filename.rsplit(".", 1)

    if len(parts) == 1:
        return ""

    return parts[1]


def file_is_dirty(
    file: "File",
    code: str = MISSING,  # type: ignore[assignment]
    code_sha1: str = MISSING,  # type: ignore[assignment]
    head_sha1: Optional[str] = MISSING,  # type: ignore[assignment]
    checkout_sha1: Optional[str] = MISSING,  # type: ignore[assignment]
) -> bool:
    """
    Compute the is_dirty property for a file, optionally using "non-current" attributes
    for some values
    """
    if code is MISSING:
        code = file.code
    if code_sha1 is MISSING:
        code_sha1 = file.code_sha1
    if head_sha1 is MISSING:
        head_sha1 = file.head_sha1
    if checkout_sha1 is MISSING:
        checkout_sha1 = file.checkout_sha1

    if code == "" and head_sha1 is None:
        return False

    return code_sha1 != head_sha1 and code_sha1 != checkout_sha1


class File(DOMWidget):
    """
    The `File` object is a jupyter widget that can be used for
    editing a particular file in a Repo, and as you edit your
    change history will be saved. It is intended in particular for
    iterating on prompts used in AI models
    """

    # Metadata needed for jupyter to find the widget
    _model_name = Unicode("WidgetModel").tag(sync=True)
    _model_module = Unicode(MODULE_NAME).tag(sync=True)
    _model_module_version = Unicode(MODULE_VERSION).tag(sync=True)
    _view_name = Unicode("WidgetView").tag(sync=True)
    _view_module = Unicode(MODULE_NAME).tag(sync=True)
    _view_module_version = Unicode(MODULE_VERSION).tag(sync=True)

    path = Unicode("").tag(sync=True)
    extension = Unicode("").tag(sync=True)
    code = Unicode("").tag(sync=True)
    height = Int(DEFAULT_HEIGHT, help="Widget height in rem").tag(sync=True)
    show_line_numbers = Bool(False).tag(sync=True)
    code_sha1 = Unicode("")
    head_sha1 = Unicode(None, allow_none=True)
    checkout_sha1 = Unicode(None, allow_none=True)
    is_dirty = Bool(False).tag(sync=True)
    head_commit = Unicode(None, allow_none=True).tag(sync=True)
    checkout_commit = Unicode(None, allow_none=True).tag(sync=True)

    def __init__(self, repo: Repo, path: str, **kwargs) -> None:
        super().__init__(path=path, extension=get_extension(path), **kwargs)
        self.repo = repo
        self.reload()
        self._unobserve = self._setup_listeners()

    def reload(self) -> None:
        """
        Reload the current code from the filesystem
        """
        try:
            with self.repo.open(self.path) as f:
                self.code = f.read()
        except FileNotFoundError:
            self.code = ""

        self.head_commit = self.repo.head()
        self.code_sha1 = hashlib.sha1(self.code.encode()).hexdigest()
        head_blob = self.repo.get_blob("HEAD", self.path)
        if head_blob is None:
            self.head_sha1 = None
        else:
            self.head_sha1 = hashlib.sha1(head_blob).hexdigest()
        self.is_dirty = file_is_dirty(self)

    def commit(self) -> Optional[str]:
        """
        Commit the latest changes to the repository, if any
        """
        hexsha = self.repo.commit(self.path)
        if hexsha is not None:
            self.checkout_sha1 = None
            self.checkout_commit = None
        return hexsha

    def checkout(self, ref: str) -> None:
        """
        Check out the contents of the file from the given ref into
        the current buffer. This will NOT actuallly check out that
        ref on the repository level, it only does so for this specific
        file.
        """
        blob = self.repo.get_blob(ref, self.path)
        if blob is None:
            return
        self.code = blob.decode()
        self.checkout_sha1 = self.code_sha1
        self.checkout_commit = ref

    def iter_commits(self) -> Generator[Dict[str, Any], None, None]:
        """
        Iterate through commits of this file in the repository
        """
        yield from self.repo.iter_commits(self.path)

    def reset_height(self) -> None:
        """
        Reset this widget's height back to the default value (18rem)
        """
        self.height = DEFAULT_HEIGHT

    def __str__(self) -> str:
        return self.code

    def __del__(self) -> None:
        self._unobserve()

    def _handle_request(self, method: str, payload: Any) -> Any:
        if method == "commit":
            return self.commit()
        if method == "get-commits":
            commits = list(self.repo.iter_commits(self.path))
            return commits
        if method == "checkout-version":
            if self.is_dirty:
                self.commit()
            hexsha = payload["hexsha"]
            self.checkout(hexsha)
            return None

        raise Exception(f"Invalid method: {method}")

    def _setup_listeners(self):
        """ """

        def observe_code(change):
            with self.repo.open(self.path, "w+") as f:
                f.write(change["new"])
                self.code_sha1 = hashlib.sha1(change["new"].encode()).hexdigest()
                self.is_dirty = file_is_dirty(self, code=change["new"])

        def observe_head_sha1(change):
            self.is_dirty = file_is_dirty(self, head_sha1=change["new"])

        def observe_checkout_sha1(change):
            self.is_dirty = file_is_dirty(self, checkout_sha1=change["new"])

        def observe_message(widget, content, buffers):
            try:
                response = self._handle_request(content["method"], content["payload"])
                self.send(
                    {
                        "request_id": content["request_id"],
                        "success": True,
                        "payload": response,
                    }
                )
            except Exception as err:
                self.send(
                    {
                        "request_id": content["request_id"],
                        "success": False,
                        "error": f"{type(err).__name__}: {err}",
                    }
                )

        def observe_commits(repo, path, hexsha):
            self.head_commit = hexsha
            if path != self.path:
                return
            head_blob = self.repo.get_blob("HEAD", self.path)
            if head_blob is None:
                self.head_sha1 = None
            else:
                self.head_sha1 = hashlib.sha1(head_blob).hexdigest()

        def observe_pre_checkout(repo, branch):
            if self.is_dirty:
                self.commit()

        def observe_post_checkout(repo, branch):
            self.reload()

        def unobserve():
            self.unobserve(observe_code, ["code"])
            self.unobserve(observe_head_sha1, ["head_sha1"])
            self.unobserve(observe_checkout_sha1, ["checkout_sha1"])
            self.on_msg(observe_message, remove=True)
            commit_signal.disconnect(observe_commits, self.repo)
            pre_checkout_signal.disconnect(observe_pre_checkout, self.repo)
            post_checkout_signal.disconnect(observe_post_checkout, self.repo)

        self.observe(observe_code, ["code"])
        self.observe(observe_head_sha1, ["head_sha1"])
        self.observe(observe_checkout_sha1, ["checkout_sha1"])
        self.on_msg(observe_message)
        commit_signal.connect(observe_commits, self.repo)
        pre_checkout_signal.connect(observe_pre_checkout, self.repo)
        post_checkout_signal.connect(observe_post_checkout, self.repo)

        return unobserve

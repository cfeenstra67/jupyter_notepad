# import asyncio
# import contextlib
import hashlib

# import sys
# import threading
# import time
from typing import Optional, Any

from ipywidgets import DOMWidget
from traitlets import Unicode, Int, Bool

from jupyter_notepad.repo import Repo, commit_signal


MODULE_NAME = "jupyter-notepad"

MODULE_VERSION = "0.0.1-dev0"

DEFAULT_HEIGHT = 18


class File(DOMWidget):
    """ """

    # Metadata needed for jupyter to find the widget
    _model_name = Unicode("WidgetModel").tag(sync=True)
    _model_module = Unicode(MODULE_NAME).tag(sync=True)
    _model_module_version = Unicode(MODULE_VERSION).tag(sync=True)
    _view_name = Unicode("WidgetView").tag(sync=True)
    _view_module = Unicode(MODULE_NAME).tag(sync=True)
    _view_module_version = Unicode(MODULE_VERSION).tag(sync=True)

    path = Unicode("").tag(sync=True)
    code = Unicode("").tag(sync=True)
    height = Int(DEFAULT_HEIGHT).tag(sync=True)
    code_sha1 = Unicode("")
    head_sha1 = Unicode(None, allow_none=True)
    is_dirty = Bool(False).tag(sync=True)

    def __init__(self, repo: Repo, path: str, **kwargs) -> None:
        super().__init__(path=path, **kwargs)
        self.repo = repo
        self.reload()
        self._unobserve = self._setup_listeners()

        # startup_event = threading.Event()
        # self.thread = FileThread(self, startup_event)
        # self.thread.start()

        # startup_event.wait(3)

    def reload(self) -> None:
        try:
            with self.repo.open(self.path) as f:
                self.code = f.read()
        except FileNotFoundError:
            self.code = ""

        self.code_sha1 = hashlib.sha1(self.code.encode()).hexdigest()
        head_blob = self.repo.get_blob("HEAD", self.path)
        if head_blob is None:
            self.head_sha1 = None
        else:
            self.head_sha1 = hashlib.sha1(head_blob).hexdigest()
        self.is_dirty = self.code_sha1 != self.head_sha1

    def commit(self) -> Optional[str]:
        return self.repo.commit(self.path)

    def reset_height(self) -> None:
        self.height = DEFAULT_HEIGHT

    def __str__(self) -> str:
        return self.code

    def __del__(self) -> None:
        self._unobserve()

    def _handle_request(self, method: str, payload: Any) -> Any:
        if method == "commit":
            return self.commit()

        raise Exception(f"Invalid method: {method}")

    def _setup_listeners(self):
        """ """

        def observe_code(change):
            with self.repo.open(self.path, "w+") as f:
                f.write(change["new"])
                self.code_sha1 = hashlib.sha1(change["new"].encode()).hexdigest()
                self.is_dirty = self.code_sha1 != self.head_sha1

        def observe_head_sha1(change):
            self.is_dirty = self.code_sha1 != change["new"]

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

        def observe_commits(repo, path, hash):
            if path != self.path:
                return
            head_blob = self.repo.get_blob("HEAD", self.path)
            if head_blob is None:
                self.head_sha1 = None
            else:
                self.head_sha1 = hashlib.sha1(head_blob).hexdigest()

        def unobserve():
            self.unobserve(observe_code, ["code"])
            self.unobserve(observe_head_sha1, ["head_sha1"])
            self.on_msg(observe_message, remove=True)
            commit_signal.disconnect(observe_commits, self.repo)

        self.observe(observe_code, ["code"])
        self.observe(observe_head_sha1, ["head_sha1"])
        self.on_msg(observe_message)
        commit_signal.connect(observe_commits, self.repo)

        return unobserve


# class FileThread(threading.Thread):
#     """
#     """
#     def __init__(self, file: File, startup_event: threading.Event) -> None:
#         super().__init__()
#         self.file = file
#         self.loop = asyncio.new_event_loop()
#         self.startup_event = startup_event
#         self.shutdown_event = threading.Event()
#         self.last_write_at = time.time()

#     def shutdown(self) -> None:
#         self.shutdown_event.set()
#         self.join()


#     # async def _commit_periodically(self) -> None:
#     #     while True:
#     #         if time.time() - self.last_write_at > 3:
#     #             self.file.commit()
#     #         await asyncio.sleep(1)

#     async def _main_loop(self) -> None:
#         while not self.shutdown_event.is_set():
#             await asyncio.sleep(0.1)

#     def run(self) -> None:
#         if sys.version_info < (3, 10):
#             asyncio.set_event_loop(self.loop)

#         unobserve = self._observe()

#         tasks = []
#         # tasks.append(self.loop.create_task(self._commit_periodically()))

#         try:
#             self.startup_event.set()
#             self.loop.run_until_complete(self._main_loop())
#         finally:
#             for task in reversed(tasks):
#                 with contextlib.suppress(asyncio.CancelledError):
#                     task.cancel()
#             unobserve()
#             self.loop.run_until_complete(self.loop.shutdown_asyncgens())
#             self.loop.close()

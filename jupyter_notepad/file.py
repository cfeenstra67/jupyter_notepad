import asyncio
import contextlib
import sys
import threading
import time
from typing import Optional

from ipywidgets import DOMWidget
from traitlets import Unicode, Int

from jupyter_notepad.repo import Repo


MODULE_NAME = "jupyter-notepad"

MODULE_VERSION = "0.0.1-dev0"


class File(DOMWidget):
    """
    """
    # Metadata needed for jupyter to find the widget
    _model_name = Unicode("WidgetModel").tag(sync=True)
    _model_module = Unicode(MODULE_NAME).tag(sync=True)
    _model_module_version = Unicode(MODULE_VERSION).tag(sync=True)
    _view_name = Unicode("WidgetView").tag(sync=True)
    _view_module = Unicode(MODULE_NAME).tag(sync=True)
    _view_module_version = Unicode(MODULE_VERSION).tag(sync=True)

    path = Unicode("").tag(sync=True)
    code = Unicode("").tag(sync=True)
    height = Int(4).tag(sync=True)

    def __init__(
        self,
        repo: Repo,
        path: str,
        **kwargs
    ) -> None:
        super().__init__(path=path, **kwargs)
        self.repo = repo
        self.reload()

        startup_event = threading.Event()
        self.thread = FileThread(self, startup_event)
        self.thread.start()

        startup_event.wait(3)

    def reload(self) -> None:
        with self.repo.open(self.path) as f:
            self.code = f.read()

    def commit(self) -> Optional[str]:
        return self.repo.commit(self.path)

    def _observe_code(self, change):
        with self.repo.open(self.path, "w+") as f:
            f.write(change["new"])

    def __str__(self) -> str:
        return self.code


class FileThread(threading.Thread):
    """
    """
    def __init__(self, file: File, startup_event: threading.Event) -> None:
        super().__init__()
        self.file = file
        self.loop = asyncio.new_event_loop()
        self.startup_event = startup_event
        self.shutdown_event = threading.Event()
        self.last_write_at = time.time()

    def shutdown(self) -> None:
        self.shutdown_event.set()
        self.join()

    def _observe(self):
        def observe(change):
            self.last_write_at = time.time()
            with self.file.repo.open(self.file.path, "w+") as f:
                f.write(change["new"])

        def unobserve():
            self.file.unobserve(observe, ["code"])

        self.file.observe(observe, ["code"])
        
        return unobserve
    
    async def _commit_periodically(self) -> None:
        while True:
            if time.time() - self.last_write_at > 3:
                self.file.commit()
            await asyncio.sleep(1)

    async def _main_loop(self) -> None:
        while not self.shutdown_event.is_set():
            await asyncio.sleep(0.1)

    def run(self) -> None:
        if sys.version_info < (3, 10):
            asyncio.set_event_loop(self.loop)

        unobserve = self._observe()
        
        tasks = []
        tasks.append(self.loop.create_task(self._commit_periodically()))

        try:
            self.startup_event.set()
            self.loop.run_until_complete(self._main_loop())
        finally:
            for task in reversed(tasks):
                with contextlib.suppress(asyncio.CancelledError):
                    task.cancel()
            unobserve()
            self.loop.run_until_complete(self.loop.shutdown_asyncgens())
            self.loop.close()

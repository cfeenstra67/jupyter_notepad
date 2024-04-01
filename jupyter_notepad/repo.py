import contextlib
import os
from typing import Optional, Dict, Generator, Any, List

import git
from blinker import signal


commit_signal = signal("commit")

pre_checkout_signal = signal("pre-checkout")

post_checkout_signal = signal("post-checkout")


class Repo:
    """ """

    def __init__(self, path: str) -> None:
        self.path = path
        if not os.path.exists(path):
            self.repo = git.Repo.init(path)
        else:
            self.repo = git.Repo(path)
        self._files: Dict[str, File] = {}

    def head(self) -> Optional[str]:
        """
        Get the commit hash for HEAD
        """
        try:
            return self.repo.head.commit.hexsha
        # This indicates it's the first commit
        except ValueError:
            return None

    def branch(self) -> str:
        """
        Get the name of the currently checkout out branch
        """
        return self.repo.head.reference.name

    def branches(self) -> List[str]:
        """
        List the names of all branches in the repository
        """
        return [branch.name for branch in self.repo.branches]  # type: ignore[attr-defined]

    @contextlib.contextmanager
    def open(self, path: str, mode: str = "r", **kwargs):
        """
        Open a file within the repository; just like the global
        open() but takes a path relative to the repository root
        """
        full_path = os.path.join(self.path, path)

        dirname = os.path.dirname(full_path)
        if not os.path.exists(dirname):
            os.makedirs(dirname)

        with open(full_path, mode, **kwargs) as f:
            yield f

    def remove(self, path: str, commit: bool = True) -> Optional[str]:
        """ """
        full_path = os.path.join(self.path, path)
        if not os.path.exists(full_path):
            return None
        if os.path.isdir(full_path):
            raise Exception(f"{path} is a directory")
        os.remove(full_path)
        if commit:
            return self.commit(path, "delete")
        return None

    def commit(self, path: str, message: Optional[str] = None) -> Optional[str]:
        """ """
        if message is None:
            message = "update"

        head_exists = self.head() is not None

        self.repo.index.add([path])

        if head_exists and not self.repo.index.diff("HEAD", paths=[path]):
            return None

        commit = self.repo.index.commit(f"{path}: {message}")

        commit_signal.send(self, path=path, hexsha=commit.hexsha)

        return commit.hexsha

    def checkout(self, branch: str, create: bool = True) -> None:
        """ """
        if self.branch() == branch:
            return

        existing = [b for b in self.repo.branches if b.name == branch]  # type: ignore
        if existing:
            branch_obj = existing[0]
        elif not create:
            raise Exception(f"Branch does not exist: {branch}")
        else:
            branch_obj = self.repo.create_head(branch)

        pre_checkout_signal.send(self, branch=branch)

        self.repo.head.reference = branch_obj  # type: ignore
        self.repo.head.reset(index=True, working_tree=True)

        post_checkout_signal.send(self, branch=branch)

    def _normalize_path(self, path: str) -> str:
        full_path = os.path.normpath(os.path.join(self.path, path))
        return os.path.relpath(full_path, self.path)

    def file(self, path: str, **kwargs) -> "File":
        """ """
        full_path = os.path.join(self.path, path)
        if os.path.isdir(full_path):
            raise Exception(f"{full_path} is a directory")

        path = self._normalize_path(path)

        if path not in self._files:
            self._files[path] = File(self, path, **kwargs)
        return self._files[path]

    def iter_commits(self, path: str) -> Generator[Dict[str, Any], None, None]:
        if self.head() is None:
            return

        for commit in self.repo.iter_commits(paths=[path]):
            ts_millis = int(commit.committed_datetime.timestamp() * 1000)
            yield {
                "hexsha": commit.hexsha,
                "message": commit.message,
                "timestamp_millis": ts_millis,
            }

    def get_blob(self, ref: str, path: str) -> Optional[bytes]:
        try:
            commit = self.repo.commit(ref)
        except git.BadName:
            return None
        try:
            blob = commit.tree / path
        except KeyError:
            return None
        return blob.data_stream.read()


from jupyter_notepad.file import File  # noqa: E402

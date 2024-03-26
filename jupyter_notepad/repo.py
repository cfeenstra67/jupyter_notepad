import contextlib
import os
from typing import Optional

import git


class Repo:
    """
    """
    def __init__(self, path: str) -> None:
        self.path = path
        if not os.path.exists(path):
            self.repo = git.Repo.init(path)
        else:
            self.repo = git.Repo(path)
        self._files = {}

    @contextlib.contextmanager
    def open(self, path: str, mode: str = "r", **kwargs):
        """
        """
        full_path = os.path.join(self.path, path)
        try:
            with open(full_path, mode, **kwargs) as f:
                yield f
        finally:
            self.repo.index.add([path])

    def commit(self, path: str) -> Optional[str]:
        """
        """
        try:
            self.repo.head.object
        # This indicates it's the first commit
        except ValueError:
            pass
        else:
            if not self.repo.index.diff("HEAD", paths=[path]):
                return None

        commit = self.repo.index.commit(f"update {path}")
        return commit.hexsha

    def checkout(self, branch: str, create: bool = False) -> None:
        """
        """
        existing = [b for b in self.repo.branches if b.name == branch]
        if existing:
            branch_obj = existing[0]
        elif not create:
            raise Exception(f"Branch does not exist: {branch}")
        else:
            branch_obj = self.repo.create_head(branch)

        self.repo.head.reference = branch_obj
        self.repo.head.reset(index=True, working_tree=True)

    def file(self, path: str, **kwargs) -> "File":
        """
        """
        if path not in self._files:
            self._files[path] = File(self, path, **kwargs)
        return self._files[path]


from jupyter_notepad.file import File

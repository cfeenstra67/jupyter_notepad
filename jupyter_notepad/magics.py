import ast
import shlex
import textwrap
from typing import Optional

from IPython import get_ipython
from IPython.core.interactiveshell import InteractiveShell
from IPython.core.magic import Magics, magics_class, line_cell_magic

from jupyter_notepad.exc import NoIPythonFound
from jupyter_notepad.repo import Repo


@magics_class
class JupyterNotepadMagics(Magics):
    """
    jupyter_notepad magics. These are registered automatically when `jupyter_notepad`
    is imported within an IPython shell.
    """

    @line_cell_magic
    def load_from_repo(self, line, cell=None):
        """
        Usage: %load_from_repo <repo_var_name> <path_or_path_var_name> <output_var_name>

        Arguments:
        - repo_var_name -
        - path_or_path_var_name -
        - output_var_name -
        """
        name = "load_from_repo"
        called_name = (r"%" if cell is None else r"%%") + name

        opts, args_str = self.parse_options(line, "h", "help")

        if opts.get("h") is not None or opts.get("help") is not None:
            default_name = r"%" + name
            doc = self.load_from_repo.__doc__.replace(default_name, called_name)
            print(textwrap.dedent(doc).strip())
            return

        args = shlex.split(args_str)
        if len(args) != 3:
            raise Exception(
                f"Usage: {called_name} <repo_var_name> <path_or_path_var_name> <output_var_name>, "
                f"Run '{called_name} --help' for a full description of arguments."
            )

        repo_var_name, path_or_path_var_name, output_var_name = args

        if repo_var_name not in self.shell.user_ns:
            raise Exception(f"Unable to find value in locals for `{repo_var_name}`")
        repo_value = self.shell.user_ns.get(repo_var_name)
        if not isinstance(repo_value, Repo):
            raise Exception(
                f"Invalid type for value `{repo_var_name}`: {type(repo_value)}"
            )

        path_value = self.shell.user_ns.get(
            path_or_path_var_name, path_or_path_var_name
        )
        try:
            with repo_value.open(path_value) as f:
                code = f.read()
        except FileNotFoundError:
            print(f"Warning: {path_value} not found. Not updating cell contents.")
            if cell is not None:
                self.shell.run_cell(cell)
        else:
            output_name = ast.Name(output_var_name, ast.Store())
            code_literal = ast.Constant(code)
            assignment_ast = ast.Assign([output_name], code_literal)
            ast.fix_missing_locations(assignment_ast)

            python_code = ast.unparse(assignment_ast)

            full_output = "\n".join(
                [
                    f"{called_name} {line}",
                    "# NOTE: The contents of this cell are generated. It's recommended that you ",
                    f"# edit the contents of {path_value} using jupyter_notepad or directly rather ",
                    "# than editing this cell directly.",
                    python_code,
                ]
            )

            self.shell.set_next_input(full_output, replace=True)
            self.shell.run_cell(python_code)


def register_magics(ipython: Optional[InteractiveShell] = None) -> None:
    """
    Register jupyter_notepad magics
    """
    if ipython is None:
        ipython = get_ipython()
    if ipython is None:
        raise NoIPythonFound

    ipython.register_magics(JupyterNotepadMagics)

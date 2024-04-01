# Jupyter Notepad

`jupyter_notepad` is a python library that provides you a code editor widget that automatically tracks change history right within Jupyter notebooks. This is useful when you're iterating on a particular piece of text such as some code or a prompt for an AI model and don't want to lose any of your history. To try it out, simple install using `pip`:
```bash
pip install jupyter_notepad
```
Then in a jupyter notebook cell, you can get started in just a couple lines of code:
```python
from jupyter_notepad import Repo

repo = Repo("./my-project")

prompt_file = repo.file("prompt.md")
prompt_file # This should be the last line of the cell
```
You should see an editor open in your notebook like below:

![Screenshot of the widget in a notebook](images/widget-1.png)

You can retrieve the contents of your file by simply calling `str(file)`:

```python
prompt_value = str(prompt_file)
```

You can use the "History" dropdown within the widget to restore old versions of your text:

![Screenshot of the widget in a notebook with the history dropdown expanded](images/widget-2.png)

`jupyter_notepad` saves a new version of your text automatically when you update your file, but you can also use `Cmd+S` or the "Save" button in the widget to save a new version of your work. If you disable the checkbox next to "Auto Save" in the widget, new versions will _only_ be created when you explicitly save your work using one of those two methods. The only exception is that when you restore an old version of your text, `jupyter_notepad` will always save a new version before restoring it (as long as there's a diff since the last saved version).

For simple usages of `jupyter_notepad`, those features should be all you need. Read on to learn about more advanced usages of `jupyter_notepad`.

## Table of Contents

- [Sharing Notebooks](#sharing-notebooks)
- [Editing multiple files at once](#editing-multiple-files-at-once)
- [Development](#development)
- [Support and feature requests](#support-and-feature-requests)

## Sharing notebooks

One of the side effects of using `jupyter_notepad` is that by default it makes sharing notebooks more difficult. `jupyter_notepad` offers a solution for this so that even without your `jupyter_notepad` repository, others can still run all of your code.

The solution is to use the `%load_from_repo` magic function. This will be registered automatically when you import `jupyter_notepad`. What this magic function does is load one of the files from your repository, and store the contents in a string literal in a cell of your notebook.

When using this magic function, you must provide three arguments:
- The variable name for the `jupyter_notepad.Repo` instance to load the file from.
- The file path within the repository to load, or the variable name that holds that path.
- The output variable that the contents of that variable will be assigned to.

For example:
```python
%load_from_repo repo prompt.md prompt_value
```
If you run a cell with those contents after the code block from the introduction, it will replace the contents of the cell with the following and execute it:
```python
%load_from_repo repo prompt.md prompt_value
# NOTE: The contents of this cell are generated. It's recommended that you 
# edit the contents of prompt.md using jupyter_notepad or directly rather 
# than editing this cell directly.
prompt_value = '# Hello\n\nAs you can see, there will be automatic syntax highlighting for most languages based on the file extension of the file name.\n\n```js\n// Code will even be highlighted in code blocks!\nconst a = 1;\n```\n'
```
The cell can be re-run, and the latest contents of the file will be loaded each time.

Now, when others run your notebook, you have two options:
- They can comment out the `%load_from_repo` line and just run the cell normally. In fact, if desired all of the `jupyter_notebook` code could be removed from the notebook by others if desired and they could still run the notebook.
- If they have an empty repository and `prompt.md` is not found, `%load_from_repo` will simply print a warning and still execute the python code below it.

## Editing Multiple Files at Once

When editing multiple files, you might want to have multiple tabs or multiple editors side-by-side. Luckly, the `ipywidgets` module makes this very straightforward. `jupyter_notepad` works seemlessly with `ipywidgets` widgets such as `VBox`, `HBox`, and `Tab`. You can use these to build more complex layouts composed of multiple individual editors. An illustrative example can be found below:
```python
import ipywidgets

ipywidgets.Tab(
    children=[
        repo.file("prompt.md"),
        ipywidgets.HBox([
            repo.file("fibonacci.js"),
            repo.file("fibonacci.py"),
        ])
    ],
    titles=[
        "prompt.md",
        "fibonacci",
    ]
)
```
Results in the following:

![Multiple jupyter_notepad file widgets composed into tabs and an HBox](images/widget-multiple-files.png)

Note that you can change the height for a particular file by setting the `height` property. It is a number, and the height of the widget will be set in `rem`. The default value is `18`. Example:
```python
my_file = repo.file("prompt.md")
my_file.height = 36
my_file
```

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md).

## Support and feature requests

If you encounter a bug with `jupyter_notepad` or would like to request a new feature, please open an [issue](https://github.com/cfeenstra67/jupyter_notepad/issues) and I'll try to help you out as quickly as possible. Contributions are welcome if you'd like to contribute a feature or improve the documentation.

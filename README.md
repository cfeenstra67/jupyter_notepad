# Jupyter React Widget Template

This is a basic repository setup for a React-based jupyter widget, based on the tools I like to use at the moment. There's a _lot_ required to get this all working and there aren't a lot of good references out there, so I made this repo as a reference for myself that I can copy when creating new Jupyter widget packages.

(See the [lmk README](https://github.com/lmkapp/lmk/blob/main/packages/python-client/README.md) for more info, all of this info originated from there)

## Set up

- Create virtual environment: `python -m venv venv`

- Install dependencies with `pnpm install`

- Install the package with `pip install -e '.[dev]'

- You should be able to run `jupyter lab` and run the following to see the widget:
```python
from jupyter_notepad.widget import Widget

w = Widget()
w
```

### Enable extension:

Make sure you've installed or run `pnpm build:prod` first.

- Jupyter notebook 5.2 and earlier:
```bash
jupyter nbextension install --sys-prefix --symlink --overwrite --py lmk
jupyter nbextension enable --sys-prefix --py lmk
```
- Jupyterlab:
```bash
jupyter labextension develop --overwrite .
```

### Watch (dev mode)

```bash
pnpm watch
```

When this is running, if you make changes to the plugin code reloading the page should be sufficient to see changes.

### Linting & formatting

```bash
pnpm check
```

### Build python wheel

```bash
pnpm build:python
```


- TODO: clean up JS dependencies
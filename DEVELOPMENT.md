# Development

## Set up

- Create virtual environment: `python -m venv venv`

- Install dependencies with `pnpm install`

- Install the package with `pip install -e '.[dev]'

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

### Build python sdist/wheel

```bash
pnpm build:python
```

### Check python distribution files before upload

```bash
pnpm pypi-check
```

### Publish to PyPI (test index)

```bash
pnpm pypi-upload-test
```

### Publish to PyPI

```bash
pnpm pypi-upload
```

### Publish to npm

```bash
pnpm npm-publish
```

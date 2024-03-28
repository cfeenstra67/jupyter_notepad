export function focusNextCell(element: HTMLElement): void {
  let jupyterLabParent = element;
  const isParent = (el: HTMLElement) =>
    el.classList.contains("jp-WindowedPanel-inner");
  while (jupyterLabParent.parentElement && !isParent(jupyterLabParent)) {
    jupyterLabParent = jupyterLabParent.parentElement;
  }

  const root = isParent(jupyterLabParent) ? jupyterLabParent : document;
  const rect = element.getBoundingClientRect();
  const candidates = Array.from(root.querySelectorAll(".cm-content"));
  const minTop = rect.top + rect.height;

  let bestCandidate: HTMLElement | null = null;
  let bestTop = Number.MAX_SAFE_INTEGER;

  for (const candidate of candidates) {
    if (candidate === element) {
      continue;
    }
    const candidateRect = candidate.getBoundingClientRect();
    if (candidateRect.top <= minTop) {
      continue;
    }

    if (candidateRect.top < bestTop) {
      bestCandidate = candidate as HTMLElement;
      bestTop = candidateRect.top;
    }
  }

  if (bestCandidate !== null) {
    bestCandidate.focus();
  }
}

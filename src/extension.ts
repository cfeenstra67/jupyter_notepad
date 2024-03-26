// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// Entry point for the notebook bundle containing custom model definitions.
//
// Setup notebook base URL
//
// Some static assets may be required by the custom widget javascript. The base
// url for the notebook is not known at build time and is therefore computed
// dynamically.
// biome-ignore lint/suspicious/noExplicitAny: need to use any here
(window as any).__webpack_public_path__ =
  // biome-ignore lint/style/useTemplate: I don't understand this that well & don't want it to break
  document.querySelector("body")!.getAttribute("data-base-url") +
  "nbextensions/jupyter-notepad";

export * from "./index";

// Copied from https://github.com/jupyterlab/jupyterlab/blob/main/packages/codemirror/src/theme.ts
import {
  HighlightStyle,
  syntaxHighlighting
} from '@codemirror/language';
import type { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';

export const jupyterEditorTheme = EditorView.theme({
  /**
   * CodeMirror themes are handling the background/color in this way. This works
   * fine for CodeMirror editors outside the notebook, but the notebook styles
   * these things differently.
   */
  '&': {
    background: 'var(--jp-layout-color0)',
    color: 'var(--jp-content-font-color1)'
  },

  /* In the notebook, we want this styling to be handled by its container */
  '.jp-CodeConsole &, .jp-Notebook &': {
    background: 'transparent'
  },

  '.cm-content': {
    caretColor: 'var(--jp-editor-cursor-color)'
  },

  /* Inherit font family from .cm-editor */
  '.cm-scroller': {
    fontFamily: 'inherit'
  },

  '.cm-cursor, .cm-dropCursor': {
    borderLeft:
      'var(--jp-code-cursor-width0) solid var(--jp-editor-cursor-color)'
  },

  '.cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'var(--jp-editor-selected-background)'
  },

  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': {
    backgroundColor: 'var(--jp-editor-selected-focused-background)'
  },

  '.cm-gutters': {
    borderRight: 'none',
    backgroundColor: 'var(--jp-layout-color0)'
  },

  '.cm-gutter': {
    backgroundColor: 'var(--jp-layout-color0)'
  },

  '.cm-activeLine': {
    backgroundColor:
      'color-mix(in srgb, var(--jp-layout-color3) 25%, transparent)'
  },

  '.cm-activeLineGutter': {
    backgroundColor: 
      'color-mix(in srgb, var(--jp-layout-color3) 25%, transparent)'
  },

  '.cm-lineNumbers': {
    color: 'var(--jp-ui-font-color2)'
  },

  '.cm-searchMatch': {
    backgroundColor: 'var(--jp-search-unselected-match-background-color)',
    color: 'var(--jp-search-unselected-match-color)'
  },

  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor:
      'var(--jp-search-selected-match-background-color) !important',
    color: 'var(--jp-search-selected-match-color) !important'
  },

  '.cm-tooltip': {
    backgroundColor: 'var(--jp-layout-color1)'
  },

  '.cm-builtin': {
    color: 'var(--jp-mirror-editor-builtin-color)'
  }
});

// The list of available tags for syntax highlighting is available at
// https://lezer.codemirror.net/docs/ref/#highlight.tags
export const jupyterHighlightStyle = HighlightStyle.define([
  // Order matters - a rule will override the previous ones; important for example for in headings styles.
  { tag: t.meta, color: 'var(--jp-mirror-editor-meta-color)' },
  { tag: t.heading, color: 'var(--jp-mirror-editor-header-color)' },
  {
    tag: [t.heading1, t.heading2, t.heading3, t.heading4],
    color: 'var(--jp-mirror-editor-header-color)',
    fontWeight: 'bold'
  },
  {
    tag: t.keyword,
    color: 'var(--jp-mirror-editor-keyword-color)',
    fontWeight: 'bold'
  },
  { tag: t.atom, color: 'var(--jp-mirror-editor-atom-color)' },
  { tag: t.number, color: 'var(--jp-mirror-editor-number-color)' },
  {
    tag: [t.definition(t.name), t.function(t.definition(t.variableName))],
    color: 'var(--jp-mirror-editor-def-color)'
  },
  {
    tag: t.standard(t.variableName),
    color: 'var(--jp-mirror-editor-builtin-color)'
  },
  {
    tag: [t.special(t.variableName), t.self],
    color: 'var(--jp-mirror-editor-variable-2-color)'
  },
  { tag: t.punctuation, color: 'var(--jp-mirror-editor-punctuation-color)' },
  { tag: t.propertyName, color: 'var(--jp-mirror-editor-property-color)' },
  {
    tag: t.operator,
    color: 'var(--jp-mirror-editor-operator-color)',
    fontWeight: 'bold'
  },
  {
    tag: t.comment,
    color: 'var(--jp-mirror-editor-comment-color)',
    fontStyle: 'italic'
  },
  { tag: t.string, color: 'var(--jp-mirror-editor-string-color)' },
  {
    tag: [t.labelName, t.monospace, t.special(t.string)],
    color: 'var(--jp-mirror-editor-string-2-color)'
  },
  { tag: t.bracket, color: 'var(--jp-mirror-editor-bracket-color)' },
  { tag: t.tagName, color: 'var(--jp-mirror-editor-tag-color)' },
  { tag: t.attributeName, color: 'var(--jp-mirror-editor-attribute-color)' },
  { tag: t.quote, color: 'var(--jp-mirror-editor-quote-color)' },
  {
    tag: t.link,
    color: 'var(--jp-mirror-editor-link-color)',
    textDecoration: 'underline'
  },
  { tag: [t.separator, t.derefOperator, t.paren], color: '' },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  {
    tag: t.bool,
    color: 'var(--jp-mirror-editor-keyword-color)',
    fontWeight: 'bold'
  }
]);

/**
 * JupyterLab CodeMirror 6 theme
 */
export const jupyterTheme: Extension = [
  jupyterEditorTheme,
  syntaxHighlighting(jupyterHighlightStyle)
];

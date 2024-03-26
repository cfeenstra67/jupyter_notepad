import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';
import { languages } from '@codemirror/language-data';
import { useWidgetModelState } from "../lib/widget-model";

import "../styles/globals.css";
import { jupyterTheme } from '../theme';

export default function Widget() {
  const [code, setCode] = useWidgetModelState("code");
  const [height] = useWidgetModelState('height');

  return (
    <CodeMirror
      value={code}
      height={`${height * 3}rem`}
      onChange={(code) => setCode(code)}
      theme={jupyterTheme}
      extensions={[markdown({ base: markdownLanguage, codeLanguages: languages }), EditorView.lineWrapping]}
      basicSetup={{
        lineNumbers: false
      }}
    />
  );
}

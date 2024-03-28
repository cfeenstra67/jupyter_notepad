import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useWidgetModelState } from "../lib/widget-model";

import { useRef } from "react";
import { useCommitAction } from "../hooks/useCommitAction";
import "../styles/globals.css";
import { jupyterTheme } from "../theme";
import { focusNextCell } from "../utils/focusNextCell";
import Toolbar from "./Toolbar";

export default function Widget() {
  const ref = useRef<HTMLDivElement>(null);
  const [code, setCode] = useWidgetModelState("code");
  const [height] = useWidgetModelState("height");
  const [lineNumbers] = useWidgetModelState("show_line_numbers");
  const commit = useCommitAction();

  return (
    <div
      ref={ref}
      className="flex flex-col border border-cellBorder"
      style={{ height: `${height}rem` }}
    >
      <Toolbar />
      <CodeMirror
        value={code}
        className="overflow-y-scroll px-1"
        onChange={(code) => setCode(code)}
        onKeyDown={async (event) => {
          if (event.key === "Enter" && (event.shiftKey || event.metaKey)) {
            event.preventDefault();
            event.stopPropagation();
            if (ref.current !== null) {
              focusNextCell(ref.current);
            }
          }

          if (event.key === "s" && event.metaKey) {
            await commit();
          }
        }}
        theme={jupyterTheme}
        extensions={[
          markdown({ base: markdownLanguage, codeLanguages: languages }),
          EditorView.lineWrapping,
        ]}
        basicSetup={{ lineNumbers }}
      />
    </div>
  );
}

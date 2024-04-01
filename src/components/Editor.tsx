import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { useQuery } from "@tanstack/react-query";
import ReactCodeMirror, {
  EditorView,
  type Extension,
} from "@uiw/react-codemirror";
import clsx from "clsx";
import type { RefObject } from "react";
import { useCommitAction } from "../hooks/useCommitAction";
import { useWidgetModelState } from "../lib/widget-model";
import { jupyterTheme } from "../theme";
import { focusNextCell } from "../utils/focusNextCell";

function useLanguageSupport(extension: string) {
  return useQuery({
    queryKey: ["languageSupport", extension],
    queryFn: async () => {
      const language = languages.filter((lang) =>
        lang.extensions.includes(extension),
      )[0];
      if (!language) {
        return null;
      }
      if (language.name === "Markdown") {
        return markdown({ base: markdownLanguage, codeLanguages: languages });
      }

      if (language.support) {
        return language.support;
      }
      return await language.load();
    },
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
  });
}

export interface EditorProps {
  className?: string;
  parentRef: RefObject<HTMLElement>;
}

export default function Editor({ className, parentRef }: EditorProps) {
  const [extension] = useWidgetModelState("extension");
  const [lineNumbers] = useWidgetModelState("show_line_numbers");
  const [code, setCode] = useWidgetModelState("code");
  const commit = useCommitAction();

  const extensions: Extension[] = [EditorView.lineWrapping];
  const { data: language } = useLanguageSupport(extension);
  if (language) {
    extensions.push(language);
  }

  return (
    <ReactCodeMirror
      value={code}
      className={clsx("overflow-y-scroll min-h-full", className)}
      onChange={(code) => setCode(code)}
      onKeyDown={async (event) => {
        if (event.key === "Enter" && (event.shiftKey || event.metaKey)) {
          event.preventDefault();
          event.stopPropagation();
          if (parentRef.current !== null) {
            focusNextCell(parentRef.current);
          }
        }

        if (event.key === "s" && event.metaKey) {
          await commit();
        }
      }}
      theme={jupyterTheme}
      extensions={extensions}
      basicSetup={{ lineNumbers }}
    />
  );
}

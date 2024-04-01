import { useRef } from "react";
import { useWidgetModelState } from "../lib/widget-model";
import "../styles/globals.css";
import Editor from "./Editor";
import Toolbar from "./Toolbar";

export default function Widget() {
  const ref = useRef<HTMLDivElement>(null);
  const [height] = useWidgetModelState("height");

  return (
    <div
      ref={ref}
      className="flex flex-col border border-cellBorder min-h-full"
      style={{ height: `${height}rem` }}
    >
      <Toolbar />
      <Editor parentRef={ref} className="px-1" />
    </div>
  );
}

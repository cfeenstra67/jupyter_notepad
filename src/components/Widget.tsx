import { useWidgetModelState } from "../lib/widget-model";
import { useRef } from "react";
import Toolbar from "./Toolbar";
import Editor from "./Editor";
import "../styles/globals.css";

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

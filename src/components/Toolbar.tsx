import { useCommitAction } from "../hooks/useCommitAction";
import { useWidgetModelState } from "../lib/widget-model";

export interface ToolbarProps {
  lineNumbers: boolean;
  setLineNumbers: (value: boolean) => void;
}

export default function Toolbar({ lineNumbers, setLineNumbers }: ToolbarProps) {
  const [isDirty] = useWidgetModelState("is_dirty");
  const commit = useCommitAction();

  return (
    <div className="bg-cellBackground flex items-center min-h-8 h-8 max-h-8 w-full p-1 gap-3">
      <button
        type="button"
        disabled={!isDirty}
        onClick={() => commit()}
        className="disabled:hidden"
      >
        Save
      </button>

      <label htmlFor="jupyter-notepad-line-numbers">Show line numbers</label>
      <input
        type="checkbox"
        id="jupyter-notepad-line-numbers"
        checked={lineNumbers}
        onChange={(event) => {
          setLineNumbers(event.target.checked);
        }}
      />
    </div>
  );
}

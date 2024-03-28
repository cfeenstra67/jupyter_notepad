import ms from "ms";
import { useCallback, useState } from "react";
import { useCheckout } from "../hooks/useCheckout";
import { useCommitAction } from "../hooks/useCommitAction";
import useGetCommits from "../hooks/useGetCommits";
import { useNow } from "../hooks/useNow";
import { useTrailing } from "../hooks/useTrailing";
import { useWidgetModelChange, useWidgetModelState } from "../lib/widget-model";

export default function Toolbar() {
  const [autoSave, setAutoSave] = useState(true);
  const [isDirty] = useWidgetModelState("is_dirty");
  const [checkoutCommit] = useWidgetModelState("checkout_commit");
  const [now] = useNow(30_000);
  const commit = useCommitAction();
  const checkout = useCheckout();

  const autoCommit = useCallback(() => {
    if (isDirty && autoSave) {
      commit();
    }
  }, [autoSave, isDirty]);

  const commitTrailing = useTrailing(autoCommit, 5_000);

  useWidgetModelChange("code", () => {
    commitTrailing();
  });

  useWidgetModelChange("is_dirty", (newValue) => {
    commitTrailing();
  });

  const commitsQuery = useGetCommits();

  return (
    <div className="bg-cellBackground flex items-center min-h-8 h-8 max-h-8 w-full py-1 px-3 gap-3">
      <button
        type="button"
        disabled={!isDirty}
        onClick={() => commit()}
        className="disabled:text-font3"
      >
        Save
      </button>

      <input
        type="checkbox"
        id="jupyter-notepad-autosave"
        checked={autoSave}
        onChange={(event) => {
          setAutoSave(event.target.checked);
        }}
      />
      <label htmlFor="jupyter-notepad-line-numbers">Auto save</label>

      <select
        className="bg-cellBackground ml-auto"
        value={checkoutCommit ?? ""}
        onChange={async (evt) => {
          if (evt.target.value) {
            await checkout(evt.target.value);
          }
        }}
      >
        <option value="">
          {commitsQuery.status === "success"
            ? "History"
            : commitsQuery.status === "loading"
              ? "Loading commits..."
              : "Error loading commits"}
        </option>
        {commitsQuery.status === "success"
          ? commitsQuery.data.map((commit) => {
              const diff = Math.max(now - commit.timestamp_millis, 0);
              let text: string;
              if (diff <= 5_000) {
                text = "Just now";
              } else if (diff <= 30_000) {
                text = "Seconds ago";
              } else {
                text = `${ms(diff)} ago`;
              }

              const shortSha = commit.hexsha.slice(0, 8);

              return (
                <option key={commit.hexsha} value={commit.hexsha}>
                  {text} - {shortSha}
                </option>
              );
            })
          : null}
      </select>
    </div>
  );
}

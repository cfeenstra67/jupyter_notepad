import ms from "ms";
import { useCallback, useState } from "react";
import { useCheckout } from "../hooks/useCheckout";
import { useCommitAction } from "../hooks/useCommitAction";
import useGetCommits from "../hooks/useGetCommits";
import { useNow } from "../hooks/useNow";
import { useTrailing } from "../hooks/useTrailing";
import { useWidgetModelChange, useWidgetModelState } from "../lib/widget-model";

function truncateLength(length: number): string {
  const max = 100;
  return length > max ? `${max}+` : length.toFixed();
}

export default function Toolbar() {
  const [autoSave, setAutoSave] = useState(true);
  const [path] = useWidgetModelState("path");
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
    <div className="bg-cellBackground grid grid-cols-[1fr_auto_1fr] items-center min-h-8 h-8 max-h-8 w-full py-1 px-3 gap-6">
      <div className="flex items-center gap-6">
        <button
          type="button"
          disabled={!isDirty}
          onClick={() => commit()}
          className="disabled:text-font3"
        >
          Save
        </button>

        <div className="flex gap-3 items-center">
          <input
            type="checkbox"
            id="jupyter-notepad-autosave"
            checked={autoSave}
            onChange={(event) => {
              setAutoSave(event.target.checked);
            }}
          />
          <label
            htmlFor="jupyter-notepad-line-numbers"
            className="whitespace-nowrap"
          >
            Auto save
          </label>
        </div>
      </div>

      <h4 className="self-center font-bold text-center text-ellipsis whitespace-nowrap overflow-hidden">
        <span title={path}>{path}</span>
      </h4>

      <div className="flex justify-end">
        <select
          className="bg-cellBackground"
          value={checkoutCommit ?? ""}
          onChange={async (evt) => {
            if (evt.target.value) {
              await checkout(evt.target.value);
            }
          }}
        >
          <option value="">
            {commitsQuery.status === "success"
              ? commitsQuery.data.length === 0
                ? "No history yet"
                : `History (${truncateLength(commitsQuery.data.length)})`
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
    </div>
  );
}

import { useCallback } from "react";
import { useWidgetTransport } from "../lib/widget-model";

export function useCommitAction(): () => Promise<string | null> {
  const transport = useWidgetTransport();
  return useCallback(async () => {
    return (await transport("commit", {})) as string | null;
  }, [transport]);
}

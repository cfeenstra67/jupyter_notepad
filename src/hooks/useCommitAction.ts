import { useWidgetTransport } from "../lib/widget-model";

export function useCommitAction(): () => Promise<string | null> {
  const transport = useWidgetTransport();
  return async () => {
    return (await transport("commit", {})) as string | null;
  };
}

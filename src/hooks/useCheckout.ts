import { useCallback } from "react";
import { useWidgetTransport } from "../lib/widget-model";

export function useCheckout() {
  const transport = useWidgetTransport();
  return useCallback(
    async (hexsha: string) => {
      await transport("checkout-version", { hexsha });
    },
    [transport],
  );
}

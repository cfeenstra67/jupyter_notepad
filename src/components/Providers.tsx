import type { WidgetModel } from "@jupyter-widgets/base";
import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WidgetViewProvider } from "../lib/widget-model";

export interface ProvidersProps {
  model: WidgetModel;
  queryClient: QueryClient;
  children?: React.ReactNode;
}

export default function Providers({
  model,
  queryClient,
  children,
}: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WidgetViewProvider model={model}>{children}</WidgetViewProvider>
    </QueryClientProvider>
  );
}

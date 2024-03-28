import type { WidgetModel } from "@jupyter-widgets/base";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WidgetViewProvider } from "../lib/widget-model";

const queryClient = new QueryClient();

export interface ProvidersProps {
  model: WidgetModel;
  children?: React.ReactNode;
}

export default function Providers({ model, children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WidgetViewProvider model={model}>{children}</WidgetViewProvider>
    </QueryClientProvider>
  );
}

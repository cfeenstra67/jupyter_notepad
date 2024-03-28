import { useQuery } from "@tanstack/react-query";
import { useWidgetModelState, useWidgetTransport } from "../lib/widget-model";

export interface Commit {
  hexsha: string;
  message: string;
  timestamp_millis: number;
}

export default function useGetCommits() {
  const transport = useWidgetTransport();
  const [headCommit] = useWidgetModelState("head_commit");

  return useQuery({
    queryKey: ["commits", headCommit],
    queryFn: async () => {
      const response = await transport("get-commits", {});
      return response as Commit[];
    },
  });
}

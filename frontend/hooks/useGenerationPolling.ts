"use client";

import { useQuery } from "@tanstack/react-query";
import { getGeneration, getTrack } from "@/services/api";

export function useGenerationPolling(id?: string | null) {
  const generation = useQuery({
    queryKey: ["generation", id],
    queryFn: () => getGeneration(id!),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "completed" || status === "failed" ? false : 1400;
    }
  });

  const track = useQuery({
    queryKey: ["track", generation.data?.track_id],
    queryFn: () => getTrack(generation.data!.track_id!),
    enabled: Boolean(generation.data?.track_id)
  });

  return { generation, track };
}

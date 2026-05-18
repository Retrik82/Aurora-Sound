"use client";

import { useMutation } from "@tanstack/react-query";
import { createGeneration } from "@/services/api";
import { useGenerationStore } from "@/store/generation-store";

export function useSubmitGeneration(path: string) {
  const setGenerationId = useGenerationStore((state) => state.setGenerationId);
  const setSubmission = useGenerationStore((state) => state.setSubmission);

  return useMutation({
    mutationFn: async (payload: unknown) => {
      setSubmission(path, { isSubmitting: true, error: null });
      try {
        const generation = await createGeneration(path, payload);
        setGenerationId(path, generation.id);
        setSubmission(path, { isSubmitting: false, error: null });
        return generation;
      } catch (error) {
        setSubmission(path, { isSubmitting: false, error: error instanceof Error ? error.message : "Request failed" });
        throw error;
      }
    }
  });
}

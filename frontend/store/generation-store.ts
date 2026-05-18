import { create } from "zustand";

type GenerationState = {
  generationIds: Record<string, string | undefined>;
  submissions: Record<string, { isSubmitting: boolean; error: string | null } | undefined>;
  setGenerationId: (path: string, id: string) => void;
  setSubmission: (path: string, submission: { isSubmitting: boolean; error: string | null }) => void;
};

export const useGenerationStore = create<GenerationState>((set) => ({
  generationIds: {},
  submissions: {},
  setGenerationId: (path, id) => set((state) => ({ generationIds: { ...state.generationIds, [path]: id } })),
  setSubmission: (path, submission) => set((state) => ({ submissions: { ...state.submissions, [path]: submission } }))
}));

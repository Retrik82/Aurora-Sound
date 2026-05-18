import { create } from "zustand";
import type { Track } from "@/services/api";

type PlayerState = {
  track: Track | null;
  setTrack: (track: Track) => void;
  clearTrack: () => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  track: null,
  setTrack: (track) => set({ track }),
  clearTrack: () => set({ track: null })
}));

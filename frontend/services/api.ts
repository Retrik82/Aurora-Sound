export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const AUTH_STORAGE_KEY = "aurora-auth-user";

export type GenerationStatus = "queued" | "analyzing" | "prompting" | "generating" | "processing" | "completed" | "failed";

export type GenerationResponse = {
  id: string;
  mode: string;
  status: GenerationStatus;
  progress: number;
  error?: string | null;
  track_id?: string | null;
};

export type Track = {
  id: string;
  title: string;
  mode: string;
  duration_seconds: number;
  public_url: string;
  waveform: number[];
  bpm: number | null;
  key: string | null;
  mood: string | null;
  metadata_json: Record<string, unknown>;
  created_at: string;
};

export type GenerationUsage = {
  login: string;
  used: number;
  limit: number | null;
  remaining: number | null;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const user = typeof window === "undefined" ? "" : localStorage.getItem(AUTH_STORAGE_KEY);
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(user ? { "X-Aurora-User": user } : {}),
      ...(options?.headers ?? {})
    }
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail ?? "Request failed");
  }
  return res.json();
}

export function createGeneration(path: string, payload: unknown) {
  return request<GenerationResponse>(path, { method: "POST", body: JSON.stringify(payload) });
}

export function getGeneration(id: string) {
  return request<GenerationResponse>(`/generation/${id}`);
}

export function getTrack(id: string) {
  return request<Track>(`/track/${id}`);
}

export function listTracks() {
  return request<Track[]>("/tracks");
}

export function getGenerationUsage() {
  return request<GenerationUsage>("/account/generation-usage");
}

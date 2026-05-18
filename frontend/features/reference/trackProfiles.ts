export type TrackProfile = {
  id: string;
  fileName: string;
  title: string;
  bpm: number;
  energy: number;
  mood: string;
  texture: string;
  genre: string;
  key: string;
  voice: string;
  language: string;
};

export const trackProfiles: TrackProfile[] = [
  { id: "brian-eno-ending", fileName: "28_days_later_10. Brian Eno - An Ending (Ascent).mp3", title: "Brian Eno - An Ending (Ascent)", bpm: 65, energy: 0.12, mood: "ethereal", texture: "ambient pads", genre: "ambient", key: "D major", voice: "instrumental", language: "auto" },
  { id: "beethoven-5", fileName: "symphony-n-5-in-c-minor-op-67-01-allegro-con-brio.mp3", title: "Beethoven - Symphony No. 5", bpm: 108, energy: 0.84, mood: "dramatic", texture: "orchestral", genre: "classical", key: "C minor", voice: "instrumental", language: "auto" },
  { id: "fela-water", fileName: "Fela-Kuti-Water-No-Get-Enemy.mp3", title: "Fela Kuti - Water No Get Enemy", bpm: 100, energy: 0.58, mood: "groovy", texture: "live ensemble", genre: "afrobeat", key: "E minor", voice: "male warm", language: "en" },
  { id: "atc-around-world", fileName: "ATC - Around The World.mp3", title: "ATC - Around The World", bpm: 132, energy: 0.64, mood: "playful", texture: "eurodance", genre: "dance pop", key: "A major", voice: "female airy", language: "en" },
  { id: "billie-bad-guy", fileName: "Billie Eilish - bad guy (with Justin Bieber).mp3", title: "Billie Eilish - bad guy", bpm: 135, energy: 0.66, mood: "minimal dark", texture: "tight bass", genre: "alt pop", key: "G minor", voice: "female cinematic", language: "en" },
  { id: "kendrick-humble", fileName: "Kendrick Lamar - Humble.mp3", title: "Kendrick Lamar - HUMBLE.", bpm: 150, energy: 0.78, mood: "confident", texture: "punchy hip-hop", genre: "hip-hop", key: "C minor", voice: "male deep", language: "en" },
  { id: "pink-so-what", fileName: "Pink_-_So_What_(SkySound.cc).mp3", title: "P!nk - So What", bpm: 126, energy: 0.8, mood: "rebellious", texture: "pop rock", genre: "rock", key: "G major", voice: "female cinematic", language: "en" },
  { id: "aphex-windowlicker", fileName: "Aphex Twin feat. Run Jeremy - Windowlicker.mp3", title: "Aphex Twin - Windowlicker", bpm: 123, energy: 0.74, mood: "surreal", texture: "glitch electronic", genre: "idm", key: "F minor", voice: "processed", language: "en" },
  { id: "metallica-master", fileName: "Metallica - Master Of Puppets.mp3", title: "Metallica - Master of Puppets", bpm: 220, energy: 0.96, mood: "aggressive", texture: "distorted guitars", genre: "metal", key: "E minor", voice: "male deep", language: "en" }
];

export function mergeTrackProfiles(selectedIds: string[]) {
  const selected = trackProfiles.filter((track) => selectedIds.includes(track.id));
  if (selected.length === 0) {
    return null;
  }

  const [base, ...rest] = selected;
  const soften = 0.22;
  const avgBpm = selected.reduce((sum, item) => sum + item.bpm, 0) / selected.length;
  const avgEnergy = selected.reduce((sum, item) => sum + item.energy, 0) / selected.length;

  return {
    bpm: Math.round(base.bpm * (1 - soften) + avgBpm * soften),
    energy: Math.min(1, Math.max(0, base.energy * (1 - soften) + avgEnergy * soften)),
    genre: base.genre,
    key: base.key,
    mood: base.mood,
    texture: base.texture,
    voice: base.voice,
    language: base.language,
    modifiers: rest.map((track) => track.mood)
  };
}

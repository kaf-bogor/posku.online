import type { LevelId, ModulId } from '~/lib/types/belajar';

const KEY = 'posku:belajar:progress';

export interface LevelProgress {
  bestScore?: number;
  total?: number;
  lastStep?: number;
}

export type ProgressMap = Record<string, LevelProgress>;

const k = (modul: ModulId, level: LevelId) => `${modul}:${level}`;

export function getProgress(): ProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function save(map: ProgressMap) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // abaikan (storage penuh / private mode)
  }
}

export function getLevelProgress(
  modul: ModulId,
  level: LevelId
): LevelProgress {
  return getProgress()[k(modul, level)] ?? {};
}

export function setBestScore(
  modul: ModulId,
  level: LevelId,
  score: number,
  total: number
): void {
  const map = getProgress();
  const key = k(modul, level);
  const prev = map[key] ?? {};
  if (prev.bestScore == null || score > prev.bestScore) {
    map[key] = { ...prev, bestScore: score, total };
    save(map);
  }
}

export function setLastStep(
  modul: ModulId,
  level: LevelId,
  step: number
): void {
  const map = getProgress();
  const key = k(modul, level);
  map[key] = { ...(map[key] ?? {}), lastStep: step };
  save(map);
}

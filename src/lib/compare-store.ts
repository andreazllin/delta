import { useSyncExternalStore } from 'react';

export interface ComparePair {
  left: string;
  right: string;
}

const STORAGE_KEY = 'diff:pair';
const EMPTY: ComparePair = { left: '', right: '' };

function read(): ComparePair {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw == null) {
      return EMPTY;
    }
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as ComparePair).left === 'string' &&
      typeof (parsed as ComparePair).right === 'string'
    ) {
      return parsed as ComparePair;
    }
  } catch {
    // Fall through to the empty pair on unreadable storage or bad JSON.
  }
  return EMPTY;
}

// The pair is held in a module-level snapshot so `/compare` reads it without a
// round trip through the URL, and mirrored into sessionStorage so a reload of
// `/compare` still has something to render.
let snapshot: ComparePair = typeof window === 'undefined' ? EMPTY : read();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function setComparePair(pair: ComparePair) {
  snapshot = pair;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pair));
  } catch {
    // Storage is a nice-to-have; the in-memory snapshot still works.
  }
  emit();
}

export function getComparePair(): ComparePair {
  return snapshot;
}

export function useComparePair(): ComparePair {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getComparePair,
    () => EMPTY
  );
}

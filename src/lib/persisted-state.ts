import { useCallback, useState } from 'react';

/**
 * `useState` that survives reloads. Values are read once on mount and written
 * back on every change; unreadable or malformed entries fall back to `initial`.
 */
export function usePersistedState<T>(
  key: string,
  initial: T,
  isValid: (value: unknown) => value is T
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) {
        const parsed: unknown = JSON.parse(raw);
        if (isValid(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Ignore and use the initial value.
    }
    return initial;
  });

  const set = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Persistence is best-effort.
      }
    },
    [key]
  );

  return [value, set];
}

export function isOneOf<const T extends readonly string[]>(
  options: T
): (value: unknown) => value is T[number] {
  return (value): value is T[number] =>
    typeof value === 'string' && (options as readonly string[]).includes(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

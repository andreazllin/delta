import type { ThemeTypes } from '@pierre/diffs';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { isOneOf, usePersistedState } from './persisted-state';

export const COLOR_MODES = ['system', 'light', 'dark'] as const;
export type ColorMode = (typeof COLOR_MODES)[number];

interface ColorModeValue {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  /**
   * The same selection in the shape `@pierre/diffs` wants, so the diff surface
   * resolves its Shiki theme against the exact scheme the chrome is using.
   */
  themeType: ThemeTypes;
  /**
   * `'system'` resolved against the media query. CodeMirror needs a concrete
   * light or dark theme; it cannot defer to `light-dark()` the way the diff
   * surface and Tailwind tokens do.
   */
  isDark: boolean;
}

const ColorModeContext = createContext<ColorModeValue | null>(null);

const isColorMode = isOneOf(COLOR_MODES);

const DARK_QUERY = '(prefers-color-scheme: dark)';

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [colorMode, setColorMode] = usePersistedState<ColorMode>(
    'delta:color-mode',
    'system',
    isColorMode
  );
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia(DARK_QUERY).matches
  );

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const sync = () => setSystemPrefersDark(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const isDark =
    colorMode === 'dark' || (colorMode === 'system' && systemPrefersDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const value = useMemo(
    () => ({ colorMode, setColorMode, themeType: colorMode, isDark }),
    [colorMode, setColorMode, isDark]
  );

  return (
    <ColorModeContext.Provider value={value}>
      {children}
    </ColorModeContext.Provider>
  );
}

export function useColorMode(): ColorModeValue {
  const value = useContext(ColorModeContext);
  if (value == null) {
    throw new Error('useColorMode must be used inside a ColorModeProvider');
  }
  return value;
}

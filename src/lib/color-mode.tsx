import type { ThemeTypes } from '@pierre/diffs';
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';

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
}

const ColorModeContext = createContext<ColorModeValue | null>(null);

const isColorMode = isOneOf(COLOR_MODES);

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [colorMode, setColorMode] = usePersistedState<ColorMode>(
    'diff:color-mode',
    'system',
    isColorMode
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark =
        colorMode === 'dark' || (colorMode === 'system' && media.matches);
      document.documentElement.classList.toggle('dark', dark);
    };
    apply();
    if (colorMode !== 'system') {
      return;
    }
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [colorMode]);

  const value = useMemo(
    () => ({ colorMode, setColorMode, themeType: colorMode }),
    [colorMode, setColorMode]
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

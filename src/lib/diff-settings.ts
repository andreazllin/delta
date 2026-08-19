import type { DiffIndicators } from '@pierre/diffs';

import { AUTO_LANGUAGE_ID } from './detect-language';
import { LANGUAGE_IDS } from './languages';
import { isBoolean, isOneOf, usePersistedState } from './persisted-state';

export const DIFF_STYLES = ['split', 'unified'] as const;
export type DiffStyle = (typeof DIFF_STYLES)[number];

export const OVERFLOWS = ['scroll', 'wrap'] as const;
export type Overflow = (typeof OVERFLOWS)[number];

export const DIFF_INDICATORS = ['bars', 'classic', 'none'] as const;

export interface DiffSettings {
  diffStyle: DiffStyle;
  setDiffStyle: (value: DiffStyle) => void;
  overflow: Overflow;
  setOverflow: (value: Overflow) => void;
  diffIndicators: DiffIndicators;
  setDiffIndicators: (value: DiffIndicators) => void;
  lineNumbers: boolean;
  setLineNumbers: (value: boolean) => void;
  showBackgrounds: boolean;
  setShowBackgrounds: (value: boolean) => void;
  collapseUnchanged: boolean;
  setCollapseUnchanged: (value: boolean) => void;
  languageId: string;
  setLanguageId: (value: string) => void;
}

/** The viewer controls diffshub exposes, persisted so they outlive a reload. */
export function useDiffSettings(): DiffSettings {
  const [diffStyle, setDiffStyle] = usePersistedState<DiffStyle>(
    'diff:style',
    'split',
    isOneOf(DIFF_STYLES)
  );
  const [overflow, setOverflow] = usePersistedState<Overflow>(
    'diff:overflow',
    'scroll',
    isOneOf(OVERFLOWS)
  );
  const [diffIndicators, setDiffIndicators] = usePersistedState<DiffIndicators>(
    'diff:indicators',
    'bars',
    isOneOf(DIFF_INDICATORS)
  );
  const [lineNumbers, setLineNumbers] = usePersistedState(
    'diff:line-numbers',
    true,
    isBoolean
  );
  const [showBackgrounds, setShowBackgrounds] = usePersistedState(
    'diff:backgrounds',
    true,
    isBoolean
  );
  const [collapseUnchanged, setCollapseUnchanged] = usePersistedState(
    'diff:collapse-unchanged',
    false,
    isBoolean
  );
  const [languageId, setLanguageId] = usePersistedState<string>(
    'diff:language',
    AUTO_LANGUAGE_ID,
    isOneOf([AUTO_LANGUAGE_ID, ...LANGUAGE_IDS])
  );

  return {
    diffStyle,
    setDiffStyle,
    overflow,
    setOverflow,
    diffIndicators,
    setDiffIndicators,
    lineNumbers,
    setLineNumbers,
    showBackgrounds,
    setShowBackgrounds,
    collapseUnchanged,
    setCollapseUnchanged,
    languageId,
    setLanguageId,
  };
}

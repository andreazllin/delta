import type {
  FileDiffMetadata,
  FileDiffOptions,
  ThemeTypes,
} from '@pierre/diffs';
import { FileDiff } from '@pierre/diffs/react';
import { useMemo } from 'react';

import type { DiffSettings } from '@/lib/diff-settings';
import { cn } from '@/lib/utils';

/**
 * The diff renders inside a shadow root, so page CSS cannot reach it; the two
 * ways in are inherited custom properties (set in index.css) and `unsafeCSS`.
 *
 * This is diffshub's sticky-header treatment: the header only grows a hairline
 * once it actually sticks, so a short diff stays clean.
 */
const DIFF_UNSAFE_CSS = `
  :host {
    --diffs-light-bg: var(--card);
    --diffs-dark-bg: var(--card);
  }

  [data-diffs-header] {
    container-type: scroll-state;
    container-name: sticky-header;
  }

  @container sticky-header scroll-state(stuck: top) {
    [data-diffs-header]::after {
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 100%;
      height: 1px;
      content: '';
      background-color: var(--diff-chrome-border);
    }
  }

  [data-header-content] [data-title] {
    font-weight: 500;
  }

  /* The +/- counts live in the toolbar as ReUI badges; with a single file in
   * view, repeating them in the file header is pure duplication. */
  [data-diffs-header] [data-metadata] {
    display: none;
  }
`;

interface DiffViewProps {
  fileDiff: FileDiffMetadata;
  settings: DiffSettings;
  themeType: ThemeTypes;
  className?: string;
}

export function DiffView({
  fileDiff,
  settings,
  themeType,
  className,
}: DiffViewProps) {
  const { diffStyle, overflow, diffIndicators, lineNumbers, showBackgrounds } =
    settings;

  const options: FileDiffOptions<undefined> = useMemo(
    () => ({
      themeType,
      diffStyle,
      diffIndicators,
      overflow,
      disableBackground: !showBackgrounds,
      disableLineNumbers: !lineNumbers,
      lineHoverHighlight: 'number',
      stickyHeader: true,
      unsafeCSS: DIFF_UNSAFE_CSS,
    }),
    [
      diffIndicators,
      diffStyle,
      lineNumbers,
      overflow,
      showBackgrounds,
      themeType,
    ]
  );

  return (
    <FileDiff
      fileDiff={fileDiff}
      options={options}
      className={cn('block w-full', className)}
    />
  );
}

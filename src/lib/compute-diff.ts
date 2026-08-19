import { parseDiffFromFile, type FileDiffMetadata } from '@pierre/diffs';

import { getLanguage } from './languages';

/**
 * Cheap FNV-1a hash. The cache key `@pierre/diffs` derives for highlight reuse
 * falls back to the filename, and both panes share one name here, so it has to
 * be content-derived or edited text would render against a stale cache entry.
 */
function hashContents(contents: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < contents.length; index++) {
    hash ^= contents.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

export interface DiffResult {
  fileDiff: FileDiffMetadata;
  additions: number;
  deletions: number;
  /** `false` when both sides are byte-identical, which yields zero hunks. */
  hasChanges: boolean;
}

export interface ComputeDiffInput {
  left: string;
  right: string;
  languageId: string;
  /** Hide runs of unchanged lines behind hunk separators. */
  collapseUnchanged: boolean;
}

/**
 * Lines of unchanged context kept around each change when collapsing.
 * Matches jsdiff's own default.
 */
const COLLAPSED_CONTEXT_LINES = 4;

/**
 * Turns the two panes into the `FileDiffMetadata` that `@pierre/diffs` renders.
 * `parseDiffFromFile` runs the same jsdiff patch + parse path diffshub gets from
 * a real git patch, so the rendered result is identical to a git-sourced diff.
 *
 * The context width matters more here than it does in diffshub. Anything the
 * patch omits is simply not in the diff, and diffshub recovers it by fetching
 * full file contents through `loadDiffFiles`. Both texts are already in memory
 * here, so the default is full context: every line the user pasted is rendered,
 * and narrowing it is an explicit choice.
 */
export function computeDiff({
  left,
  right,
  languageId,
  collapseUnchanged,
}: ComputeDiffInput): DiffResult | { error: string } {
  const language = getLanguage(languageId);
  const name = `text.${language.extension}`;

  try {
    const fileDiff = parseDiffFromFile(
      { name, contents: left, lang: language.id, cacheKey: hashContents(left) },
      { name, contents: right, lang: language.id, cacheKey: hashContents(right) },
      {
        context: collapseUnchanged
          ? COLLAPSED_CONTEXT_LINES
          : Number.MAX_SAFE_INTEGER,
      }
    );

    let additions = 0;
    let deletions = 0;
    for (const hunk of fileDiff.hunks) {
      additions += hunk.additionLines;
      deletions += hunk.deletionLines;
    }

    return {
      fileDiff,
      additions,
      deletions,
      hasChanges: fileDiff.hunks.length > 0,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Could not diff the two inputs.',
    };
  }
}

export function isDiffError(
  result: DiffResult | { error: string }
): result is { error: string } {
  return 'error' in result;
}

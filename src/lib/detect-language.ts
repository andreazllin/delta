import { LANGUAGE_IDS } from './languages';

/**
 * Sentinel language selection: infer the language from the text instead of
 * pinning one. This is the default, so pasting code highlights without the
 * user having to reach for the picker.
 */
export const AUTO_LANGUAGE_ID = 'auto';

export function isAutoLanguage(languageId: string): boolean {
  return languageId === AUTO_LANGUAGE_ID;
}

/**
 * Ordered signals, most distinctive first. A heuristic, not a parser: it aims
 * to be right on ordinary pasted files and to fall back to plain text rather
 * than guess wildly. The picker always wins over it.
 */
const RULES: { id: string; test: (text: string) => boolean }[] = [
  // Shebangs and preambles are unambiguous.
  { id: 'bash', test: (t) => /^#!.*\b(?:ba|z|k)?sh\b/.test(t) },
  { id: 'python', test: (t) => /^#!.*\bpython[\d.]*\b/.test(t) },
  { id: 'php', test: (t) => /^\s*<\?php\b/.test(t) },
  { id: 'xml', test: (t) => /^\s*<\?xml\b/.test(t) },
  { id: 'html', test: (t) => /^\s*<!doctype html|^\s*<html[\s>]/i.test(t) },
  {
    id: 'diff',
    test: (t) => /^diff --git |^@@ -\d|^--- .+\n\+\+\+ /m.test(t),
  },

  { id: 'json', test: isJson },

  // Language-defining declarations.
  { id: 'go', test: (t) => /^package \w+$/m.test(t) && /\bfunc /.test(t) },
  { id: 'rust', test: (t) => /\bfn \w+\s*\(|^use \w+::/m.test(t) },
  { id: 'zig', test: (t) => /@import\(|\bpub fn \w+\s*\(/.test(t) },
  {
    id: 'csharp',
    test: (t) => /^using System\b|\bConsole\.(?:Write|Read)/m.test(t),
  },
  {
    id: 'java',
    test: (t) =>
      /\b(?:public|private)\s+(?:static\s+)?(?:final\s+)?class \w+|System\.out\.print/.test(
        t
      ),
  },
  { id: 'kotlin', test: (t) => /\bfun \w+\s*\(|\bval \w+\s*[:=]/.test(t) },
  {
    id: 'swift',
    test: (t) => /^import (?:Foundation|SwiftUI|UIKit)\b/m.test(t),
  },
  { id: 'cpp', test: (t) => /\bstd::|#include <\w+>\s*$/m.test(t) },
  { id: 'c', test: (t) => /#include\s*<\w+\.h>/.test(t) },
  {
    id: 'ruby',
    test: (t) => /^\s*(?:require|puts) |^\s*def \w+.*\n[\s\S]*^\s*end$/m.test(t),
  },
  {
    id: 'python',
    test: (t) =>
      /^\s*(?:def \w+\s*\(.*\)\s*:|class \w+.*:|from \w+ import |import \w+$)/m.test(
        t
      ),
  },

  // The TypeScript / JavaScript family, narrowest first.
  { id: 'tsx', test: (t) => hasJsx(t) && (hasTsDeclaration(t) || hasTsTypes(t)) },
  { id: 'jsx', test: (t) => hasJsx(t) && isJsLike(t) },
  // A declaration stands on its own; a bare type annotation needs JS around it
  // to tell it apart from other `name: type` syntax.
  {
    id: 'typescript',
    test: (t) => hasTsDeclaration(t) || (hasTsTypes(t) && isJsLike(t)),
  },
  { id: 'javascript', test: isJsLike },

  // Data and markup formats.
  { id: 'sql', test: (t) => /\b(?:SELECT .+ FROM|(?:CREATE|ALTER) TABLE|INSERT INTO)\b/i.test(t) },
  // Ahead of CSS and Markdown on purpose: a YAML flow mapping looks like a CSS
  // rule, and a YAML comment looks like a Markdown heading. The structural test
  // below is the narrower of the three, so it gets first refusal.
  { id: 'yaml', test: isYaml },
  {
    id: 'css',
    test: (t) =>
      /@media\b|@keyframes\b|@import\s+url\(/.test(t) ||
      // A declaration inside braces, terminated by a semicolon. Requiring the
      // semicolon is what keeps `env: { A: 1, B: 2 }` out of here.
      /\{[^{}]*[\w-]+\s*:[^{};]*;/.test(t),
  },
  { id: 'toml', test: (t) => /^\[[\w.$-]+\]$/m.test(t) && /^[\w.-]+\s*=/m.test(t) },
  {
    id: 'markdown',
    test: (t) => /^#{1,6} \S|^```|^[-*] \S.*\n[-*] \S/m.test(t),
  },
  { id: 'xml', test: (t) => /^\s*<[\w:-]+[\s/>]/.test(t) && /<\/[\w:-]+>/.test(t) },
  { id: 'bash', test: (t) => /^\s*(?:echo|export|cd|sudo|apt|brew|git|npm|pnpm) /m.test(t) },
];

/** A YAML mapping key: `key:`, `key: value`, `"quoted key":`. */
const YAML_MAPPING = /^\s*(?:"[^"\n]+"|'[^'\n]+'|[\w.$/@+-]+)\s*:(?:\s|$)/;
/** A YAML sequence entry: `- item` or a bare `-`. */
const YAML_SEQUENCE = /^\s*-(?:\s|$)/;

/**
 * Structural rather than pattern-based, because the single-regex version was
 * wrong on ordinary YAML in three separate ways: it vetoed any document
 * containing `{`, `}` or `;`, which rules out flow mappings, GitHub Actions
 * `${{ … }}` expressions, and shell one-liners under `run:`.
 *
 * Instead: count the lines that carry YAML structure and require them to
 * dominate. Block scalar bodies (the CSS or shell inside a `|` block) are
 * expected not to count, which is why this is a ratio and not a rule for
 * every line.
 */
function isYaml(text: string): boolean {
  // A document marker is decisive; nothing else in the list uses it.
  if (/^---\s*$/m.test(text)) {
    return true;
  }

  let mappings = 0;
  let structural = 0;
  let considered = 0;

  for (const line of text.split('\n')) {
    if (line.trim().length === 0 || /^\s*#/.test(line)) {
      continue;
    }
    considered++;
    // A CSS declaration also reads as `key: value`, so a trailing semicolon
    // disqualifies the line — YAML values do not end that way.
    if (YAML_MAPPING.test(line) && !/;\s*$/.test(line)) {
      mappings++;
      structural++;
    } else if (YAML_SEQUENCE.test(line)) {
      structural++;
    }
  }

  // At least one mapping, so a bare Markdown bullet list is not mistaken for a
  // YAML sequence.
  return mappings > 0 && structural >= 2 && structural / considered >= 0.5;
}

function isJson(text: string): boolean {
  const trimmed = text.trim();
  if (!/^[[{]/.test(trimmed) || !/[\]}]$/.test(trimmed)) {
    return false;
  }
  try {
    JSON.parse(trimmed);
    return true;
  } catch {
    return false;
  }
}

function hasJsx(text: string): boolean {
  return /<[A-Z]\w*[\s/>]|<\/[A-Z]\w*>|return\s*\(\s*</.test(text);
}

/** Declarations no other language in the list has, so they need no corroboration. */
function hasTsDeclaration(text: string): boolean {
  return /^\s*(?:export\s+)?(?:declare\s+)?(?:interface \w+\s*[{<]|type \w+\s*[=<]|enum \w+\s*\{)/m.test(
    text
  );
}

function hasTsTypes(text: string): boolean {
  return /\b(?:interface|type) \w+\s*[=<{]|:\s*(?:string|number|boolean|void|unknown|any)\b|\bas \w+|\benum \w+/.test(
    text
  );
}

function isJsLike(text: string): boolean {
  return /\b(?:const|let|var|function|class|import|export|=>)\b/.test(text);
}

/**
 * Picks the language for a text, preferring the changed side and falling back
 * to the original when it is empty. Returns `'text'` when nothing matches.
 */
export function detectLanguage(...candidates: string[]): string {
  const text = candidates.find((candidate) => candidate.trim().length > 0);
  if (text == null) {
    return 'text';
  }

  // Only the head of a large paste is needed, and it keeps this cheap enough to
  // run on every keystroke.
  const sample = text.slice(0, 4000);
  for (const rule of RULES) {
    if (rule.test(sample) && LANGUAGE_IDS.includes(rule.id)) {
      return rule.id;
    }
  }
  return 'text';
}

/** Resolves a picker selection, expanding `'auto'` into a detected language. */
export function resolveLanguageId(
  languageId: string,
  ...candidates: string[]
): string {
  return isAutoLanguage(languageId)
    ? detectLanguage(...candidates)
    : languageId;
}

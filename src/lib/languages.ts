import type { SupportedLanguages } from '@pierre/diffs';

export interface LanguageOption {
  /** Value handed to Shiki through `FileContents.lang`. */
  id: SupportedLanguages;
  label: string;
  /** Extension used for the name shown in the diff header. */
  extension: string;
}

/**
 * A short, hand-picked list instead of Shiki's full bundle: the two panes hold
 * pasted text with no filename to infer a language from, so the pane header
 * needs a name and Shiki needs an explicit `lang`.
 */
export const LANGUAGES: LanguageOption[] = [
  { id: 'text', label: 'Plain text', extension: 'txt' },
  { id: 'bash', label: 'Bash', extension: 'sh' },
  { id: 'c', label: 'C', extension: 'c' },
  { id: 'cpp', label: 'C++', extension: 'cpp' },
  { id: 'csharp', label: 'C#', extension: 'cs' },
  { id: 'css', label: 'CSS', extension: 'css' },
  { id: 'diff', label: 'Diff', extension: 'diff' },
  { id: 'go', label: 'Go', extension: 'go' },
  { id: 'html', label: 'HTML', extension: 'html' },
  { id: 'java', label: 'Java', extension: 'java' },
  { id: 'javascript', label: 'JavaScript', extension: 'js' },
  { id: 'jsx', label: 'JSX', extension: 'jsx' },
  { id: 'json', label: 'JSON', extension: 'json' },
  { id: 'kotlin', label: 'Kotlin', extension: 'kt' },
  { id: 'markdown', label: 'Markdown', extension: 'md' },
  { id: 'php', label: 'PHP', extension: 'php' },
  { id: 'python', label: 'Python', extension: 'py' },
  { id: 'ruby', label: 'Ruby', extension: 'rb' },
  { id: 'rust', label: 'Rust', extension: 'rs' },
  { id: 'sql', label: 'SQL', extension: 'sql' },
  { id: 'swift', label: 'Swift', extension: 'swift' },
  { id: 'toml', label: 'TOML', extension: 'toml' },
  { id: 'tsx', label: 'TSX', extension: 'tsx' },
  { id: 'typescript', label: 'TypeScript', extension: 'ts' },
  { id: 'xml', label: 'XML', extension: 'xml' },
  { id: 'yaml', label: 'YAML', extension: 'yaml' },
  { id: 'zig', label: 'Zig', extension: 'zig' },
];

export const LANGUAGE_IDS: string[] = LANGUAGES.map((language) => language.id);

export function getLanguage(id: string): LanguageOption {
  return LANGUAGES.find((language) => language.id === id) ?? LANGUAGES[0];
}

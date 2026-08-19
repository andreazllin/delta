import type { SupportedLanguages } from '@pierre/diffs';

export interface LanguageOption {
  /** Value handed to Shiki through `FileContents.lang`. */
  id: SupportedLanguages;
  label: string;
  /** Extension used for the name shown in the diff header. */
  extension: string;
  /**
   * Name `@uiw/codemirror-extensions-langs` knows this grammar by, for the
   * input panes. Omitted when CodeMirror has no grammar for it — the pane
   * stays plain while Shiki still highlights the diff.
   */
  codemirror?: string;
}

/**
 * A short, hand-picked list instead of Shiki's full bundle: the two panes hold
 * pasted text with no filename to infer a language from, so the pane header
 * needs a name and Shiki needs an explicit `lang`.
 */
export const LANGUAGES: LanguageOption[] = [
  { id: 'text', label: 'Plain text', extension: 'txt' },
  { id: 'bash', label: 'Bash', extension: 'sh', codemirror: 'sh' },
  { id: 'c', label: 'C', extension: 'c', codemirror: 'c' },
  { id: 'cpp', label: 'C++', extension: 'cpp', codemirror: 'cpp' },
  { id: 'csharp', label: 'C#', extension: 'cs', codemirror: 'cs' },
  { id: 'css', label: 'CSS', extension: 'css', codemirror: 'css' },
  { id: 'diff', label: 'Diff', extension: 'diff', codemirror: 'diff' },
  { id: 'go', label: 'Go', extension: 'go', codemirror: 'go' },
  { id: 'html', label: 'HTML', extension: 'html', codemirror: 'html' },
  { id: 'java', label: 'Java', extension: 'java', codemirror: 'java' },
  { id: 'javascript', label: 'JavaScript', extension: 'js', codemirror: 'js' },
  { id: 'jsx', label: 'JSX', extension: 'jsx', codemirror: 'jsx' },
  { id: 'json', label: 'JSON', extension: 'json', codemirror: 'json' },
  { id: 'kotlin', label: 'Kotlin', extension: 'kt', codemirror: 'kt' },
  { id: 'markdown', label: 'Markdown', extension: 'md', codemirror: 'markdown' },
  { id: 'php', label: 'PHP', extension: 'php', codemirror: 'php' },
  { id: 'python', label: 'Python', extension: 'py', codemirror: 'python' },
  { id: 'ruby', label: 'Ruby', extension: 'rb', codemirror: 'rb' },
  { id: 'rust', label: 'Rust', extension: 'rs', codemirror: 'rs' },
  { id: 'sql', label: 'SQL', extension: 'sql', codemirror: 'sql' },
  { id: 'swift', label: 'Swift', extension: 'swift', codemirror: 'swift' },
  { id: 'toml', label: 'TOML', extension: 'toml', codemirror: 'toml' },
  { id: 'tsx', label: 'TSX', extension: 'tsx', codemirror: 'tsx' },
  { id: 'typescript', label: 'TypeScript', extension: 'ts', codemirror: 'ts' },
  { id: 'xml', label: 'XML', extension: 'xml', codemirror: 'xml' },
  { id: 'yaml', label: 'YAML', extension: 'yaml', codemirror: 'yaml' },
  { id: 'zig', label: 'Zig', extension: 'zig' },
];

export const LANGUAGE_IDS: string[] = LANGUAGES.map((language) => language.id);

export function getLanguage(id: string): LanguageOption {
  return LANGUAGES.find((language) => language.id === id) ?? LANGUAGES[0];
}

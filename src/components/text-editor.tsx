import CodeMirror, {
  EditorView,
  type Extension,
} from '@uiw/react-codemirror';
import { useEffect, useState } from 'react';

import { useColorMode } from '@/lib/color-mode';
import { getLanguage } from '@/lib/languages';
import { cn } from '@/lib/utils';

/**
 * Pulls CodeMirror's chrome onto the app's tokens: the surrounding wrapper
 * draws the border and focus ring like any other ReUI input, so the editor
 * itself stays transparent and only owns the gutter, cursor, and selection.
 */
const REUI_CHROME = EditorView.theme({
  // `!important` because the base light/dark theme from @uiw sets its own
  // background at a higher precedence, and its blue-grey reads as off-palette
  // next to the app's neutral surface. Only the chrome is overridden; the
  // theme still owns the syntax colors.
  '&': {
    backgroundColor: 'transparent !important',
    color: 'var(--foreground)',
    fontSize: '13px',
  },
  '&.cm-focused': { outline: 'none' },
  '.cm-content': {
    fontFamily: 'var(--diffs-font-family)',
    padding: '8px 0',
    caretColor: 'var(--foreground)',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent !important',
    border: 'none',
    color: 'color-mix(in oklch, var(--muted-foreground) 70%, transparent)',
    fontFamily: 'var(--diffs-font-family)',
  },
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 8px 0 10px' },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'transparent' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'color-mix(in oklch, var(--primary) 22%, transparent)',
  },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--foreground)' },
  '.cm-placeholder': { color: 'var(--muted-foreground)' },
  '.cm-scroller': { lineHeight: '1.55' },
});

const BASE_EXTENSIONS: Extension[] = [REUI_CHROME, EditorView.lineWrapping];

/**
 * The grammar bundle covers every language in the picker but is large, so it is
 * only fetched once something other than plain text is in play. Vite splits it
 * into its own chunk, keeping it off the first paint.
 */
function useLanguageExtension(languageId: string): Extension | null {
  const [extension, setExtension] = useState<Extension | null>(null);
  const name = getLanguage(languageId).codemirror;

  useEffect(() => {
    if (name == null) {
      setExtension(null);
      return;
    }
    let cancelled = false;
    void import('@uiw/codemirror-extensions-langs').then(({ loadLanguage }) => {
      if (!cancelled) {
        setExtension(loadLanguage(name as never) ?? null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [name]);

  return extension;
}

interface TextEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  languageId: string;
  placeholder?: string;
  className?: string;
  /** Any CSS length; the editor scrolls internally past this. */
  maxHeight?: string;
  minHeight?: string;
}

export function TextEditor({
  id,
  value,
  onChange,
  languageId,
  placeholder,
  className,
  maxHeight = 'min(28rem, 55vh)',
  minHeight = '18rem',
}: TextEditorProps) {
  const { isDark } = useColorMode();
  const languageExtension = useLanguageExtension(languageId);

  return (
    <div
      className={cn(
        'overflow-hidden rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30',
        className
      )}
    >
      <CodeMirror
        id={id}
        value={value}
        onChange={onChange}
        theme={isDark ? 'dark' : 'light'}
        placeholder={placeholder}
        maxHeight={maxHeight}
        minHeight={minHeight}
        extensions={
          languageExtension == null
            ? BASE_EXTENSIONS
            : [...BASE_EXTENSIONS, languageExtension]
        }
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
          // This is an input, not an authoring surface: completion popups and
          // bracket auto-closing would fight with pasting.
          autocompletion: false,
          closeBrackets: false,
          searchKeymap: false,
        }}
      />
    </div>
  );
}

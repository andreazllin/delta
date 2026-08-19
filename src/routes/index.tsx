import { IconArrowRight } from '@tabler/icons-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { LanguageSelect } from '@/components/language-select';
import { TextEditor } from '@/components/text-editor';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getComparePair, setComparePair } from '@/lib/compare-store';
import { resolveLanguageId } from '@/lib/detect-language';
import { useDiffSettings } from '@/lib/diff-settings';

export const Route = createFileRoute('/')({
  component: ComparePage,
});

function ComparePage() {
  const initial = getComparePair();
  const [left, setLeft] = useState(initial.left);
  const [right, setRight] = useState(initial.right);
  const { languageId, setLanguageId } = useDiffSettings();
  const navigate = useNavigate();

  // The panes highlight with the same language the diff will use, so the two
  // screens agree before the user ever reaches the diff.
  const resolvedLanguageId = useMemo(
    () => resolveLanguageId(languageId, right, left),
    [languageId, left, right]
  );

  const canCompare = left.length > 0 || right.length > 0;

  const compare = () => {
    if (!canCompare) {
      return;
    }
    setComparePair({ left, right });
    void navigate({ to: '/compare' });
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 md:px-6 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Compare two texts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste text into both panes. Then select Compare.
          </p>
        </div>
        <LanguageSelect
          value={languageId}
          onChange={setLanguageId}
          resolvedLanguageId={resolvedLanguageId}
          align="end"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextPane
          id="text-1"
          label="Text 1"
          description="Original"
          value={left}
          onChange={setLeft}
          languageId={resolvedLanguageId}
        />
        <TextPane
          id="text-2"
          label="Text 2"
          description="Changed"
          value={right}
          onChange={setRight}
          languageId={resolvedLanguageId}
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {!canCompare && (
          <span className="text-sm text-muted-foreground">
            Add text to at least one pane.
          </span>
        )}
        <Button type="button" disabled={!canCompare} onClick={compare}>
          Compare
          <IconArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}

interface TextPaneProps {
  id: string;
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  languageId: string;
}

function TextPane({
  id,
  label,
  description,
  value,
  onChange,
  languageId,
}: TextPaneProps) {
  const lineCount = value.length === 0 ? 0 : value.split('\n').length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          <span className="ml-2 font-normal text-muted-foreground">
            {description}
          </span>
        </Label>
        <span className="text-xs text-muted-foreground tabular-nums">
          {lineCount} {lineCount === 1 ? 'line' : 'lines'}
        </span>
      </div>
      <TextEditor
        id={id}
        value={value}
        onChange={onChange}
        languageId={languageId}
        placeholder="Paste text here…"
      />
    </div>
  );
}

import { IconArrowRight } from '@tabler/icons-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getComparePair, setComparePair } from '@/lib/compare-store';

export const Route = createFileRoute('/')({
  component: ComparePage,
});

function ComparePage() {
  const initial = getComparePair();
  const [left, setLeft] = useState(initial.left);
  const [right, setRight] = useState(initial.right);
  const navigate = useNavigate();

  const canCompare = left.length > 0 || right.length > 0;

  const compare = () => {
    if (!canCompare) {
      return;
    }
    setComparePair({ left, right });
    void navigate({ to: '/compare' });
  };

  return (
    <form
      className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 md:px-6 md:py-10"
      onSubmit={(event) => {
        event.preventDefault();
        compare();
      }}
    >
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Compare two texts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste anything into both panes, then compare them side by side.
        </p>
      </div>

      <div className="grid flex-1 gap-4 md:grid-cols-2">
        <TextPane
          id="text-1"
          label="Text 1"
          description="Original"
          value={left}
          onChange={setLeft}
        />
        <TextPane
          id="text-2"
          label="Text 2"
          description="Changed"
          value={right}
          onChange={setRight}
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        {!canCompare && (
          <span className="text-sm text-muted-foreground">
            Add text to at least one pane.
          </span>
        )}
        <Button type="submit" disabled={!canCompare}>
          Compare
          <IconArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </form>
  );
}

interface TextPaneProps {
  id: string;
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
}

function TextPane({ id, label, description, value, onChange }: TextPaneProps) {
  const lineCount = value.length === 0 ? 0 : value.split('\n').length;

  return (
    <div className="flex min-h-0 flex-col gap-2">
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
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        placeholder="Paste text here…"
        className="min-h-[22rem] flex-1 resize-y font-mono text-[13px] leading-relaxed"
      />
    </div>
  );
}

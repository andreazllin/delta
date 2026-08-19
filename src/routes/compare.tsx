import {
  IconAlertTriangle,
  IconClipboardText,
  IconEqual,
  IconPencil,
  type Icon,
} from '@tabler/icons-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo } from 'react';

import { DiffStats } from '@/components/diff/diff-stats';
import { DiffToolbar } from '@/components/diff/diff-toolbar';
import { DiffView } from '@/components/diff/diff-view';
import { IconStack } from '@/components/reui/icon-stack';
import { Button } from '@/components/ui/button';
import { useColorMode } from '@/lib/color-mode';
import { useComparePair } from '@/lib/compare-store';
import { computeDiff, isDiffError } from '@/lib/compute-diff';
import { resolveLanguageId } from '@/lib/detect-language';
import { useDiffSettings } from '@/lib/diff-settings';

export const Route = createFileRoute('/compare')({
  component: DiffPage,
});

function DiffPage() {
  const { left, right } = useComparePair();
  const settings = useDiffSettings();
  const { themeType } = useColorMode();

  // `'auto'` is the default, so the diff highlights without the user picking a
  // language; an explicit pick overrides it.
  const resolvedLanguageId = useMemo(
    () => resolveLanguageId(settings.languageId, right, left),
    [settings.languageId, left, right]
  );

  const result = useMemo(
    () =>
      computeDiff({
        left,
        right,
        languageId: resolvedLanguageId,
        collapseUnchanged: settings.collapseUnchanged,
      }),
    [left, right, resolvedLanguageId, settings.collapseUnchanged]
  );

  const isEmpty = left.length === 0 && right.length === 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link to="/" />}
          >
            <IconPencil />
            Edit texts
          </Button>
          {!isEmpty && !isDiffError(result) && (
            <DiffStats
              additions={result.additions}
              deletions={result.deletions}
            />
          )}
        </div>
        <DiffToolbar
          settings={settings}
          resolvedLanguageId={resolvedLanguageId}
        />
      </div>

      <div className="flex flex-col overflow-hidden rounded-lg border bg-card">
        {isEmpty ? (
          <EmptyState
            icon={IconClipboardText}
            title="Nothing to compare"
            description="Both panes are empty."
          />
        ) : isDiffError(result) ? (
          <EmptyState
            icon={IconAlertTriangle}
            tone="error"
            title="The app cannot build a diff"
            description={result.error}
          />
        ) : !result.hasChanges ? (
          <EmptyState
            icon={IconEqual}
            title="The texts are identical"
            description="Change one pane to see a diff."
          />
        ) : (
          <DiffView
            fileDiff={result.fileDiff}
            settings={settings}
            themeType={themeType}
          />
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon: Icon;
  title: string;
  description: string;
  /** `error` tints the stack, so a failure does not read as a normal state. */
  tone?: 'default' | 'error';
}

function EmptyState({
  icon: StateIcon,
  title,
  description,
  tone = 'default',
}: EmptyStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center gap-5 bg-card p-12 text-center">
      <IconStack className={tone === 'error' ? 'text-destructive' : undefined}>
        <StateIcon className="size-5" />
      </IconStack>
      <div className="space-y-1.5">
        <p className="text-sm font-medium">{title}</p>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

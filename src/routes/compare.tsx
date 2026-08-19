import { IconEqual, IconPencil } from '@tabler/icons-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo } from 'react';

import { DiffStats } from '@/components/diff/diff-stats';
import { DiffToolbar } from '@/components/diff/diff-toolbar';
import { DiffView } from '@/components/diff/diff-view';
import { Button } from '@/components/ui/button';
import { useColorMode } from '@/lib/color-mode';
import { useComparePair } from '@/lib/compare-store';
import { computeDiff, isDiffError } from '@/lib/compute-diff';
import { useDiffSettings } from '@/lib/diff-settings';

export const Route = createFileRoute('/compare')({
  component: DiffPage,
});

function DiffPage() {
  const { left, right } = useComparePair();
  const settings = useDiffSettings();
  const { themeType } = useColorMode();

  const result = useMemo(
    () =>
      computeDiff({
        left,
        right,
        languageId: settings.languageId,
        collapseUnchanged: settings.collapseUnchanged,
      }),
    [left, right, settings.collapseUnchanged, settings.languageId]
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
        <DiffToolbar settings={settings} />
      </div>

      <div className="flex flex-col overflow-hidden rounded-lg border bg-card">
        {isEmpty ? (
          <EmptyState
            title="Nothing to compare"
            description="Both panes are empty."
          />
        ) : isDiffError(result) ? (
          <EmptyState title="Could not build a diff" description={result.error} />
        ) : !result.hasChanges ? (
          <EmptyState
            icon
            title="The two texts are identical"
            description="No lines were added, removed, or changed."
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
  title: string;
  description: string;
  icon?: boolean;
}

function EmptyState({ title, description, icon = false }: EmptyStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-2 bg-card p-12 text-center">
      {icon && <IconEqual className="size-6 text-muted-foreground" />}
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

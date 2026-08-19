import type { DiffIndicators } from '@pierre/diffs';
import {
  IconLayoutColumns,
  IconLayoutRows,
  IconSettings,
  IconTextWrap,
} from '@tabler/icons-react';

import { LanguageSelect } from '@/components/language-select';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { DiffSettings, DiffStyle } from '@/lib/diff-settings';

interface DiffToolbarProps {
  settings: DiffSettings;
  /** What `'auto'` resolved to, so the trigger can name the detected language. */
  resolvedLanguageId: string;
}

export function DiffToolbar({
  settings,
  resolvedLanguageId,
}: DiffToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ToggleGroup
        variant="outline"
        size="sm"
        spacing={0}
        value={[settings.diffStyle]}
        onValueChange={(value: string[]) => {
          const [next] = value;
          if (next != null) {
            settings.setDiffStyle(next as DiffStyle);
          }
        }}
        aria-label="Diff layout"
      >
        <ToggleGroupItem value="split" aria-label="Split view">
          <IconLayoutColumns />
          Split
        </ToggleGroupItem>
        <ToggleGroupItem value="unified" aria-label="Unified view">
          <IconLayoutRows />
          Unified
        </ToggleGroupItem>
      </ToggleGroup>

      <Tooltip>
        <TooltipTrigger
          render={
            <Toggle
              variant="outline"
              size="sm"
              className="px-2"
              aria-label="Wrap long lines"
              pressed={settings.overflow === 'wrap'}
              onPressedChange={(pressed: boolean) =>
                settings.setOverflow(pressed ? 'wrap' : 'scroll')
              }
            >
              <IconTextWrap />
            </Toggle>
          }
        />
        <TooltipContent>Wrap long lines</TooltipContent>
      </Tooltip>

      <LanguageSelect
        value={settings.languageId}
        onChange={settings.setLanguageId}
        resolvedLanguageId={resolvedLanguageId}
      />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="icon-sm" aria-label="Diff settings">
              <IconSettings />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Display</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={settings.lineNumbers}
              onCheckedChange={settings.setLineNumbers}
            >
              Line numbers
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={settings.showBackgrounds}
              onCheckedChange={settings.setShowBackgrounds}
            >
              Line highlights
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={settings.collapseUnchanged}
              onCheckedChange={settings.setCollapseUnchanged}
            >
              Collapse unchanged lines
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={settings.diffIndicators}
            onValueChange={(value: string) =>
              settings.setDiffIndicators(value as DiffIndicators)
            }
          >
            <DropdownMenuLabel>Diff markers</DropdownMenuLabel>
            <DropdownMenuRadioItem value="bars">Bars</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="classic">
              Plus and minus
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="none">None</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

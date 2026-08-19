import type { DiffIndicators } from '@pierre/diffs';
import {
  IconChevronDown,
  IconLayoutColumns,
  IconLayoutRows,
  IconSettings,
  IconTextWrap,
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { LANGUAGES } from '@/lib/languages';

interface DiffToolbarProps {
  settings: DiffSettings;
}

export function DiffToolbar({ settings }: DiffToolbarProps) {
  const activeLanguage = LANGUAGES.find(
    (language) => language.id === settings.languageId
  );

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

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="sm">
              {activeLanguage?.label ?? 'Plain text'}
              <IconChevronDown data-icon="inline-end" />
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="max-h-80 overflow-y-auto">
          <DropdownMenuLabel>Syntax</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={settings.languageId}
            onValueChange={(value: string) => settings.setLanguageId(value)}
          >
            {LANGUAGES.map((language) => (
              <DropdownMenuRadioItem key={language.id} value={language.id}>
                {language.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="icon-sm" aria-label="Diff settings">
              <IconSettings />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-56">
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
            Change backgrounds
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={settings.collapseUnchanged}
            onCheckedChange={settings.setCollapseUnchanged}
          >
            Collapse unchanged
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Change indicators</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={settings.diffIndicators}
            onValueChange={(value: string) =>
              settings.setDiffIndicators(value as DiffIndicators)
            }
          >
            <DropdownMenuRadioItem value="bars">Bars</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="classic">
              Classic (+/-)
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="none">None</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

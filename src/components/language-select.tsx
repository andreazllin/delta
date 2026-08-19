import { IconChevronDown, IconCode } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AUTO_LANGUAGE_ID, isAutoLanguage } from '@/lib/detect-language';
import { getLanguage, LANGUAGES } from '@/lib/languages';

interface LanguageSelectProps {
  /** The stored selection, which may be `'auto'`. */
  value: string;
  onChange: (languageId: string) => void;
  /** What `'auto'` resolved to, so the trigger can name the detected language. */
  resolvedLanguageId: string;
  align?: 'start' | 'end';
}

/**
 * Shared by both screens: the input panes and the diff read one persisted
 * selection, so changing it in either place moves both.
 */
export function LanguageSelect({
  value,
  onChange,
  resolvedLanguageId,
  align = 'start',
}: LanguageSelectProps) {
  const isAuto = isAutoLanguage(value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" aria-label="Syntax language">
            <IconCode className="text-muted-foreground" />
            {getLanguage(resolvedLanguageId).label}
            {isAuto && <span className="text-muted-foreground">· auto</span>}
            <IconChevronDown data-icon="inline-end" />
          </Button>
        }
      />
      <DropdownMenuContent align={align} className="max-h-80 overflow-y-auto">
        {/* Base UI's GroupLabel reads a context that only Group and RadioGroup
            provide, so the label lives inside the radio group. */}
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next: string) => onChange(next)}
        >
          <DropdownMenuLabel>Syntax</DropdownMenuLabel>
          <DropdownMenuRadioItem value={AUTO_LANGUAGE_ID}>
            Auto-detect
          </DropdownMenuRadioItem>
          <DropdownMenuSeparator />
          {LANGUAGES.map((language) => (
            <DropdownMenuRadioItem key={language.id} value={language.id}>
              {language.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { IconCheck, IconChevronDown, IconCode } from '@tabler/icons-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { AUTO_LANGUAGE_ID, isAutoLanguage } from '@/lib/detect-language';
import { getLanguage, LANGUAGES } from '@/lib/languages';
import { cn } from '@/lib/utils';

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
 * selection, so a change in either place moves both.
 *
 * A Command list rather than a menu, because the list holds 28 entries and
 * needs a search field. A menu runs its own typeahead and would compete with
 * an input for the keystrokes.
 */
export function LanguageSelect({
  value,
  onChange,
  resolvedLanguageId,
  align = 'start',
}: LanguageSelectProps) {
  const [open, setOpen] = useState(false);
  const isAuto = isAutoLanguage(value);

  const select = (languageId: string) => {
    onChange(languageId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm" aria-label="Language">
            <IconCode className="text-muted-foreground" />
            {getLanguage(resolvedLanguageId).label}
            {isAuto && (
              <span className="text-muted-foreground">· automatic</span>
            )}
            <IconChevronDown data-icon="inline-end" />
          </Button>
        }
      />
      <PopoverContent align={align} className="w-60 p-0">
        <Command>
          <CommandInput placeholder="Search languages…" />
          <CommandList>
            <CommandEmpty>No language matches.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="automatic detect"
                onSelect={() => select(AUTO_LANGUAGE_ID)}
              >
                Automatic
                <IconCheck
                  aria-hidden="true"
                  className={cn('ml-auto', !isAuto && 'opacity-0')}
                />
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              {LANGUAGES.map((language) => (
                <CommandItem
                  key={language.id}
                  // The extension is searchable too, so "yml" finds YAML and
                  // "py" finds Python. Neither appears in the label.
                  value={`${language.label} ${language.extension}`}
                  onSelect={() => select(language.id)}
                >
                  {language.label}
                  <IconCheck
                    aria-hidden="true"
                    className={cn(
                      'ml-auto',
                      value !== language.id && 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

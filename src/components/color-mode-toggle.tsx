import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { COLOR_MODES, useColorMode, type ColorMode } from '@/lib/color-mode';

const ICONS = {
  system: IconDeviceDesktop,
  light: IconSun,
  dark: IconMoon,
} as const;

export function ColorModeToggle() {
  const { colorMode, setColorMode } = useColorMode();

  return (
    <ToggleGroup
      variant="outline"
      size="sm"
      spacing={0}
      value={[colorMode]}
      onValueChange={(value: string[]) => {
        const [next] = value;
        if (next != null) {
          setColorMode(next as ColorMode);
        }
      }}
      aria-label="Color mode"
    >
      {COLOR_MODES.map((mode) => {
        const Icon = ICONS[mode];
        return (
          <ToggleGroupItem
            key={mode}
            value={mode}
            aria-label={mode}
            className="px-2"
          >
            <Icon />
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}

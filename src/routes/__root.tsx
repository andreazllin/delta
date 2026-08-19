import { IconGitCompare } from '@tabler/icons-react';
import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

import { ColorModeToggle } from '@/components/color-mode-toggle';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ColorModeProvider } from '@/lib/color-mode';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <ColorModeProvider>
      <TooltipProvider>
        <div className="flex min-h-dvh flex-col">
          <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b px-4 md:px-6">
            <Link to="/" className="flex min-w-0 items-center gap-2 text-sm">
              <IconGitCompare className="size-4.5 shrink-0 text-muted-foreground" />
              <span className="font-semibold tracking-tight">diff</span>
              {/* Hidden on the narrowest screens, where the toolbar needs the room. */}
              <span
                aria-hidden="true"
                className="hidden text-muted-foreground/60 sm:inline"
              >
                ·
              </span>
              <span className="hidden truncate text-muted-foreground sm:inline">
                a no-bs text diff viewer
              </span>
            </Link>
            <ColorModeToggle />
          </header>
          <main className="flex min-h-0 flex-1 flex-col">
            <Outlet />
          </main>
        </div>
      </TooltipProvider>
    </ColorModeProvider>
  );
}

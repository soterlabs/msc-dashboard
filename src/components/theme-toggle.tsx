"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getTheme, setTheme } from "@/lib/theme";

/**
 * The theme lives on <html> and nowhere else, so this button holds no state:
 * it reads the class at click time and the two icons are switched by the theme
 * itself. That also means nothing here differs between the server render and
 * the first client render, whichever theme the head script picked.
 */
export function ThemeToggle() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Toggle light and dark theme"
            onClick={() => setTheme(getTheme() === "dark" ? "light" : "dark")}
          >
            <SunIcon aria-hidden className="hidden dark:block" />
            <MoonIcon aria-hidden className="block dark:hidden" />
          </Button>
        }
      />
      <TooltipContent>Toggle theme</TooltipContent>
    </Tooltip>
  );
}

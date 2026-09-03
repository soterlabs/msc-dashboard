import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Soter Labs mark — the official name-less logo from soterlabs.com, paired with
 * a type-set "Soter Labs" wordmark rather than a second image, so the name
 * inherits the dashboard's own scale.
 *
 * The asset ships gold. `brightness-0` flattens it to black without touching
 * its alpha and `dark:invert` turns that white, so the lockup sits in whichever
 * foreground the theme is using.
 */
export function SoterLabsMark({ className }: { className?: string }) {
  return (
    <Image
      src="/soter-labs.png"
      alt="Soter Labs"
      width={254}
      height={264}
      priority={false}
      className={cn("shrink-0 object-contain brightness-0 dark:invert", className)}
    />
  );
}

import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Soter Labs mark — the official name-less logo from soterlabs.com, gold on a
 * transparent background. Pair it with a type-set "Soter Labs" wordmark rather
 * than a second image, so the name inherits the dashboard's own scale.
 */
export function SoterLabsMark({ className }: { className?: string }) {
  return (
    <Image
      src="/soter-labs.png"
      alt="Soter Labs"
      width={254}
      height={264}
      priority={false}
      className={cn("w-auto shrink-0", className)}
    />
  );
}

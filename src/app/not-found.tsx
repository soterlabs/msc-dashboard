import Link from "next/link";

import { Button } from "@/components/ui/button";
import { paths } from "@/lib/routes";

/**
 * Rendered inside the console's chrome, so a mistyped or stale link still
 * leaves the sidebar to navigate from. Also what a flagged-off report serves,
 * which is why this says nothing about what might have been here.
 */
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold">No report at this address</h1>
      <p className="max-w-prose text-sm text-muted-foreground">
        The link may be out of date, or the report may not be part of this
        build. Pick one from the sidebar.
      </p>
      <Button render={<Link href={paths.home} />} className="mt-2">
        Distribution Rewards
      </Button>
    </div>
  );
}

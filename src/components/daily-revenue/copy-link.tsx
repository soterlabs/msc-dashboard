"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyLink() {
  const [copied, setCopied] = useState(false);
  return <Button variant="outline" size="sm" onClick={async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }}>{copied ? "Copied" : "Copy link"}</Button>;
}

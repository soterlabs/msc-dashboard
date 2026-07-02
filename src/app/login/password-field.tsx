"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordField() {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name="password"
        autoFocus
        required
        autoComplete="off"
        data-1p-ignore
        data-lpignore="true"
        placeholder="password"
        className="h-10 w-full rounded-[6px] border border-line-strong bg-paper pr-10 pl-3 font-mono text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-ink/40"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        title={show ? "Hide password" : "Show password"}
        className="absolute top-1/2 right-2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-[4px] text-muted transition-colors hover:text-ink"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

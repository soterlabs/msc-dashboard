import type { Metadata } from "next";
import { Geist_Mono, Public_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

/* Deltha — Soter Labs' own display face, used only for the "Soter Labs"
 * wordmark so the brand renders in its real typography, not a lookalike. */
const brand = localFont({
  src: "./fonts/Deltha.otf",
  variable: "--font-brand",
  display: "swap",
});

/* Two voices. Public Sans is the shadcn preset's own face and carries the whole
 * interface, figures included — money reads better in the text face with
 * `tabular-nums`. Geist Mono is reserved for machine identifiers: ref codes,
 * venue IDs, addresses, tx hashes. */
const sans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono-geist",
});

export const metadata: Metadata = {
  title: "Sky · Soter console",
  description:
    "Soter methodology breakdown of Sky distribution rewards and supply side revenues.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /* Light is the rendered default, and what a visitor gets until they choose
     * otherwise. The head script below switches to dark before first paint for
     * anyone who has — so no flash either way — and suppressHydrationWarning
     * covers the class it may change. */
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        sans.variable,
        mono.variable,
        brand.variable,
      )}
      suppressHydrationWarning
    >
      <head>
        {/* A bare inline <script>, not next/script: every next/script strategy
            queues the code for the Next runtime, which runs after the stylesheet
            has painted, so a light-theme user would see a dark frame first.
            React logs a dev-only note that component-rendered scripts do not run
            on client renders — true, and irrelevant here. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full font-sans">
        {/* The chrome wraps every route, so moving between reports swaps only
            the page below it — the sidebar and header never remount. */}
        <TooltipProvider>
          <AppShell>{children}</AppShell>
        </TooltipProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist_Mono, Public_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
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
    /* `dark` is the rendered default; the head script below rewrites it before
     * first paint from the stored preference or the OS setting.
     * suppressHydrationWarning covers the class that script may change. */
    <html
      lang="en"
      className={cn(
        "dark h-full antialiased",
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
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}

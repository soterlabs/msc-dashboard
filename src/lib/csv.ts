/**
 * CSV building and download for the browser.
 *
 * Quoting follows RFC 4180, same as scripts/lib/csv.mjs — kept separate because
 * that one is a Node module and this runs in the page. The rules are five lines;
 * sharing them across the two runtimes would cost more than it saves.
 *
 * Correct quoting matters more than it looks: an exported row is what a reviewer
 * opens to check the numbers, and a stray comma in a note silently shifts every
 * column after it.
 */

/** One cell: quoted only when it has to be, with inner quotes doubled. */
function cell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export function toCsv(header: string[], rows: (string | number | null | undefined)[][]): string {
  return [header.map(cell).join(","), ...rows.map((r) => r.map(cell).join(","))].join("\n") + "\n";
}

/** Offers `csv` to the user as a file download. */
export function downloadCsv(filename: string, csv: string): void {
  // A BOM so Excel reads the file as UTF-8 rather than guessing a code page.
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Builds a filename that records which filters produced the file, so two
 * downloads taken from different views cannot be confused for each other.
 *
 * `{ prime: "SPARK", month: "all" }` → `prime_payments_SPARK.csv`
 */
export function filteredFilename(base: string, parts: Record<string, string>): string {
  const active = Object.values(parts)
    .filter((v) => v && v !== "all")
    .map((v) => v.replaceAll(/[^A-Za-z0-9-]+/g, "-").replace(/^-|-$/g, ""));
  return [base, ...active].join("_") + ".csv";
}

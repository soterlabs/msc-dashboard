/**
 * Minimal RFC 4180 CSV read/write.
 *
 * The data files under data/ are hand-edited (and opened in Sheets/Excel), so
 * quoting has to be correct rather than convenient: a comma, quote or newline
 * inside a cell must survive a round trip. Values are always strings — typing
 * belongs to the per-dataset schema, not here.
 */

/** Serialise one cell: quote only when required, doubling any inner quote. */
function quote(value) {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

/**
 * Rows of objects → CSV text (with trailing newline).
 * `header` fixes column order; missing keys are written as empty cells.
 */
export function toCsv(header, rows) {
  const lines = [header.map(quote).join(",")];
  for (const row of rows) lines.push(header.map((h) => quote(row[h])).join(","));
  return lines.join("\n") + "\n";
}

/**
 * CSV text → { header, rows } where each row is a header→string object.
 * Blank lines are skipped; a short row is padded, a long one is an error
 * (a ragged file means the writer or a hand edit went wrong — fail loudly).
 */
export function fromCsv(text, { file = "csv" } = {}) {
  const records = parseRecords(text);
  if (!records.length) throw new Error(`${file} is empty`);
  const [header, ...body] = records;
  const rows = [];
  for (const [i, cells] of body.entries()) {
    // A single empty cell is a blank line, not a record.
    if (cells.length === 1 && cells[0].trim() === "") continue;
    if (cells.length > header.length) {
      throw new Error(
        `${file} line ${i + 2}: ${cells.length} cells for ${header.length} columns`,
      );
    }
    rows.push(Object.fromEntries(header.map((h, c) => [h, (cells[c] ?? "").trim()])));
  }
  return { header, rows };
}

/** Split CSV text into records of raw cells, honouring quoted sections. */
function parseRecords(text) {
  const records = [];
  let cells = [];
  let cell = "";
  let quoted = false;
  // Normalise line endings so a CRLF file parses the same as an LF one.
  const src = text.replaceAll("\r\n", "\n").replaceAll("\r", "\n");

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch !== '"') {
        cell += ch;
      } else if (src[i + 1] === '"') {
        cell += '"';
        i++; // consume the escaped quote
      } else {
        quoted = false;
      }
      continue;
    }
    if (ch === '"' && cell === "") {
      quoted = true;
    } else if (ch === ",") {
      cells.push(cell);
      cell = "";
    } else if (ch === "\n") {
      cells.push(cell);
      records.push(cells);
      cells = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  if (quoted) throw new Error("unterminated quoted cell");
  if (cell !== "" || cells.length) {
    cells.push(cell);
    records.push(cells);
  }
  return records.map((r) => r.map((c) => c.trim()));
}

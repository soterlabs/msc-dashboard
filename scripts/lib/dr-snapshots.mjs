/**
 * Finalized DR month snapshots, settlement-cycle data/distribution_rewards/<YYYY-MM>/.
 *
 * settlement-cycle's DR loader (src/settle/load/dr_rewards.py → dr_snapshot.py)
 * gives these precedence over the pinned workbook: the upstream comparison
 * workbook can lag a settled month (October 2026 was settled from settle-dr-dune
 * #34's CSVs while its workbook still ended in September). Reading the same
 * snapshots, with the same guards — manifest checksums, one row per
 * (month, chain, token, ref code, source), a non-empty CSV, and a half-cent
 * per-code reconciliation to the finalized workbook — keeps DR on the
 * dashboard equal to the DR the settlement actually used.
 */
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import * as XLSX from "xlsx";

import { fromCsv } from "./csv.mjs";

const round = (v, dp) => Math.round(v * 10 ** dp) / 10 ** dp;
const str = (v) => (v === null || v === undefined ? "" : String(v).trim());
const sha256 = (file) => createHash("sha256").update(fs.readFileSync(file)).digest("hex");

/**
 * Returns [{ month, refCodes: Map<code, {value, notes}>, tokens: Map<"code|token", value> }],
 * oldest month first. Values are rounded to cents; codes and tokens that round
 * to $0.00 are omitted, matching the comparison workbook, which leaves such a
 * month blank rather than writing 0.00.
 */
export function drFinalizedSnapshots(cycleDir) {
  const base = path.join(cycleDir, "data", "distribution_rewards");
  if (!fs.existsSync(base)) return [];
  const out = [];
  for (const month of fs.readdirSync(base).filter((m) => /^\d{4}-\d{2}$/.test(m)).sort()) {
    const dir = path.join(base, month);
    const rel = path.relative(cycleDir, dir);
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8"));
    if (manifest.month !== month) throw new Error(`${rel}/manifest.json is for ${manifest.month}`);
    for (const name of ["accrual.csv", "finalized.xlsx"]) {
      if (sha256(path.join(dir, name)) !== manifest.files?.[name]) {
        throw new Error(`${rel}/${name} does not match its manifest checksum`);
      }
    }

    // Finalized workbook: ref-code aggregate rounded to cents (what is paid).
    const wb = XLSX.read(fs.readFileSync(path.join(dir, "finalized.xlsx")));
    if (!wb.Sheets["Soter by Ref Code"]) throw new Error(`${rel}/finalized.xlsx has no "Soter by Ref Code" sheet`);
    const sheet = XLSX.utils.sheet_to_json(wb.Sheets["Soter by Ref Code"], { header: 1, raw: true, defval: null });
    const header = (sheet[0] ?? []).map(str);
    const col = header.indexOf(month);
    const notesCol = header.indexOf("notes");
    if (header[0] !== "ref_code" || col === -1) {
      throw new Error(`${rel}/finalized.xlsx "Soter by Ref Code" format changed — header: ${header.join(", ")}`);
    }
    const refCodes = new Map();
    for (const r of sheet.slice(1)) {
      const code = str(r[0]);
      if (!code || code.toLowerCase() === "total") continue;
      const value = r[col] === null || str(r[col]) === "" ? 0 : Number(r[col]);
      if (!Number.isFinite(value)) throw new Error(`${rel}/finalized.xlsx: ref code ${code} has a non-numeric ${month}`);
      if (refCodes.has(code)) throw new Error(`${rel}/finalized.xlsx: ref code ${code} listed twice`);
      refCodes.set(code, { value: round(value, 2), notes: notesCol === -1 ? "" : str(r[notesCol]) });
    }

    // Companion CSV: full precision per chain × token × ref code.
    const csvRel = `${rel}/accrual.csv`;
    const { header: csvHeader, rows: csvRows } = fromCsv(fs.readFileSync(path.join(dir, "accrual.csv"), "utf8"), {
      file: csvRel,
    });
    for (const c of ["month", "blockchain", "token", "ref_code", "dr_usd", "source"]) {
      if (!csvHeader.includes(c)) throw new Error(`${csvRel} is missing column ${c}`);
    }
    if (!csvRows.length) throw new Error(`${csvRel} is empty`);
    const byCode = new Map();
    const tokens = new Map();
    const seen = new Set();
    for (const r of csvRows) {
      const amount = Number(r.dr_usd);
      const key = [r.month, r.blockchain, r.token, r.ref_code, r.source].join("|");
      if (r.month !== `${month}-01` || !Number.isFinite(amount) || r.dr_usd.trim() === "") {
        throw new Error(`${csvRel}: invalid row ${JSON.stringify(r)}`);
      }
      if (seen.has(key)) throw new Error(`${csvRel}: duplicate row ${key}`);
      seen.add(key);
      byCode.set(r.ref_code, (byCode.get(r.ref_code) ?? 0) + amount);
      const tokenKey = `${r.ref_code}|${r.token}`;
      tokens.set(tokenKey, (tokens.get(tokenKey) ?? 0) + amount);
    }
    // Same reconciliation as dr_snapshot.py: CSV per code within half a cent.
    for (const code of new Set([...byCode.keys(), ...refCodes.keys()])) {
      const a = byCode.get(code) ?? 0;
      const b = refCodes.get(code)?.value ?? 0;
      if (Math.abs(a - b) > 0.00500001) {
        throw new Error(`${rel}: ref code ${code} CSV ${a} does not reconcile to finalized ${b}`);
      }
    }
    // Blank-for-zero, as the workbook does. This also drops zero rows with no
    // CSV accrual at all (e.g. 2018 in 2026-10), which the settlement's
    // snapshot import never saw.
    for (const [code, { value }] of refCodes) if (value === 0) refCodes.delete(code);
    for (const [k, v] of tokens) {
      const cents = round(v, 2);
      if (cents === 0) tokens.delete(k);
      else tokens.set(k, cents);
    }
    out.push({ month, refCodes, tokens });
  }
  return out;
}

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import test from "node:test";
import * as XLSX from "xlsx";

import { drFinalizedSnapshots } from "./dr-snapshots.mjs";

const HEADER = "month,blockchain,token,ref_code,dr_usd,source\n";

/** A settlement-cycle-shaped checkout with one finalized month. */
function fixture({ csv, sheet, month = "2026-10", tamper } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "dr-snap-"));
  const dir = path.join(root, "data", "distribution_rewards", month);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "accrual.csv"), csv ?? HEADER +
    `${month}-01,ethereum,sUSDS,128,100.004,susds_susdc\n` +
    `${month}-01,base,sUSDC,128,0.5,susds_susdc\n` +
    `${month}-01,ethereum,stUSDS,2002,0.0001,stusds\n`);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheet ?? [
    ["ref_code", month, "notes"], ["128", 100.5, "rollup"], ["2002", 0, "rollup"], ["2018", 0, "rollup"],
  ]), "Soter by Ref Code");
  fs.writeFileSync(path.join(dir, "finalized.xlsx"), XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
  const sha = (f) => createHash("sha256").update(fs.readFileSync(path.join(dir, f))).digest("hex");
  fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify({
    month, files: { "accrual.csv": sha("accrual.csv"), "finalized.xlsx": sha("finalized.xlsx") },
  }));
  tamper?.(dir);
  return root;
}

test("finalized snapshot: cents per code and token, dust and zero rows omitted", () => {
  const [snap] = drFinalizedSnapshots(fixture());
  assert.equal(snap.month, "2026-10");
  assert.deepEqual([...snap.refCodes.keys()], ["128"]);
  assert.equal(snap.refCodes.get("128").value, 100.5);
  assert.deepEqual(Object.fromEntries(snap.tokens), { "128|sUSDS": 100, "128|sUSDC": 0.5 });
});

test("no snapshot directory means no snapshots", () => {
  assert.deepEqual(drFinalizedSnapshots(fs.mkdtempSync(path.join(os.tmpdir(), "dr-none-"))), []);
});

test("a file that no longer matches its manifest is rejected", () => {
  const root = fixture({ tamper: (dir) => fs.appendFileSync(path.join(dir, "accrual.csv"), "\n") });
  assert.throws(() => drFinalizedSnapshots(root), /does not match its manifest checksum/);
});

test("duplicate and empty CSVs fail instead of double-counting or emptying a month", () => {
  const dup = HEADER + "2026-10-01,ethereum,sUSDS,128,50.25,susds_susdc\n".repeat(2);
  assert.throws(() => drFinalizedSnapshots(fixture({ csv: dup, sheet: [["ref_code", "2026-10"], ["128", 100.5]] })),
    /duplicate row/);
  assert.throws(() => drFinalizedSnapshots(fixture({ csv: HEADER, sheet: [["ref_code", "2026-10"]] })), /is empty/);
});

test("CSV and finalized workbook must reconcile within half a cent per code", () => {
  const sheet = [["ref_code", "2026-10"], ["128", 100.52], ["2002", 0]];
  assert.throws(() => drFinalizedSnapshots(fixture({ sheet })), /does not reconcile/);
  const wrongMonth = HEADER + "2026-09-01,ethereum,sUSDS,128,100.5,susds_susdc\n";
  assert.throws(() => drFinalizedSnapshots(fixture({ csv: wrongMonth })), /invalid row/);
});

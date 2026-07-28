/**
 * Names an executed spell by finding its source directory in
 * sky-ecosystem/spells-mainnet.
 *
 * Each archived spell keeps the address it was deployed to in
 * `archive/<name>/test/config.sol`:
 *
 *     deployed_spell: address(0xEbf1…1A51), // populate with deployed spell if deployed
 *
 * so matching an on-chain spell address to a directory is a lookup rather than a
 * guess. Guessing by date would be wrong anyway: a spell is named for the day it
 * was written and cast some days later.
 *
 * Purely cosmetic — an unmatched spell keeps its address, and a GitHub outage
 * costs names, not data.
 */

const REPO = "sky-ecosystem/spells-mainnet";
const RAW = `https://raw.githubusercontent.com/${REPO}/master`;
const API = `https://api.github.com/repos/${REPO}/contents`;

/** How many archive directories to read at once. */
const CONCURRENCY = 6;

const DEPLOYED_SPELL = /deployed_spell:\s*address\((0x[0-9a-fA-F]{40})\)/;

async function json(url) {
  const res = await fetch(url, {
    headers: { accept: "application/vnd.github+json", "user-agent": "msc-dashboard" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function text(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

/** Archive directory names, newest first. */
async function listArchive() {
  const entries = await json(`${API}/archive`);
  return entries
    .filter((e) => e.type === "dir" && /^\d{4}-\d{2}-\d{2}-/.test(e.name))
    .map((e) => e.name)
    .sort()
    .reverse();
}

/** The address an archived spell was deployed to, or null. */
async function deployedAddress(dir) {
  try {
    const config = await text(`${RAW}/archive/${dir}/test/config.sol`);
    return DEPLOYED_SPELL.exec(config)?.[1]?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

/**
 * Every archived spell: Map(lowercased deployed address → { dir, date }),
 * restricted to directories dated on/after `since`.
 *
 * Read in full rather than looked up per address, because the set doubles as the
 * expected list: an executed spell that matches nothing here is worth a warning,
 * and an archived spell that never appears on-chain is worth one too.
 */
export async function fetchArchiveSpells(since = "0000-00-00") {
  const byAddress = new Map();
  let dirs;
  try {
    dirs = await listArchive();
  } catch (e) {
    console.warn(`[spell-archive] could not list the archive (${e.message}) — spells stay unnamed`);
    return byAddress;
  }
  // Cast happens days after the spell is dated, so reach a little further back
  // than the requested window or the first spell in range is missed.
  const cutoff = shiftDays(since, -21);
  dirs = dirs.filter((d) => d.slice(0, 10) >= cutoff);

  const undeployed = [];
  for (let i = 0; i < dirs.length; i += CONCURRENCY) {
    const batch = dirs.slice(i, i + CONCURRENCY);
    const resolved = await Promise.all(batch.map(async (dir) => [dir, await deployedAddress(dir)]));
    for (const [dir, address] of resolved) {
      if (!address || /^0x0+$/.test(address)) undeployed.push(dir);
      else if (!byAddress.has(address)) byAddress.set(address, { dir, date: dir.slice(0, 10) });
    }
  }
  if (undeployed.length) {
    console.warn(
      `[spell-archive] ${undeployed.length} archived spell(s) record no deployed address: ${undeployed.join(", ")}`,
    );
  }
  return byAddress;
}

function shiftDays(date, days) {
  const t = Date.parse(`${date}T00:00:00Z`);
  if (Number.isNaN(t)) return date;
  return new Date(t + days * 86_400_000).toISOString().slice(0, 10);
}

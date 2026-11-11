import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export const WORTEL = new URL("../../", import.meta.url).pathname;

/** Alle bestanden onder een map, zonder node_modules en .git. */
export function bestanden(map = WORTEL, filter = () => true) {
  const uit = [];
  for (const naam of readdirSync(map)) {
    if (["node_modules", ".git"].includes(naam)) continue;
    const pad = join(map, naam);
    if (statSync(pad).isDirectory()) uit.push(...bestanden(pad, filter));
    else if (filter(pad)) uit.push(pad);
  }
  return uit;
}

export const lees = (pad) => readFileSync(pad, "utf8");
export const kort = (pad) => relative(WORTEL, pad);
export const appBestanden = (extensies) =>
  bestanden(WORTEL, (p) => extensies.some((e) => p.endsWith(e)) && !p.includes("/tests/"));

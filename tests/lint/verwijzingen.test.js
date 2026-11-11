/** Controleert dat elke verwijzing naar een bestand ook echt bestaat (imports, @import, url(), href, src). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { appBestanden, kort, lees, WORTEL } from "./hulp.js";

const lokaal = (v) => v && !/^(https?:|data:|mailto:|#|\/\/)/.test(v);

function controleer(pad, verwijzing, basis = dirname(pad)) {
  if (!lokaal(verwijzing)) return;
  const doel = join(basis, verwijzing.split("#")[0].split("?")[0]);
  assert.ok(existsSync(doel), `${kort(pad)} verwijst naar ontbrekend bestand: ${verwijzing}`);
}

test("JavaScript-imports verwijzen naar bestaande modules", () => {
  for (const pad of appBestanden([".js"])) {
    const bron = lees(pad);
    for (const m of bron.matchAll(/(?:from\s+|import\s*\(\s*)["'](\.{1,2}\/[^"']+)["']/g)) controleer(pad, m[1]);
  }
});

test("CSS verwijst naar bestaande stylesheets, lettertypes en afbeeldingen", () => {
  for (const pad of appBestanden([".css"])) {
    const bron = lees(pad);
    for (const m of bron.matchAll(/@import\s+["']([^"']+)["']/g)) controleer(pad, m[1]);
    for (const m of bron.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) controleer(pad, m[1]);
  }
});

test("HTML en manifest verwijzen naar bestaande bestanden", () => {
  for (const pad of appBestanden([".html"])) {
    for (const m of lees(pad).matchAll(/\s(?:href|src)="([^"]+)"/g)) controleer(pad, m[1], WORTEL);
  }
  const manifest = JSON.parse(lees(join(WORTEL, "manifest.webmanifest")));
  for (const icoon of manifest.icons) controleer(join(WORTEL, "manifest.webmanifest"), icoon.src, WORTEL);
});

test("elk tabblad uit het register bestaat", () => {
  const register = lees(join(WORTEL, "assets/js/admin/tabs/index.js"));
  for (const m of register.matchAll(/from\s+"(\.\/[^"]+)"/g)) controleer(join(WORTEL, "assets/js/admin/tabs/index.js"), m[1]);
});

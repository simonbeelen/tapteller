/**
 * Spelregels voor de code, automatisch afgedwongen:
 *  - geen inline CSS (style-attributen, <style>-blokken, cssText of losse style-eigenschappen)
 *  - geen innerHTML (voorkomt dat namen uit de database als HTML worden uitgevoerd)
 * Dynamische waarden geef je door als CSS-variabele: element.style.setProperty("--naam", waarde)
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { appBestanden, kort, lees } from "./hulp.js";

const html = appBestanden([".html"]);
const js = appBestanden([".js"]);

test("HTML bevat geen style-attributen of <style>-blokken", () => {
  for (const pad of html) {
    const bron = lees(pad);
    assert.doesNotMatch(bron, /\sstyle\s*=/i, `${kort(pad)} bevat een style-attribuut`);
    assert.doesNotMatch(bron, /<style[\s>]/i, `${kort(pad)} bevat een <style>-blok`);
  }
});

test("HTML-pagina's verbieden inline CSS via een Content-Security-Policy", () => {
  for (const pad of html) {
    assert.match(lees(pad), /Content-Security-Policy"\s+content="[^"]*style-src 'self'/, `${kort(pad)} mist style-src 'self'`);
  }
});

test("JavaScript zet geen inline stijlen", () => {
  const verboden = [
    [/\.style\.cssText/, "style.cssText"],
    [/setAttribute\(\s*["']style["']/, "setAttribute('style')"],
    [/\.style\.(?!setProperty\b|removeProperty\b|getPropertyValue\b)[a-zA-Z]+\s*=[^=]/, "style.eigenschap ="],
  ];
  for (const pad of js) {
    const bron = lees(pad);
    for (const [patroon, naam] of verboden) assert.doesNotMatch(bron, patroon, `${kort(pad)} gebruikt ${naam}`);
  }
});

test("JavaScript gebruikt geen innerHTML of insertAdjacentHTML", () => {
  for (const pad of js) {
    assert.doesNotMatch(lees(pad), /innerHTML|insertAdjacentHTML|outerHTML/, `${kort(pad)} gebruikt HTML-strings`);
  }
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { bonnetjes, getal, initialen } from "../../assets/js/lib/opmaak.js";

test("getal gebruikt Belgische notatie en rondt af op één decimaal", () => {
  assert.equal(getal(1234.5), "1.234,5");
  assert.equal(getal(2.25), "2,3");
  assert.equal(getal(7), "7");
});

test("getal maakt van ongeldige waarden 0", () => {
  assert.equal(getal(undefined), "0");
  assert.equal(getal("abc"), "0");
  assert.equal(getal(null), "0");
});

test("bonnetjes: enkelvoud en meervoud", () => {
  assert.equal(bonnetjes(1), "1 bonnetje");
  assert.equal(bonnetjes(2), "2 bonnetjes");
  assert.equal(bonnetjes(0), "0 bonnetjes");
  assert.equal(bonnetjes(1.5), "1,5 bonnetjes");
});

test("initialen: eerste letter van de eerste twee woorden, in hoofdletters", () => {
  assert.equal(initialen("Scouts Merchtem"), "SM");
  assert.equal(initialen("KSA"), "K");
  assert.equal(initialen("  jeugdhuis de  nacht "), "JD");
  assert.equal(initialen(""), "");
  assert.equal(initialen(undefined), "");
});

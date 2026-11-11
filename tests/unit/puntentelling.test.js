import { test } from "node:test";
import assert from "node:assert/strict";
import { aandeel, bestellingRegels, bestellingTotaal, puntenVoor, rangschik, rond } from "../../assets/js/lib/puntentelling.js";

const kaart = {
  pils: { naam: "Pils", prijs: 1, punten: 1, telt: true },
  duvel: { naam: "Duvel", prijs: 2, punten: 3, telt: true },
  water: { naam: "Water", prijs: 1, punten: 0, telt: false },
  half: { naam: "Proefglas", prijs: 0.5, punten: 0.5, telt: true },
};

test("bonnetjes-modus: punten = bonnetjes", () => {
  assert.equal(puntenVoor(kaart.duvel, 2, "bonnetjes"), 4);
});

test("zuipbeker-modus: eigen puntenwaarde, standaard 1", () => {
  assert.equal(puntenVoor(kaart.duvel, 2, "zuipbeker"), 6);
  assert.equal(puntenVoor({ naam: "X", prijs: 5 }, 3, "zuipbeker"), 3);
});

test("dranken die niet meetellen geven nooit punten", () => {
  assert.equal(puntenVoor(kaart.water, 5, "bonnetjes"), 0);
  assert.equal(puntenVoor(kaart.water, 5, "zuipbeker"), 0);
});

test("onbekende drank geeft 0 punten", () => {
  assert.equal(puntenVoor(undefined, 2, "bonnetjes"), 0);
});

test("totaal telt bonnetjes altijd, ook voor dranken die niet meetellen", () => {
  const t = bestellingTotaal({ pils: 3, water: 2, duvel: 1 }, kaart, "bonnetjes");
  assert.deepEqual(t, { bonnetjes: 7, punten: 5 });
});

test("totaal in zuipbeker-modus", () => {
  const t = bestellingTotaal({ pils: 3, water: 2, duvel: 1 }, kaart, "zuipbeker");
  assert.deepEqual(t, { bonnetjes: 7, punten: 6 });
});

test("totaal negeert verwijderde dranken en nulaantallen", () => {
  const t = bestellingTotaal({ pils: 0, weg: 4, duvel: 1 }, kaart, "bonnetjes");
  assert.deepEqual(t, { bonnetjes: 2, punten: 2 });
});

test("halve bonnetjes geven geen drijvende-kommafouten", () => {
  const t = bestellingTotaal({ half: 3, pils: 1 }, { ...kaart }, "bonnetjes");
  assert.equal(t.bonnetjes, 2.5);
  assert.equal(rond(0.1 + 0.2), 0.3);
});

test("bestellingRegels bewaart naam, prijs en punten van dat moment", () => {
  const r = bestellingRegels({ duvel: 2, water: 1 }, kaart, "zuipbeker");
  assert.deepEqual(r.duvel, { naam: "Duvel", aantal: 2, prijs: 2, punten: 6 });
  assert.deepEqual(r.water, { naam: "Water", aantal: 1, prijs: 1, punten: 0 });
});

test("rangschikking: hoog naar laag, gelijke stand alfabetisch", () => {
  const lijst = rangschik({ a: { naam: "Scouts", aantal: 5 }, b: { naam: "KSA", aantal: 9 }, c: { naam: "KLJ", aantal: 5 } });
  assert.deepEqual(lijst.map((g) => g.naam), ["KSA", "KLJ", "Scouts"]);
});

test("rangschikking verdraagt ontbrekende gegevens", () => {
  assert.deepEqual(rangschik(null), []);
  assert.equal(rangschik({ a: {} })[0].aantal, 0);
  assert.equal(rangschik({ a: {} })[0].naam, "?");
});

test("aandeel: verhouding tegenover de hoogste score, begrensd tussen 0 en 100", () => {
  assert.equal(aandeel(5, 10), 50);
  assert.equal(aandeel(10, 10), 100);
  assert.equal(aandeel(0, 0), 0);
  assert.equal(aandeel(-3, 10), 0);
});

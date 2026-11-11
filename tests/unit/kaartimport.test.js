import { test } from "node:test";
import assert from "node:assert/strict";
import { leesKaartLijst } from "../../assets/js/lib/kaartimport.js";

test("bonnetjes-modus: punten volgen de prijs", () => {
  const [pils, duvel] = leesKaartLijst("Pils;1\nDuvel;2", { zuipbeker: false, startVolgorde: 5 });
  assert.deepEqual(pils, { naam: "Pils", prijs: 1, punten: 1, telt: true, v: 5 });
  assert.deepEqual(duvel, { naam: "Duvel", prijs: 2, punten: 2, telt: true, v: 6 });
});

test("zuipbeker-modus: derde kolom zijn de punten, 0 punten telt niet mee", () => {
  const [duvel, cola] = leesKaartLijst("Duvel;2;3\nCola;1;0", { zuipbeker: true, startVolgorde: 0 });
  assert.equal(duvel.punten, 3);
  assert.equal(duvel.telt, true);
  assert.equal(cola.telt, false);
});

test("tabs (uit Excel), komma's als decimaal en lege regels", () => {
  const lijst = leesKaartLijst("Kriek\t1,5\n\n   \nWijn\t2", { zuipbeker: false, startVolgorde: 0 });
  assert.equal(lijst.length, 2);
  assert.equal(lijst[0].prijs, 1.5);
});

test("ontbrekende prijs wordt 1, negatieve en ongeldige waarden worden 0", () => {
  const [a, b] = leesKaartLijst("Water\nRaar;-3", { zuipbeker: false, startVolgorde: 0 });
  assert.equal(a.prijs, 1);
  assert.equal(b.prijs, 0);
});

test("namen worden afgekapt op 40 tekens", () => {
  const [d] = leesKaartLijst("x".repeat(60), { zuipbeker: false, startVolgorde: 0 });
  assert.equal(d.naam.length, 40);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { bestellingenNaarCsv } from "../../assets/js/lib/csv.js";

const bestellingen = [
  { t: 2000, groepNaam: "KLJ", items: { a: { naam: "Pils", aantal: 2 } }, bonnetjes: 2, punten: 2, door: "bar@x.be" },
  { t: 1000, groepNaam: 'Scouts "Nacht"', items: { a: { naam: "Duvel", aantal: 1 } }, bonnetjes: 1.5, punten: 3, door: "bar@x.be", geannuleerd: true },
];

test("csv begint met BOM en kopregel, oudste bestelling eerst", () => {
  const csv = bestellingenNaarCsv(bestellingen, { groepWoord: "Groep" });
  const regels = csv.replace("\ufeff", "").split("\r\n");
  assert.ok(csv.startsWith("\ufeff"));
  assert.equal(regels[0], '"Tijd";"Groep";"Bestelling";"Bonnetjes";"Punten";"Door";"Geannuleerd"');
  assert.match(regels[1], /Scouts/);
  assert.match(regels[2], /KLJ/);
});

test("csv escapet aanhalingstekens, gebruikt decimale komma en markeert annulaties", () => {
  const regel = bestellingenNaarCsv(bestellingen, { groepWoord: "Groep" }).split("\r\n")[1];
  assert.match(regel, /"Scouts ""Nacht"""/);
  assert.match(regel, /"1,5"/);
  assert.match(regel, /"ja"$/);
});

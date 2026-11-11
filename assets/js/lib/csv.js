/** Export van bestellingen naar CSV (puntkomma-gescheiden, met BOM zodat Excel de accenten goed leest). */
import { datumTijd } from "./opmaak.js";

const veld = (waarde) => `"${String(waarde ?? "").replaceAll('"', '""')}"`;
const decimaal = (waarde) => String(Math.round((Number(waarde) || 0) * 100) / 100).replace(".", ",");

/**
 * @param {Array<object>} bestellingen
 * @param {{ groepWoord: string }} opties
 */
export function bestellingenNaarCsv(bestellingen, { groepWoord }) {
  const rijen = [["Tijd", groepWoord, "Bestelling", "Bonnetjes", "Punten", "Door", "Geannuleerd"]];

  // oudste eerst, zoals in een kasboek
  for (const b of [...bestellingen].sort((x, y) => x.t - y.t)) {
    rijen.push([
      datumTijd(b.t),
      b.groepNaam,
      Object.values(b.items ?? {}).map((i) => `${i.aantal}x ${i.naam}`).join(", "),
      decimaal(b.bonnetjes),
      decimaal(b.punten),
      b.door,
      b.geannuleerd ? "ja" : "",
    ]);
  }

  return "\ufeff" + rijen.map((rij) => rij.map(veld).join(";")).join("\r\n");
}

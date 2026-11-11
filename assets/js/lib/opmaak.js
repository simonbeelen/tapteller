/** Getallen en tijden weergeven. Zuivere functies, geen DOM. */

const GETAL = new Intl.NumberFormat("nl-BE", { maximumFractionDigits: 1 });

/** 1234.5 → "1.234,5". Ontbrekende of ongeldige waarden worden 0. */
export function getal(waarde) {
  const n = Number(waarde);
  return GETAL.format(Number.isFinite(n) ? n : 0);
}

/** 1 → "1 bonnetje", 2 → "2 bonnetjes". */
export function bonnetjes(aantal) {
  return `${getal(aantal)} ${Number(aantal) === 1 ? "bonnetje" : "bonnetjes"}`;
}

/** "Scouts Merchtem" → "SM", "KSA" → "K". Voor de ronde plaatsvervanger als er geen foto is. */
export function initialen(naam) {
  return String(naam ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((woord) => [...woord][0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Tijdstip als "21:05". */
export function klok(datum = new Date()) {
  return new Date(datum).toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" });
}

/** Datum + tijd, voor exports. */
export function datumTijd(datum) {
  return new Date(datum).toLocaleString("nl-BE");
}

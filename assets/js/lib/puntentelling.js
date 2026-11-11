/**
 * De regels voor punten en rangschikking. Zuivere functies: geen DOM, geen Firebase.
 * Dit is het hart van de app en wordt daarom volledig getest (tests/unit).
 */

/** Rondt af op `decimalen` om drijvende-kommafouten (0,1 + 0,2) te vermijden. */
export const rond = (waarde, decimalen = 2) => {
  const factor = 10 ** decimalen;
  return Math.round((Number(waarde) || 0) * factor) / factor;
};

/**
 * Punten voor `aantal` stuks van een drank.
 * - modus "bonnetjes": punten = bonnetjes van de drank
 * - modus "zuipbeker": punten = de eigen puntenwaarde van de drank (standaard 1)
 * - telt === false: geeft nooit punten
 */
export function puntenVoor(drank, aantal, modus) {
  if (!drank || drank.telt === false) return 0;
  const perStuk = modus === "zuipbeker" ? (drank.punten ?? 1) : (drank.prijs ?? 0);
  return perStuk * aantal;
}

/**
 * Totaal van een bestelling.
 * @param {Record<string, number>} mand  drank-id → aantal
 * @param {Record<string, object>} kaart drank-id → drank
 * @returns {{ bonnetjes: number, punten: number }}
 */
export function bestellingTotaal(mand, kaart, modus) {
  let bonnetjes = 0;
  let punten = 0;
  for (const [id, aantal] of Object.entries(mand)) {
    const drank = kaart[id];
    if (!drank || aantal <= 0) continue;
    bonnetjes += (drank.prijs ?? 0) * aantal;
    punten += puntenVoor(drank, aantal, modus);
  }
  return { bonnetjes: rond(bonnetjes), punten: rond(punten) };
}

/**
 * Regels van een bestelling zoals ze bewaard worden (met de prijs en punten van dat moment).
 */
export function bestellingRegels(mand, kaart, modus) {
  const regels = {};
  for (const [id, aantal] of Object.entries(mand)) {
    const drank = kaart[id];
    if (!drank || aantal <= 0) continue;
    regels[id] = { naam: drank.naam, aantal, prijs: drank.prijs ?? 0, punten: rond(puntenVoor(drank, aantal, modus)) };
  }
  return regels;
}

/** Groepen van hoog naar laag; bij gelijke stand alfabetisch. */
export function rangschik(groepen) {
  return Object.entries(groepen ?? {})
    .map(([id, g]) => ({ id, naam: g.naam || "?", aantal: Number(g.aantal) || 0, foto: g.foto || "" }))
    .sort((a, b) => b.aantal - a.aantal || a.naam.localeCompare(b.naam, "nl"));
}

/** Verhouding (0–100) van een score tegenover de hoogste score, voor de staafgrafiek. */
export function aandeel(aantal, hoogste) {
  if (!hoogste || hoogste <= 0) return 0;
  return Math.max(0, Math.min(100, (aantal / hoogste) * 100));
}

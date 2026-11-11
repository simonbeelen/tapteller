/**
 * Alle schrijfacties naar de database. De interface roept enkel deze functies aan,
 * zodat de datastructuur op één plek te vinden en aan te passen is.
 */
import { db, ref, set, push, update, remove, increment } from "../firebase/db.js";
import { PAD } from "./paden.js";

const wortel = () => ref(db);

/* Instellingen -------------------------------------------------------- */

export const wijzigInstellingen = (velden) => update(ref(db, PAD.instellingen), velden);
export const zetLogo = (dataUrl) => set(ref(db, PAD.logo), dataUrl);
export const wisLogo = () => remove(ref(db, PAD.logo));

/* Groepen ------------------------------------------------------------- */

export const maakGroep = (naam) => push(ref(db, PAD.groepen), { naam, aantal: 0, t: Date.now() });
export const hernoemGroep = (id, naam) => update(ref(db, PAD.groep(id)), { naam });
export const zetGroepFoto = (id, dataUrl) => update(ref(db, PAD.groep(id)), { foto: dataUrl });
export const wisGroepFoto = (id) => remove(ref(db, PAD.groepFoto(id)));
export const verwijderGroep = (id) => update(wortel(), { [PAD.groep(id)]: null, [PAD.gif(id)]: null });
export const zetGif = (id, bron) => set(ref(db, PAD.gif(id)), bron);
export const wisGif = (id) => remove(ref(db, PAD.gif(id)));

/** Telt punten bij (of, met een negatief getal, af) bij één groep. */
export const wijzigPunten = (id, verschil) => update(wortel(), { [PAD.aantal(id)]: increment(verschil) });

export function zetAllePuntenOpNul(groepIds) {
  return update(wortel(), Object.fromEntries(groepIds.map((id) => [PAD.aantal(id), 0])));
}

/* Drankkaart ---------------------------------------------------------- */

export const maakDrank = (drank) => push(ref(db, PAD.kaart), drank);
export const wijzigDrank = (id, velden) => update(ref(db, PAD.drank(id)), velden);
export const verwijderDrank = (id) => remove(ref(db, PAD.drank(id)));

export function zetVolgorde(volgordePerId) {
  return update(wortel(), Object.fromEntries(Object.entries(volgordePerId).map(([id, v]) => [`${PAD.drank(id)}/v`, v])));
}

export function importeerDranken(dranken) {
  const wijzigingen = {};
  for (const drank of dranken) wijzigingen[PAD.drank(push(ref(db, PAD.kaart)).key)] = drank;
  return update(wortel(), wijzigingen);
}

/* Bestellingen -------------------------------------------------------- */

/** Slaat de bestelling op en telt de punten bij de groep op, in één atomaire schrijfactie. */
export async function plaatsBestelling(bestelling) {
  const sleutel = push(ref(db, PAD.bestellingen)).key;
  const wijzigingen = { [PAD.bestelling(sleutel)]: bestelling };
  if (bestelling.punten > 0) wijzigingen[PAD.aantal(bestelling.groep)] = increment(bestelling.punten);
  await update(wortel(), wijzigingen);
  return sleutel;
}

/** Markeert een bestelling als geannuleerd en trekt de punten af (nooit onder nul). */
export function annuleerBestelling(sleutel, bestelling, huidigeScore) {
  const wijzigingen = { [`${PAD.bestelling(sleutel)}/geannuleerd`]: true };
  const terug = Math.min(bestelling.punten || 0, huidigeScore ?? 0);
  if (terug > 0) wijzigingen[PAD.aantal(bestelling.groep)] = increment(-terug);
  return update(wortel(), wijzigingen);
}

export const wisAlleBestellingen = () => remove(ref(db, PAD.bestellingen));

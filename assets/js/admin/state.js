/**
 * De enige bron van waarheid voor de beheer-app: wat de database nu zegt.
 * Luisteraars (admin/luisteraars.js) schrijven hierin; tabbladen lezen eruit.
 */

export const state = {
  gebruiker: null,
  instellingen: {},
  groepen: {},
  kaart: {},
  gifs: {},
  bestellingen: {},
};

const abonnees = new Set();

/** Werkt de state bij en meldt welke sleutels veranderden. */
export function zet(wijziging) {
  Object.assign(state, wijziging);
  for (const abonnee of abonnees) abonnee(Object.keys(wijziging));
}

/** @param {(sleutels: string[]) => void} abonnee @returns {() => void} */
export function abonneer(abonnee) {
  abonnees.add(abonnee);
  return () => abonnees.delete(abonnee);
}

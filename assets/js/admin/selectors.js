/** Afgeleide gegevens uit de state. Tabbladen gebruiken enkel deze functies om te lezen. */
import { APP } from "../config.js";
import { state } from "./state.js";

export const modus = () => state.instellingen.modus || "bonnetjes";
export const isZuipbeker = () => modus() === "zuipbeker";

export function woorden() {
  return APP.woorden[state.instellingen.woord] ?? APP.woorden.groep;
}

export const groepen = () =>
  Object.entries(state.groepen)
    .map(([id, groep]) => ({ id, ...groep }))
    .sort((a, b) => (a.t || 0) - (b.t || 0));

export const dranken = () =>
  Object.entries(state.kaart)
    .map(([id, drank]) => ({ id, ...drank }))
    .sort((a, b) => (a.v ?? 0) - (b.v ?? 0) || String(a.naam).localeCompare(b.naam, "nl"));

export const bestellingen = () =>
  Object.entries(state.bestellingen)
    .map(([id, bestelling]) => ({ id, ...bestelling }))
    .sort((a, b) => b.t - a.t);

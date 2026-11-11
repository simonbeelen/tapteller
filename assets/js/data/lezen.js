import { db, ref, onValue, get } from "../firebase/db.js";

/**
 * Luistert live naar een pad.
 * @param {string} pad
 * @param {(waarde: any) => void} bijWijziging
 * @param {(fout: Error) => void} [bijFout]
 * @returns {() => void} functie om te stoppen met luisteren
 */
export function luister(pad, bijWijziging, bijFout = () => {}) {
  return onValue(ref(db, pad), (momentopname) => bijWijziging(momentopname.val()), bijFout);
}

/** Eenmalig lezen. */
export async function lees(pad) {
  return (await get(ref(db, pad))).val();
}

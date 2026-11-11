import { PAD } from "../data/paden.js";
import { luister } from "../data/lezen.js";
import { zet } from "./state.js";

/**
 * Start alle live-verbindingen met de database en zet de resultaten in de state.
 * @param {(fout: Error) => void} bijFout
 * @returns {() => void} stopt alle verbindingen
 */
export function startLuisteraars(bijFout) {
  const stoppers = [
    luister(PAD.instellingen, (v) => zet({ instellingen: v ?? {} }), bijFout),
    luister(PAD.groepen, (v) => zet({ groepen: v ?? {} }), bijFout),
    luister(PAD.kaart, (v) => zet({ kaart: v ?? {} }), bijFout),
    luister(PAD.gifs, (v) => zet({ gifs: v ?? {} }), bijFout),
    luister(PAD.bestellingen, (v) => zet({ bestellingen: v ?? {} }), bijFout),
  ];
  return () => stoppers.forEach((stop) => stop());
}

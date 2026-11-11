import { h } from "../lib/dom.js";

let timer;

/**
 * Korte melding bovenaan. Met `actie` verschijnt er een knop (bv. "Ongedaan") en blijft de melding langer staan.
 * @param {string} tekst
 * @param {{ label: string, bijKlik: () => void }} [actie]
 */
export function toast(tekst, actie) {
  const regio = document.getElementById("meldingen");
  regio.replaceChildren();

  const melding = h(
    "div",
    { class: "toast" },
    h("span", { class: "toast__tekst", tekst }),
    actie &&
      h("button", {
        class: "knop knop--klein",
        type: "button",
        tekst: actie.label,
        onclick: () => {
          melding.remove();
          actie.bijKlik();
        },
      }),
  );

  regio.append(melding);
  clearTimeout(timer);
  timer = setTimeout(() => melding.remove(), actie ? 6000 : 2600);
}

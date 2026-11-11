import { h } from "../lib/dom.js";

/**
 * Keuzeschakelaar met 2–3 opties naast elkaar.
 * @param {{ opties: Array<{ waarde: string, label: string, uitleg?: string }>, waarde: string, bijKeuze: (waarde: string) => void }} p
 */
export function segment({ opties, waarde, bijKeuze }) {
  return h(
    "div",
    { class: "segment", role: "group" },
    opties.map((optie) =>
      h(
        "button",
        {
          class: "segment__optie",
          type: "button",
          "aria-pressed": String(optie.waarde === waarde),
          onclick: () => optie.waarde !== waarde && bijKeuze(optie.waarde),
        },
        optie.label,
        optie.uitleg && h("span", { class: "segment__uitleg", tekst: optie.uitleg }),
      ),
    ),
  );
}

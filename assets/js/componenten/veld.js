import { h } from "../lib/dom.js";

let teller = 0;

/** Label + invoer + optionele hulptekst, correct aan elkaar gekoppeld. */
export function veld(label, invoer, hulp) {
  const id = invoer.id || `veld-${++teller}`;
  invoer.id = id;
  return h(
    "div",
    { class: "veld" },
    h("label", { class: "veld__label", for: id, tekst: label }),
    invoer,
    hulp && h("p", { class: "veld__hulp", tekst: hulp }),
  );
}

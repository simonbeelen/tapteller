import { getal } from "../lib/opmaak.js";
import { isAfbeelding } from "../lib/media.js";

/** De kop van het scherm: titel, evenementnaam, logo en totaal. */
export function maakKop({ titel, evenement, logo, totaal }) {
  return {
    zetTitel(tekst) {
      titel.textContent = typeof tekst === "string" && tekst ? tekst : "Klassement";
    },
    zetNaam(tekst) {
      evenement.textContent = typeof tekst === "string" ? tekst : "";
      evenement.hidden = !evenement.textContent;
    },
    zetLogo(bron) {
      const bruikbaar = isAfbeelding(bron);
      logo.hidden = !bruikbaar;
      if (bruikbaar) logo.src = bron;
    },
    zetTotaal(waarde) {
      totaal.textContent = getal(waarde);
    },
  };
}

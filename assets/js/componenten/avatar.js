import { h } from "../lib/dom.js";
import { cssUrl, isAfbeelding } from "../lib/media.js";
import { initialen } from "../lib/opmaak.js";

/** Ronde afbeelding van een groep; zonder foto verschijnen de initialen van de naam. */
export function avatar(foto, { naam = "", groot = false } = {}) {
  const gevuld = isAfbeelding(foto);
  return h(
    "div",
    {
      class: `avatar${groot ? " avatar--groot" : ""}${gevuld ? "" : " avatar--leeg"}`,
      vars: gevuld ? { "--foto": cssUrl(foto) } : {},
      "aria-hidden": "true",
    },
    gevuld ? null : initialen(naam),
  );
}

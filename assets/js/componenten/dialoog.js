import { h } from "../lib/dom.js";

/**
 * Bevestigingsvenster (vervangt window.confirm).
 * @returns {Promise<boolean>} true bij bevestigen, false bij annuleren of Escape
 */
export function bevestig({ titel, tekst, knop = "Bevestigen", gevaar = false }) {
  return new Promise((klaar) => {
    const venster = h(
      "dialog",
      { class: "dialoog", "aria-labelledby": "dialoog-titel" },
      h(
        "form",
        { method: "dialog" },
        h("h2", { class: "dialoog__titel", id: "dialoog-titel", tekst: titel }),
        tekst && h("p", { class: "dialoog__tekst", tekst }),
        h(
          "div",
          { class: "dialoog__acties" },
          h("button", { class: "knop knop--spook", value: "annuleer", tekst: "Annuleren" }),
          h("button", { class: `knop ${gevaar ? "knop--gevaar" : "knop--primair"}`, value: "ok", tekst: knop, autofocus: true }),
        ),
      ),
    );

    venster.addEventListener("close", () => {
      klaar(venster.returnValue === "ok");
      venster.remove();
    });

    document.body.append(venster);
    venster.showModal();
  });
}

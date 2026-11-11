/** Drankkaart: dranken met prijs in bonnetjes, eventueel eigen punten, en of ze meetellen. */
import { h } from "../../lib/dom.js";
import { icoon } from "../../lib/iconen.js";
import { leesKaartLijst } from "../../lib/kaartimport.js";
import { bevestig } from "../../componenten/dialoog.js";
import { toast } from "../../componenten/toast.js";
import { importeerDranken, maakDrank, verwijderDrank, wijzigDrank, zetVolgorde } from "../../data/schrijven.js";
import { dranken, isZuipbeker } from "../selectors.js";
import { meldFout } from "../fouten.js";

const naarGetal = (tekst) => Math.max(0, Number(String(tekst).replace(",", ".")) || 0);

export const kaartTab = {
  id: "kaart",
  label: () => "Drankkaart",
  watch: ["kaart", "instellingen"],
  beschermInvoer: true,

  render(wortel, ctx) {
    const zuip = isZuipbeker();
    const lijst = dranken();

    // Volgordenummers doorlopend houden (alleen schrijven als er iets scheef zit)
    const scheef = Object.fromEntries(lijst.flatMap((d, i) => (d.v !== i ? [[d.id, i]] : [])));
    if (Object.keys(scheef).length) zetVolgorde(scheef).catch(() => {});

    wortel.append(
      h("section", { class: "sectie" },
        h("div", { class: "sectie__kop" },
          h("h2", { class: "sectie__titel", tekst: "Drankkaart" }),
          h("p", { class: "sectie__uitleg", tekst: zuip
            ? "Modus Zuipbeker: elke drank geeft de punten die je hier instelt. Vink ‘Telt’ uit voor dranken die niet meetellen."
            : "Modus Bonnetjes: punten = aantal bonnetjes. Vink ‘Telt’ uit voor dranken zonder punten, zoals water of chips." }),
        ),
        tabel(lijst, zuip),
      ),
      nieuweDrank(lijst.length, zuip, ctx),
      plakLijst(lijst.length, zuip, ctx),
    );
  },
};

function tabel(lijst, zuip) {
  const wortel = h("div", { class: `paneel kaarttabel${zuip ? "" : " kaarttabel--zonder-punten"}` },
    h("div", { class: "kaarttabel__kop" }, h("span"), h("span", { tekst: "Naam" }), h("span", { tekst: "Bon." }), h("span", { class: "kaarttabel__punten", tekst: "Punten" }), h("span", { tekst: "Telt" }), h("span")),
  );

  if (!lijst.length) wortel.append(h("p", { class: "notitie", tekst: "Nog geen dranken." }));

  lijst.forEach((drank, index) => {
    const naam = h("input", { class: "invoer invoer--compact", type: "text", maxlength: 40, value: drank.naam, "aria-label": "Naam" });
    naam.addEventListener("change", () => naam.value.trim() && wijzigDrank(drank.id, { naam: naam.value.trim() }).catch(meldFout));

    const prijs = h("input", { class: "invoer invoer--compact invoer--getal", type: "number", min: 0, step: 0.5, inputmode: "decimal", value: drank.prijs ?? 0, "aria-label": `Bonnetjes voor ${drank.naam}` });
    prijs.addEventListener("change", () => wijzigDrank(drank.id, { prijs: naarGetal(prijs.value) }).catch(meldFout));

    const punten = h("input", { class: "invoer invoer--compact invoer--getal kaarttabel__punten", type: "number", min: 0, step: 0.5, inputmode: "decimal", value: drank.punten ?? 1, "aria-label": `Punten voor ${drank.naam}` });
    punten.addEventListener("change", () => wijzigDrank(drank.id, { punten: naarGetal(punten.value) }).catch(meldFout));

    const telt = h("input", { class: "vink", type: "checkbox", checked: drank.telt !== false, "aria-label": `${drank.naam} telt mee` });
    telt.addEventListener("change", () => wijzigDrank(drank.id, { telt: telt.checked }).catch(meldFout));

    const verplaats = (naarIndex) => {
      const ander = lijst[naarIndex];
      if (ander) zetVolgorde({ [drank.id]: naarIndex, [ander.id]: index }).catch(meldFout);
    };

    wortel.append(
      h("div", { class: "kaarttabel__rij" },
        h("div", { class: "kaarttabel__volgorde" },
          h("button", { class: "kaarttabel__pijl", type: "button", "aria-label": `${drank.naam} hoger`, disabled: index === 0, onclick: () => verplaats(index - 1) }, icoon("omhoog")),
          h("button", { class: "kaarttabel__pijl", type: "button", "aria-label": `${drank.naam} lager`, disabled: index === lijst.length - 1, onclick: () => verplaats(index + 1) }, icoon("omlaag")),
        ),
        naam, prijs, punten, telt,
        h("button", {
          class: "knop knop--klein knop--icoon knop--spook kaarttabel__verwijder",
          type: "button",
          "aria-label": `Verwijder ${drank.naam}`,
          onclick: async () => {
            const ok = await bevestig({ titel: `${drank.naam} verwijderen?`, knop: "Verwijderen", gevaar: true });
            if (ok) verwijderDrank(drank.id).catch(meldFout);
          },
        }, icoon("sluit")),
      ),
    );
  });

  return wortel;
}

function nieuweDrank(aantal, zuip, ctx) {
  const naam = h("input", { class: "invoer", type: "text", maxlength: 40, placeholder: "Naam, bv. Duvel", autocomplete: "off", "aria-label": "Naam van de nieuwe drank" });
  const prijs = h("input", { class: "invoer invoer--getal", type: "number", min: 0, step: 0.5, inputmode: "decimal", value: 1, "aria-label": "Bonnetjes" });
  const punten = h("input", { class: "invoer invoer--getal", type: "number", min: 0, step: 0.5, inputmode: "decimal", value: 1, "aria-label": "Punten" });

  const voegToe = async () => {
    const tekst = naam.value.trim();
    if (!tekst) return naam.focus();
    const bon = naarGetal(prijs.value);
    try {
      await maakDrank({ naam: tekst, prijs: bon, punten: zuip ? naarGetal(punten.value) : bon, telt: true, v: aantal });
      ctx.herteken();
    } catch (fout) {
      meldFout(fout);
    }
  };
  naam.addEventListener("keydown", (e) => e.key === "Enter" && voegToe());

  return h("section", { class: "sectie" },
    h("div", { class: "sectie__kop" }, h("h2", { class: "sectie__titel", tekst: "Drank toevoegen" })),
    h("div", { class: "paneel formulier" },
      naam,
      h("div", { class: "rij" },
        h("label", { class: "veld__label", tekst: "Bonnetjes" }), prijs,
        zuip && h("label", { class: "veld__label", tekst: "Punten" }),
        zuip && punten,
        h("button", { class: "knop knop--primair", type: "button", tekst: "Toevoegen", onclick: voegToe }),
      ),
    ),
  );
}

function plakLijst(aantal, zuip, ctx) {
  const vak = h("textarea", { class: "tekstvak", placeholder: zuip ? "Pils;1;1\nDuvel;2;3\nCola;1;0" : "Pils;1\nDuvel;2\nCola;1", "aria-label": "Lijst met dranken" });

  return h("details", { class: "paneel uitklap sectie" },
    h("summary", { class: "uitklap__titel", tekst: "Hele lijst in één keer plakken" }),
    h("div", { class: "uitklap__inhoud" },
      h("p", { class: "notitie", tekst: `Eén drank per regel: naam;bonnetjes${zuip ? ";punten" : ""}. Kolommen uit Excel kopiëren werkt ook.` }),
      vak,
      h("button", {
        class: "knop knop--primair",
        type: "button",
        tekst: "Toevoegen aan de kaart",
        onclick: async () => {
          const nieuw = leesKaartLijst(vak.value, { zuipbeker: zuip, startVolgorde: aantal });
          if (!nieuw.length) return;
          try {
            await importeerDranken(nieuw);
            toast(`${nieuw.length} ${nieuw.length === 1 ? "drank" : "dranken"} toegevoegd`);
            ctx.herteken();
          } catch (fout) {
            meldFout(fout);
          }
        },
      }),
    ),
  );
}

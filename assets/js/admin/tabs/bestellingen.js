/** Overzicht van bestellingen, verkoop per drank, annuleren en exporteren. */
import { h } from "../../lib/dom.js";
import { bonnetjes, getal, klok } from "../../lib/opmaak.js";
import { bestellingenNaarCsv } from "../../lib/csv.js";
import { downloadTekst } from "../../lib/download.js";
import { icoon } from "../../lib/iconen.js";
import { bevestig } from "../../componenten/dialoog.js";
import { toast } from "../../componenten/toast.js";
import { annuleerBestelling } from "../../data/schrijven.js";
import { bestellingen as alleBestellingen, woorden } from "../selectors.js";
import { state } from "../state.js";
import { meldFout } from "../fouten.js";

const TOON_MAX = 60;

export const bestellingenTab = {
  id: "bestellingen",
  label: () => "Bestellingen",
  watch: ["bestellingen", "instellingen"],

  render(wortel) {
    const lijst = alleBestellingen();
    const geldig = lijst.filter((b) => !b.geannuleerd);
    const totaalBonnetjes = geldig.reduce((som, b) => som + (b.bonnetjes || 0), 0);

    wortel.append(
      h("section", { class: "sectie" },
        h("div", { class: "sectie__kop" }, h("h2", { class: "sectie__titel", tekst: "Overzicht" })),
        h("div", { class: "paneel stapel" },
          h("dl", { class: "kenmerken" },
            h("div", { class: "kenmerken__rij" }, h("dt", { tekst: "Bestellingen" }), h("dd", { tekst: geldig.length })),
            h("div", { class: "kenmerken__rij" }, h("dt", { tekst: "Bonnetjes in totaal" }), h("dd", { tekst: getal(totaalBonnetjes) })),
          ),
          h("button", {
            class: "knop knop--klein",
            type: "button",
            disabled: !lijst.length,
            onclick: () => exporteer(lijst),
          }, icoon("download"), "Exporteer voor Excel (CSV)"),
        ),
      ),
    );

    const perDrank = verkoopPerDrank(geldig);
    if (perDrank.length) {
      wortel.append(
        h("section", { class: "sectie" },
          h("div", { class: "sectie__kop" }, h("h2", { class: "sectie__titel", tekst: "Verkocht per drank" })),
          h("dl", { class: "paneel kenmerken" },
            perDrank.map(([naam, aantal]) => h("div", { class: "kenmerken__rij" }, h("dt", { tekst: naam }), h("dd", { tekst: `${aantal}×` }))),
          ),
        ),
      );
    }

    wortel.append(
      h("section", { class: "sectie" },
        h("div", { class: "sectie__kop" }, h("h2", { class: "sectie__titel", tekst: "Laatste bestellingen" })),
        lijst.length
          ? h("div", { class: "paneel lijst" },
              lijst.slice(0, TOON_MAX).map(rij),
              lijst.length > TOON_MAX && h("p", { class: "notitie", tekst: `En nog ${lijst.length - TOON_MAX} oudere. Exporteer voor de volledige lijst.` }),
            )
          : h("p", { class: "paneel paneel--leeg", tekst: "Nog geen bestellingen." }),
      ),
    );
  },
};

function verkoopPerDrank(bestellingen) {
  const totalen = new Map();
  for (const b of bestellingen) {
    for (const regel of Object.values(b.items ?? {})) totalen.set(regel.naam, (totalen.get(regel.naam) || 0) + (regel.aantal || 0));
  }
  return [...totalen].sort((a, b) => b[1] - a[1]);
}

function rij(b) {
  const wat = Object.values(b.items ?? {}).map((i) => `${i.aantal}× ${i.naam}`).join(", ");
  const door = (b.door || "").split("@")[0];

  return h(
    "div",
    { class: `lijst__rij${b.geannuleerd ? " lijst__rij--vervallen" : ""}` },
    h("div", { class: "lijst__inhoud" },
      h("p", { class: "lijst__titel", tekst: `${klok(b.t)} · ${b.groepNaam || "?"}` }),
      h("p", { class: "lijst__detail", tekst: wat }),
      h("p", { class: "lijst__detail", tekst: `${bonnetjes(b.bonnetjes)} · ${getal(b.punten)} punten · ${door}${b.geannuleerd ? " · geannuleerd" : ""}` }),
    ),
    !b.geannuleerd && h("button", { class: "knop knop--klein knop--gevaar", type: "button", tekst: "Annuleer", onclick: () => annuleer(b) }),
  );
}

async function annuleer(b) {
  const ok = await bevestig({
    titel: "Bestelling annuleren?",
    tekst: `${b.groepNaam}: ${bonnetjes(b.bonnetjes)}, ${getal(b.punten)} punten worden afgetrokken.`,
    knop: "Annuleren",
    gevaar: true,
  });
  if (!ok) return;
  try {
    await annuleerBestelling(b.id, b, state.groepen[b.groep]?.aantal);
    toast("Bestelling geannuleerd");
  } catch (fout) {
    meldFout(fout, "Annuleren lukte niet");
  }
}

function exporteer(lijst) {
  const naam = state.instellingen.naam || "bestellingen";
  downloadTekst(`${naam}.csv`, bestellingenNaarCsv(lijst, { groepWoord: woorden().enkelvoud }));
}

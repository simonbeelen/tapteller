/** Kassa: kies een groep, tik de dranken aan, reken af. De punten gaan automatisch naar de groep. */
import { h } from "../../lib/dom.js";
import { bonnetjes, getal } from "../../lib/opmaak.js";
import { bestellingRegels, bestellingTotaal } from "../../lib/puntentelling.js";
import { avatar } from "../../componenten/avatar.js";
import { icoon } from "../../lib/iconen.js";
import { bevestig } from "../../componenten/dialoog.js";
import { toast } from "../../componenten/toast.js";
import { annuleerBestelling, plaatsBestelling } from "../../data/schrijven.js";
import { dranken, groepen, isZuipbeker, modus, woorden } from "../selectors.js";
import { state } from "../state.js";
import { meldFout } from "../fouten.js";

let gekozenId = null;
let mand = {}; // drank-id → aantal

export const kassa = {
  id: "kassa",
  label: () => "Kassa",
  watch: ["groepen", "kaart", "instellingen"],

  render(wortel, ctx) {
    // Verwijderde dranken of groepen opruimen
    for (const id of Object.keys(mand)) if (!state.kaart[id]) delete mand[id];
    if (gekozenId && !state.groepen[gekozenId]) {
      gekozenId = null;
      mand = {};
    }

    if (!gekozenId) return kiesGroep(wortel, ctx);
    return kiesDranken(wortel, ctx);
  },
};

function kiesGroep(wortel, ctx) {
  const w = woorden();
  const lijst = groepen();

  wortel.append(
    h("div", { class: "sectie__kop" }, h("h2", { class: "sectie__titel", tekst: `Voor ${w.welk} ${w.enkelvoud.toLowerCase()}?` })),
  );

  if (!lijst.length) {
    wortel.append(h("p", { class: "paneel paneel--leeg", tekst: `Nog geen ${w.meervoud.toLowerCase()}. Voeg ze toe in het tabblad ${w.meervoud}.` }));
    return;
  }

  wortel.append(
    h(
      "div",
      { class: "tegels" },
      lijst.map((groep) =>
        h(
          "button",
          {
            class: "tegel",
            type: "button",
            onclick: () => {
              gekozenId = groep.id;
              mand = {};
              ctx.herteken();
              window.scrollTo(0, 0);
            },
          },
          avatar(groep.foto, { naam: groep.naam, groot: true }),
          h("span", { tekst: groep.naam }),
          h("span", { class: "tegel__detail", tekst: `${getal(groep.aantal)} punten` }),
        ),
      ),
    ),
  );
}

function kiesDranken(wortel, ctx) {
  const groep = state.groepen[gekozenId];
  const w = woorden();
  const lijst = dranken();

  wortel.append(
    h(
      "div",
      { class: "gekozen-groep" },
      avatar(groep.foto, { naam: groep.naam }),
      h("p", { class: "gekozen-groep__naam", tekst: groep.naam }),
      h("button", { class: "knop knop--klein", type: "button", tekst: `Ander ${w.enkelvoud.toLowerCase()}`, onclick: () => wisselGroep(ctx) }),
    ),
  );

  if (!lijst.length) {
    wortel.append(h("p", { class: "paneel paneel--leeg", tekst: "De drankkaart is nog leeg. Vul ze aan in het tabblad Drankkaart." }));
  } else {
    wortel.append(
      h(
        "div",
        { class: "tegels" },
        lijst.map((drank) => {
          const aantal = mand[drank.id] || 0;
          const detail = bonnetjes(drank.prijs ?? 0) + (isZuipbeker() && drank.telt !== false ? ` · ${getal(drank.punten ?? 1)} pt` : "");
          return h(
            "button",
            {
              class: `tegel${aantal ? " tegel--gekozen" : ""}`,
              type: "button",
              "aria-label": `${drank.naam}, ${bonnetjes(drank.prijs ?? 0)}${aantal ? `, ${aantal} in bestelling` : ""}`,
              onclick: () => {
                mand[drank.id] = (mand[drank.id] || 0) + 1;
                ctx.herteken();
              },
            },
            h("span", { tekst: drank.naam }),
            h("span", { class: "tegel__detail", tekst: detail }),
            drank.telt === false && h("span", { class: "tegel__waarschuwing", tekst: "telt niet mee" }),
            aantal > 0 && h("span", { class: "tegel__aantal", tekst: aantal }),
          );
        }),
      ),
    );
  }

  tekenMand(ctx);
}

async function wisselGroep(ctx) {
  if (Object.keys(mand).length) {
    const ok = await bevestig({ titel: "Bestelling wissen?", tekst: "De huidige bestelling wordt gewist.", knop: "Wissen", gevaar: true });
    if (!ok) return;
  }
  gekozenId = null;
  mand = {};
  ctx.herteken();
}

function tekenMand(ctx) {
  const totaal = bestellingTotaal(mand, state.kaart, modus());
  const regels = Object.entries(mand).filter(([id]) => state.kaart[id]);
  const groep = state.groepen[gekozenId];

  const inhoud = h(
    "div",
    { class: "mand__inhoud" },
    h(
      "div",
      { class: "mand__regels" },
      regels.length
        ? regels.map(([id, aantal]) =>
            h(
              "button",
              {
                class: "regel",
                type: "button",
                "aria-label": `Eén ${state.kaart[id].naam} minder`,
                onclick: () => {
                  if (--mand[id] <= 0) delete mand[id];
                  ctx.herteken();
                },
              },
              `${aantal}× ${state.kaart[id].naam}`,
              icoon("sluit"),
            ),
          )
        : h("span", { class: "mand__leeg", tekst: "Tik op de dranken om ze toe te voegen." }),
    ),
    h(
      "div",
      { class: "mand__onder" },
      h(
        "div",
        { class: "mand__totaal" },
        h("span", { class: "mand__bedrag", tekst: getal(totaal.bonnetjes) }),
        " ",
        h("span", { class: "mand__eenheid", tekst: totaal.bonnetjes === 1 ? "bonnetje" : "bonnetjes" }),
        h("span", { class: "mand__punten", tekst: `+${getal(totaal.punten)} punten voor ${groep.naam}` }),
      ),
      h("button", {
        class: "knop knop--spook",
        type: "button",
        tekst: "Wis",
        disabled: !regels.length,
        onclick: () => {
          mand = {};
          ctx.herteken();
        },
      }),
      h("button", { class: "knop knop--primair mand__afrekenen", type: "button", tekst: "Afrekenen", disabled: !regels.length, onclick: () => afrekenen(ctx) }),
    ),
  );

  ctx.voet.toon(inhoud);
}

async function afrekenen(ctx) {
  const groepId = gekozenId;
  const groep = state.groepen[groepId];
  const totaal = bestellingTotaal(mand, state.kaart, modus());
  const items = bestellingRegels(mand, state.kaart, modus());
  if (!Object.keys(items).length) return;

  const bestelling = {
    groep: groepId,
    groepNaam: groep.naam,
    items,
    bonnetjes: totaal.bonnetjes,
    punten: totaal.punten,
    t: Date.now(),
    door: state.gebruiker?.email ?? "",
    modus: modus(),
  };

  // Meteen leegmaken zodat de volgende klant kan bestellen
  mand = {};
  gekozenId = null;
  ctx.herteken();
  window.scrollTo(0, 0);

  try {
    const sleutel = await plaatsBestelling(bestelling);
    toast(`${groep.naam}: ${bonnetjes(bestelling.bonnetjes)} · +${getal(bestelling.punten)} pt`, {
      label: "Ongedaan",
      bijKlik: () =>
        annuleerBestelling(sleutel, bestelling, state.groepen[groepId]?.aantal)
          .then(() => toast("Bestelling geannuleerd"))
          .catch((fout) => meldFout(fout, "Annuleren lukte niet")),
    });
  } catch (fout) {
    meldFout(fout, "Afrekenen lukte niet");
  }
}

/** Snel tellen: punten rechtstreeks toekennen met vaste knoppen, zonder drankkaart. */
import { APP } from "../../config.js";
import { h } from "../../lib/dom.js";
import { getal } from "../../lib/opmaak.js";
import { avatar } from "../../componenten/avatar.js";
import { bevestig } from "../../componenten/dialoog.js";
import { wijzigPunten } from "../../data/schrijven.js";
import { groepen, woorden } from "../selectors.js";
import { state } from "../state.js";
import { meldFout } from "../fouten.js";

const geschiedenis = []; // laatste tikken op dit toestel, voor "Ongedaan maken"

export const snel = {
  id: "snel",
  label: () => "Snel tellen",
  watch: ["groepen", "instellingen"],

  render(wortel, ctx) {
    const lijst = groepen();
    wortel.append(
      h("div", { class: "sectie__kop" },
        h("h2", { class: "sectie__titel", tekst: "Snel tellen" }),
        h("p", { class: "sectie__uitleg", tekst: APP.snelknoppen.map((k) => `${k.naam} = ${k.punten}`).join(" · ") }),
      ),
    );

    if (!lijst.length) {
      wortel.append(h("p", { class: "paneel paneel--leeg", tekst: `Nog geen ${woorden().meervoud.toLowerCase()}.` }));
    }

    for (const groep of lijst) {
      wortel.append(
        h(
          "section",
          { class: "paneel snel" },
          h("div", { class: "snel__kop" }, avatar(groep.foto, { naam: groep.naam }), h("span", { class: "snel__naam", tekst: groep.naam }), h("span", { class: "snel__score", tekst: getal(groep.aantal) })),
          h(
            "div",
            { class: "snel__knoppen" },
            APP.snelknoppen.map((knop) =>
              h(
                "button",
                {
                  class: `snelknop${knop.toon === "accent" ? " snelknop--accent" : ""}${knop.toon === "donker" ? " snelknop--donker" : ""}`,
                  type: "button",
                  "aria-label": `${knop.naam} voor ${groep.naam}, ${knop.punten} punten`,
                  onclick: () => ken(knop, groep, ctx),
                },
                h("span", { class: "snelknop__punten", tekst: `+${knop.punten}` }),
                knop.naam,
              ),
            ),
          ),
        ),
      );
    }

    const laatste = geschiedenis.at(-1);
    const kanTerug = Boolean(laatste && state.groepen[laatste.id]);
    wortel.append(
      h("button", {
        class: "knop knop--blok",
        type: "button",
        disabled: !kanTerug,
        tekst: kanTerug ? `Ongedaan maken: ${laatste.naam.toLowerCase()} bij ${state.groepen[laatste.id].naam} (−${laatste.punten})` : "Niets om ongedaan te maken",
        onclick: () => maakOngedaan(ctx),
      }),
    );
  },
};

async function ken(knop, groep, ctx) {
  if (knop.bevestig) {
    const ok = await bevestig({ titel: `${knop.naam} voor ${groep.naam}?`, tekst: `Dat is +${knop.punten} punten.`, knop: "Toekennen" });
    if (!ok) return;
  }
  try {
    await wijzigPunten(groep.id, knop.punten);
    geschiedenis.push({ id: groep.id, punten: knop.punten, naam: knop.naam });
    ctx.herteken();
  } catch (fout) {
    meldFout(fout);
  }
}

async function maakOngedaan(ctx) {
  const laatste = geschiedenis.pop();
  if (!laatste) return;
  const terug = Math.min(laatste.punten, Number(state.groepen[laatste.id]?.aantal) || 0);
  try {
    if (terug > 0) await wijzigPunten(laatste.id, -terug);
  } catch (fout) {
    meldFout(fout);
  }
  ctx.herteken();
}

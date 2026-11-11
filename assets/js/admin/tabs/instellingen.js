/** Instellingen: schermlink, puntentelling, algemene gegevens, logo en opnieuw beginnen. */
import { APP } from "../../config.js";
import { h } from "../../lib/dom.js";
import { cssUrl, isAfbeelding } from "../../lib/media.js";
import { icoon } from "../../lib/iconen.js";
import { verkleinAfbeelding } from "../../lib/afbeelding.js";
import { bevestig } from "../../componenten/dialoog.js";
import { segment } from "../../componenten/segment.js";
import { toast } from "../../componenten/toast.js";
import { veld } from "../../componenten/veld.js";
import { wijzigInstellingen, wisAlleBestellingen, wisLogo, zetAllePuntenOpNul, zetLogo } from "../../data/schrijven.js";
import { groepen, modus } from "../selectors.js";
import { state } from "../state.js";
import { meldFout } from "../fouten.js";

export const instellingenTab = {
  id: "instellingen",
  label: () => "Instellingen",
  watch: ["instellingen", "groepen"],
  beschermInvoer: true,

  render(wortel, ctx) {
    const instellingen = state.instellingen;
    wortel.append(
      schermLink(),
      puntentelling(),
      algemeen(instellingen),
      logo(instellingen.logo),
      opnieuwBeginnen(),
      h("p", { class: "versie", tekst: `${APP.naam} ${APP.versie}` }),
    );
  },
};

function sectie(titel, uitleg, ...inhoud) {
  return h("section", { class: "sectie" },
    h("div", { class: "sectie__kop" },
      h("h2", { class: "sectie__titel", tekst: titel }),
      uitleg && h("p", { class: "sectie__uitleg", tekst: uitleg }),
    ),
    ...inhoud,
  );
}

function schermLink() {
  const link = location.origin + location.pathname.replace(/admin\.html$/, "");
  return sectie("Beamerscherm", "Open deze link op de laptop die aan de beamer hangt.",
    h("div", { class: "paneel link-veld" },
      h("input", { class: "invoer", type: "text", readonly: true, value: link, "aria-label": "Link naar het beamerscherm", onclick: (e) => e.target.select() }),
      h("div", { class: "rij" },
        h("button", {
          class: "knop knop--klein",
          type: "button",
          onclick: () => navigator.clipboard?.writeText(link).then(() => toast("Link gekopieerd")),
        }, icoon("kopieer"), "Kopieer link"),
        h("a", { class: "knop knop--klein", href: link, target: "_blank", rel: "noopener" }, icoon("scherm"), "Open scherm"),
      ),
    ),
  );
}

function puntentelling() {
  return sectie("Hoe tellen de punten?", "Wisselen geldt voor nieuwe bestellingen; punten die al gegeven zijn blijven staan. De punten per drank stel je in bij Drankkaart.",
    segment({
      waarde: modus(),
      opties: [
        { waarde: "bonnetjes", label: "Bonnetjes", uitleg: "punten = bonnetjes" },
        { waarde: "zuipbeker", label: "Zuipbeker", uitleg: "eigen punten per drank" },
      ],
      bijKeuze: (waarde) => wijzigInstellingen({ modus: waarde }).then(() => toast(`Modus: ${waarde === "zuipbeker" ? "Zuipbeker" : "Bonnetjes"}`)).catch(meldFout),
    }),
  );
}

function algemeen(instellingen) {
  const naam = h("input", { class: "invoer", type: "text", maxlength: 60, value: instellingen.naam ?? "" });
  naam.addEventListener("change", () => wijzigInstellingen({ naam: naam.value.trim() }).catch(meldFout));

  const titel = h("input", { class: "invoer", type: "text", maxlength: 40, value: instellingen.titel ?? "Klassement" });
  titel.addEventListener("change", () => wijzigInstellingen({ titel: titel.value.trim() }).catch(meldFout));

  const woord = h("select", { class: "keuze" },
    Object.entries(APP.woorden).map(([sleutel, w]) =>
      h("option", { value: sleutel, selected: (instellingen.woord || "groep") === sleutel, tekst: `${w.enkelvoud} / ${w.meervoud}` }),
    ),
  );
  woord.addEventListener("change", () => wijzigInstellingen({ woord: woord.value }).catch(meldFout));

  return sectie("Algemeen", null,
    h("div", { class: "paneel formulier" },
      veld("Naam van het evenement", naam, "Verschijnt boven de titel op de beamer en bovenaan deze pagina."),
      veld("Titel op het scherm", titel),
      veld("Wie strijdt er?", woord),
    ),
  );
}

function logo(bron) {
  const gevuld = isAfbeelding(bron);
  const kiezer = h("input", { type: "file", accept: "image/*", hidden: true });
  kiezer.addEventListener("change", async () => {
    const bestand = kiezer.files?.[0];
    kiezer.value = "";
    if (!bestand) return;
    try {
      toast("Logo opslaan…");
      await zetLogo(await verkleinAfbeelding(bestand, { max: 800, maxTekens: 1_200_000 }));
      toast("Logo opgeslagen");
    } catch (fout) {
      meldFout(fout, "Logo opslaan lukte niet");
    }
  });

  return sectie("Logo", "Verschijnt links bovenaan op de beamer. Een PNG met transparante achtergrond oogt het best.",
    h("div", { class: "paneel stapel" },
      h("div", { class: `logo-voorbeeld${gevuld ? "" : " logo-voorbeeld--leeg"}`, vars: gevuld ? { "--logo": cssUrl(bron) } : {}, role: "img", "aria-label": gevuld ? "Huidig logo" : "Nog geen logo" }),
      h("div", { class: "rij" },
        kiezer,
        h("button", { class: "knop knop--klein", type: "button", onclick: () => kiezer.click() }, icoon("afbeelding"), gevuld ? "Ander logo" : "Logo kiezen"),
        gevuld && h("button", { class: "knop knop--klein knop--spook", type: "button", tekst: "Logo weg", onclick: () => wisLogo().catch(meldFout) }),
      ),
    ),
  );
}

function opnieuwBeginnen() {
  const actie = (label, vraag, uitvoeren, klaar) =>
    h("button", {
      class: "knop knop--gevaar knop--blok",
      type: "button",
      tekst: label,
      onclick: async () => {
        if (!(await bevestig({ ...vraag, knop: label, gevaar: true }))) return;
        try {
          await uitvoeren();
          toast(klaar);
        } catch (fout) {
          meldFout(fout);
        }
      },
    });

  return sectie("Opnieuw beginnen", null,
    h("div", { class: "paneel stapel" },
      actie("Alle punten op 0 zetten",
        { titel: "Alle punten op 0 zetten?", tekst: "De bestellingen blijven in de lijst staan." },
        () => zetAllePuntenOpNul(groepen().map((g) => g.id)), "Punten op 0"),
      actie("Alle bestellingen wissen",
        { titel: "Alle bestellingen wissen?", tekst: "Exporteer ze eerst als je ze wil bewaren. Dit kan niet ongedaan gemaakt worden." },
        wisAlleBestellingen, "Bestellingen gewist"),
    ),
  );
}

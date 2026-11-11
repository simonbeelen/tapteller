/** Groepen beheren: toevoegen, hernoemen, foto, gif en verwijderen. */
import { APP } from "../../config.js";
import { h } from "../../lib/dom.js";
import { getal } from "../../lib/opmaak.js";
import { isGif } from "../../lib/media.js";
import { icoon } from "../../lib/iconen.js";
import { leesBestandAlsDataUrl, verkleinAfbeelding } from "../../lib/afbeelding.js";
import { avatar } from "../../componenten/avatar.js";
import { bevestig } from "../../componenten/dialoog.js";
import { toast } from "../../componenten/toast.js";
import { hernoemGroep, maakGroep, verwijderGroep, wisGif, wisGroepFoto, zetGif, zetGroepFoto } from "../../data/schrijven.js";
import { groepen, woorden } from "../selectors.js";
import { state } from "../state.js";
import { meldFout } from "../fouten.js";

export const groepenTab = {
  id: "groepen",
  label: () => woorden().meervoud,
  watch: ["groepen", "gifs", "instellingen"],
  beschermInvoer: true,

  render(wortel, ctx) {
    const w = woorden();
    const naamVeld = h("input", { class: "invoer", id: "nieuwe-groep", type: "text", maxlength: 40, autocomplete: "off", placeholder: `Naam van ${w.lidwoord} ${w.enkelvoud.toLowerCase()}`, "aria-label": `Naam van ${w.lidwoord} ${w.enkelvoud.toLowerCase()}` });

    const toevoegen = async () => {
      const naam = naamVeld.value.trim();
      if (!naam) return naamVeld.focus();
      try {
        await maakGroep(naam);
        naamVeld.value = "";
        ctx.herteken();
      } catch (fout) {
        meldFout(fout);
      }
    };
    naamVeld.addEventListener("keydown", (e) => e.key === "Enter" && toevoegen());

    wortel.append(
      h("section", { class: "sectie" },
        h("div", { class: "sectie__kop" }, h("h2", { class: "sectie__titel", tekst: w.meervoud })),
        h("div", { class: "rij" }, naamVeld, h("button", { class: "knop knop--primair", type: "button", tekst: "Toevoegen", onclick: toevoegen })),
      ),
    );

    const lijst = groepen();
    if (!lijst.length) {
      wortel.append(h("p", { class: "paneel paneel--leeg", tekst: `Nog geen ${w.meervoud.toLowerCase()}.` }));
    }
    for (const groep of lijst) wortel.append(groepKaart(groep, ctx));

    wortel.append(h("p", { class: "notitie sectie", tekst: "De gif verschijnt groot op de beamer telkens als de groep punten krijgt." }));
  },
};

// Welke kaarten staan uitgeklapt? Blijft behouden als de lijst opnieuw getekend wordt.
const uitgeklapt = new Set();

function groepKaart(groep, ctx) {
  const naam = h("input", { class: "invoer", type: "text", maxlength: 40, value: groep.naam, "aria-label": `Naam van ${groep.naam}` });
  naam.addEventListener("change", () => {
    const nieuw = naam.value.trim();
    if (nieuw && nieuw !== groep.naam) hernoemGroep(groep.id, nieuw).catch(meldFout);
  });

  const gif = state.gifs[groep.id];
  const gifLink = h("input", { class: "invoer", type: "url", placeholder: "of plak een gif-link (https://…)", "aria-label": `Gif-link voor ${groep.naam}` });

  const meer = h(
    "details",
    { class: "groep__meer", open: uitgeklapt.has(groep.id) },
    h("summary", { tekst: "Foto en gif" }),
    h(
      "div",
      { class: "groep__meer-inhoud" },
      h("div", { class: "groep__media" },
        bestandKnop({ label: groep.foto ? "Andere foto" : "Foto kiezen", accept: "image/*", bijBestand: (bestand) => uploadFoto(groep, bestand, ctx) }),
        groep.foto && h("button", { class: "knop knop--klein knop--spook", type: "button", tekst: "Foto weg", onclick: () => wisGroepFoto(groep.id).catch(meldFout) }),
      ),
      h("div", { class: "groep__media" },
        isGif(gif) ? h("img", { class: "gifje", src: gif, alt: `Gif van ${groep.naam}` }) : h("div", { class: "gifje gifje--leeg", tekst: "GIF" }),
        bestandKnop({ label: gif ? "Andere gif" : "Gif kiezen", accept: "image/gif", bijBestand: (bestand) => uploadGif(groep, bestand) }),
        gif && h("button", { class: "knop knop--klein knop--spook", type: "button", tekst: "Gif weg", onclick: () => wisGif(groep.id).catch(meldFout) }),
      ),
      h("div", { class: "rij" },
        gifLink,
        h("button", {
          class: "knop knop--klein",
          type: "button",
          onclick: () => {
            const bron = gifLink.value.trim();
            if (!bron.startsWith("https://")) return toast("Een gif-link moet beginnen met https://");
            zetGif(groep.id, bron).then(() => { gifLink.value = ""; ctx.herteken(); }).catch(meldFout);
          },
        }, icoon("link"), "Opslaan"),
      ),
      h("div", { class: "rij" },
        h("button", { class: "knop knop--klein knop--gevaar", type: "button", onclick: () => verwijder(groep) }, icoon("prullenbak"), `${woorden().enkelvoud} verwijderen`),
      ),
    ),
  );
  meer.addEventListener("toggle", () => (meer.open ? uitgeklapt.add(groep.id) : uitgeklapt.delete(groep.id)));

  return h(
    "section",
    { class: "paneel groep" },
    h("div", { class: "groep__kop" }, avatar(groep.foto, { naam: groep.naam }), naam, h("strong", { class: "score", tekst: `${getal(groep.aantal)} pt` })),
    meer,
  );
}

/** Knop die een verborgen bestandskiezer opent. */
function bestandKnop({ label, accept, bijBestand }) {
  const kiezer = h("input", { type: "file", accept, hidden: true });
  kiezer.addEventListener("change", () => {
    const bestand = kiezer.files?.[0];
    kiezer.value = "";
    if (bestand) bijBestand(bestand);
  });
  return h("span", {}, kiezer, h("button", { class: "knop knop--klein", type: "button", tekst: label, onclick: () => kiezer.click() }));
}

async function uploadFoto(groep, bestand, ctx) {
  try {
    toast("Foto opslaan…");
    await zetGroepFoto(groep.id, await verkleinAfbeelding(bestand));
    toast("Foto opgeslagen");
    ctx.herteken();
  } catch (fout) {
    meldFout(fout, "Foto opslaan lukte niet");
  }
}

async function uploadGif(groep, bestand) {
  if (bestand.type !== "image/gif") return toast("Kies een .gif-bestand.");
  if (bestand.size > APP.maxGifBytes) return toast("Deze gif is groter dan 2 MB. Kies een kleinere of plak een gif-link.");
  try {
    await zetGif(groep.id, await leesBestandAlsDataUrl(bestand));
    toast("Gif opgeslagen");
  } catch (fout) {
    meldFout(fout, "Gif opslaan lukte niet");
  }
}

async function verwijder(groep) {
  const ok = await bevestig({
    titel: `‘${groep.naam}’ verwijderen?`,
    tekst: "De punten van deze groep verdwijnen van het scherm.",
    knop: "Verwijderen",
    gevaar: true,
  });
  if (ok) verwijderGroep(groep.id).catch(meldFout);
}

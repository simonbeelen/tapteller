/** Opstartpunt van de beamer-weergave (index.html). */
import { APP } from "../config.js";
import { PAD } from "../data/paden.js";
import { isGif } from "../lib/media.js";
import { getal } from "../lib/opmaak.js";
import { rangschik } from "../lib/puntentelling.js";
import { maakGrafiek } from "./grafiek.js";
import { maakGifSpeler } from "./gif-speler.js";
import { maakKop } from "./kop.js";
import { startKlok } from "./klok.js";
import { startInactiviteit } from "./inactief.js";

const el = (id) => document.getElementById(id);

const kop = maakKop({ titel: el("titel"), evenement: el("evenement"), logo: el("logo"), totaal: el("totaal") });
const gifSpeler = maakGifSpeler(el("gif"), { duurMs: APP.gifDuurMs });

let gifs = {};

const grafiek = maakGrafiek(el("grafiek"), {
  bijScore({ id, naam, plus }) {
    const bron = gifs[id];
    if (isGif(bron)) gifSpeler.speel({ src: bron, naam, plus: getal(plus) });
  },
});

startKlok(el("klok"));
startInactiviteit(document.body, { naMs: APP.inactiefNaMs });

el("volScherm").addEventListener("click", () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.().catch(() => {});
});

async function start() {
  let luister;
  try {
    ({ luister } = await import("../data/lezen.js"));
  } catch {
    grafiek.toonMelding("Geen verbinding met de database. Controleer het internet en herlaad de pagina.");
    return;
  }

  luister(PAD.titel, (v) => kop.zetTitel(v));
  luister(PAD.naam, (v) => kop.zetNaam(v));
  luister(PAD.logo, (v) => kop.zetLogo(v));
  luister(PAD.gifs, (v) => { gifs = v ?? {}; });
  luister(
    PAD.groepen,
    (groepen) => {
      kop.zetTotaal(rangschik(groepen).reduce((som, g) => som + g.aantal, 0));
      grafiek.teken(groepen);
    },
    () => grafiek.toonMelding("Geen toegang tot de gegevens. Zijn de databaseregels gepubliceerd?"),
  );
}

start();

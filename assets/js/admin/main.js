/** Opstartpunt van de beheer-app (admin.html). */
import { APP } from "../config.js";
import { h } from "../lib/dom.js";
import { icoon } from "../lib/iconen.js";
import { abonneer, state, zet } from "./state.js";
import { meldFout } from "./fouten.js";

const el = (id) => document.getElementById(id);
const weergaven = { laden: el("weergave-laden"), inloggen: el("weergave-inloggen"), app: el("weergave-app") };

function toon(naam) {
  for (const [sleutel, element] of Object.entries(weergaven)) element.hidden = sleutel !== naam;
}

function toonLaadFout(tekst) {
  weergaven.laden.textContent = tekst;
  toon("laden");
}

el("uitloggen").append(icoon("uitloggen"));

async function start() {
  let sessie, luisteraars, shell;
  try {
    [sessie, luisteraars, shell] = await Promise.all([
      import("./sessie.js"),
      import("./luisteraars.js"),
      import("./shell.js"),
    ]);
  } catch (fout) {
    console.error(fout);
    return toonLaadFout("Kan de verbinding met Firebase niet opzetten. Controleer het internet en herlaad de pagina.");
  }

  const fout = el("inlogfout");
  let stopLuisteraars = null;

  const stop = () => {
    stopLuisteraars?.();
    stopLuisteraars = null;
  };

  // Titel en naam bovenaan volgen de instellingen
  abonneer((sleutels) => {
    if (!sleutels.includes("instellingen")) return;
    const naam = state.instellingen.naam || APP.naam;
    el("evenementnaam").textContent = naam;
    document.title = `${naam} – beheer`;
  });

  el("inlogformulier").addEventListener("submit", async (gebeurtenis) => {
    gebeurtenis.preventDefault();
    fout.hidden = true;
    const knop = gebeurtenis.submitter;
    knop.disabled = true;
    try {
      await sessie.inloggen(el("email").value.trim(), el("wachtwoord").value);
    } catch (e) {
      fout.textContent = sessie.inlogFout(e);
      fout.hidden = false;
    } finally {
      knop.disabled = false;
    }
  });

  el("uitloggen").addEventListener("click", () => sessie.uitloggen());

  sessie.volgSessie({
    bijUitgelogd() {
      stop();
      zet({ gebruiker: null });
      toon("inloggen");
    },

    bijGeenBeheerder(gebruiker) {
      stop();
      fout.replaceChildren(
        "Dit account is nog geen beheerder. Voeg onderstaande code toe onder ‘admins’ in de database (waarde: true).",
        h("code", { class: "inloggen__code", tekst: gebruiker.uid }),
        h("button", { class: "tekstknop", type: "button", tekst: "Uitloggen", onclick: () => sessie.uitloggen() }),
      );
      fout.hidden = false;
      toon("inloggen");
    },

    bijBeheerder(gebruiker) {
      stop();
      fout.hidden = true;
      zet({ gebruiker });
      stopLuisteraars = luisteraars.startLuisteraars((e) => meldFout(e, "Verbinding verbroken"));
      shell.startShell();
      toon("app");
    },
  });
}

start();

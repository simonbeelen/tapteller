/**
 * Staafgrafiek (geluidsmeter) op de beamer.
 * Kolommen blijven bestaan tussen updates: de volgorde wordt met CSS (`order`) bepaald,
 * zodat balken vanzelf mee-animeren en kolommen zachtjes van plaats wisselen.
 */
import { h, leeg } from "../lib/dom.js";
import { aandeel, rangschik } from "../lib/puntentelling.js";
import { getal } from "../lib/opmaak.js";
import { cssUrl, isAfbeelding } from "../lib/media.js";

const WISSEL_MS = 650;

export function maakGrafiek(wortel, { bijScore }) {
  const kolommen = new Map();
  let vorigeScores = null;

  function maakKolom(id) {
    const waarde = h("span", { class: "kolom__waarde" });
    const foto = h("div", { class: "kolom__foto" });
    const top = h("div", { class: "kolom__top" }, waarde, foto);
    const balk = h("div", { class: "kolom__balk" });
    const rang = h("span", { class: "kolom__rang" });
    const naam = h("span", { class: "kolom__naam" });
    const kolom = h(
      "div",
      { class: "kolom", role: "listitem", data: { id } },
      h("div", { class: "kolom__plot" }, balk, top),
      h("div", { class: "kolom__label" }, rang, naam),
    );
    const onderdelen = { kolom, waarde, foto, balk, rang, naam, links: null, rangNummer: null };
    wortel.append(kolom);
    kolommen.set(id, onderdelen);
    return onderdelen;
  }

  function toonMelding(tekst) {
    kolommen.clear();
    vorigeScores = null;
    leeg(wortel).append(h("p", { class: "grafiek__melding", tekst }));
  }

  function teken(groepen) {
    const lijst = rangschik(groepen);

    if (!lijst.length) {
      toonMelding("Nog geen groepen. Voeg ze toe via de adminpagina.");
      return;
    }
    wortel.querySelector(".grafiek__melding")?.remove();

    const hoogste = Math.max(...lijst.map((g) => g.aantal));
    const scherm = wortel.closest(".scherm");
    scherm?.classList.toggle("scherm--zonder-foto", !lijst.some((g) => isAfbeelding(g.foto)));

    // Posities vóór de herordening, voor de wisselanimatie
    for (const onderdelen of kolommen.values()) onderdelen.links = onderdelen.kolom.getBoundingClientRect().left;

    const nieuweScores = new Map();
    const scoreMomenten = [];
    const tePlaatsen = [];

    lijst.forEach((groep, index) => {
      const bestond = kolommen.has(groep.id);
      const o = kolommen.get(groep.id) ?? maakKolom(groep.id);
      const rang = index + 1;
      const isLeider = index === 0 && groep.aantal > 0;

      o.kolom.classList.toggle("kolom--leider", isLeider);
      o.kolom.setAttribute("aria-label", `${groep.naam}: ${getal(groep.aantal)} punten, plaats ${rang}`);
      o.waarde.textContent = getal(groep.aantal);
      o.rang.textContent = `#${rang}`;
      o.naam.textContent = groep.naam;

      const heeftFoto = isAfbeelding(groep.foto);
      o.foto.hidden = !heeftFoto;
      if (heeftFoto) o.foto.style.setProperty("--foto", cssUrl(groep.foto));

      const wijziging = o.rangNummer !== null && o.rangNummer !== rang;
      o.rangNummer = rang;
      o.kolom.style.setProperty("--rang", rang);

      const waarde = aandeel(groep.aantal, hoogste);
      if (bestond) o.kolom.style.setProperty("--aandeel", waarde);
      else tePlaatsen.push([o.kolom, waarde]); // nieuwe kolom: eerst op 0 laten staan zodat hij omhoog groeit

      const vorige = vorigeScores?.get(groep.id);
      if (vorige !== undefined && groep.aantal > vorige) {
        scoreMomenten.push({ id: groep.id, naam: groep.naam, plus: groep.aantal - vorige, balk: o.balk });
      }
      nieuweScores.set(groep.id, groep.aantal);
      o.wisselt = wijziging;
    });

    // Groepen die verdwenen zijn
    for (const [id, o] of kolommen) {
      if (!nieuweScores.has(id)) {
        o.kolom.remove();
        kolommen.delete(id);
      }
    }

    requestAnimationFrame(() => {
      for (const [kolom, waarde] of tePlaatsen) kolom.style.setProperty("--aandeel", waarde);
    });

    // Zachte wissel van plaats (FLIP): van oude naar nieuwe positie
    for (const o of kolommen.values()) {
      if (!o.wisselt || o.links == null) continue;
      const verschil = o.links - o.kolom.getBoundingClientRect().left;
      if (Math.abs(verschil) > 1 && o.kolom.animate) {
        o.kolom.animate([{ transform: `translateX(${verschil}px)` }, { transform: "none" }], {
          duration: WISSEL_MS,
          easing: "cubic-bezier(0.22, 0.8, 0.24, 1)",
        });
      }
    }

    // Korte flits op de balk die punten kreeg
    for (const moment of scoreMomenten) {
      moment.balk.animate?.([{ filter: "brightness(1.7)" }, { filter: "none" }], { duration: 1000, easing: "ease-out" });
      bijScore(moment);
    }

    vorigeScores = nieuweScores;
  }

  return { teken, toonMelding };
}

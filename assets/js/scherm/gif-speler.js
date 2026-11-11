/** Toont gifs groot op de beamer, één voor één. Te veel tegelijk? Dan vallen de oudste af. */

const MAX_WACHTRIJ = 4;
const UITFADEN_MS = 300;

export function maakGifSpeler(wortel, { duurMs }) {
  const naam = wortel.querySelector(".gif__naam");
  const punten = wortel.querySelector(".gif__punten");
  const wachtrij = [];
  let bezig = false;

  function volgende() {
    const item = wachtrij.shift();
    if (!item) {
      bezig = false;
      wortel.hidden = true;
      return;
    }
    bezig = true;

    // Een nieuw element laat de gif altijd vanaf het begin starten
    const oud = wortel.querySelector(".gif__beeld");
    const nieuw = oud.cloneNode();
    nieuw.src = item.src;
    nieuw.alt = `Gif van ${item.naam}`;
    oud.replaceWith(nieuw);

    naam.textContent = item.naam;
    punten.textContent = `+${item.plus}`;

    // Klassen eerst weghalen en een reflow forceren, zodat de intro-animatie telkens opnieuw start
    wortel.classList.remove("gif--binnen", "gif--uit");
    wortel.hidden = false;
    void wortel.offsetWidth;
    wortel.classList.add("gif--binnen");

    setTimeout(() => {
      wortel.classList.replace("gif--binnen", "gif--uit");
      setTimeout(volgende, UITFADEN_MS);
    }, duurMs);
  }

  function speel(item) {
    wachtrij.push(item);
    if (wachtrij.length > MAX_WACHTRIJ) wachtrij.splice(0, wachtrij.length - MAX_WACHTRIJ);
    if (!bezig) volgende();
  }

  return { speel };
}

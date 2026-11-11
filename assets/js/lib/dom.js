/**
 * Kleine hulpfuncties om DOM-elementen te bouwen, zonder HTML-strings en zonder inline stijlen.
 *
 * h("button", { class: "knop", onclick: fn, "aria-label": "Sluit" }, "Tekst", ander element)
 *
 * Speciale eigenschappen:
 *   class, tekst, value, checked, data ({ sleutel: waarde }), vars ({ "--naam": waarde }),
 *   on<gebeurtenis> (functie). Al het andere wordt als attribuut gezet.
 * Stijl zet je via CSS-klassen; dynamische waarden geef je door als CSS-variabele met `vars`.
 */
export function h(tag, props = {}, ...kinderen) {
  const element = document.createElement(tag);

  for (const [sleutel, waarde] of Object.entries(props ?? {})) {
    if (waarde == null || waarde === false) continue;

    if (sleutel === "class") element.className = waarde;
    else if (sleutel === "tekst") element.textContent = waarde;
    else if (sleutel === "value") element.value = waarde;
    else if (sleutel === "checked") element.checked = Boolean(waarde);
    else if (sleutel === "data") Object.assign(element.dataset, waarde);
    else if (sleutel === "vars") {
      for (const [naam, w] of Object.entries(waarde)) element.style.setProperty(naam, w);
    } else if (sleutel.startsWith("on") && typeof waarde === "function") {
      element.addEventListener(sleutel.slice(2), waarde);
    } else element.setAttribute(sleutel, waarde === true ? "" : waarde);
  }

  voegToe(element, kinderen);
  return element;
}

function voegToe(ouder, kinderen) {
  for (const kind of kinderen) {
    if (kind == null || kind === false) continue;
    if (Array.isArray(kind)) voegToe(ouder, kind);
    else ouder.append(kind);
  }
}

export const $ = (selector, wortel = document) => wortel.querySelector(selector);

/** Maakt een element leeg en geeft het terug. */
export function leeg(element) {
  element.replaceChildren();
  return element;
}

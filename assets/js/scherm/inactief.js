/** Verbergt cursor en knoppen op de beamer wanneer er een tijd niets beweegt. */
export function startInactiviteit(element, { naMs }) {
  let timer;

  const actief = () => {
    element.classList.remove("scherm--inactief");
    clearTimeout(timer);
    timer = setTimeout(() => element.classList.add("scherm--inactief"), naMs);
  };

  for (const gebeurtenis of ["mousemove", "keydown", "touchstart", "pointerdown"]) {
    window.addEventListener(gebeurtenis, actief, { passive: true });
  }
  actief();
}

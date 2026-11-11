import { klok } from "../lib/opmaak.js";

/** Houdt een <time>-element bij op de huidige tijd. */
export function startKlok(element) {
  const verfris = () => {
    const nu = new Date();
    element.textContent = klok(nu);
    element.dateTime = nu.toISOString();
  };
  verfris();
  setInterval(verfris, 15_000);
}

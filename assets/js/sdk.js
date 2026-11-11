/**
 * Enige plek waar de Firebase-versie staat. Wil je upgraden? Pas VERSIE aan en test.
 * De modules worden pas geladen wanneer ze nodig zijn: het beamerscherm laadt zo geen inlog-code.
 */
const VERSIE = "10.12.2";
const BASIS = `https://www.gstatic.com/firebasejs/${VERSIE}`;

/** @param {"app"|"database"|"auth"} naam */
export const laadSdk = (naam) => import(`${BASIS}/firebase-${naam}.js`);

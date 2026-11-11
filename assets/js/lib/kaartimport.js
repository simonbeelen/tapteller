/** Leest een geplakte lijst (uit Excel of getypt) en maakt er dranken van. */

const naarGetal = (tekst) => Math.max(0, Number(String(tekst ?? "").replace(",", ".")) || 0);

/**
 * Regelformaat: naam;bonnetjes[;punten]. Scheiding met ; of tab.
 * @param {string} tekst
 * @param {{ zuipbeker: boolean, startVolgorde: number }} opties
 */
export function leesKaartLijst(tekst, { zuipbeker, startVolgorde = 0 }) {
  const dranken = [];

  for (const regel of String(tekst).split(/\r?\n/)) {
    const delen = regel.split(/[;\t]/).map((d) => d.trim());
    if (!delen[0]) continue;

    const prijs = delen[1] ? naarGetal(delen[1]) : 1;
    const punten = delen[2] ? naarGetal(delen[2]) : zuipbeker ? 1 : prijs;

    dranken.push({
      naam: delen[0].slice(0, 40),
      prijs,
      punten,
      telt: zuipbeker ? punten > 0 : true,
      v: startVolgorde + dranken.length,
    });
  }

  return dranken;
}

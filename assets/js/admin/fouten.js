import { toast } from "../componenten/toast.js";

/** Vertaalt een Firebase-fout naar een begrijpelijke melding. */
export function foutTekst(fout) {
  const code = String(fout?.code ?? fout?.message ?? "");
  if (/permission/i.test(code)) return "Geen toestemming. Ben je beheerder en zijn de databaseregels gepubliceerd?";
  if (/network|offline|unavailable/i.test(code)) return "Geen verbinding. Probeer het zo opnieuw.";
  return fout?.message || "Er ging iets mis.";
}

export function meldFout(fout, voorvoegsel = "Opslaan lukte niet") {
  console.error(fout);
  toast(`${voorvoegsel}. ${foutTekst(fout)}`);
}

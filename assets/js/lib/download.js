/** Laat de browser een tekstbestand downloaden. */
export function downloadTekst(bestandsnaam, inhoud, type = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([inhoud], { type }));
  const link = Object.assign(document.createElement("a"), { href: url, download: bestandsnaam });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

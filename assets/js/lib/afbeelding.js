/** Afbeeldingen voorbereiden in de browser. */

/**
 * Verkleint een afbeelding en geeft een data-URL terug.
 * PNG behoudt transparantie; wordt het resultaat te groot, dan valt het terug op JPEG met witte achtergrond.
 */
export function verkleinAfbeelding(bestand, { max = 320, maxTekens = 350_000 } = {}) {
  return new Promise((klaar, mislukt) => {
    const url = URL.createObjectURL(bestand);
    const beeld = new Image();

    beeld.onload = () => {
      URL.revokeObjectURL(url);
      const schaal = Math.min(1, max / Math.max(beeld.width, beeld.height));
      const breedte = Math.round(beeld.width * schaal);
      const hoogte = Math.round(beeld.height * schaal);

      const doek = document.createElement("canvas");
      doek.width = breedte;
      doek.height = hoogte;
      doek.getContext("2d").drawImage(beeld, 0, 0, breedte, hoogte);

      let data = doek.toDataURL("image/png");
      if (data.length > maxTekens) {
        const wit = document.createElement("canvas");
        wit.width = breedte;
        wit.height = hoogte;
        const context = wit.getContext("2d");
        context.fillStyle = "#fff";
        context.fillRect(0, 0, breedte, hoogte);
        context.drawImage(doek, 0, 0);
        data = wit.toDataURL("image/jpeg", 0.85);
      }
      klaar(data);
    };

    beeld.onerror = () => {
      URL.revokeObjectURL(url);
      mislukt(new Error("Deze afbeelding kan niet gelezen worden."));
    };

    beeld.src = url;
  });
}

/** Leest een gif ongewijzigd in (verkleinen zou de animatie stoppen). */
export function leesBestandAlsDataUrl(bestand) {
  return new Promise((klaar, mislukt) => {
    const lezer = new FileReader();
    lezer.onload = () => klaar(lezer.result);
    lezer.onerror = () => mislukt(new Error("Dit bestand kan niet gelezen worden."));
    lezer.readAsDataURL(bestand);
  });
}

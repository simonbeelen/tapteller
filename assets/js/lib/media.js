/** Controles op afbeeldingen uit de database. Alles wat niet klopt wordt genegeerd. */

export const isAfbeelding = (bron) => typeof bron === "string" && bron.startsWith("data:image/");

export const isGif = (bron) =>
  typeof bron === "string" && (bron.startsWith("data:image/gif") || bron.startsWith("https://"));

/** Maakt van een bron een veilige CSS-waarde: url("…"). */
export const cssUrl = (bron) => `url("${String(bron).replace(/["\\\n\r]/g, "")}")`;

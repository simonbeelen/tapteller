/** Alle paden in de Realtime Database. Nergens anders in de code staan pad-strings. */
export const PAD = {
  instellingen: "instellingen",
  titel: "instellingen/titel",
  naam: "instellingen/naam",
  logo: "instellingen/logo",

  groepen: "groepen",
  groep: (id) => `groepen/${id}`,
  groepFoto: (id) => `groepen/${id}/foto`,
  aantal: (id) => `groepen/${id}/aantal`,

  gifs: "gifs",
  gif: (id) => `gifs/${id}`,

  kaart: "kaart",
  drank: (id) => `kaart/${id}`,

  bestellingen: "bestellingen",
  bestelling: (id) => `bestellingen/${id}`,

  admin: (uid) => `admins/${uid}`,
};

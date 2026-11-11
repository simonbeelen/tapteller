/**
 * Centrale configuratie. Alles wat je per project of evenement wil aanpassen staat hier.
 * De Firebase-sleutels mogen publiek staan: de beveiliging zit in database.rules.json.
 */

export const firebaseConfig = {
  apiKey: "AIzaSyD-pc37_OY7wFhasrysx4DmsQ11XOY0Czc",
  authDomain: "tapteller-6d209.firebaseapp.com",
  databaseURL: "https://tapteller-6d209-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tapteller-6d209",
  storageBucket: "tapteller-6d209.firebasestorage.app",
  messagingSenderId: "586666669689",
  appId: "1:586666669689:web:ae27283111f47dbe7c46a8",
};

export const APP = {
  naam: "Tapteller",
  versie: "3.0.0",

  /** Hoelang een gif op de beamer blijft staan (ms). */
  gifDuurMs: 3500,
  /** Grootste toegelaten gif-bestand. */
  maxGifBytes: 2 * 1024 * 1024,
  /** Na zoveel ms zonder beweging verdwijnen cursor en knoppen op de beamer. */
  inactiefNaMs: 4000,

  /**
   * Knoppen van het tabblad "Snel tellen".
   * toon: neutraal | accent | donker. bevestig: vraagt eerst een bevestiging.
   */
  snelknoppen: [
    { id: "consumptie", naam: "Consumptie", punten: 1, toon: "neutraal" },
    { id: "streekbier", naam: "Streekbier", punten: 2, toon: "accent" },
    { id: "vat", naam: "Vat 20 L", punten: 75, toon: "donker", bevestig: true },
  ],

  /** Keuzes voor "Wie strijdt er?". welk en lidwoord zijn nodig voor correcte zinnen ("Voor welk team?", "Naam van het team"). */
  woorden: {
    groep: { enkelvoud: "Groep", meervoud: "Groepen", welk: "welke", lidwoord: "de" },
    team: { enkelvoud: "Team", meervoud: "Teams", welk: "welk", lidwoord: "het" },
    ploeg: { enkelvoud: "Ploeg", meervoud: "Ploegen", welk: "welke", lidwoord: "de" },
    jeugdbeweging: { enkelvoud: "Jeugdbeweging", meervoud: "Jeugdbewegingen", welk: "welke", lidwoord: "de" },
  },
};

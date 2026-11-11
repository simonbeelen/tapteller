/**
 * Register van alle tabbladen. Een nieuw tabblad toevoegen = een bestand in deze map maken
 * en het hier in de lijst zetten. De volgorde hieronder is de volgorde in de navigatie.
 *
 * Een tabblad is een object:
 *   id              unieke naam, ook gebruikt in de URL (admin.html#id)
 *   label()         tekst in de navigatie
 *   watch           welke delen van de state een nieuwe weergave veroorzaken
 *   beschermInvoer  (optioneel) niet hertekenen terwijl de gebruiker typt
 *   render(wortel, ctx)  bouwt de inhoud; ctx.herteken() tekent opnieuw, ctx.voet is de balk onderaan
 */
import { kassa } from "./kassa.js";
import { snel } from "./snel.js";
import { bestellingenTab } from "./bestellingen.js";
import { groepenTab } from "./groepen.js";
import { kaartTab } from "./kaart.js";
import { instellingenTab } from "./instellingen.js";

export const TABS = [kassa, snel, bestellingenTab, groepenTab, kaartTab, instellingenTab];

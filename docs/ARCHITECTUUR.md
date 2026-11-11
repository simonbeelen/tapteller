# Architectuur

Tapteller is een statische website (geen buildstap): ES-modules, gewone CSS en Firebase als database.
GitHub Pages host de bestanden; Firebase bewaart de gegevens en regelt het inloggen.

## Mappen

```
index.html               beamer-weergave
admin.html               beheer-app (kassa, tabbladen)
manifest.webmanifest     maakt "zet op beginscherm" mogelijk
database.rules.json      beveiliging van de database (plakken in Firebase)

assets/
  css/
    kern/                variabelen (tokens), lettertypes, basis
    componenten/         herbruikbare onderdelen: knoppen, formulieren, panelen, dialoog, ...
    paginas/             opmaak per pagina of tabblad
    scherm.css           bundelt alles voor index.html
    admin.css            bundelt alles voor admin.html
  fonts/                 Archivo (variabel), lokaal gehost
  img/                   logo en pictogrammen
  js/
    config.js            Firebase-gegevens + alle instelbare waarden
    sdk.js               enige plek met de Firebase-versie
    firebase/            initialisatie van app, database en auth
    data/                alle toegang tot de database
    lib/                 zuivere hulpfuncties (puntentelling, csv, opmaak, ...)
    componenten/         herbruikbare UI (dialoog, toast, avatar, ...)
    scherm/              de beamer
    admin/               de beheer-app
      tabs/              één bestand per tabblad

tests/
  unit/                  puntenregels, opmaak, csv, import
  lint/                  spelregels voor de code (geen inline CSS, geen innerHTML, geldige verwijzingen)
  e2e/                   volledige doorloop in een browser met nagebootste database
```

## Lagen en afhankelijkheden

```
tabs/ ─► componenten/ ─► lib/            (UI)
tabs/ ─► data/schrijven.js ─► firebase/  (schrijven)
admin/luisteraars.js ─► data/lezen.js    (lezen) ─► state.js ─► tabs/
```

- **`lib/`** kent geen DOM-structuur van de app en geen Firebase. Daardoor kan alles met `npm test` getest worden.
- **`data/`** is de enige laag die Firebase aanroept. Alle paden staan in `data/paden.js`.
- **`admin/state.js`** bevat wat de database nu zegt. Tabbladen lezen via `selectors.js` en schrijven via `data/schrijven.js`.
  Een schrijfactie komt via Firebase terug als nieuwe state, waarna de tabbladen zichzelf hertekenen.
- De **beamer** laadt geen inlog-code (`sdk.js` laadt modules pas wanneer ze nodig zijn).

## Gegevensmodel (Realtime Database)

```
instellingen/   { naam, titel, woord, modus, logo }
groepen/<id>    { naam, aantal, t, foto }
gifs/<groepId>  "data:image/gif…" of "https://…"
kaart/<id>      { naam, prijs, punten, telt, v }      v = volgorde
bestellingen/<id> { groep, groepNaam, items, bonnetjes, punten, t, door, modus, geannuleerd }
admins/<uid>    true
```

Lezen mag iedereen (de beamer is publiek), behalve `bestellingen`; schrijven mogen enkel beheerders.

## Punten

`lib/puntentelling.js`:

- modus **bonnetjes**: punten = bonnetjes van de drank × aantal
- modus **zuipbeker**: punten = eigen puntenwaarde van de drank × aantal
- `telt: false` geeft nooit punten, ook niet in een van beide modi
- een bestelling bewaart de prijs en punten van dat moment, zodat later wijzigen aan de kaart oude bestellingen niet verandert

## Uitbreiden

**Nieuw tabblad**: maak `assets/js/admin/tabs/mijn-tab.js` met `{ id, label, watch, render(wortel, ctx) }` en zet het in
`tabs/index.js`. Navigatie, URL (`admin.html#mijn-tab`) en hertekenen werken vanzelf.

**Nieuwe snelknop**: voeg een regel toe aan `APP.snelknoppen` in `config.js`.

**Nieuw woord voor de deelnemers** (bv. "Klas"): voeg het toe aan `APP.woorden` in `config.js` en aan de lijst in
`database.rules.json` (regel `woord`).

**Nieuwe instelling**: veld toevoegen in `database.rules.json` onder `instellingen`, lezen in `admin/luisteraars.js`
(zit al in `state.instellingen`) en een veld in `tabs/instellingen.js`.

## Stijl

Alle kleuren, afstanden en lettergroottes staan als variabelen in `css/kern/tokens.css`.
Klassenamen volgen `blok__element--variant` (bv. `kolom__waarde`, `knop--primair`).
Een lichte of donkere weergave volgt het systeem; de beamer staat altijd donker (`data-thema="dark"`).

**Geen inline CSS.** Elke pagina heeft een Content-Security-Policy (`style-src 'self'`) die dat afdwingt,
en `tests/lint` controleert het ook. Dynamische waarden geef je door als CSS-variabele:

```js
element.style.setProperty("--aandeel", 40);   // toegestaan
element.style.width = "40%";                  // niet toegestaan (en geblokkeerd door de test)
```

## Beveiliging

- De Firebase-sleutels in `config.js` mogen publiek zijn; de regels in `database.rules.json` beschermen de data.
- Namen en andere tekst uit de database gaan nooit via HTML-strings de pagina in (`h()` gebruikt `textContent`).
- Afbeeldingen uit de database worden gecontroleerd (`lib/media.js`) voor ze gebruikt worden.

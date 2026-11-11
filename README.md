# Tapteller

Kassa en live klassement voor fuiven, quizzen en jeugdbewegingsfeesten.

- **Beamer** (`index.html`): staafgrafiek als geluidsmeter, totaal, logo en een gif bij elke score.
- **Beheer** (`admin.html`): kassa met drankkaart, snel tellen, bestellingen, groepen, instellingen.
- Twee manieren om punten te tellen, per evenement in te stellen:
  **Bonnetjes** (punten = bonnetjes) of **Zuipbeker** (eigen punten per drank).

## Lokaal draaien

```bash
git clone https://github.com/simonbeelen/tapteller.git
cd tapteller
npm run dev            # of: python3 -m http.server 8080
```

Open daarna http://localhost:8080 (beamer) en http://localhost:8080/admin.html (beheer).
Een server is nodig omdat de pagina's ES-modules gebruiken; dubbelklikken op het bestand werkt niet.

## Tests

```bash
npm test               # unit- en lint-tests, geen installatie nodig (Node 22+)

npm install            # eenmalig, voor de browsertest
npx playwright-core install chromium
npm run test:e2e       # doorloopt de volledige app met een nagebootste database
```

De tests draaien ook automatisch op GitHub bij elke push (`.github/workflows/test.yml`).

## Online zetten

1. **GitHub Pages**: Settings → Pages → Deploy from a branch → `main` / root.
2. **Firebase** (eenmalig):
   - Realtime Database → Rules: plak `database.rules.json` en klik Publish.
   - Authentication → Email/Password aanzetten, een beheerder aanmaken.
   - Realtime Database → Data: `admins/<UID van de beheerder>` = `true`.
   - Authentication → Settings → Authorized domains: je `github.io`-domein toevoegen.
3. Firebase-gegevens staan in `assets/js/config.js`.

Een beheerder die inlogt maar nog geen toegang heeft, ziet zijn UID op het inlogscherm.

## Documentatie

Opbouw, gegevensmodel, regels en hoe je iets uitbreidt: [docs/ARCHITECTUUR.md](docs/ARCHITECTUUR.md).

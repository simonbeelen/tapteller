# Tapteller

Live klassement voor de Nacht van de Jeugdbeweging.

- `index.html` – het scherm (beamer/tv) met een staafgrafiek per groep.
- `admin.html` – de adminpagina voor op de gsm: tellen, groepen toevoegen, hernoemen, verwijderen en resetten.
- `config.js` – hier vul je de gegevens van je Firebase-project in.
- `database.rules.json` – de beveiliging: iedereen mag kijken, alleen admins mogen aanpassen.

GitHub Pages host de pagina’s, Firebase (gratis) bewaart de tellingen zodat alle toestellen live gelijk lopen.

## 1. Firebase instellen (± 10 minuten)

1. Ga naar https://console.firebase.google.com en maak een nieuw project (Google Analytics mag uit).
2. **Realtime Database**: menu *Build → Realtime Database → Create database*. Kies locatie *Belgium (europe-west1)* en start in *locked mode*.
3. Open het tabblad **Rules**, plak de inhoud van `database.rules.json` en klik *Publish*.
4. **Authentication**: *Build → Authentication → Get started → Email/Password* aanzetten.
5. Tabblad **Users → Add user**: maak een account voor elke admin (e-mail + wachtwoord). Kopieer de **User UID** van elk account.
6. Terug naar **Realtime Database → Data**. Klik op het plusje naast de root en maak:
   - sleutel `admins`, daaronder per admin een sleutel met de **UID** en als waarde `true` (zonder aanhalingstekens).
7. **Projectinstellingen** (tandwiel) → *Algemeen* → onderaan *Jouw apps* → web-icoon `</>` → app registreren. Kopieer de `firebaseConfig` en zet de waarden in `config.js`. Controleer dat `databaseURL` ingevuld is (staat ook bovenaan de Realtime Database-pagina).

## 2. Hosten op GitHub Pages

1. Maak een nieuwe **publieke** repository op GitHub, bijvoorbeeld `tapteller`.
2. *Add file → Upload files* en sleep alle bestanden uit deze map erin. *Commit changes*.
3. *Settings → Pages* → bij *Source* kies *Deploy from a branch*, branch `main`, map `/ (root)` → *Save*.
4. Na een minuutje staat de site op `https://<jouw-gebruikersnaam>.github.io/tapteller/`.
   - Scherm: `https://<jouw-gebruikersnaam>.github.io/tapteller/`
   - Admin: `https://<jouw-gebruikersnaam>.github.io/tapteller/admin.html`
5. In Firebase: *Authentication → Settings → Authorized domains → Add domain* en voeg `<jouw-gebruikersnaam>.github.io` toe, anders werkt inloggen niet.

## Gebruik op de avond

- Open het scherm op de laptop aan de beamer en klik rechtsonder op *Volledig scherm*.
- Admins openen `admin.html` op hun gsm, loggen in en tikken +1 per consumptie. Tip: *Zet op beginscherm* in je browser.
- Een nieuwe admin toevoegen of iemand weghalen doe je in Firebase (stap 1.5 en 1.6).

## Veiligheid

De Firebase-sleutels in `config.js` mogen publiek op GitHub staan; dat is zo bedoeld. De echte beveiliging zit in de databaseregels: zonder admin-account kan niemand iets aanpassen, alleen kijken.

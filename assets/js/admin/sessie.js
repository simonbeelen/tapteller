/** Inloggen, uitloggen en controleren of de gebruiker beheerder is. */
import { auth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "../firebase/auth.js";
import { isBeheerder } from "../data/toegang.js";

export const inloggen = (email, wachtwoord) => signInWithEmailAndPassword(auth, email, wachtwoord);
export const uitloggen = () => signOut(auth);

/**
 * @param {{ bijUitgelogd: () => void, bijGeenBeheerder: (gebruiker: object) => void, bijBeheerder: (gebruiker: object) => void }} acties
 */
export function volgSessie({ bijUitgelogd, bijGeenBeheerder, bijBeheerder }) {
  onAuthStateChanged(auth, async (gebruiker) => {
    if (!gebruiker) return bijUitgelogd();
    if (!(await isBeheerder(gebruiker.uid))) return bijGeenBeheerder(gebruiker);
    bijBeheerder(gebruiker);
  });
}

/** Leesbare tekst bij een mislukte inlogpoging. */
export function inlogFout(fout) {
  const code = String(fout?.code ?? "");
  if (/invalid-credential|wrong-password|user-not-found|invalid-login/.test(code)) return "E-mailadres of wachtwoord klopt niet.";
  if (/invalid-email/.test(code)) return "Dit e-mailadres is niet geldig.";
  if (/too-many-requests/.test(code)) return "Te veel pogingen. Wacht even en probeer opnieuw.";
  if (/network/.test(code)) return "Geen verbinding. Controleer het internet.";
  return "Inloggen lukte niet. Probeer het opnieuw.";
}

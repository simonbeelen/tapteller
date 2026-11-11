const auth = { currentUser: null, cbs: [] };
const maakGebruiker = (email, uid = "u1") => ({ uid, email, emailVerified: true });

export const indexedDBLocalPersistence = {};
export const browserLocalPersistence = {};
export const initializeAuth = () => auth;

export function onAuthStateChanged(a, cb) {
  a.cbs.push(cb);
  if (window.__mockUser) a.currentUser = maakGebruiker(window.__mockUser.email, window.__mockUser.uid);
  setTimeout(() => cb(a.currentUser), 0);
  return () => {};
}
const meld = () => auth.cbs.forEach((cb) => cb(auth.currentUser));

export async function signInWithEmailAndPassword(a, email, wachtwoord) {
  if (wachtwoord !== "goed") { const f = new Error("fout"); f.code = "auth/invalid-credential"; throw f; }
  auth.currentUser = maakGebruiker(email, email === "beheer@test.be" ? "u1" : "x9");
  meld();
}
export async function signOut() { auth.currentUser = null; meld(); }

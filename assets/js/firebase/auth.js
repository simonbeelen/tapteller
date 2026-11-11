import { laadSdk } from "../sdk.js";
import { app } from "./app.js";

const sdk = await laadSdk("auth");

// Zonder pop-up/redirect-resolver: laadt geen extra Google-scripts en is niet nodig voor e-mail + wachtwoord.
export const auth = sdk.initializeAuth(app, {
  persistence: [sdk.indexedDBLocalPersistence, sdk.browserLocalPersistence],
});

export const { onAuthStateChanged, signInWithEmailAndPassword, signOut } = sdk;

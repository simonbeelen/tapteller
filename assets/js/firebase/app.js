import { firebaseConfig } from "../config.js";
import { laadSdk } from "../sdk.js";

const { initializeApp } = await laadSdk("app");

export const app = initializeApp(firebaseConfig);

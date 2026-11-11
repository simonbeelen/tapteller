import { laadSdk } from "../sdk.js";
import { app } from "./app.js";

const sdk = await laadSdk("database");

export const db = sdk.getDatabase(app);
export const { ref, onValue, get, set, push, update, remove, increment } = sdk;

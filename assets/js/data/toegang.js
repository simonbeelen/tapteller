import { lees } from "./lezen.js";
import { PAD } from "./paden.js";

/** Is deze gebruiker een beheerder? De databaseregels dwingen dit zelf ook af. */
export async function isBeheerder(uid) {
  try {
    return (await lees(PAD.admin(uid))) === true;
  } catch {
    return false;
  }
}

const boom = window.__mockTree || (window.__mockTree = JSON.parse(JSON.stringify(window.__seed || {})));
window.__schrijfacties = [];
const abonnees = new Set();
const delen = (pad) => pad.split("/").filter(Boolean);

function lees(pad) {
  let knoop = boom;
  for (const d of delen(pad)) {
    if (knoop == null || typeof knoop !== "object") return null;
    knoop = knoop[d];
  }
  return knoop === undefined ? null : JSON.parse(JSON.stringify(knoop));
}

function opruimen(o) {
  if (o && typeof o === "object") {
    for (const k of Object.keys(o)) {
      o[k] = opruimen(o[k]);
      if (o[k] === null || (typeof o[k] === "object" && !Object.keys(o[k]).length)) delete o[k];
    }
  }
  return o;
}

function schrijf(pad, waarde) {
  const ks = delen(pad);
  let knoop = boom;
  for (let i = 0; i < ks.length - 1; i++) {
    if (typeof knoop[ks[i]] !== "object" || knoop[ks[i]] === null) knoop[ks[i]] = {};
    knoop = knoop[ks[i]];
  }
  const laatste = ks[ks.length - 1];
  if (waarde && typeof waarde === "object" && "__inc" in waarde) waarde = (Number(knoop[laatste]) || 0) + waarde.__inc;
  if (waarde === null || waarde === undefined) delete knoop[laatste];
  else knoop[laatste] = JSON.parse(JSON.stringify(waarde));
  opruimen(boom);
}

const momentopname = (pad) => ({ val: () => lees(pad), exists: () => lees(pad) != null, key: delen(pad).pop() });

function meld(paden) {
  for (const a of abonnees) {
    if (paden.some((p) => p === a.pad || p.startsWith(a.pad + "/") || a.pad.startsWith(p + "/") || a.pad === "")) {
      queueMicrotask(() => a.leeft && a.cb(momentopname(a.pad)));
    }
  }
}

export const getDatabase = () => ({});
export const ref = (db, pad = "") => ({ pad: delen(pad).join("/"), key: delen(pad).pop() });

let teller = 0;
export function push(r, waarde) {
  const key = "k" + Date.now().toString(36) + (teller++).toString(36).padStart(4, "0");
  const pad = r.pad + "/" + key;
  const belofte = waarde !== undefined ? set({ pad }, waarde) : Promise.resolve();
  return { key, pad, then: (a, b) => belofte.then(a, b) };
}
export async function set(r, waarde) { window.__schrijfacties.push(["set", r.pad]); schrijf(r.pad, waarde); meld([r.pad]); }
export async function update(r, wijzigingen) {
  window.__schrijfacties.push(["update", r.pad, Object.keys(wijzigingen)]);
  const paden = Object.entries(wijzigingen).map(([k, v]) => {
    const pad = (r.pad ? r.pad + "/" : "") + k;
    schrijf(pad, v);
    return delen(pad).join("/");
  });
  meld(paden);
}
export async function remove(r) { schrijf(r.pad, null); meld([r.pad]); }
export async function get(r) { return momentopname(r.pad); }
export const increment = (n) => ({ __inc: n });
export function onValue(r, cb) {
  const a = { pad: r.pad, cb, leeft: true };
  abonnees.add(a);
  queueMicrotask(() => cb(momentopname(r.pad)));
  return () => { a.leeft = false; abonnees.delete(a); };
}

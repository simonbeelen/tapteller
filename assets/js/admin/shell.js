/** De beheer-app: navigatie, tabbladen en de balk onderaan. */
import { h, leeg } from "../lib/dom.js";
import { abonneer } from "./state.js";
import { naar, startRouter } from "./router.js";
import { TABS } from "./tabs/index.js";

const $nav = document.getElementById("tabs");
const $inhoud = document.getElementById("inhoud");
const $balk = document.getElementById("mand");
const $app = document.getElementById("weergave-app");

let actief = null;
let gestart = false;

const voet = {
  toon(inhoud) {
    $balk.replaceChildren(inhoud);
    $balk.hidden = false;
    $app.classList.add("app--met-balk");
  },
  verberg() {
    $balk.hidden = true;
    $balk.replaceChildren();
    $app.classList.remove("app--met-balk");
  },
};

// Houdt de hoogte van de balk onderaan bij, zodat inhoud en meldingen er netjes boven blijven
new ResizeObserver(() => document.documentElement.style.setProperty("--balk-hoogte", `${$balk.offsetHeight}px`)).observe($balk);

const ctx = { voet, herteken: () => teken(true) };

function bouwNavigatie() {
  for (const tab of TABS) {
    $nav.append(
      h("button", {
        class: "tab",
        type: "button",
        role: "tab",
        id: `tab-${tab.id}`,
        "aria-controls": "inhoud",
        data: { tab: tab.id },
        onclick: () => naar(tab.id),
      }),
    );
  }

  // Pijltjestoetsen binnen de tabbalk
  $nav.addEventListener("keydown", (e) => {
    const richting = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!richting) return;
    const index = TABS.findIndex((t) => t.id === actief?.id);
    const volgende = TABS[(index + richting + TABS.length) % TABS.length];
    naar(volgende.id);
    document.getElementById(`tab-${volgende.id}`)?.focus();
  });
}

function verfrisNavigatie() {
  for (const knop of $nav.children) {
    const tab = TABS.find((t) => t.id === knop.dataset.tab);
    knop.textContent = tab.label();
    knop.setAttribute("aria-selected", String(tab === actief));
    knop.tabIndex = tab === actief ? 0 : -1;
    if (tab === actief) knop.scrollIntoView?.({ inline: "center", block: "nearest" });
  }
}

const typtNu = () => {
  const el = document.activeElement;
  return Boolean(el && $inhoud.contains(el) && el.matches("input:not([type=checkbox]):not([type=file]), textarea, select"));
};

function teken(geforceerd) {
  if (!actief) return;
  if (!geforceerd && actief.beschermInvoer && typtNu()) return;

  voet.verberg();
  leeg($inhoud);
  actief.render($inhoud, ctx);
  verfrisNavigatie();
}

function toonTab(id) {
  actief = TABS.find((t) => t.id === id) ?? TABS[0];
  teken(true);
  window.scrollTo(0, 0);
}

/** Start de app één keer; daarna reageert ze vanzelf op state-wijzigingen en de URL. */
export function startShell() {
  if (gestart) return;
  gestart = true;

  bouwNavigatie();
  startRouter(TABS.map((t) => t.id), toonTab);

  abonneer((sleutels) => {
    if (!actief) return;
    if (sleutels.includes("instellingen")) verfrisNavigatie();
    if (actief.watch.some((s) => sleutels.includes(s))) teken(false);
  });
}

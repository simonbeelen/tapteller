/** Eigen iconenset (24×24, lijnstijl). De opmaak staat in componenten/icoon.css. */

const SVG = "http://www.w3.org/2000/svg";

const PADEN = {
  terug: "M15 18l-6-6 6-6",
  omhoog: "M6 15l6-6 6 6",
  omlaag: "M6 9l6 6 6-6",
  sluit: "M6 6l12 12M18 6L6 18",
  plus: "M12 5v14M5 12h14",
  check: "M5 12l5 5 9-10",
  prullenbak: "M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3",
  afbeelding: "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 9h.01",
  download: "M12 4v11M7 11l5 5 5-5M5 20h14",
  uitloggen: "M10 5H5v14h5M15 8l4 4-4 4M19 12H9",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  kopieer: "M9 9h10v11H9zM5 15V4h10",
  ongedaan: "M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-4",
  scherm: "M3 5h18v11H3zM9 20h6M12 16v4",
};

/** @param {keyof typeof PADEN} naam */
export function icoon(naam) {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("class", "icoon");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");

  const pad = document.createElementNS(SVG, "path");
  pad.setAttribute("d", PADEN[naam]);
  svg.append(pad);
  return svg;
}

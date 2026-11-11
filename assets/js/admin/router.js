/** Minimale router op de URL-hash: admin.html#kassa. Herladen en de terugknop werken zo gewoon. */

export function startRouter(geldigeIds, bijWijziging) {
  const lees = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    return geldigeIds.includes(id) ? id : geldigeIds[0];
  };

  window.addEventListener("hashchange", () => bijWijziging(lees()));
  bijWijziging(lees());
}

export function naar(id) {
  if (decodeURIComponent(location.hash.slice(1)) !== id) location.hash = id;
}

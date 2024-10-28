export function setCookie(name, value, days = 365) {
  const expires = days ? `; expires=${new Date(Date.now() + days * 864e5).toUTCString()}` : "";
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/`;
}

export function getCookie(name) {
  return document.cookie.split("; ").reduce((prev, current) => {
    const [key, value] = current.split("=");
    return key === name ? decodeURIComponent(value) : prev;
  }, null);
}

export function deleteCookie(name) {
  setCookie(name, "", -1);
}

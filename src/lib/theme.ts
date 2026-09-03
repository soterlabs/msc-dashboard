/**
 * Theme switching, kept deliberately tiny: the palette lives entirely in CSS
 * custom properties, so switching themes is one class on <html> and nothing
 * else in the app needs to know which one is on — no provider, no context, no
 * React state mirroring a value the document already holds.
 */
export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "soter-theme";

/**
 * Runs before first paint, inlined into the document head. Kept as a string so
 * there is exactly one copy of this logic; it must stay dependency-free and
 * must not throw, because Safari's private mode makes `localStorage` a getter
 * that raises.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}var e=document.documentElement;e.classList.toggle("dark",t==="dark");e.style.colorScheme=t}catch(_){}})()`;

export function getTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function setTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // A blocked storage API only costs the preference across reloads.
  }
}

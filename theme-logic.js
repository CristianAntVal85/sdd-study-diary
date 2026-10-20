"use strict";

// Pure logic for the light and dark theme.
// This file only decides: it must not access the page, the saved data, the
// system media query or the clock. The saved text and the system preference
// always arrive as parameters.
const ThemeLogic = (() => {
  const LIGHT = "claro";
  const DARK = "oscuro";

  function isTheme(value) {
    return value === LIGHT || value === DARK;
  }

  // Receives the text saved for the theme (null when the key does not exist)
  // and returns "claro", "oscuro" or null. A corrupt value is ignored, never
  // repaired and never thrown away.
  function parseStoredTheme(rawValue) {
    if (typeof rawValue !== "string" || rawValue === "") return null;

    let parsed;
    try {
      parsed = JSON.parse(rawValue);
    } catch (error) {
      return null;
    }

    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    return isTheme(parsed.tema) ? parsed.tema : null;
  }

  // A valid saved choice always wins. Without one, only a true system
  // preference for dark makes the page dark; anything else stays light.
  function resolveTheme(storedChoice, systemPrefersDark) {
    const stored = parseStoredTheme(storedChoice);
    if (stored !== null) return stored;

    return systemPrefersDark === true ? DARK : LIGHT;
  }

  // There are only two themes, so an invalid value is treated as light.
  function toggleTheme(theme) {
    return theme === DARK ? LIGHT : DARK;
  }

  // The key is written only when the saved choice differs from the requested
  // theme, or when it is missing or unreadable.
  function shouldWriteTheme(currentStored, requested) {
    const stored = parseStoredTheme(currentStored);
    return stored === null || stored !== requested;
  }

  function serializeTheme(theme) {
    return `{"tema":"${theme === DARK ? DARK : LIGHT}"}`;
  }

  // The button is an action: its label names the theme you switch to.
  // With the light theme it offers the dark one, and the other way round.
  function getToggleLabel(theme) {
    return theme === DARK ? "Modo claro" : "Modo oscuro";
  }

  // The icon accompanies the label: the moon takes you to the dark theme
  // and the sun to the light one.
  function getIconName(theme) {
    return theme === DARK ? "sol" : "luna";
  }

  return {
    parseStoredTheme,
    resolveTheme,
    toggleTheme,
    shouldWriteTheme,
    serializeTheme,
    getToggleLabel,
    getIconName,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = ThemeLogic;
}

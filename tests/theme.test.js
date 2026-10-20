"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const logicPath = path.join(__dirname, "..", "theme-logic.js");
const ThemeLogic = require(logicPath);

// Stored values exactly as the browser returns them: plain text or null.
const STORED_LIGHT = '{"tema":"claro"}';
const STORED_DARK = '{"tema":"oscuro"}';

// A. Reading the saved choice.
test("A1: reads a stored dark choice", () => {
  assert.equal(ThemeLogic.parseStoredTheme(STORED_DARK), "oscuro");
});

test("A2: reads a stored light choice", () => {
  assert.equal(ThemeLogic.parseStoredTheme(STORED_LIGHT), "claro");
});

test("A3: accepts extra spacing and extra keys", () => {
  assert.equal(ThemeLogic.parseStoredTheme(' { "tema" : "oscuro" } '), "oscuro");
  assert.equal(ThemeLogic.parseStoredTheme('{"tema":"oscuro","otra":1}'), "oscuro");
});

test("A4: ignores corrupt, mistyped and unrelated values", () => {
  const invalid = [
    null,
    undefined,
    "",
    "   ",
    "{'tema':'oscuro'}",
    '"oscuro"',
    "null",
    "[]",
    '{"modo":"oscuro"}',
    '{"tema":"morado"}',
    '{"tema":1}',
    '{"tema":null}',
    '{"tema":"OSCURO"}',
    '{"tema":"oscuro"',
    "42",
    "true",
  ];

  invalid.forEach((rawValue) => {
    assert.equal(
      ThemeLogic.parseStoredTheme(rawValue),
      null,
      `expected null for ${String(rawValue)}`,
    );
  });
});

test("A5: ignores non-text input without throwing", () => {
  [0, 42, true, {}, [], function () {}].forEach((value) => {
    assert.equal(ThemeLogic.parseStoredTheme(value), null);
  });
});

test("A6: never throws with hostile text", () => {
  const hostile = [
    '{"tema":"oscuro"',
    '{"tema":{"a":1}}',
    '["oscuro"]',
    "\u0000",
    "{".repeat(50),
  ];

  hostile.forEach((rawValue) => {
    assert.doesNotThrow(() => ThemeLogic.parseStoredTheme(rawValue));
  });
  assert.equal(ThemeLogic.parseStoredTheme('{"tema":{"a":1}}'), null);
  assert.equal(ThemeLogic.parseStoredTheme('["oscuro"]'), null);
});

test("A7: leaves the received value untouched", () => {
  const rawValue = STORED_DARK;

  ThemeLogic.parseStoredTheme(rawValue);

  assert.equal(rawValue, STORED_DARK);
});

// B. Resolving the theme.
test("B1: follows the system when there is no saved choice", () => {
  assert.equal(ThemeLogic.resolveTheme(null, true), "oscuro");
  assert.equal(ThemeLogic.resolveTheme(null, false), "claro");
});

test("B2: falls back to light when the system preference is unknown", () => {
  [undefined, null, "true", 1].forEach((preference) => {
    assert.equal(ThemeLogic.resolveTheme(null, preference), "claro");
  });
  assert.equal(ThemeLogic.resolveTheme(undefined, undefined), "claro");
});

test("B3: a valid saved choice wins over the system", () => {
  assert.equal(ThemeLogic.resolveTheme(STORED_DARK, false), "oscuro");
  assert.equal(ThemeLogic.resolveTheme(STORED_LIGHT, true), "claro");
});

test("B4: an unreadable saved choice falls back to the system", () => {
  assert.equal(ThemeLogic.resolveTheme('{"tema":"morado"}', true), "oscuro");
  assert.equal(ThemeLogic.resolveTheme('{"tema":', true), "oscuro");
  assert.equal(ThemeLogic.resolveTheme("", false), "claro");
});

// C. Toggling.
test("C1: toggles between the two themes", () => {
  assert.equal(ThemeLogic.toggleTheme("claro"), "oscuro");
  assert.equal(ThemeLogic.toggleTheme("oscuro"), "claro");
});

test("C2: toggling twice returns to the starting theme", () => {
  ["claro", "oscuro"].forEach((theme) => {
    assert.equal(ThemeLogic.toggleTheme(ThemeLogic.toggleTheme(theme)), theme);
  });
});

test("C3: treats an invalid theme as light", () => {
  [null, undefined, "", "morado", 0, true].forEach((theme) => {
    assert.equal(ThemeLogic.toggleTheme(theme), "oscuro");
  });
});

test("C4: only ever returns 'claro' or 'oscuro'", () => {
  const inputs = ["claro", "oscuro", null, "", "morado", 3];

  inputs.forEach((theme) => {
    assert.ok(["claro", "oscuro"].includes(ThemeLogic.toggleTheme(theme)));
    assert.ok(
      ["claro", "oscuro"].includes(
        ThemeLogic.toggleTheme(ThemeLogic.toggleTheme(theme)),
      ),
    );
  });
});

// D. Write decision.
test("D1: does not write when the saved choice already matches", () => {
  assert.equal(ThemeLogic.shouldWriteTheme(STORED_DARK, "oscuro"), false);
  assert.equal(ThemeLogic.shouldWriteTheme(STORED_LIGHT, "claro"), false);
});

test("D2: writes when the requested theme differs", () => {
  assert.equal(ThemeLogic.shouldWriteTheme(STORED_DARK, "claro"), true);
  assert.equal(ThemeLogic.shouldWriteTheme(STORED_LIGHT, "oscuro"), true);
});

test("D3: writes when the key is missing", () => {
  assert.equal(ThemeLogic.shouldWriteTheme(null, "claro"), true);
  assert.equal(ThemeLogic.shouldWriteTheme(undefined, "oscuro"), true);
});

test("D4: writes when the saved value is corrupt", () => {
  assert.equal(ThemeLogic.shouldWriteTheme('{"tema":"morado"}', "claro"), true);
  assert.equal(ThemeLogic.shouldWriteTheme('{"tema":', "oscuro"), true);
  assert.equal(ThemeLogic.shouldWriteTheme('{"tema":"OSCURO"}', "oscuro"), true);
});

test("D5: never asks to write the same value twice in a row", () => {
  let stored = null;

  ["oscuro", "claro", "oscuro"].forEach((requested) => {
    assert.equal(ThemeLogic.shouldWriteTheme(stored, requested), true);
    stored = ThemeLogic.serializeTheme(requested);
    assert.equal(ThemeLogic.shouldWriteTheme(stored, requested), false);
  });
});

// E. Serialization.
test("E1: writes exactly the agreed shape", () => {
  assert.equal(ThemeLogic.serializeTheme("claro"), '{"tema":"claro"}');
  assert.equal(ThemeLogic.serializeTheme("oscuro"), '{"tema":"oscuro"}');
});

test("E2: the written text reads back as the same theme", () => {
  ["claro", "oscuro"].forEach((theme) => {
    assert.equal(ThemeLogic.parseStoredTheme(ThemeLogic.serializeTheme(theme)), theme);
  });
});

test("E3: never writes any other text", () => {
  const inputs = ["claro", "oscuro", null, undefined, "", "morado", 1, true];
  const allowed = ['{"tema":"claro"}', '{"tema":"oscuro"}'];

  inputs.forEach((theme) => {
    const text = ThemeLogic.serializeTheme(theme);

    assert.equal(typeof text, "string");
    assert.ok(allowed.includes(text));
    assert.equal(JSON.parse(text).tema, ThemeLogic.parseStoredTheme(text));
  });
});

test("E4: writes valid JSON with a single key", () => {
  const parsed = JSON.parse(ThemeLogic.serializeTheme("oscuro"));

  assert.deepEqual(parsed, { tema: "oscuro" });
  assert.equal(Object.keys(parsed).length, 1);
});

// F. Label and icon of the action.
test("F1: the label names the theme you switch to", () => {
  assert.equal(ThemeLogic.getToggleLabel("claro"), "Modo oscuro");
  assert.equal(ThemeLogic.getToggleLabel("oscuro"), "Modo claro");
});

test("F2: the icon accompanies the label", () => {
  assert.equal(ThemeLogic.getIconName("claro"), "luna");
  assert.equal(ThemeLogic.getIconName("oscuro"), "sol");
});

test("F3: an invalid theme is treated as light", () => {
  [null, undefined, "", "morado", 0].forEach((theme) => {
    assert.equal(ThemeLogic.getToggleLabel(theme), "Modo oscuro");
    assert.equal(ThemeLogic.getIconName(theme), "luna");
  });
});

test("F4: label and icon always agree with each other", () => {
  ["claro", "oscuro"].forEach((theme) => {
    assert.equal(
      ThemeLogic.getToggleLabel(theme),
      theme === "oscuro" ? "Modo claro" : "Modo oscuro",
    );
    assert.equal(
      ThemeLogic.getIconName(theme),
      theme === "oscuro" ? "sol" : "luna",
    );
  });
});

test("F5: the button has no pressed state any more", () => {
  assert.equal(ThemeLogic.isThemeButtonPressed, undefined);
});

// G. Purity and determinism.
test("G1: stays independent from the page, saved data, media queries and clock", () => {
  const source = fs.readFileSync(logicPath, "utf8");

  assert.doesNotMatch(source, /\bdocument\b/);
  assert.doesNotMatch(source, /\blocalStorage\b/);
  assert.doesNotMatch(source, /\bmatchMedia\b/);
  assert.doesNotMatch(source, /\bDate\.now\b/);
  assert.doesNotMatch(source, /\bnew\s+Date\s*\(\s*\)/);
});

test("G2: does not know the session or goal keys", () => {
  const source = fs.readFileSync(logicPath, "utf8");

  assert.doesNotMatch(source, /estudioDiarioSesiones/);
  assert.doesNotMatch(source, /estudioDiarioObjetivoSemanal/);
});

test("G3: follows the module pattern with a guarded CommonJS export", () => {
  const source = fs.readFileSync(logicPath, "utf8");

  assert.match(source, /const ThemeLogic = \(\(\) =>/);
  assert.match(source, /typeof module !== "undefined" && module\.exports/);
  assert.match(source, /module\.exports = ThemeLogic/);
});

test("G4: exposes every promised function and nothing else", () => {
  const functions = [
    "parseStoredTheme",
    "resolveTheme",
    "toggleTheme",
    "shouldWriteTheme",
    "serializeTheme",
    "getToggleLabel",
    "getIconName",
  ];

  functions.forEach((name) => {
    assert.equal(typeof ThemeLogic[name], "function", name);
  });
  assert.deepEqual(Object.keys(ThemeLogic).sort(), functions.slice().sort());
});

test("G5: the same input always returns the same result", () => {
  const savedValues = [null, "", STORED_DARK, STORED_LIGHT, '{"tema":"morado"}'];

  savedValues.forEach((rawValue) => {
    const first = ThemeLogic.resolveTheme(rawValue, true);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      assert.equal(ThemeLogic.resolveTheme(rawValue, true), first);
    }
  });
});

test("G6: keeps no state between calls", () => {
  ThemeLogic.toggleTheme("claro");
  ThemeLogic.resolveTheme(STORED_DARK, false);

  assert.equal(ThemeLogic.parseStoredTheme(STORED_DARK), "oscuro");
  assert.equal(ThemeLogic.resolveTheme(STORED_DARK, false), "oscuro");
  assert.equal(ThemeLogic.toggleTheme("claro"), "oscuro");
});

test("G7: leaves its arguments untouched", () => {
  ThemeLogic.parseStoredTheme(STORED_DARK);
  ThemeLogic.resolveTheme(STORED_DARK, true);
  ThemeLogic.shouldWriteTheme(STORED_DARK, "oscuro");

  assert.equal(STORED_DARK, '{"tema":"oscuro"}');
  assert.equal(STORED_LIGHT, '{"tema":"claro"}');
});

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const logicPath = path.join(__dirname, "..", "weekly-goal-logic.js");
const WeeklyGoalLogic = require(logicPath);
const HeatMapLogic = require(path.join(__dirname, "..", "heat-map-logic.js"));

// Fixture: 2026-10-19 is a Monday; its week goes from 19 to 25 October 2026.
const TODAY = "2026-10-19";

test("T1: exposes the logic as an object", () => {
  assert.equal(typeof WeeklyGoalLogic, "object");
  assert.notEqual(WeeklyGoalLogic, null);
  assert.equal(Array.isArray(WeeklyGoalLogic), false);
});

test("T1: exposes the week helpers", () => {
  assert.equal(typeof WeeklyGoalLogic.getWeekRange, "function");
  assert.equal(typeof WeeklyGoalLogic.formatWeekRange, "function");
});

test("T1: stays independent from DOM, storage, and clock", () => {
  const source = fs.readFileSync(logicPath, "utf8");

  assert.doesNotMatch(source, /\bdocument\b/);
  assert.doesNotMatch(source, /\blocalStorage\b/);
  assert.doesNotMatch(source, /\bDate\.now\b/);
  assert.doesNotMatch(source, /\bnew\s+Date\s*\(\s*\)/);
});

test("T1: reuses the heat map calendar instead of duplicating it", () => {
  const source = fs.readFileSync(logicPath, "utf8");

  // The new module delegates the calendar to the heat map logic: it wires that
  // file up and never builds a date of its own.
  assert.match(source, /heat-map-logic\.js/);
  assert.doesNotMatch(source, /\bnew\s+Date\b/);
});

test("T1: returns Monday to Sunday when today is Monday", () => {
  assert.deepEqual(WeeklyGoalLogic.getWeekRange("2026-10-19"), {
    start: "2026-10-19",
    end: "2026-10-25",
  });
});

test("T1: returns the same week when today is Wednesday", () => {
  assert.deepEqual(WeeklyGoalLogic.getWeekRange("2026-10-21"), {
    start: "2026-10-19",
    end: "2026-10-25",
  });
});

test("T1: returns the same week when today is Sunday", () => {
  assert.deepEqual(WeeklyGoalLogic.getWeekRange("2026-10-25"), {
    start: "2026-10-19",
    end: "2026-10-25",
  });
});

test("T1: crosses a month boundary", () => {
  assert.deepEqual(WeeklyGoalLogic.getWeekRange("2026-09-30"), {
    start: "2026-09-28",
    end: "2026-10-04",
  });
});

test("T1: crosses a year boundary", () => {
  assert.deepEqual(WeeklyGoalLogic.getWeekRange("2026-01-01"), {
    start: "2025-12-29",
    end: "2026-01-04",
  });
});

test("T1: keeps a leap day inside its own week", () => {
  assert.deepEqual(WeeklyGoalLogic.getWeekRange("2024-02-29"), {
    start: "2024-02-26",
    end: "2024-03-03",
  });
});

test("T1: keeps seven days in the weeks around the start of summer time", () => {
  // In Europe/Madrid the clocks move forward on Sunday 28 March 2027 at 02:00,
  // an hour that does not exist. The week that contains the change and the next
  // one must still go from Monday to Sunday, with seven different days each.
  const weeks = ["2027-03-22", "2027-03-29"];

  weeks.forEach((today) => {
    const range = WeeklyGoalLogic.getWeekRange(today);

    assert.deepEqual(range, {
      start: today,
      end: HeatMapLogic.addDays(today, 6),
    });
    assert.equal(HeatMapLogic.getWeekdayIndex(range.start), 0);
    assert.equal(HeatMapLogic.getWeekdayIndex(range.end), 6);

    // Seven days, one after another, without repeating or skipping any.
    const days = [0, 1, 2, 3, 4, 5, 6].map((offset) =>
      HeatMapLogic.addDays(range.start, offset)
    );
    assert.equal(days.length, 7);
    assert.equal(new Set(days).size, 7);
    assert.equal(days[6], range.end);
  });

  assert.deepEqual(WeeklyGoalLogic.getWeekRange("2027-03-28"), {
    start: "2027-03-22",
    end: "2027-03-28",
  });
  assert.deepEqual(WeeklyGoalLogic.getWeekRange("2027-04-04"), {
    start: "2027-03-29",
    end: "2027-04-04",
  });
});

test("T1: returns null for an invalid today", () => {
  assert.equal(WeeklyGoalLogic.getWeekRange("2026-02-30"), null);
  assert.equal(WeeklyGoalLogic.getWeekRange("2026-2-3"), null);
  assert.equal(WeeklyGoalLogic.getWeekRange("19-10-2026"), null);
  assert.equal(WeeklyGoalLogic.getWeekRange(""), null);
  assert.equal(WeeklyGoalLogic.getWeekRange(null), null);
  assert.equal(WeeklyGoalLogic.getWeekRange(undefined), null);
});

test("T1: formats a week inside a single month", () => {
  assert.equal(
    WeeklyGoalLogic.formatWeekRange("2026-10-19", "2026-10-25"),
    "19 al 25 de octubre"
  );
});

test("T1: formats a week crossing a month boundary", () => {
  assert.equal(
    WeeklyGoalLogic.formatWeekRange("2026-09-28", "2026-10-04"),
    "28 de septiembre al 4 de octubre"
  );
});

test("T1: formats a week crossing a year boundary", () => {
  assert.equal(
    WeeklyGoalLogic.formatWeekRange("2025-12-28", "2026-01-03"),
    "28 de diciembre al 3 de enero"
  );
  assert.equal(
    WeeklyGoalLogic.formatWeekRange("2025-12-29", "2026-01-04"),
    "29 de diciembre al 4 de enero"
  );
});

test("T1: formats the week that follows the fixture", () => {
  assert.equal(
    WeeklyGoalLogic.formatWeekRange("2026-10-26", "2026-11-01"),
    "26 de octubre al 1 de noviembre"
  );
});

test("T1: returns an empty text for invalid range dates", () => {
  assert.equal(WeeklyGoalLogic.formatWeekRange("2026-02-30", "2026-10-25"), "");
  assert.equal(WeeklyGoalLogic.formatWeekRange("2026-10-19", "not-a-date"), "");
  assert.equal(WeeklyGoalLogic.formatWeekRange(null, null), "");
});

test("T1: keeps the week range coherent with the heat map helpers", () => {
  const range = WeeklyGoalLogic.getWeekRange("2026-10-21");

  assert.deepEqual(range, {
    start: HeatMapLogic.getMonday("2026-10-21"),
    end: HeatMapLogic.addDays(HeatMapLogic.getMonday("2026-10-21"), 6),
  });
});

// T2: goal input validation (RF-4, CA-4.5, CA-4.6). Block A of §8.1: the raw
// text of the field, never a value normalized by the browser.
function goalErrorOf(value) {
  const result = WeeklyGoalLogic.validateGoalInput(value);

  assert.equal(result.ok, false, `se esperaba un error para ${String(value)}`);
  return result.error;
}

test("T2: exposes the goal input helpers", () => {
  assert.equal(typeof WeeklyGoalLogic.validateGoalInput, "function");
  assert.equal(typeof WeeklyGoalLogic.getGoalErrorMessage, "function");
});

test("T2: accepts whole numbers within range", () => {
  assert.deepEqual(WeeklyGoalLogic.validateGoalInput("300"), {
    ok: true,
    minutes: 300,
  });
  assert.deepEqual(WeeklyGoalLogic.validateGoalInput(" 300 "), {
    ok: true,
    minutes: 300,
  });
  assert.deepEqual(WeeklyGoalLogic.validateGoalInput("1"), {
    ok: true,
    minutes: 1,
  });
  assert.deepEqual(WeeklyGoalLogic.validateGoalInput("10080"), {
    ok: true,
    minutes: 10080,
  });
});

test("T2: rejects empty or digitless text with the whole-number error", () => {
  ["", "   ", "treinta"].forEach((value) => {
    assert.equal(goalErrorOf(value), "empty");
  });
});

test("T2: rejects decimals with the decimal error", () => {
  ["300,5", "300.5", "0,5"].forEach((value) => {
    assert.equal(goalErrorOf(value), "decimals");
  });
});

test("T2: rejects signs, notation, and inner characters", () => {
  ["3e2", "+300", "1e3", "3 0 0"].forEach((value) => {
    assert.equal(goalErrorOf(value), "sign-or-notation");
  });
});

test("T2: rejects zero and negative goals as too small", () => {
  ["0", "-5"].forEach((value) => {
    assert.equal(goalErrorOf(value), "too-small");
  });
});

test("T2: rejects goals above the weekly maximum", () => {
  ["10081", "99999"].forEach((value) => {
    assert.equal(goalErrorOf(value), "too-large");
  });
});

test("T2: does not throw on odd values and treats them as text", () => {
  assert.equal(goalErrorOf(null), "empty");
  assert.equal(goalErrorOf(undefined), "empty");
  assert.equal(goalErrorOf(NaN), "empty");
  assert.equal(goalErrorOf(Infinity), "empty");
  assert.equal(goalErrorOf(true), "empty");
  assert.deepEqual(WeeklyGoalLogic.validateGoalInput(300), {
    ok: true,
    minutes: 300,
  });
  assert.equal(goalErrorOf(3.5), "decimals");
});

test("T2: keeps the exact Spanish messages of CA-4.6", () => {
  assert.equal(
    WeeklyGoalLogic.getGoalErrorMessage("empty"),
    "Escribe un número entero de minutos."
  );
  assert.equal(
    WeeklyGoalLogic.getGoalErrorMessage("decimals"),
    "Escribe un número entero de minutos, sin decimales."
  );
  assert.equal(
    WeeklyGoalLogic.getGoalErrorMessage("sign-or-notation"),
    "Escribe el número sin signo ni notación científica, por ejemplo 300."
  );
  assert.equal(
    WeeklyGoalLogic.getGoalErrorMessage("too-small"),
    "El objetivo debe ser al menos 1 minuto."
  );
  assert.equal(
    WeeklyGoalLogic.getGoalErrorMessage("too-large"),
    "El objetivo no puede superar 10080 minutos (168 horas)."
  );
});

test("T2: returns no message for an unknown code", () => {
  assert.equal(WeeklyGoalLogic.getGoalErrorMessage("unknown"), "");
  assert.equal(WeeklyGoalLogic.getGoalErrorMessage(null), "");
});

test("T2: wires every rejected input to its exact message", () => {
  const cases = [
    ["", "Escribe un número entero de minutos."],
    ["treinta", "Escribe un número entero de minutos."],
    ["300,5", "Escribe un número entero de minutos, sin decimales."],
    [
      "3e2",
      "Escribe el número sin signo ni notación científica, por ejemplo 300.",
    ],
    ["+300", "Escribe el número sin signo ni notación científica, por ejemplo 300."],
    ["0", "El objetivo debe ser al menos 1 minuto."],
    ["-5", "El objetivo debe ser al menos 1 minuto."],
    ["10081", "El objetivo no puede superar 10080 minutos (168 horas)."],
  ];

  cases.forEach(([value, message]) => {
    assert.equal(
      WeeklyGoalLogic.getGoalErrorMessage(goalErrorOf(value)),
      message
    );
  });
});

// T3: reading the stored goal (RF-1, RF-7, CA-7.3). Block B of §8.1: the value
// already saved in storage, read here without touching storage itself.
test("T3: exposes the stored goal helpers", () => {
  assert.equal(typeof WeeklyGoalLogic.isValidGoal, "function");
  assert.equal(typeof WeeklyGoalLogic.parseStoredGoal, "function");
});

test("T3: accepts whole goals between 1 and 10080 minutes", () => {
  assert.equal(WeeklyGoalLogic.isValidGoal(1), true);
  assert.equal(WeeklyGoalLogic.isValidGoal(600), true);
  assert.equal(WeeklyGoalLogic.isValidGoal(10080), true);
});

test("T3: rejects goals outside the range or not whole numbers", () => {
  [0, -5, 1.5, 10081, 99999, NaN, Infinity, -Infinity].forEach((value) => {
    assert.equal(WeeklyGoalLogic.isValidGoal(value), false, String(value));
  });
});

test("T3: rejects values that are not numbers", () => {
  ["300", null, undefined, true, {}, [], (() => 300)].forEach((value) => {
    assert.equal(WeeklyGoalLogic.isValidGoal(value), false, String(value));
  });
});

test("T3: reads a valid stored goal", () => {
  assert.equal(WeeklyGoalLogic.parseStoredGoal('{"minutos":600}'), 600);
  assert.equal(WeeklyGoalLogic.parseStoredGoal('{"minutos":1}'), 1);
  assert.equal(WeeklyGoalLogic.parseStoredGoal('{"minutos":10080}'), 10080);
  assert.equal(WeeklyGoalLogic.parseStoredGoal('  {"minutos": 600}  '), 600);
});

test("T3: treats an out-of-range stored goal as no goal", () => {
  ['{"minutos":0}', '{"minutos":-5}', '{"minutos":1.5}', '{"minutos":10081}'].forEach(
    (value) => {
      assert.equal(WeeklyGoalLogic.parseStoredGoal(value), null, value);
    }
  );
});

test("T3: treats a wrong shape as no goal", () => {
  [
    '{"minutos":"300"}',
    '{"minutos":null}',
    '{"minutos":[300]}',
    "{}",
    "[]",
    "null",
    '"600"',
    "600",
    "true",
  ].forEach((value) => {
    assert.equal(WeeklyGoalLogic.parseStoredGoal(value), null, value);
  });
});

test("T3: never throws on broken or missing data", () => {
  assert.equal(WeeklyGoalLogic.parseStoredGoal("{roto"), null);
  assert.equal(WeeklyGoalLogic.parseStoredGoal("{"), null);
  assert.equal(WeeklyGoalLogic.parseStoredGoal(""), null);
  assert.equal(WeeklyGoalLogic.parseStoredGoal(null), null);
  assert.equal(WeeklyGoalLogic.parseStoredGoal(undefined), null);
  assert.equal(WeeklyGoalLogic.parseStoredGoal({ minutos: NaN }), null);
  assert.equal(WeeklyGoalLogic.parseStoredGoal({ minutos: Infinity }), null);
  assert.equal(WeeklyGoalLogic.parseStoredGoal({ minutos: 600 }), null);
});

test("T3: does not modify the value it reads", () => {
  const raw = '{"minutos":600}';
  assert.equal(WeeklyGoalLogic.parseStoredGoal(raw), 600);
  assert.equal(raw, '{"minutos":600}');

  const notText = { minutos: 600, extra: true };
  assert.equal(WeeklyGoalLogic.parseStoredGoal(notText), null);
  assert.deepEqual(notText, { minutos: 600, extra: true });
});

test("T3: is deterministic when reading the same value", () => {
  const raw = '{"minutos":600}';

  assert.equal(WeeklyGoalLogic.parseStoredGoal(raw), WeeklyGoalLogic.parseStoredGoal(raw));
  assert.equal(WeeklyGoalLogic.parseStoredGoal("{roto"), WeeklyGoalLogic.parseStoredGoal("{roto"));
});

test("T3: accepts every goal the text validation produces", () => {
  ["1", "300", "10080"].forEach((text) => {
    const result = WeeklyGoalLogic.validateGoalInput(text);

    assert.equal(result.ok, true);
    assert.equal(WeeklyGoalLogic.isValidGoal(result.minutes), true);
  });
});

// T4: strict weekly minutes (RF-2, CA-2.1 to CA-2.6, CA-7.4). The fixture week
// of 2026-10-19 runs from Monday 19 to Sunday 25 October 2026.
function makeSession(id, fecha, minutos, tema = "Tema") {
  return { id, fecha, tema, minutos };
}

test("T4: exposes the weekly minutes helper", () => {
  assert.equal(typeof WeeklyGoalLogic.sumWeeklyMinutes, "function");
});

test("T4: sums sessions of the current week, even on the same day", () => {
  const sessions = [
    makeSession(1, "2026-10-19", 30),
    makeSession(2, "2026-10-19", 15),
    makeSession(3, "2026-10-21", 25),
    makeSession(4, "2026-10-25", 5),
  ];

  // Today is Sunday, so the whole week is already in the past.
  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(sessions, "2026-10-25"), 75);
});

test("T4: counts a session of today", () => {
  assert.equal(
    WeeklyGoalLogic.sumWeeklyMinutes([makeSession(1, "2026-10-19", 60)], TODAY),
    60
  );
});

test("T4: ignores a future session inside the current week", () => {
  const sessions = [
    makeSession(1, "2026-10-20", 45),
    makeSession(2, "2026-10-25", 30),
    makeSession(3, "2026-10-19", 10),
  ];

  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(sessions, TODAY), 10);
});

test("T4: ignores sessions outside the current week", () => {
  const sessions = [
    makeSession(1, "2026-10-18", 100),
    makeSession(2, "2026-10-26", 100),
    makeSession(3, "2025-10-19", 100),
    makeSession(4, "2026-10-19", 20),
  ];

  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(sessions, TODAY), 20);
});

test("T4: ignores invalid minutes one by one and keeps the rest", () => {
  const sessions = [
    makeSession(1, "2026-10-19", 0),
    makeSession(2, "2026-10-19", -30),
    makeSession(3, "2026-10-19", NaN),
    makeSession(4, "2026-10-19", Infinity),
    makeSession(5, "2026-10-19", "30"),
    makeSession(6, "2026-10-19", null),
    makeSession(7, "2026-10-18", 90),
    makeSession(8, "2026-10-19", 45),
  ];

  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(sessions, TODAY), 45);
});

test("T4: ignores malformed dates one by one and keeps the rest", () => {
  const sessions = [
    makeSession(1, "2026-2-3", 30),
    makeSession(2, "2026-02-30", 30),
    makeSession(3, "19-10-2026", 30),
    makeSession(4, null, 30),
    makeSession(5, 20261019, 30),
    makeSession(6, "2026-10-19", 10),
  ];

  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(sessions, TODAY), 10);
});

test("T4: returns 0 when the list is not an array", () => {
  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(null, TODAY), 0);
  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(undefined, TODAY), 0);
  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes({}, TODAY), 0);
  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes("sesiones", TODAY), 0);
  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes([], TODAY), 0);
});

test("T4: ignores a session that is not an object", () => {
  const sessions = [null, "sesión", 42, makeSession(1, "2026-10-19", 20)];

  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(sessions, TODAY), 20);
});

test("T4: counts a duplicated id only on its first appearance", () => {
  const sessions = [
    makeSession("a", "2026-10-19", 30),
    makeSession("a", "2026-10-19", 20),
  ];

  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(sessions, TODAY), 30);
});

test("T4: consumes the id even when the first session is future", () => {
  const sessions = [
    makeSession(1, "2026-10-21", 60),
    makeSession(1, "2026-10-19", 60),
  ];

  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(sessions, TODAY), 0);
});

test("T4: consumes the id even when the first session is invalid", () => {
  const sessions = [
    makeSession(1, "2026-10-19", 0),
    makeSession(1, "2026-10-19", 60),
  ];

  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(sessions, TODAY), 0);
});

test("T4: sums sessions without an id separately", () => {
  const withoutId = [
    { fecha: "2026-10-19", minutos: 15 },
    { fecha: "2026-10-19", minutos: 25 },
  ];
  const withNullId = [
    makeSession(null, "2026-10-19", 15),
    makeSession(null, "2026-10-19", 25),
  ];

  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(withoutId, TODAY), 40);
  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(withNullId, TODAY), 40);
});

test("T4: rounds the weekly total to the nearest minute", () => {
  assert.equal(
    WeeklyGoalLogic.sumWeeklyMinutes([makeSession(1, "2026-10-19", 14.5)], TODAY),
    15
  );
  assert.equal(
    WeeklyGoalLogic.sumWeeklyMinutes([makeSession(1, "2026-10-19", 14.4)], TODAY),
    14
  );
  assert.equal(
    WeeklyGoalLogic.sumWeeklyMinutes(
      [makeSession(1, "2026-10-19", 10), makeSession(2, "2026-10-19", 4.5)],
      TODAY
    ),
    15
  );
  assert.equal(
    WeeklyGoalLogic.sumWeeklyMinutes([makeSession(1, "2026-10-19", 0.5)], TODAY),
    1
  );
  assert.equal(
    WeeklyGoalLogic.sumWeeklyMinutes([makeSession(1, "2026-10-19", 30)], TODAY),
    30
  );
});

test("T4: aggregates one thousand valid sessions", () => {
  const sessions = [];

  for (let index = 0; index < 1000; index += 1) {
    sessions.push(makeSession(index, "2026-10-19", 10));
  }

  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(sessions, TODAY), 10000);
});

test("T4: does not mutate the list it receives", () => {
  const sessions = Object.freeze([
    makeSession(2, "2026-10-19", 25),
    makeSession(1, "2026-10-19", 30),
    makeSession(null, "2026-10-18", 90),
  ]);

  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(sessions, TODAY), 55);
  assert.deepEqual(sessions, [
    { id: 2, fecha: "2026-10-19", tema: "Tema", minutos: 25 },
    { id: 1, fecha: "2026-10-19", tema: "Tema", minutos: 30 },
    { id: null, fecha: "2026-10-18", tema: "Tema", minutos: 90 },
  ]);
});

test("T4: returns null for an invalid today, like getWeekRange", () => {
  const sessions = [makeSession(1, "2026-10-19", 30)];

  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(sessions, "2026-02-30"), null);
  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(sessions, "2026-2-3"), null);
  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(sessions, ""), null);
  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(sessions, null), null);
  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(sessions, undefined), null);
});

test("T4: moves the week with today", () => {
  const sessions = [
    makeSession(1, "2026-10-19", 30),
    makeSession(2, "2026-10-26", 40),
  ];

  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(sessions, "2026-10-19"), 30);
  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(sessions, "2026-10-26"), 40);
  assert.equal(WeeklyGoalLogic.sumWeeklyMinutes(sessions, "2026-10-25"), 30);
});

// T5: weekly progress (RF-2, RF-3; CA-2.7 to CA-2.10). `total` is the rounded
// weekly total, `goal` the weekly goal, `percent` the visible percentage,
// `remaining` the minutes still left (0 when reached), `barRatio` the bar fill
// (never above 1) and `summary` / `message` the visible texts.
function progressOf(total, goal, today = TODAY) {
  const sessions = total > 0 ? [makeSession(1, today, total)] : [];

  return WeeklyGoalLogic.buildProgress(sessions, goal, today);
}

test("T5: exposes the progress helpers", () => {
  assert.equal(typeof WeeklyGoalLogic.buildProgress, "function");
  assert.equal(typeof WeeklyGoalLogic.getProgressSummary, "function");
  assert.equal(typeof WeeklyGoalLogic.getProgressMessage, "function");
});

test("T5: shows no activity with 0 of 300 minutes", () => {
  const progress = progressOf(0, 300);

  assert.equal(progress.state, "idle");
  assert.equal(progress.total, 0);
  assert.equal(progress.goal, 300);
  assert.equal(progress.percent, 0);
  assert.equal(progress.remaining, 300);
  assert.equal(progress.barRatio, 0);
  assert.equal(progress.summary, "0 de 300 min · 0 %");
  assert.equal(progress.message, "Te faltan 300 min");
  assert.deepEqual([progress.start, progress.end], ["2026-10-19", "2026-10-25"]);
});

test("T5: exposes the state title helper", () => {
  assert.equal(typeof WeeklyGoalLogic.getStateTitle, "function");
});

test("T5: titles the week with no activity yet", () => {
  assert.equal(
    WeeklyGoalLogic.getStateTitle(progressOf(0, 300)),
    "Aún no has estudiado esta semana"
  );
  assert.equal(
    WeeklyGoalLogic.getStateTitle(progressOf(0, 1)),
    "Aún no has estudiado esta semana"
  );
});

test("T5: writes no title outside the idle state", () => {
  assert.equal(WeeklyGoalLogic.getStateTitle(progressOf(120, 300)), "");
  assert.equal(WeeklyGoalLogic.getStateTitle(progressOf(300, 300)), "");
  assert.equal(WeeklyGoalLogic.getStateTitle(progressOf(345, 300)), "");
  assert.equal(WeeklyGoalLogic.getStateTitle(null), "");
  assert.equal(WeeklyGoalLogic.getStateTitle(undefined), "");
});

test("T5: keeps 1 percent when there is some activity and rounding gives 0", () => {
  const progress = progressOf(1, 10080);

  assert.equal(progress.state, "in-progress");
  assert.equal(progress.percent, 1);
  assert.equal(progress.remaining, 10079);
  assert.equal(progress.summary, "1 de 10080 min · 1 %");
  assert.equal(progress.message, "Te faltan 10079 min");
});

test("T5: rounds the percentage to the nearest whole number", () => {
  assert.equal(progressOf(1, 3).percent, 33);
  assert.equal(progressOf(1, 3).message, "Te faltan 2 min");
  assert.equal(progressOf(120, 300).percent, 40);
  assert.equal(progressOf(120, 300).message, "Te faltan 180 min");
  assert.equal(progressOf(120, 300).state, "in-progress");
  assert.equal(progressOf(2, 3).percent, 67);
});

test("T5: shows 99 percent when rounding would give 100 without reaching the goal", () => {
  const progress = progressOf(299, 300);

  assert.equal(progress.state, "in-progress");
  assert.equal(progress.percent, 99);
  assert.equal(progress.remaining, 1);
  assert.equal(progress.message, "Te falta 1 min");
  assert.equal(progress.summary, "299 de 300 min · 99 %");
});

test("T5: marks the goal as met", () => {
  const progress = progressOf(300, 300);

  assert.equal(progress.state, "met");
  assert.equal(progress.percent, 100);
  assert.equal(progress.remaining, 0);
  assert.equal(progress.barRatio, 1);
  assert.equal(progress.summary, "300 de 300 min · 100 %");
  assert.equal(progress.message, "¡Objetivo cumplido!");
});

test("T5: marks the goal as exceeded by one minute", () => {
  const progress = progressOf(301, 300);

  assert.equal(progress.state, "exceeded");
  assert.equal(progress.percent, 100);
  assert.equal(progress.remaining, 0);
  assert.equal(progress.barRatio, 1);
  assert.equal(progress.summary, "301 de 300 min · 100 %");
  assert.equal(progress.message, "¡Objetivo superado! +1 min");
});

test("T5: marks the goal as exceeded with the real percentage", () => {
  const progress = progressOf(345, 300);

  assert.equal(progress.state, "exceeded");
  assert.equal(progress.percent, 115);
  assert.equal(progress.remaining, 0);
  assert.equal(progress.barRatio, 1);
  assert.equal(progress.summary, "345 de 300 min · 115 %");
  assert.equal(progress.message, "¡Objetivo superado! +45 min");
});

test("T5: has no upper limit on the percentage", () => {
  const progress = progressOf(900, 300);

  assert.equal(progress.state, "exceeded");
  assert.equal(progress.percent, 300);
  assert.equal(progress.summary, "900 de 300 min · 300 %");
  assert.equal(progress.message, "¡Objetivo superado! +600 min");
});

test("T5: keeps the bar between 0 and 1", () => {
  assert.equal(progressOf(0, 300).barRatio, 0);
  assert.equal(progressOf(1, 300).barRatio < 1, true);
  assert.equal(progressOf(120, 300).barRatio, 0.4);
  assert.equal(progressOf(299, 300).barRatio < 1, true);
  assert.equal(progressOf(300, 300).barRatio, 1);
  assert.equal(progressOf(900, 300).barRatio, 1);
});

test("T5: works with the smallest goal, in singular", () => {
  const empty = progressOf(0, 1);
  const met = progressOf(1, 1);

  assert.equal(empty.percent, 0);
  assert.equal(empty.remaining, 1);
  assert.equal(empty.message, "Te falta 1 min");
  assert.equal(empty.summary, "0 de 1 min · 0 %");
  assert.equal(empty.barRatio, 0);
  assert.equal(met.state, "met");
  assert.equal(met.percent, 100);
  assert.equal(met.barRatio, 1);
});

test("T5: accepts the largest goal", () => {
  const progress = progressOf(10080, 10080);

  assert.equal(progress.state, "met");
  assert.equal(progress.percent, 100);
  assert.equal(progress.summary, "10080 de 10080 min · 100 %");
});

test("T5: rounds the weekly total before comparing it with the goal", () => {
  const progress = progressOf(14.5, 300);

  assert.equal(progress.total, 15);
  assert.equal(progress.percent, 5);
  assert.equal(progress.remaining, 285);
  assert.equal(progress.summary, "15 de 300 min · 5 %");
  assert.equal(progress.message, "Te faltan 285 min");
});

test("T5: returns null when the goal is invalid", () => {
  [0, -5, 1.5, 10081, NaN, Infinity, "300", null, undefined, {}].forEach((goal) => {
    assert.equal(progressOf(60, goal), null, String(goal));
  });
});

test("T5: returns null when today is invalid", () => {
  [null, undefined, "", "2026-02-30", "2026-2-3", "19-10-2026"].forEach((today) => {
    assert.equal(WeeklyGoalLogic.buildProgress([], 300, today), null, String(today));
  });
});

test("T5: treats a missing or broken session list as 0 minutes", () => {
  [null, undefined, {}, "sesiones"].forEach((sessions) => {
    const progress = WeeklyGoalLogic.buildProgress(sessions, 300, TODAY);

    assert.equal(progress.total, 0);
    assert.equal(progress.state, "idle");
  });
});

test("T5: builds the same progress for the same data", () => {
  const sessions = Object.freeze([makeSession(1, "2026-10-19", 120)]);

  const first = WeeklyGoalLogic.buildProgress(sessions, 300, TODAY);
  const second = WeeklyGoalLogic.buildProgress(sessions, 300, TODAY);

  assert.deepEqual(first, second);
  assert.deepEqual(sessions, [
    { id: 1, fecha: "2026-10-19", tema: "Tema", minutos: 120 },
  ]);
});

test("T5: exposes the visible texts through the summary and message helpers", () => {
  const progress = progressOf(120, 300);

  assert.equal(WeeklyGoalLogic.getProgressSummary(progress), "120 de 300 min · 40 %");
  assert.equal(WeeklyGoalLogic.getProgressSummary(progress), progress.summary);
  assert.equal(WeeklyGoalLogic.getProgressMessage(progress), "Te faltan 180 min");
  assert.equal(WeeklyGoalLogic.getProgressMessage(progress), progress.message);
});

test("T5: returns empty texts when there is no progress", () => {
  assert.equal(WeeklyGoalLogic.getProgressSummary(null), "");
  assert.equal(WeeklyGoalLogic.getProgressMessage(null), "");
});

test("T5: counts only sessions up to today inside the current week", () => {
  const sessions = [
    makeSession(1, "2026-10-18", 100),
    makeSession(2, "2026-10-20", 100),
    makeSession(3, "2026-10-19", 60),
  ];
  const progress = WeeklyGoalLogic.buildProgress(sessions, 120, TODAY);

  assert.equal(progress.total, 60);
  assert.equal(progress.percent, 50);
  assert.equal(progress.state, "in-progress");
  assert.equal(progress.message, "Te faltan 60 min");
});

// T6: accessible text (RF-3, RF-8; CA-8.2, CA-8.3) and the closing checks of
// the pure logic suite.
test("T6: exposes the accessible text helper", () => {
  assert.equal(typeof WeeklyGoalLogic.getAccessibleLabel, "function");
});

test("T6: describes the week with no activity yet", () => {
  assert.equal(
    WeeklyGoalLogic.getAccessibleLabel(progressOf(0, 300)),
    "Semana del 19 al 25 de octubre: 0 de 300 minutos, 0 por ciento. Te faltan 300 minutos."
  );
});

test("T6: describes the week in progress", () => {
  assert.equal(
    WeeklyGoalLogic.getAccessibleLabel(progressOf(120, 300)),
    "Semana del 19 al 25 de octubre: 120 de 300 minutos, 40 por ciento. Te faltan 180 minutos."
  );
});

test("T6: describes the met week without leftovers", () => {
  assert.equal(
    WeeklyGoalLogic.getAccessibleLabel(progressOf(300, 300)),
    "Semana del 19 al 25 de octubre: 300 de 300 minutos, 100 por ciento. Objetivo cumplido."
  );
});

test("T6: describes the exceeded week", () => {
  assert.equal(
    WeeklyGoalLogic.getAccessibleLabel(progressOf(345, 300)),
    "Semana del 19 al 25 de octubre: 345 de 300 minutos, 115 por ciento. Objetivo superado por 45 minutos."
  );
});

test("T6: writes one minute in singular", () => {
  assert.equal(
    WeeklyGoalLogic.getAccessibleLabel(progressOf(299, 300)),
    "Semana del 19 al 25 de octubre: 299 de 300 minutos, 99 por ciento. Te falta 1 minuto."
  );
  assert.equal(
    WeeklyGoalLogic.getAccessibleLabel(progressOf(301, 300)),
    "Semana del 19 al 25 de octubre: 301 de 300 minutos, 100 por ciento. Objetivo superado por 1 minuto."
  );
  assert.equal(
    WeeklyGoalLogic.getAccessibleLabel(progressOf(0, 1)),
    "Semana del 19 al 25 de octubre: 0 de 1 minuto, 0 por ciento. Te falta 1 minuto."
  );
});

test("T6: writes the range of a week crossing a month and a year", () => {
  // 2026-09-30 is a Wednesday: 28 September to 4 October 2026.
  assert.equal(
    WeeklyGoalLogic.getAccessibleLabel(
      WeeklyGoalLogic.buildProgress(
        [makeSession(1, "2026-09-30", 60)],
        300,
        "2026-09-30"
      )
    ),
    "Semana del 28 de septiembre al 4 de octubre: 60 de 300 minutos, 20 por ciento. Te faltan 240 minutos."
  );

  // 2025-12-29 is a Monday: 29 December 2025 to 4 January 2026.
  assert.equal(
    WeeklyGoalLogic.getAccessibleLabel(
      WeeklyGoalLogic.buildProgress(
        [makeSession(1, "2025-12-29", 30)],
        300,
        "2025-12-29"
      )
    ),
    "Semana del 29 de diciembre al 4 de enero: 30 de 300 minutos, 10 por ciento. Te faltan 270 minutos."
  );
});

test("T6: writes no accessible text when there is no progress", () => {
  assert.equal(WeeklyGoalLogic.getAccessibleLabel(null), "");
  assert.equal(WeeklyGoalLogic.getAccessibleLabel(undefined), "");
});

test("T6: leaves no exported function without a test", () => {
  const testSource = fs.readFileSync(
    path.join(__dirname, "weekly-goal.test.js"),
    "utf8"
  );
  const exportedFunctions = Object.keys(WeeklyGoalLogic).filter(
    (name) => typeof WeeklyGoalLogic[name] === "function"
  );

  assert.equal(exportedFunctions.length > 0, true);

  exportedFunctions.forEach((name) => {
    assert.match(
      testSource,
      new RegExp(`WeeklyGoalLogic\\.${name}\\(`),
      `${name} no tiene ninguna prueba`
    );
  });
});

test("T6: stays pure when its source is read", () => {
  const source = fs.readFileSync(logicPath, "utf8");

  assert.doesNotMatch(source, /\bdocument\b/);
  assert.doesNotMatch(source, /\blocalStorage\b/);
  assert.doesNotMatch(source, /\bDate\.now\b/);
  assert.doesNotMatch(source, /\bnew\s+Date\s*\(\s*\)/);
  assert.doesNotMatch(source, /\bnew\s+Date\b/);
});

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const logicPath = path.join(__dirname, "..", "heat-map-logic.js");
const HeatMapLogic = require(logicPath);

test("T1: exposes the logic as an object", () => {
  assert.equal(typeof HeatMapLogic, "object");
  assert.notEqual(HeatMapLogic, null);
  assert.equal(Array.isArray(HeatMapLogic), false);
});

test("T1: stays independent from DOM, storage, and clock", () => {
  const source = fs.readFileSync(logicPath, "utf8");

  assert.doesNotMatch(source, /\bdocument\b/);
  assert.doesNotMatch(source, /\blocalStorage\b/);
  assert.doesNotMatch(source, /\bDate\.now\b/);
});

// Fixtures: 2026-10-19 is a Monday.
const TODAY = "2026-10-19";

function makeSession(id, fecha, minutos, tema = "Tema") {
  return { id, fecha, tema, minutos };
}

function findDay(data, date) {
  return data.days.find((day) => day.date === date);
}

// T2: date helpers
test("T2: parses and rejects ISO dates", () => {
  assert.deepEqual(HeatMapLogic.parseIsoDate("2026-10-19"), {
    year: 2026,
    month: 10,
    day: 19,
  });
  assert.equal(HeatMapLogic.parseIsoDate("2026-02-30"), null);
  assert.equal(HeatMapLogic.parseIsoDate("2026-2-3"), null);
  assert.equal(HeatMapLogic.parseIsoDate("19-10-2026"), null);
  assert.equal(HeatMapLogic.parseIsoDate(""), null);
});

test("T2: composes ISO dates", () => {
  assert.equal(HeatMapLogic.toIsoDate(2026, 10, 19), "2026-10-19");
  assert.equal(HeatMapLogic.toIsoDate(2026, 1, 5), "2026-01-05");
});

test("T2: adds days across months, years, and leap days", () => {
  assert.equal(HeatMapLogic.addDays("2025-12-31", 1), "2026-01-01");
  assert.equal(HeatMapLogic.addDays("2026-03-01", -1), "2026-02-28");
  assert.equal(HeatMapLogic.addDays("2024-02-28", 1), "2024-02-29");
  assert.equal(HeatMapLogic.addDays("2026-03-28", 2), "2026-03-30");
  assert.equal(HeatMapLogic.addDays("2026-10-19", -77), "2026-08-03");
  assert.equal(HeatMapLogic.addDays("not-a-date", 1), null);
});

test("T2: maps weekdays with Monday as zero", () => {
  assert.equal(HeatMapLogic.getWeekdayIndex("2026-10-19"), 0);
  assert.equal(HeatMapLogic.getWeekdayIndex("2026-10-20"), 1);
  assert.equal(HeatMapLogic.getWeekdayIndex("2026-10-25"), 6);
});

test("T2: finds the Monday of a week", () => {
  assert.equal(HeatMapLogic.getMonday("2026-10-19"), "2026-10-19");
  assert.equal(HeatMapLogic.getMonday("2026-10-21"), "2026-10-19");
  assert.equal(HeatMapLogic.getMonday("2026-10-25"), "2026-10-19");
});

// T3: Spanish formatting
test("T3: formats short, long, and month-day dates", () => {
  assert.equal(HeatMapLogic.formatShortDate("2026-10-19"), "19 oct");
  assert.equal(HeatMapLogic.formatLongDate("2026-10-19"), "lunes 19 de octubre");
  assert.equal(HeatMapLogic.formatMonthDay("2026-10-19"), "19 de octubre");
  assert.equal(HeatMapLogic.formatShortDate("2026-08-03"), "3 ago");
  assert.equal(HeatMapLogic.formatLongDate("2026-10-25"), "domingo 25 de octubre");
});

// T4: validators and levels
test("T4: validates minutes", () => {
  assert.equal(HeatMapLogic.isValidMinutes(1), true);
  assert.equal(HeatMapLogic.isValidMinutes(14.5), true);
  assert.equal(HeatMapLogic.isValidMinutes(0), false);
  assert.equal(HeatMapLogic.isValidMinutes(-1), false);
  assert.equal(HeatMapLogic.isValidMinutes("30"), false);
  assert.equal(HeatMapLogic.isValidMinutes(NaN), false);
  assert.equal(HeatMapLogic.isValidMinutes(Infinity), false);
  assert.equal(HeatMapLogic.isValidMinutes(null), false);
});

test("T4: validates sessions by date and minutes only", () => {
  assert.equal(
    HeatMapLogic.isValidSession({ fecha: "2026-10-19", minutos: 30 }),
    true
  );
  assert.equal(
    HeatMapLogic.isValidSession({ fecha: "2026-02-30", minutos: 30 }),
    false
  );
  assert.equal(
    HeatMapLogic.isValidSession({ fecha: "2026-10-19", minutos: 0 }),
    false
  );
  assert.equal(HeatMapLogic.isValidSession(null), false);
});

test("T4: classifies minutes into five levels", () => {
  assert.equal(HeatMapLogic.getLevel(0), 0);
  assert.equal(HeatMapLogic.getLevel(-5), 0);
  assert.equal(HeatMapLogic.getLevel(1), 1);
  assert.equal(HeatMapLogic.getLevel(14), 1);
  assert.equal(HeatMapLogic.getLevel(15), 2);
  assert.equal(HeatMapLogic.getLevel(29), 2);
  assert.equal(HeatMapLogic.getLevel(30), 3);
  assert.equal(HeatMapLogic.getLevel(59), 3);
  assert.equal(HeatMapLogic.getLevel(60), 4);
  assert.equal(HeatMapLogic.getLevel(999), 4);
});

// T5: aggregation
test("T5: sums valid sessions by day and ignores invalid or future ones", () => {
  const sessions = [
    makeSession(1, TODAY, 45),
    makeSession(2, TODAY, 30),
    makeSession(3, "2026-10-18", 25),
    makeSession(4, "2026-10-20", 10),
    makeSession(5, TODAY, 0),
    makeSession(6, TODAY, "30"),
    makeSession(7, TODAY, NaN),
  ];

  assert.deepEqual(HeatMapLogic.aggregateMinutes(sessions, TODAY), {
    "2026-10-19": 75,
    "2026-10-18": 25,
  });
});

test("T5: counts a duplicated id only once", () => {
  const sessions = [
    makeSession(1, TODAY, 45),
    makeSession(1, TODAY, 30),
  ];

  assert.deepEqual(HeatMapLogic.aggregateMinutes(sessions, TODAY), {
    "2026-10-19": 45,
  });
});

test("T5: rounds each daily total to the nearest minute", () => {
  const sessions = [
    makeSession(1, TODAY, 10),
    makeSession(2, TODAY, 4.5),
  ];

  assert.deepEqual(HeatMapLogic.aggregateMinutes(sessions, TODAY), {
    "2026-10-19": 15,
  });
});

test("T5: treats non-array input as empty and does not mutate it", () => {
  assert.deepEqual(HeatMapLogic.aggregateMinutes(null, TODAY), {});

  const sessions = Object.freeze([
    Object.freeze(makeSession(1, TODAY, 45)),
  ]);

  HeatMapLogic.aggregateMinutes(sessions, TODAY);
  assert.deepEqual(sessions, [makeSession(1, TODAY, 45)]);
});

test("T5: aggregates one thousand sessions", () => {
  const sessions = Array.from({ length: 1000 }, (_, index) =>
    makeSession(index, TODAY, 1)
  );

  assert.deepEqual(HeatMapLogic.aggregateMinutes(sessions, TODAY), {
    "2026-10-19": 1000,
  });
});

// T6: period and 84-day model
test("T6: builds the 12-week period ending on the current week", () => {
  const data = HeatMapLogic.buildData([], TODAY);

  assert.equal(data.start, "2026-08-03");
  assert.equal(data.end, "2026-10-25");
  assert.equal(data.today, TODAY);
  assert.equal(data.weeks, 12);
  assert.equal(data.days.length, 84);
  assert.equal(data.todayIndex, 77);
  assert.equal(data.days[0].date, "2026-08-03");
  assert.equal(data.days[83].date, "2026-10-25");
  assert.equal(data.days[0].weekIndex, 0);
  assert.equal(data.days[0].dayIndex, 0);
  assert.equal(data.days[7].weekIndex, 1);
  assert.equal(data.days[7].dayIndex, 0);
  assert.equal(data.days[83].weekIndex, 11);
  assert.equal(data.days[83].dayIndex, 6);
});

test("T6: marks future days and excludes their minutes", () => {
  const data = HeatMapLogic.buildData(
    [makeSession(1, "2026-10-20", 100)],
    TODAY
  );
  const futureDays = data.days.filter((day) => day.isFuture);

  assert.equal(futureDays.length, 6);
  assert.equal(findDay(data, "2026-10-20").minutes, 0);
  assert.equal(findDay(data, "2026-10-20").level, 0);
  assert.equal(data.studiedDays, 0);
});

test("T6: aggregates sessions inside the period and ignores the rest", () => {
  const sessions = [
    makeSession(1, TODAY, 45),
    makeSession(2, TODAY, 30),
    makeSession(3, "2026-10-18", 25),
    makeSession(4, "2026-07-01", 100),
  ];
  const data = HeatMapLogic.buildData(sessions, TODAY);

  assert.equal(findDay(data, TODAY).minutes, 75);
  assert.equal(findDay(data, TODAY).level, 4);
  assert.equal(findDay(data, "2026-10-18").minutes, 25);
  assert.equal(findDay(data, "2026-10-18").level, 2);
  assert.equal(data.studiedDays, 2);
});

test("T6: uses the same period when today is Monday or Sunday", () => {
  const monday = HeatMapLogic.buildData([], "2026-10-19");
  const sunday = HeatMapLogic.buildData([], "2026-10-25");

  assert.equal(monday.start, sunday.start);
  assert.equal(monday.end, sunday.end);
  assert.equal(monday.todayIndex, 77);
  assert.equal(sunday.todayIndex, 83);
  assert.equal(
    sunday.days.filter((day) => day.isFuture).length,
    0
  );
});

test("T6: handles a period crossing the year boundary", () => {
  const data = HeatMapLogic.buildData([], "2026-01-01");

  assert.equal(data.start, "2025-10-13");
  assert.equal(data.end, "2026-01-04");
  assert.equal(data.days.length, 84);
  assert.equal(data.todayIndex, 80);
  assert.ok(data.days.some((day) => day.date === "2025-12-31"));
  assert.ok(data.days.some((day) => day.date === "2026-01-01"));
});

test("T6: includes a leap day exactly once", () => {
  const data = HeatMapLogic.buildData([], "2024-03-01");
  const leapDays = data.days.filter((day) => day.date === "2024-02-29");

  assert.equal(data.start, "2023-12-11");
  assert.equal(data.end, "2024-03-03");
  assert.equal(leapDays.length, 1);
  assert.equal(data.days.length, 84);
});

test("T6: returns null for an invalid today and tolerates bad sessions", () => {
  assert.equal(HeatMapLogic.buildData([], "not-a-date"), null);

  const data = HeatMapLogic.buildData(null, TODAY);
  assert.equal(data.days.length, 84);
  assert.ok(data.days.every((day) => day.level === 0 && day.minutes === 0));
});

test("T6: is deterministic", () => {
  const sessions = [makeSession(1, TODAY, 45)];
  assert.deepEqual(
    HeatMapLogic.buildData(sessions, TODAY),
    HeatMapLogic.buildData(sessions, TODAY)
  );
});

// T7: month labels
test("T7: labels the first column and each month change", () => {
  const data = HeatMapLogic.buildData([], TODAY);

  assert.deepEqual(HeatMapLogic.getMonthLabels(data.days), [
    { weekIndex: 0, label: "ago" },
    { weekIndex: 4, label: "sep" },
    { weekIndex: 8, label: "oct" },
  ]);
});

test("T7: keeps labels ordered and unique across a year boundary", () => {
  const data = HeatMapLogic.buildData([], "2026-01-01");
  const labels = HeatMapLogic.getMonthLabels(data.days);
  const weeks = labels.map((label) => label.weekIndex);

  assert.deepEqual(labels, [
    { weekIndex: 0, label: "oct" },
    { weekIndex: 2, label: "nov" },
    { weekIndex: 7, label: "dic" },
    { weekIndex: 11, label: "ene" },
  ]);
  assert.equal(new Set(weeks).size, weeks.length);
});

// T8: tooltip, cell label, and summary
test("T8: formats the tooltip without a year", () => {
  assert.equal(
    HeatMapLogic.formatTooltip({
      date: "2026-10-19",
      minutes: 45,
      isFuture: false,
    }),
    "19 oct · 45 min"
  );
  assert.equal(
    HeatMapLogic.formatTooltip({
      date: "2026-10-19",
      minutes: 1,
      isFuture: false,
    }),
    "19 oct · 1 min"
  );
});

test("T8: returns no tooltip for empty or future days", () => {
  assert.equal(
    HeatMapLogic.formatTooltip({
      date: "2026-10-19",
      minutes: 0,
      isFuture: false,
    }),
    null
  );
  assert.equal(
    HeatMapLogic.formatTooltip({
      date: "2026-10-20",
      minutes: 45,
      isFuture: true,
    }),
    null
  );
});

test("T8: writes accessible cell labels", () => {
  assert.equal(
    HeatMapLogic.getCellLabel({
      date: "2026-10-19",
      minutes: 45,
      isFuture: false,
    }),
    "lunes 19 de octubre, 45 minutos de estudio"
  );
  assert.equal(
    HeatMapLogic.getCellLabel({
      date: "2026-10-19",
      minutes: 1,
      isFuture: false,
    }),
    "lunes 19 de octubre, 1 minuto de estudio"
  );
  assert.equal(
    HeatMapLogic.getCellLabel({
      date: "2026-10-19",
      minutes: 0,
      isFuture: false,
    }),
    "lunes 19 de octubre, sin sesiones"
  );
  assert.equal(
    HeatMapLogic.getCellLabel({
      date: "2026-10-20",
      minutes: 0,
      isFuture: true,
    }),
    ""
  );
});

test("T8: summarizes the period with singular and plural", () => {
  const empty = HeatMapLogic.buildData([], TODAY);
  const one = HeatMapLogic.buildData([makeSession(1, TODAY, 45)], TODAY);
  const two = HeatMapLogic.buildData(
    [makeSession(1, TODAY, 45), makeSession(2, "2026-10-18", 25)],
    TODAY
  );

  assert.equal(
    HeatMapLogic.getSummary(empty),
    "Del 3 de agosto al 19 de octubre: 0 días con estudio"
  );
  assert.equal(
    HeatMapLogic.getSummary(one),
    "Del 3 de agosto al 19 de octubre: 1 día con estudio"
  );
  assert.equal(
    HeatMapLogic.getSummary(two),
    "Del 3 de agosto al 19 de octubre: 2 días con estudio"
  );
});

// T9: keyboard focus
test("T9: moves focus one day or one week", () => {
  const last = 77;

  assert.equal(HeatMapLogic.moveFocus(10, "ArrowLeft", last), 3);
  assert.equal(HeatMapLogic.moveFocus(10, "ArrowRight", last), 17);
  assert.equal(HeatMapLogic.moveFocus(10, "ArrowUp", last), 9);
  assert.equal(HeatMapLogic.moveFocus(10, "ArrowDown", last), 11);
});

test("T9: keeps focus inside the focusable range", () => {
  const last = 77;

  assert.equal(HeatMapLogic.moveFocus(0, "ArrowUp", last), 0);
  assert.equal(HeatMapLogic.moveFocus(0, "ArrowLeft", last), 0);
  assert.equal(HeatMapLogic.moveFocus(77, "ArrowRight", last), 77);
  assert.equal(HeatMapLogic.moveFocus(77, "ArrowDown", last), 77);
  assert.equal(HeatMapLogic.moveFocus(77, "ArrowUp", last), 76);
  assert.equal(HeatMapLogic.moveFocus(77, "ArrowLeft", last), 70);
  assert.equal(HeatMapLogic.moveFocus(5, "ArrowRight", last), 12);
  assert.equal(HeatMapLogic.moveFocus(6, "ArrowDown", last), 7);
  assert.equal(HeatMapLogic.moveFocus(7, "ArrowUp", last), 6);
  assert.equal(HeatMapLogic.moveFocus(10, "Enter", last), 10);
});

"use strict";

// Pure logic for the weekly study goal.
// This file must not access the DOM, browser storage, or the current clock:
// the reference date always arrives as the `today` parameter.
const WeeklyGoalLogic = (() => {
  // Date helpers are reused from the heat map logic, which already keeps the
  // local calendar rules. In the browser it is the previous classic script.
  const dateApi =
    typeof module !== "undefined" && module.exports
      ? require("./heat-map-logic.js")
      : HeatMapLogic;

  const MIN_GOAL_MINUTES = 1;
  const MAX_GOAL_MINUTES = 10080;

  const GOAL_ERROR_MESSAGES = {
    empty: "Escribe un número entero de minutos.",
    decimals: "Escribe un número entero de minutos, sin decimales.",
    "sign-or-notation":
      "Escribe el número sin signo ni notación científica, por ejemplo 300.",
    "too-small": "El objetivo debe ser al menos 1 minuto.",
    "too-large": "El objetivo no puede superar 10080 minutos (168 horas).",
  };

  // The field keeps the literal text written by the person, so it is validated
  // as text: a number input could turn "3e2" into 300 before we could see it.
  function toGoalText(rawText) {
    if (rawText === null || rawText === undefined) return "";
    return typeof rawText === "string" ? rawText : String(rawText);
  }

  function validateGoalInput(rawText) {
    const text = toGoalText(rawText).trim();

    if (text === "" || !/\d/.test(text)) return { ok: false, error: "empty" };
    if (text.includes(",") || text.includes(".")) {
      return { ok: false, error: "decimals" };
    }
    // Only digits are allowed, plus a single leading hyphen for the next step.
    if (!/^-?\d+$/.test(text)) return { ok: false, error: "sign-or-notation" };
    if (text.startsWith("-")) return { ok: false, error: "too-small" };

    const minutes = Number(text);
    if (minutes === 0) return { ok: false, error: "too-small" };
    if (minutes > MAX_GOAL_MINUTES) return { ok: false, error: "too-large" };

    return { ok: true, minutes };
  }

  function getGoalErrorMessage(code) {
    return GOAL_ERROR_MESSAGES[code] || "";
  }

  function isValidGoal(value) {
    return (
      typeof value === "number" &&
      Number.isInteger(value) &&
      value >= MIN_GOAL_MINUTES &&
      value <= MAX_GOAL_MINUTES
    );
  }

  // Receives the raw text saved in storage (null when the key does not exist)
  // and returns the goal in minutes, or null when there is no valid goal.
  // A corrupt value is never thrown away: it is only ignored.
  function parseStoredGoal(rawValue) {
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

    return isValidGoal(parsed.minutos) ? parsed.minutos : null;
  }

  function getWeekRange(today) {
    if (dateApi.parseIsoDate(today) === null) return null;

    const start = dateApi.getMonday(today);
    return { start, end: dateApi.addDays(start, 6) };
  }

  function formatWeekRange(start, end) {
    const startLabel = dateApi.formatMonthDay(start);
    const endLabel = dateApi.formatMonthDay(end);
    if (!startLabel || !endLabel) return "";

    const startParts = dateApi.parseIsoDate(start);
    const endParts = dateApi.parseIsoDate(end);
    const sameMonth =
      startParts.year === endParts.year && startParts.month === endParts.month;

    if (sameMonth) {
      // "19 al 25 de octubre": the month is written once.
      const monthName = startLabel.slice(startLabel.indexOf(" de ") + 4);
      return `${startParts.day} al ${endParts.day} de ${monthName}`;
    }

    // "28 de septiembre al 4 de octubre", also across a year boundary.
    return `${startLabel} al ${endLabel}`;
  }

  // Strict weekly total, from Monday to Sunday in local time and up to today.
  // Returns null when today is not a valid date, like getWeekRange.
  function sumWeeklyMinutes(sessions, today) {
    if (dateApi.parseIsoDate(today) === null) return null;
    if (!Array.isArray(sessions)) return 0;

    const range = getWeekRange(today);
    const seenIds = new Set();
    let total = 0;

    sessions.forEach((session) => {
      if (session === null || typeof session !== "object") return;

      // The id is consumed on its first appearance, valid or not, like the
      // heat map: a duplicate is always ignored from the second one onwards.
      if (session.id !== null && session.id !== undefined) {
        if (seenIds.has(session.id)) return;
        seenIds.add(session.id);
      }

      if (dateApi.parseIsoDate(session.fecha) === null) return;
      if (!dateApi.isValidMinutes(session.minutos)) return;
      if (session.fecha > today) return;
      if (session.fecha < range.start || session.fecha > range.end) return;

      total += session.minutos;
    });

    // A half minute rounds up; the sessions themselves are left untouched.
    return Math.round(total);
  }

  // Visible texts of the progress, built from the numbers above (CA-3.2 to
  // CA-3.6). The "min" abbreviation never changes; only the verb does.
  function getProgressSummary(progress) {
    if (!progress) return "";
    return `${progress.total} de ${progress.goal} min · ${progress.percent} %`;
  }

  function getProgressMessage(progress) {
    if (!progress) return "";
    if (progress.state === "met") return "¡Objetivo cumplido!";

    if (progress.state === "exceeded") {
      return `¡Objetivo superado! +${progress.total - progress.goal} min`;
    }

    const verb = progress.remaining === 1 ? "Te falta" : "Te faltan";
    return `${verb} ${progress.remaining} min`;
  }

  // Title of the "no activity yet" state (CA-3.2). Only the idle state has one;
  // the rest return an empty text so the interface can hide it.
  function getStateTitle(progress) {
    if (!progress || progress.state !== "idle") return "";
    return "Aún no has estudiado esta semana";
  }

  // Weekly progress against the goal, in this exact order: rounded total,
  // percentage, remaining minutes, bar fill, and finally state and texts.
  function buildProgress(sessions, goalMinutes, today) {
    if (!isValidGoal(goalMinutes)) return null;
    if (dateApi.parseIsoDate(today) === null) return null;

    const total = sumWeeklyMinutes(sessions, today);

    let percent = Math.round((total * 100) / goalMinutes);
    if (total > 0 && percent === 0) percent = 1;
    if (total < goalMinutes && percent >= 100) percent = 99;

    const remaining = Math.max(0, goalMinutes - total);
    const barRatio = Math.min(total / goalMinutes, 1);

    let state = "idle";
    if (total > 0 && total < goalMinutes) state = "in-progress";
    else if (total === goalMinutes) state = "met";
    else if (total > goalMinutes) state = "exceeded";

    const range = getWeekRange(today);
    const progress = {
      state,
      total,
      goal: goalMinutes,
      percent,
      remaining,
      barRatio,
      start: range.start,
      end: range.end,
    };

    progress.summary = getProgressSummary(progress);
    progress.message = getProgressMessage(progress);

    return progress;
  }

  // Full word used by the accessible text; only the value 1 is singular.
  function formatMinutes(count) {
    return `${count} ${count === 1 ? "minuto" : "minutos"}`;
  }

  // One sentence with the week range, the numbers and the state (CA-8.2,
  // CA-8.3). The unit follows the goal in "X de N minutos".
  function getAccessibleLabel(progress) {
    if (!progress) return "";

    const range = formatWeekRange(progress.start, progress.end);
    const headline =
      `Semana del ${range}: ${progress.total} de ` +
      `${formatMinutes(progress.goal)}, ${progress.percent} por ciento.`;

    if (progress.state === "met") return `${headline} Objetivo cumplido.`;

    if (progress.state === "exceeded") {
      const surplus = formatMinutes(progress.total - progress.goal);
      return `${headline} Objetivo superado por ${surplus}.`;
    }

    const verb = progress.remaining === 1 ? "Te falta" : "Te faltan";
    return `${headline} ${verb} ${formatMinutes(progress.remaining)}.`;
  }

  return {
    validateGoalInput,
    getGoalErrorMessage,
    isValidGoal,
    parseStoredGoal,
    getWeekRange,
    formatWeekRange,
    sumWeeklyMinutes,
    getProgressSummary,
    getProgressMessage,
    getStateTitle,
    buildProgress,
    getAccessibleLabel,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = WeeklyGoalLogic;
}

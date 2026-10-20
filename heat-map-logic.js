"use strict";

// Pure logic for the study heat map.
// This file must not access the DOM, browser storage, or the current clock.
const HeatMapLogic = (() => {
  const MONTHS_SHORT = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];

  const MONTHS_LONG = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  // Indexed by getWeekdayIndex: Monday = 0.
  const WEEKDAYS_LONG = [
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
    "domingo",
  ];

  function pad(value, length) {
    return String(value).padStart(length, "0");
  }

  function createLocalNoon(year, month, day) {
    const date = new Date(year, month - 1, day, 12, 0, 0, 0);
    if (year >= 0 && year < 100) {
      date.setFullYear(year);
    }
    return date;
  }

  function parseIsoDate(value) {
    if (typeof value !== "string") return null;

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = createLocalNoon(year, month, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return { year, month, day };
  }

  function toIsoDate(year, month, day) {
    return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
  }

  function addDays(isoDate, amount) {
    const parts = parseIsoDate(isoDate);
    if (!parts) return null;

    const date = createLocalNoon(parts.year, parts.month, parts.day);
    date.setDate(date.getDate() + amount);

    return toIsoDate(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
  }

  function getWeekdayIndex(isoDate) {
    const parts = parseIsoDate(isoDate);
    if (!parts) return null;

    const date = createLocalNoon(parts.year, parts.month, parts.day);
    return (date.getDay() + 6) % 7;
  }

  function getMonday(isoDate) {
    const weekday = getWeekdayIndex(isoDate);
    if (weekday === null) return null;

    return addDays(isoDate, -weekday);
  }

  function formatShortDate(isoDate) {
    const parts = parseIsoDate(isoDate);
    if (!parts) return "";

    return `${parts.day} ${MONTHS_SHORT[parts.month - 1]}`;
  }

  function formatLongDate(isoDate) {
    const parts = parseIsoDate(isoDate);
    if (!parts) return "";

    const weekday = WEEKDAYS_LONG[getWeekdayIndex(isoDate)];
    return `${weekday} ${parts.day} de ${MONTHS_LONG[parts.month - 1]}`;
  }

  function formatMonthDay(isoDate) {
    const parts = parseIsoDate(isoDate);
    if (!parts) return "";

    return `${parts.day} de ${MONTHS_LONG[parts.month - 1]}`;
  }

  function isValidMinutes(value) {
    return typeof value === "number" && Number.isFinite(value) && value > 0;
  }

  function isValidSession(session) {
    return (
      session !== null &&
      typeof session === "object" &&
      !Array.isArray(session) &&
      parseIsoDate(session.fecha) !== null &&
      isValidMinutes(session.minutos)
    );
  }

  function aggregateMinutes(sessions, today) {
    if (!Array.isArray(sessions) || parseIsoDate(today) === null) {
      return {};
    }

    const seenIds = new Set();
    const totals = {};

    sessions.forEach((session) => {
      if (session === null || typeof session !== "object") return;

      if (session.id !== null && session.id !== undefined) {
        if (seenIds.has(session.id)) return;
        seenIds.add(session.id);
      }

      if (!isValidSession(session)) return;
      if (session.fecha > today) return;

      totals[session.fecha] = (totals[session.fecha] || 0) + session.minutos;
    });

    Object.keys(totals).forEach((date) => {
      totals[date] = Math.round(totals[date]);
    });

    return totals;
  }

  function getLevel(minutes) {
    const value = Number.isFinite(minutes) ? minutes : 0;

    if (value <= 0) return 0;
    if (value < 15) return 1;
    if (value < 30) return 2;
    if (value < 60) return 3;
    return 4;
  }

  function buildData(sessions, today) {
    if (parseIsoDate(today) === null) return null;

    const monday = getMonday(today);
    const start = addDays(monday, -77);
    const end = addDays(monday, 6);
    const minutesByDate = aggregateMinutes(sessions, today);
    const days = [];

    for (let index = 0; index < 84; index += 1) {
      const date = addDays(start, index);
      const minutes = minutesByDate[date] || 0;
      const isFuture = date > today;

      days.push({
        date,
        weekIndex: Math.floor(index / 7),
        dayIndex: index % 7,
        minutes,
        level: isFuture ? 0 : getLevel(minutes),
        isFuture,
      });
    }

    const todayIndex = days.findIndex((day) => day.date === today);
    const studiedDays = days.filter(
      (day) => !day.isFuture && day.minutes > 0
    ).length;

    return {
      start,
      end,
      today,
      todayIndex,
      weeks: 12,
      days,
      studiedDays,
    };
  }

  function getMonthLabels(days) {
    if (!Array.isArray(days)) return [];

    const labels = [];
    let lastMonth = null;

    days.forEach((day) => {
      const parts = parseIsoDate(day.date);
      if (!parts) return;

      if (parts.month !== lastMonth) {
        labels.push({
          weekIndex: day.weekIndex,
          label: MONTHS_SHORT[parts.month - 1],
        });
        lastMonth = parts.month;
      }
    });

    return labels;
  }

  function formatTooltip(day) {
    if (
      !day ||
      day.isFuture ||
      !Number.isFinite(day.minutes) ||
      day.minutes <= 0
    ) {
      return null;
    }

    const shortDate = formatShortDate(day.date);
    if (!shortDate) return null;

    return `${shortDate} · ${day.minutes} min`;
  }

  function getCellLabel(day) {
    if (!day || day.isFuture) return "";

    const longDate = formatLongDate(day.date);
    if (!longDate) return "";

    const minutes = Number.isFinite(day.minutes) ? day.minutes : 0;

    if (minutes <= 0) {
      return `${longDate}, sin sesiones`;
    }

    const unit = minutes === 1 ? "minuto" : "minutos";
    return `${longDate}, ${minutes} ${unit} de estudio`;
  }

  function getSummary(data) {
    if (!data) return "";

    const start = formatMonthDay(data.start);
    const end = formatMonthDay(data.today);
    const count = Number.isFinite(data.studiedDays) ? data.studiedDays : 0;
    const unit = count === 1 ? "día" : "días";

    return `Del ${start} al ${end}: ${count} ${unit} con estudio`;
  }

  function moveFocus(index, key, lastIndex) {
    if (!Number.isInteger(index) || !Number.isInteger(lastIndex)) {
      return index;
    }

    let candidate = index;

    switch (key) {
      case "ArrowLeft":
        candidate = index - 7;
        break;
      case "ArrowRight":
        candidate = index + 7;
        break;
      case "ArrowUp":
        candidate = index - 1;
        break;
      case "ArrowDown":
        candidate = index + 1;
        break;
      default:
        return index;
    }

    if (candidate < 0 || candidate > lastIndex) return index;
    return candidate;
  }

  return {
    parseIsoDate,
    toIsoDate,
    addDays,
    getWeekdayIndex,
    getMonday,
    formatShortDate,
    formatLongDate,
    formatMonthDay,
    isValidMinutes,
    isValidSession,
    aggregateMinutes,
    getLevel,
    buildData,
    getMonthLabels,
    formatTooltip,
    getCellLabel,
    getSummary,
    moveFocus,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = HeatMapLogic;
}

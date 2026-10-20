const STORAGE_KEY = 'estudioDiarioSesiones';
const GOAL_STORAGE_KEY = 'estudioDiarioObjetivoSemanal';
const THEME_STORAGE_KEY = 'estudioDiarioTema';

const sessionForm = document.getElementById('session-form');
const themeToggle = document.getElementById('theme-toggle');
const fechaInput = document.getElementById('fecha');
const temaInput = document.getElementById('tema');
const minutosInput = document.getElementById('minutos');
const streakCountEl = document.getElementById('streak-count');
const sessionsListEl = document.getElementById('sessions-list');
const emptyStateEl = document.getElementById('empty-state');
const bestStreakCountEl = document.getElementById('best-streak-count');
const weeklyMinutesEl = document.getElementById('weekly-minutes');
const daysThisMonthEl = document.getElementById('days-this-month');
const heatmapGridEl = document.getElementById('heatmap-grid');
const heatmapMonthsEl = document.getElementById('heatmap-months');
const heatmapSummaryEl = document.getElementById('heatmap-summary');
const heatmapTooltipEl = document.getElementById('heatmap-tooltip');
const goalNoGoalEl = document.getElementById('goal-no-goal');
const goalActiveEl = document.getElementById('goal-active');
const goalIdleEl = document.getElementById('goal-idle');
const goalTargetEl = document.getElementById('goal-target');
const goalProgressEl = document.getElementById('goal-progress');
const goalSummaryEl = document.getElementById('goal-summary');
const goalMessageEl = document.getElementById('goal-message');
const goalRemoveEl = document.getElementById('goal-remove');
const goalFormEl = document.getElementById('goal-form');
const goalMinutesInput = document.getElementById('goal-minutes');
const goalErrorEl = document.getElementById('goal-error');
const goalStatusEl = document.getElementById('goal-status');
const goalSetButton = document.getElementById('goal-set');
const goalEditButton = document.getElementById('goal-edit');
const goalCancelButton = document.getElementById('goal-cancel');

let currentHeatMapData = null;
let focusedHeatMapDate = null;
let activeHeatMapTooltipDate = null;
let midnightRefreshTimer = null;
let goalFormOpenedFrom = null;

// Obtener fecha actual en formato local YYYY-MM-DD
function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Obtener fecha de ayer en formato local YYYY-MM-DD
function getYesterdayDateString() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Obtener clave de fecha YYYY-MM-DD a partir de un Date
function getDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parsear string YYYY-MM-DD como fecha local (sin UTC)
function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Cargar sesiones desde localStorage
function loadSessions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const sessions = JSON.parse(stored);
    return Array.isArray(sessions) ? sessions : [];
  } catch (error) {
    console.error('Error al cargar sesiones:', error);
    return [];
  }
}

// Guardar sesiones en localStorage
function saveSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error al guardar sesiones:', error);
  }
}

// Crear mapa de fechas con al menos una sesión (para calcular racha)
function getDatesWithSessions(sessions) {
  const dateSet = new Set();
  sessions.forEach((session) => {
    if (session && session.fecha) {
      dateSet.add(session.fecha);
    }
  });
  return dateSet;
}

// Calcular racha actual
// - Un día cuenta si tiene al menos una sesión
// - Racha son días consecutivos con sesión que terminan hoy
// - Si hoy no he estudiado pero ayer sí, la racha sigue viva (no rompe hasta que termina el día)
// - Usar siempre fecha local
function calculateStreak(sessions) {
  const datesWithSession = getDatesWithSessions(sessions);
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();

  let streak = 0;
  let currentDate = new Date();

  // Si hoy no tiene sesiones, empezamos a contar desde ayer
  // para mantener la racha viva
  if (!datesWithSession.has(todayStr)) {
    // Comprobar si ayer tiene sesiones
    if (!datesWithSession.has(yesterdayStr)) {
      return 0;
    }
    // Empezamos desde ayer
    currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1);
  }
  // Si hoy tiene sesiones, empezamos desde hoy

  // Contar hacia atrás días consecutivos con sesión
  while (true) {
    const currentDateStr = getDateString(currentDate);
    if (datesWithSession.has(currentDateStr)) {
      streak++;
      // Ir al día anterior
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// Formatear fecha para mostrar (en español, formato local)
function formatDisplayDate(dateString) {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

// Renderizar lista de sesiones (de más reciente a más antigua)
function renderSessions(sessions) {
  sessionsListEl.innerHTML = '';

  // Ordenar: por fecha descendente, y si es misma fecha, por id/orden de creación descendente
  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.fecha !== b.fecha) {
      // Comparar fechas YYYY-MM-DD (string lexicográfico funciona para mismo formato)
      if (a.fecha > b.fecha) return -1;
      if (a.fecha < b.fecha) return 1;
      return 0;
    }
    // Misma fecha: ordenar por id descendente (más reciente primero)
    if (a.id > b.id) return -1;
    if (a.id < b.id) return 1;
    return 0;
  });

  if (sortedSessions.length === 0) {
    emptyStateEl.classList.remove('hidden');
    sessionsListEl.classList.add('hidden');
    return;
  }

  emptyStateEl.classList.add('hidden');
  sessionsListEl.classList.remove('hidden');

  sortedSessions.forEach((session) => {
    const li = document.createElement('li');
    li.className = 'session-item';

    const header = document.createElement('div');
    header.className = 'session-header';

    const dateEl = document.createElement('span');
    dateEl.className = 'session-date';
    dateEl.textContent = formatDisplayDate(session.fecha);

    const minutesEl = document.createElement('span');
    minutesEl.className = 'session-minutes';
    minutesEl.textContent = `${session.minutos} min`;

    header.appendChild(dateEl);
    header.appendChild(minutesEl);

    const themeEl = document.createElement('p');
    themeEl.className = 'session-theme';
    themeEl.textContent = session.tema;

    li.appendChild(header);
    li.appendChild(themeEl);
    sessionsListEl.appendChild(li);
  });
}

// Calcular récord de racha (máxima longitud de días consecutivos con al menos 1 sesión)
// No exige terminar hoy. Incluye la racha actual si es la más larga.
// Se calcula sobre fechas <= hoy. Fechas futuras se ignoran.
function calculateBestStreak(sessions) {
  const datesWithSession = getDatesWithSessions(sessions);
  const todayStr = getTodayDateString();

  // Obtener fechas únicas con sesión y <= hoy
  const validDates = [];
  datesWithSession.forEach((dateStr) => {
    if (dateStr <= todayStr) {
      validDates.push(dateStr);
    }
  });

  if (validDates.length === 0) {
    return 0;
  }

  // Ordenar ascendente
  validDates.sort();

  let best = 1;
  let current = 1;
  
  // Si solo hay 1 fecha válida, mejor racha es 1
  if (validDates.length === 1) {
    return 1;
  }

  for (let i = 1; i < validDates.length; i++) {
    const prevDate = parseLocalDate(validDates[i - 1]);
    const currDate = parseLocalDate(validDates[i]);

    // Comprobar si son consecutivos (curr = prev + 1 día)
    const expectedNext = new Date(prevDate);
    expectedNext.setDate(expectedNext.getDate() + 1);
    const expectedStr = getDateString(expectedNext);

    if (validDates[i] === expectedStr) {
      // Consecutivo
      current++;
      if (current > best) {
        best = current;
      }
    } else {
      // No consecutivo, reiniciar
      current = 1;
      best = Math.max(best, 1); // Al menos 1 día
    }
  }

  // Si todas las fechas son consecutivas en una sola secuencia
  // Necesitamos recalcular correctamente para el caso general
  // Recalculamos de forma más clara
  return calculateBestStreakClean(validDates);
}

// Versión más clara para calcular mejor racha
function calculateBestStreakClean(validDates) {
  if (validDates.length === 0) return 0;
  if (validDates.length === 1) return 1;

  let best = 1;
  let current = 1;

  for (let i = 1; i < validDates.length; i++) {
    const prevDate = parseLocalDate(validDates[i - 1]);
    const expectedNext = new Date(prevDate);
    expectedNext.setDate(expectedNext.getDate() + 1);
    const expectedStr = getDateString(expectedNext);

    if (validDates[i] === expectedStr) {
      current++;
      if (current > best) {
        best = current;
      }
    } else {
      current = 1;
    }
  }

  return best;
}

// Renderizar racha
function renderStreak(sessions) {
  const streak = calculateStreak(sessions);
  streakCountEl.textContent = streak;
}

// Renderizar récord de racha
function renderBestStreak(sessions) {
  const bestStreak = calculateBestStreakClean(getValidDatesSorted(sessions));
  bestStreakCountEl.textContent = bestStreak;
}

// Obtener fechas válidas ordenadas (<= hoy) para mejor racha
function getValidDatesSorted(sessions) {
  const datesWithSession = getDatesWithSessions(sessions);
  const todayStr = getTodayDateString();
  const validDates = [];
  datesWithSession.forEach((dateStr) => {
    if (dateStr <= todayStr) {
      validDates.push(dateStr);
    }
  });
  validDates.sort();
  return validDates;
}

// Obtener inicio de semana (lunes) para una fecha dada (fecha local)
function getStartOfWeekMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=domingo, 1=lunes, ...
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Calcular total de minutos esta semana (lunes-domingo, semana que incluye hoy)
// Solo sesiones con fecha >= inicio semana y <= hoy. Fechas futuras excluidas.
function calculateWeeklyMinutes(sessions) {
  const today = new Date();
  const todayStr = getTodayDateString();
  const startOfWeek = getStartOfWeekMonday(today);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  let total = 0;
  sessions.forEach((session) => {
    if (!session || !session.fecha || typeof session.minutos !== 'number') {
      return;
    }
    const sessionDateStr = session.fecha;
    // Excluir futuras
    if (sessionDateStr > todayStr) {
      return;
    }
    const [year, month, day] = sessionDateStr.split('-').map(Number);
    const sessionDate = new Date(year, month - 1, day);
    // Comprobar si está dentro de la semana (lunes-domingo)
    if (sessionDate >= startOfWeek && sessionDate <= endOfWeek) {
      if (!isNaN(session.minutos) && session.minutos > 0) {
        total += session.minutos;
      }
    }
  });
  return total;
}

// Renderizar total semanal
function renderWeeklyMinutes(sessions) {
  const total = calculateWeeklyMinutes(sessions);
  weeklyMinutesEl.textContent = `${total} min`;
}

// Leer el objetivo semanal guardado: minutos válidos o null (ausente o corrupto)
function loadWeeklyGoal() {
  try {
    return WeeklyGoalLogic.parseStoredGoal(localStorage.getItem(GOAL_STORAGE_KEY));
  } catch (error) {
    console.error('Error al cargar el objetivo semanal:', error);
    return null;
  }
}

// Renderizar el bloque del objetivo semanal (RF-3, RF-8)
// Es idempotente y no toca el formulario: ni el campo, ni el error, ni el foco.
function renderWeeklyGoal(sessions) {
  const goal = loadWeeklyGoal();
  const progress = WeeklyGoalLogic.buildProgress(
    sessions,
    goal,
    getTodayDateString()
  );

  // Sin objetivo guardado o corrupto: estado sin objetivo, sin barra (CA-3.1)
  if (!progress) {
    goalNoGoalEl.hidden = false;
    goalActiveEl.hidden = true;
    goalRemoveEl.hidden = true;
    goalIdleEl.hidden = true;
    return;
  }

  goalNoGoalEl.hidden = true;
  goalActiveEl.hidden = false;
  goalRemoveEl.hidden = false;

  goalTargetEl.textContent = `Objetivo semanal: ${progress.goal} min`;
  goalSummaryEl.textContent = progress.summary;
  goalMessageEl.textContent = progress.message;

  // La frase solo se ve cuando hay objetivo y aún no hay minutos (CA-3.2)
  const stateTitle = WeeklyGoalLogic.getStateTitle(progress);
  goalIdleEl.textContent = stateTitle;
  goalIdleEl.hidden = stateTitle === '';

  // El relleno se ajusta con el ratio, así que nunca se desborda (CA-2.10)
  goalProgressEl.style.setProperty('--goal-progress', String(progress.barRatio));
  goalProgressEl.setAttribute('aria-valuemin', '0');
  goalProgressEl.setAttribute('aria-valuemax', String(progress.goal));
  goalProgressEl.setAttribute(
    'aria-valuenow',
    String(Math.min(progress.total, progress.goal))
  );
  goalProgressEl.setAttribute(
    'aria-valuetext',
    WeeklyGoalLogic.getAccessibleLabel(progress)
  );
}

// Abrir el formulario en línea, con el objetivo vigente si es válido (CA-4.2)
function openGoalForm(originButton) {
  goalFormOpenedFrom = originButton;

  const goal = loadWeeklyGoal();
  goalMinutesInput.value = goal === null ? '' : String(goal);
  goalRemoveEl.hidden = goal === null;

  hideGoalError();
  goalFormEl.hidden = false;
  goalMinutesInput.focus();
}

// Cerrar el formulario y descartar lo escrito (el foco lo decide quien cierra)
function closeGoalForm() {
  goalFormEl.hidden = true;
  goalMinutesInput.value = '';
  hideGoalError();
}

// Devolver el foco al botón que abrió el formulario (CA-4.4, CA-4.7).
// Si ese botón ya no está visible (por ejemplo «Fijar objetivo» tras guardar el
// primer objetivo, o «Editar» tras quitarlo), el foco pasa al botón equivalente
// visible del otro estado.
function restoreGoalFocus() {
  const origin = goalFormOpenedFrom;
  goalFormOpenedFrom = null;

  const isVisible = (element) =>
    element !== null && element.getClientRects().length > 0;

  if (isVisible(origin)) {
    origin.focus();
    return;
  }

  const fallback = origin === goalSetButton ? goalEditButton : goalSetButton;
  if (isVisible(fallback)) {
    fallback.focus();
  }
}

// Mensaje de error junto al campo (CA-4.6)
function showGoalError(message) {
  goalErrorEl.textContent = message;
  goalErrorEl.hidden = false;
}

// El mensaje se limpia al abrir o cerrar el formulario y en cuanto la persona
// corrige el campo, para no dejar un aviso obsoleto a la vista
function hideGoalError() {
  if (goalErrorEl.hidden) return;
  goalErrorEl.textContent = '';
  goalErrorEl.hidden = true;
}

// Anuncio para lectores de pantalla; solo cuando cambia el objetivo (CA-8.10),
// nunca en los recálculos por sesiones, medianoche o vuelta a la pestaña
function announceGoalStatus(text) {
  goalStatusEl.textContent = text;
}

// Guardar el objetivo escrito en el campo (CA-4.4, CA-4.5, CA-4.9, CA-4.10)
function handleGoalSubmit(event) {
  event.preventDefault();

  const result = WeeklyGoalLogic.validateGoalInput(goalMinutesInput.value);

  if (!result.ok) {
    showGoalError(WeeklyGoalLogic.getGoalErrorMessage(result.error));
    goalMinutesInput.focus();
    return;
  }

  // Guardar el valor vigente cierra sin reescribir la clave ni anunciar (CA-4.9)
  if (result.minutes === loadWeeklyGoal()) {
    closeGoalForm();
    restoreGoalFocus();
    return;
  }

  try {
    localStorage.setItem(
      GOAL_STORAGE_KEY,
      JSON.stringify({ minutos: result.minutes })
    );
  } catch (error) {
    console.error('Error al guardar el objetivo semanal:', error);
    showGoalError('No se pudo guardar el objetivo. Inténtalo de nuevo.');
    return;
  }

  closeGoalForm();
  render();
  restoreGoalFocus();
  announceGoalStatus(`Objetivo semanal guardado: ${result.minutes} min.`);
}

// «Cancelar» y Escape: cerrar sin guardar y devolver el foco (CA-4.7)
function cancelGoalForm() {
  closeGoalForm();
  restoreGoalFocus();
}

// «Quitar objetivo»: borrar la clave y volver al estado sin objetivo (CA-4.8)
function handleGoalRemove() {
  try {
    localStorage.removeItem(GOAL_STORAGE_KEY);
  } catch (error) {
    console.error('Error al quitar el objetivo semanal:', error);
    showGoalError('No se pudo guardar el objetivo. Inténtalo de nuevo.');
    return;
  }

  closeGoalForm();
  render();
  restoreGoalFocus();
  announceGoalStatus('Objetivo semanal eliminado.');
}

// Conectar el formulario del objetivo
function setupGoalForm() {
  goalSetButton.addEventListener('click', () => openGoalForm(goalSetButton));
  goalEditButton.addEventListener('click', () => openGoalForm(goalEditButton));
  goalFormEl.addEventListener('submit', handleGoalSubmit);
  goalCancelButton.addEventListener('click', cancelGoalForm);
  goalRemoveEl.addEventListener('click', handleGoalRemove);
  goalMinutesInput.addEventListener('input', hideGoalError);
}

// Tema: el botón refleja el tema realmente aplicado (RF-1, RF-7).
// Es un botón de acción: la etiqueta y el icono nombran el tema al que se cambia.
function updateThemeButton() {
  if (
    !themeToggle ||
    typeof ThemeRuntime === 'undefined' ||
    typeof ThemeLogic === 'undefined'
  ) {
    return;
  }

  const theme = ThemeRuntime.getTheme();

  const label = themeToggle.querySelector('.theme-toggle-label');
  if (label) {
    label.textContent = ThemeLogic.getToggleLabel(theme);
  }

  const iconName = ThemeLogic.getIconName(theme);
  const icons = themeToggle.querySelectorAll('[data-theme-icon]');
  icons.forEach((icon) => {
    // `hidden` es un atributo también en SVG, no una propiedad.
    if (icon.getAttribute('data-theme-icon') === iconName) {
      icon.removeAttribute('hidden');
    } else {
      icon.setAttribute('hidden', '');
    }
  });
}

// Clic en el botón: alterna, guarda solo si el valor cambia y aplica (CA-4.1 a CA-4.7)
function handleThemeToggle() {
  if (typeof ThemeRuntime === 'undefined' || typeof ThemeLogic === 'undefined') {
    return;
  }

  const next = ThemeLogic.toggleTheme(ThemeRuntime.getTheme());

  let rawStored = null;
  try {
    rawStored = localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    rawStored = null;
  }

  if (ThemeLogic.shouldWriteTheme(rawStored, next)) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, ThemeLogic.serializeTheme(next));
    } catch (error) {
      // Sin mensaje ni aviso: la elección vale solo para esta sesión (CA-4.7).
    }
  }

  ThemeRuntime.applyTheme(next);
  ThemeRuntime.setHasChoice(true);
}

// Aplica lo que hay guardado; sin elección válida, se sigue al sistema (CA-3.6, CA-4.4)
function applyStoredTheme(rawValue) {
  if (typeof ThemeRuntime === 'undefined' || typeof ThemeLogic === 'undefined') {
    return;
  }

  const stored = ThemeLogic.parseStoredTheme(rawValue);

  if (stored !== null) {
    ThemeRuntime.applyTheme(stored);
    ThemeRuntime.setHasChoice(true);
    return;
  }

  const prefersDark = ThemeRuntime.mediaQuery
    ? ThemeRuntime.mediaQuery.matches
    : false;

  ThemeRuntime.applyTheme(ThemeLogic.resolveTheme(null, prefersDark));
  ThemeRuntime.setHasChoice(false);
}

// Se conecta una sola vez: sin consultas ni escuchas nuevas del sistema (CA-5.6)
function setupThemeToggle() {
  if (typeof ThemeRuntime === 'undefined') return;

  ThemeRuntime.subscribe(updateThemeButton);
  updateThemeButton();

  if (themeToggle) {
    themeToggle.addEventListener('click', handleThemeToggle);
  }
}

// Obtener inicio de mes (día 1) con fecha local
function getStartOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Obtener fin de mes con fecha local
function getEndOfMonth(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}

// Calcular días estudiados este mes (días distintos con >=1 sesión, mes de hoy, <= hoy)
function calculateDaysThisMonth(sessions) {
  const today = new Date();
  const todayStr = getTodayDateString();
  const startOfMonth = getStartOfMonth(today);
  const endOfMonth = getEndOfMonth(today);

  const datesWithSession = getDatesWithSessions(sessions);
  let count = 0;
  datesWithSession.forEach((dateStr) => {
    if (dateStr > todayStr) {
      return;
    }
    const [year, month, day] = dateStr.split('-').map(Number);
    const sessionDate = new Date(year, month - 1, day);
    if (sessionDate >= startOfMonth && sessionDate <= endOfMonth) {
      count++;
    }
  });
  return count;
}

// Renderizar días este mes
function renderDaysThisMonth(sessions) {
  const days = calculateDaysThisMonth(sessions);
  if (days === 1) {
    daysThisMonthEl.textContent = '1 día';
  } else {
    daysThisMonthEl.textContent = `${days} días`;
  }
}

// Inicializar formulario con fecha de hoy
function initializeForm() {
  fechaInput.value = getTodayDateString();
}

// Heat map: DOM helpers
function getHeatMapCell(target) {
  if (!target || typeof target.closest !== 'function') return null;
  return target.closest('.heatmap-cell');
}

function getHeatMapDay(date) {
  if (!currentHeatMapData) return null;
  return currentHeatMapData.days.find((day) => day.date === date) || null;
}

function setHeatMapRovingTabIndex(cell) {
  const cells = heatmapGridEl.querySelectorAll('.heatmap-cell');
  cells.forEach((candidate) => {
    candidate.tabIndex = candidate === cell ? 0 : -1;
  });
}

// Heat map: rendering
function renderHeatMap(sessions) {
  const hadFocus = heatmapGridEl.contains(document.activeElement);
  const previousDate = hadFocus
    ? document.activeElement.dataset.date
    : focusedHeatMapDate;

  hideHeatMapTooltip();

  const data = HeatMapLogic.buildData(sessions, getTodayDateString());

  if (!data) {
    currentHeatMapData = null;
    heatmapMonthsEl.replaceChildren();
    heatmapGridEl.replaceChildren();
    heatmapSummaryEl.textContent = '';
    return;
  }

  currentHeatMapData = data;
  heatmapSummaryEl.textContent = HeatMapLogic.getSummary(data);

  heatmapMonthsEl.replaceChildren();
  HeatMapLogic.getMonthLabels(data.days).forEach(({ weekIndex, label }) => {
    const month = document.createElement('span');
    month.className = 'heatmap-month-label';
    month.style.gridColumnStart = String(weekIndex + 1);
    month.textContent = label;
    heatmapMonthsEl.appendChild(month);
  });

  let targetDate = data.today;
  if (
    previousDate &&
    data.days.some((day) => day.date === previousDate && !day.isFuture)
  ) {
    targetDate = previousDate;
  }

  heatmapGridEl.replaceChildren();

  data.days.forEach((day, index) => {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'heatmap-cell';
    cell.dataset.date = day.date;
    cell.dataset.level = String(day.level);
    cell.dataset.index = String(index);
    cell.tabIndex = -1;

    if (day.isFuture) {
      cell.disabled = true;
      cell.setAttribute('aria-hidden', 'true');
    } else {
      cell.setAttribute('aria-label', HeatMapLogic.getCellLabel(day));
      if (day.date === targetDate) cell.tabIndex = 0;
    }

    heatmapGridEl.appendChild(cell);
  });

  focusedHeatMapDate = targetDate;

  if (hadFocus) {
    const targetCell = heatmapGridEl.querySelector(
      `[data-date="${targetDate}"]`
    );
    if (targetCell) {
      targetCell.focus({ preventScroll: true });
      hideHeatMapTooltip();
    }
  }
}

// Heat map: tooltip
function positionHeatMapTooltip(cell) {
  const cellRect = cell.getBoundingClientRect();
  const tooltipRect = heatmapTooltipEl.getBoundingClientRect();
  const gap = 8;
  const margin = 8;

  let top = cellRect.top - tooltipRect.height - gap;
  if (top < margin) {
    top = cellRect.bottom + gap;
  }

  let left = cellRect.left + cellRect.width / 2 - tooltipRect.width / 2;
  left = Math.max(
    margin,
    Math.min(left, window.innerWidth - tooltipRect.width - margin)
  );

  heatmapTooltipEl.style.top = `${Math.round(top)}px`;
  heatmapTooltipEl.style.left = `${Math.round(left)}px`;
}

function showHeatMapTooltip(cell) {
  if (!cell || !currentHeatMapData) return;

  const day = getHeatMapDay(cell.dataset.date);
  if (!day) return;

  const text = HeatMapLogic.formatTooltip(day);
  if (!text) {
    hideHeatMapTooltip();
    return;
  }

  activeHeatMapTooltipDate = day.date;
  heatmapTooltipEl.textContent = text;
  heatmapTooltipEl.hidden = false;
  positionHeatMapTooltip(cell);
}

function hideHeatMapTooltip() {
  heatmapTooltipEl.hidden = true;
  heatmapTooltipEl.textContent = '';
  activeHeatMapTooltipDate = null;
}

// Heat map: interaction handlers
function handleHeatMapFocusIn(event) {
  const cell = getHeatMapCell(event.target);
  if (!cell || cell.disabled) return;

  focusedHeatMapDate = cell.dataset.date;
  setHeatMapRovingTabIndex(cell);

  if (cell.matches(':focus-visible')) {
    showHeatMapTooltip(cell);
  }
}

function handleHeatMapFocusOut(event) {
  if (!heatmapGridEl.contains(event.relatedTarget)) {
    hideHeatMapTooltip();
  }
}

function handleHeatMapKeyDown(event) {
  const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
  if (!keys.includes(event.key)) return;

  const cell = getHeatMapCell(event.target);
  if (!cell || !currentHeatMapData) return;

  event.preventDefault();

  const index = Number(cell.dataset.index);
  const nextIndex = HeatMapLogic.moveFocus(
    index,
    event.key,
    currentHeatMapData.todayIndex
  );

  if (nextIndex === index) return;

  const nextCell = heatmapGridEl.querySelector(
    `[data-index="${nextIndex}"]`
  );
  if (nextCell && !nextCell.disabled) {
    nextCell.focus();
  }
}

function handleHeatMapPointerUp(event) {
  if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;

  const cell = getHeatMapCell(event.target);
  if (!cell || cell.disabled) return;

  if (activeHeatMapTooltipDate === cell.dataset.date) {
    hideHeatMapTooltip();
  } else {
    showHeatMapTooltip(cell);
  }
}

function handleDocumentPointerDown(event) {
  if (!event.target || typeof event.target.closest !== 'function') return;
  if (!event.target.closest('.heatmap-grid')) {
    hideHeatMapTooltip();
  }
}

function handleDocumentKeyDown(event) {
  if (event.key !== 'Escape') return;

  hideHeatMapTooltip();

  if (!goalFormEl.hidden) {
    cancelGoalForm();
  }
}

function handleVisibilityChange() {
  if (document.visibilityState !== 'visible') return;

  hideHeatMapTooltip();
  render();
  scheduleMidnightRefresh();
}

function handleStorageChange(event) {
  // El tema no repinta datos: solo cambia colores (CA-2.3, CA-5.3, CA-5.4).
  if (event.key === THEME_STORAGE_KEY) {
    applyStoredTheme(event.newValue);
    return;
  }

  if (event.key !== null && event.key !== STORAGE_KEY && event.key !== GOAL_STORAGE_KEY) return;

  hideHeatMapTooltip();
  render();

  // El objetivo cambió en otra pestaña y se anuncia el nuevo estado (CA-8.10).
  // El borrado completo del almacenamiento (key === null) lo elimina también.
  if (event.key === GOAL_STORAGE_KEY || event.key === null) {
    const goal = loadWeeklyGoal();
    announceGoalStatus(
      goal === null
        ? 'Objetivo semanal eliminado.'
        : `Objetivo semanal actualizado: ${goal} min.`
    );
  }

  // Si se borró todo el almacenamiento, el tema vuelve al modo automático.
  if (event.key === null) {
    applyStoredTheme(null);
  }
}

function scheduleMidnightRefresh() {
  if (midnightRefreshTimer !== null) {
    clearTimeout(midnightRefreshTimer);
  }

  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    1,
    0
  );
  const delay = Math.max(1000, nextMidnight.getTime() - now.getTime());

  midnightRefreshTimer = setTimeout(() => {
    hideHeatMapTooltip();
    render();
    scheduleMidnightRefresh();
  }, delay);
}

function setupHeatMapInteractions() {
  if (!heatmapGridEl) return;

  heatmapGridEl.addEventListener('keydown', handleHeatMapKeyDown);
  heatmapGridEl.addEventListener('focusin', handleHeatMapFocusIn);
  heatmapGridEl.addEventListener('focusout', handleHeatMapFocusOut);
  heatmapGridEl.addEventListener('pointerup', handleHeatMapPointerUp);

  heatmapGridEl.addEventListener('pointerover', (event) => {
    if (event.pointerType !== 'mouse') return;

    const cell = getHeatMapCell(event.target);
    if (cell && !cell.disabled) {
      showHeatMapTooltip(cell);
    }
  });

  heatmapGridEl.addEventListener('pointerout', (event) => {
    if (event.pointerType !== 'mouse') return;

    const cell = getHeatMapCell(event.target);
    if (!cell || cell.contains(event.relatedTarget)) return;
    if (activeHeatMapTooltipDate === cell.dataset.date) {
      hideHeatMapTooltip();
    }
  });

  document.addEventListener('pointerdown', handleDocumentPointerDown);
  document.addEventListener('keydown', handleDocumentKeyDown);
  window.addEventListener('scroll', hideHeatMapTooltip, { passive: true });
  window.addEventListener('resize', hideHeatMapTooltip);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('storage', handleStorageChange);
}

// Renderizar todo
function render() {
  const sessions = loadSessions();
  renderStreak(sessions);
  renderBestStreak(sessions);
  renderWeeklyMinutes(sessions);
  renderWeeklyGoal(sessions);
  renderDaysThisMonth(sessions);
  renderSessions(sessions);
  renderHeatMap(sessions);
}

// Manejar envío del formulario
sessionForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const fecha = fechaInput.value;
  const tema = temaInput.value.trim();
  const minutosStr = minutosInput.value;
  const minutos = parseInt(minutosStr, 10);

  // Validación básica
  if (!fecha) {
    fechaInput.focus();
    return;
  }

  if (!tema) {
    temaInput.focus();
    return;
  }

  if (isNaN(minutos) || minutos < 1) {
    minutosInput.focus();
    return;
  }

  // Crear nueva sesión
  const sessions = loadSessions();
  const newSession = {
    id: Date.now(),
    fecha: fecha,
    tema: tema,
    minutos: minutos
  };

  sessions.push(newSession);
  saveSessions(sessions);

  // Limpiar formulario (mantener fecha por defecto hoy)
  temaInput.value = '';
  minutosInput.value = '';
  initializeForm();
  temaInput.focus();

  // Actualizar vista
  render();
});

// Inicializar
initializeForm();
setupHeatMapInteractions();
setupGoalForm();
setupThemeToggle();
render();
scheduleMidnightRefresh();
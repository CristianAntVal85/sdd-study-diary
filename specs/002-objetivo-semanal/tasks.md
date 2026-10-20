# Tasks 002 — Objetivo semanal de estudio

Tareas pequeñas, en orden de dependencia, según `specs/002-objetivo-semanal/plan.md` y la
spec aprobada. Los tests de lógica van primero y son puerta: no se avanza con `node --test`
en rojo. No se tocan la estadística «Esta semana», el formulario de sesiones, la racha, el
récord, el mes, el mapa de calor ni la clave `estudioDiarioSesiones`.

Antes de empezar: ejecutar `node --test` y confirmar que la suite actual (32 pruebas) está en
verde; si no, parar y avisar.

## Fase A — Lógica pura y pruebas

- [x] **T1. Esqueleto de `weekly-goal-logic.js` y fechas reutilizadas**
  - **RF**: RF-2, RF-6, RF-8; RNF-6, RNF-10.
  - **Depende de**: —
  - **Tests primero**: en `tests/weekly-goal.test.js`, casos que comprueben que el módulo se
    expone como objeto, que `getWeekRange("2026-10-19")` es `{ start: "2026-10-19", end:
    "2026-10-25" }`, que el rango es correcto con hoy lunes, miércoles y domingo, que cruza
    mes y año (`2026-01-01` → `2025-12-29` a `2026-01-04`), que `today` inválido devuelve
    `null` y que `formatWeekRange` produce `19 al 25 de octubre`, `28 de septiembre al 4 de
    octubre` y `28 de diciembre al 3 de enero`.
  - **Hecho cuando**: `node --test` pasa; el archivo sigue el patrón de `heat-map-logic.js`
    (IIFE, espacio de nombres `WeeklyGoalLogic`, exportación CommonJS protegida) y reutiliza
    las funciones puras de fecha del mapa de calor sin duplicar el calendario; `grep` no
    encuentra `document`, `localStorage`, `Date.now` ni `new Date()` sin argumentos.

- [x] **T2. Validación del texto del objetivo y mensajes**
  - **RF**: RF-4; RNF-6, RNF-10.
  - **Depende de**: T1.
  - **Tests primero**: bloque A de la spec §8.1 («entradas del campo»): `«300»`, `« 300 »`,
    `«1»` y `«10080»` válidos; `«»`, `«   »` y `«treinta»` → mensaje de número entero;
    `«300,5»`, `«300.5»` y `«0,5»` → mensaje de decimales; `«3e2»`, `«+300»`, `«1e3»` y
    `«3 0 0»` → mensaje de signo o notación científica; `«0»` y `«-5»` → mensaje de al menos
    1 minuto; `«10081»` y `«99999»` → mensaje de máximo 10080; entradas `null`, `undefined` y
    números sueltos no lanzan excepción.
  - **Hecho cuando**: `validateGoalInput` aplica el orden de comprobación de CA-4.5 sobre el
    texto literal y `getGoalErrorMessage` devuelve los cinco mensajes exactos de CA-4.6.

- [x] **T3. Lectura del objetivo guardado**
  - **RF**: RF-1, RF-7; RNF-10.
  - **Depende de**: T2.
  - **Tests primero**: bloque B de la spec §8.1 («valores guardados»): `'{"minutos":600}'`,
    `'{"minutos":1}'` y `'{"minutos":10080}'` válidos; `0`, `-5`, `1.5`, `"300"`, `null`,
    `{}`, `[]`, `'null'`, JSON roto y clave ausente → sin objetivo; `NaN` e `Infinity` → sin
    objetivo; nunca se lanza excepción ni se reescribe el valor.
  - **Hecho cuando**: `isValidGoal` y `parseStoredGoal` cubren todos los casos y la lectura
    de un valor corrupto devuelve «sin objetivo» sin lanzar.

- [x] **T4. Total semanal estricto: validación por sesión, duplicados y redondeo**
  - **RF**: RF-2; RNF-3, RNF-10.
  - **Depende de**: T3.
  - **Tests primero**: suma de varias sesiones del mismo día dentro de la semana; sesión de
    hoy cuenta; sesión futura dentro de la semana no cuenta; sesiones fuera de la semana no
    cuentan; minutos 0, negativos, `NaN`, `Infinity` y en texto se ignoran una a una y las
    demás siguen sumando; fechas `2026-2-3`, `2026-02-30` y `19-10-2026` se ignoran; `null`,
    objeto o cadena como lista → 0; mismo `id` dos veces → solo la primera;
    `[{id:1, futura}, {id:1, válida}]` → 0; `[{id:1, minutos 0}, {id:1, válida}]` → 0; dos
    sesiones sin `id` suman las dos; 14,5 → 15 y 10 + 4,5 → 15; 1000 sesiones correctas; el
    array de entrada congelado con `Object.freeze` no se altera.
  - **Hecho cuando**: `sumWeeklyMinutes` devuelve el entero redondeado esperado en todos los
    casos, consume el `id` en su primera aparición (válida, inválida o futura) y no muta los
    datos.

- [x] **T5. Progreso: porcentaje, restante, barra, estados y textos visibles**
  - **RF**: RF-2, RF-3; RNF-3, RNF-7.
  - **Depende de**: T4.
  - **Tests primero**: `0 de 300` → 0 %, «Te faltan 300 min» y estado sin actividad; `1 de
    10080` → 1 % y «Te faltan 10079 min»; `1 de 3` → 33 % y «Te faltan 2 min»; `120 de 300` →
    40 % y «Te faltan 180 min»; `299 de 300` → 99 % y «Te falta 1 min»; `300 de 300` → 100 %,
    «¡Objetivo cumplido!» y restante 0; `301 de 300` → 100 % y «+1 min»; `345 de 300` →
    115 % y «¡Objetivo superado! +45 min»; `900 de 300` → 300 % y «+600 min»; barra igual a 1
    en cumplido y superado y menor que 1 en progreso; `buildProgress` devuelve `null` con
    objetivo inválido o `today` inválido; dos llamadas idénticas son iguales.
  - **Hecho cuando**: el orden total → porcentaje → restante → barra → estado está
    implementado tal cual, con las reglas del 1 % con actividad y del 99 % sin alcanzar, y
    los resúmenes y mensajes visibles coinciden con la tabla del plan.

- [x] **T6. Texto accesible y cierre de la suite de lógica**
  - **RF**: RF-3, RF-8; RNF-7, RNF-10.
  - **Depende de**: T5.
  - **Tests primero**: texto accesible de los cuatro estados con objetivo («Semana del 19 al
    25 de octubre: 0 de 300 minutos, 0 por ciento. Te faltan 300 minutos.», el de progreso,
    «Objetivo cumplido.», «Objetivo superado por 45 minutos.»), singular («1 minuto»),
    porcentaje y rango correctos cuando la semana cruza mes y año, y comprobación de pureza
    por lectura del código fuente.
  - **Hecho cuando**: `node --test` pasa completo, todas las funciones exportadas tienen al
    menos un test y `grep` no encuentra `document`, `localStorage`, `Date.now` ni
    `new Date()` sin argumentos en `weekly-goal-logic.js`.

## Fase B — Estructura, estilos y render

- [x] **T7. Bloque del objetivo en `index.html`**
  - **RF**: RF-3, RF-4, RF-8; RNF-5, RNF-6.
  - **Depende de**: T6.
  - **Hecho cuando**: dentro de la tarjeta «Esta semana», debajo de `#weekly-minutes`, hay el
    bloque sin objetivo (texto «Aún no tienes un objetivo semanal», explicación y botón
    «Fijar objetivo»), el bloque activo (objetivo, barra `role="progressbar"`, resumen,
    mensaje y botón «Editar») y el formulario oculto con etiqueta «Minutos por semana»,
    `input type="text" inputmode="numeric" autocomplete="off"`, ayuda, error con
    `role="alert"`, «Guardar», «Cancelar» y «Quitar objetivo»; existe `#goal-status` con
    `aria-live="polite"`; `weekly-goal-logic.js` se carga después de `heat-map-logic.js` y
    antes de `app.js`; abre con doble clic sin errores en consola.

- [x] **T8. Estilos del bloque y del formulario**
  - **RF**: RF-8; RNF-1, RNF-2.
  - **Depende de**: T7.
  - **Hecho cuando**: la barra tiene pista clara, relleno naranja, altura 10–12 px y
    `overflow: hidden`; el relleno usa una variable CSS de progreso; los botones tienen al
    menos 44 px de alto; el error se ve con contraste AA; el foco de campo y botones es
    visible; a 320, 375 y 1280 px no hay scroll horizontal ni textos cortados; con
    `prefers-reduced-motion: reduce` la barra no se anima.

- [x] **T9. Render de los cinco estados en `app.js`**
  - **RF**: RF-3, RF-8; RNF-9.
  - **Depende de**: T6, T7.
  - **Hecho cuando**: `renderWeeklyGoal(sessions)` se llama desde `render()` y alterna los
    bloques con `hidden`, escribe objetivo, resumen y mensaje, ajusta el relleno con el ratio
    y expone `aria-valuemin`, `aria-valuemax`, `aria-valuenow` limitado al objetivo y
    `aria-valuetext`; con objetivo corrupto o ausente muestra el estado sin objetivo; el
    bloque no escribe en `#goal-minutes`, no cambia el `hidden` del formulario, no toca
    `#goal-error` ni mueve el foco; «Esta semana», racha y mapa siguen igual.

- [x] **T10. Formulario: abrir, validar, guardar, quitar y anunciar**
  - **RF**: RF-1, RF-4, RF-8.
  - **Depende de**: T9.
  - **Hecho cuando**: «Fijar objetivo»/«Editar» abren el formulario con el campo relleno si
    el objetivo es válido y vacío si no lo es, con el foco en el campo; guardar usa
    `validateGoalInput` y `getGoalErrorMessage` (mensaje en `#goal-error`, sin persistir, sin
    cerrar y con el foco en el campo si falla); un valor válido se guarda con `setItem` en
    `estudioDiarioObjetivoSemanal`, cierra el formulario, refresca el bloque y devuelve el
    foco al botón; guardar el valor vigente no reescribe la clave; «Quitar objetivo» usa
    `removeItem`; `Escape` y «Cancelar» cierran sin guardar; un fallo de almacenamiento
    muestra «No se pudo guardar el objetivo. Inténtalo de nuevo.» y deja el estado anterior;
    guardar, quitar y quitar el objetivo desde otra pestaña escriben el anuncio en
    `#goal-status`; con objetivo corrupto no aparece «Quitar objetivo».

## Fase C — Sincronización, documentación y verificación

- [x] **T11. Sincronización y temporizador único**
  - **RF**: RF-5; RNF-9.
  - **Depende de**: T10.
  - **Hecho cuando**: registrar una sesión de hoy actualiza el progreso sin recargar y una
    futura no lo cambia; el temporizador de medianoche sigue siendo uno solo
    (`scheduleMidnightRefresh`) y el lunes el progreso vuelve a 0 manteniendo el objetivo;
    `visibilitychange` visible recalcula; el manejador de `storage` atiende
    `estudioDiarioSesiones`, `estudioDiarioObjetivoSemanal` y `event.key === null`; con el
    formulario abierto, un recálculo conserva el texto y el foco y solo actualiza textos,
    barra y la presencia de «Quitar objetivo» (CA-5.6).

- [x] **T12. Corregir `AGENTS.md`**
  - **RF**: CA-7.8; RNF-11.
  - **Depende de**: T11.
  - **Hecho cuando**: `AGENTS.md` documenta la clave real `estudioDiarioSesiones` y la forma
    `{ id, fecha, tema, minutos }`, sin ningún resto de `diario-estudio-sesiones` ni de
    `{ date, topic, minutes }`, y el resto del documento sigue siendo correcto.

- [x] **T13. Verificación manual completa en Chrome**
  - **RF**: RF-1 a RF-8; RNF-1 a RNF-6, RNF-9.
  - **Depende de**: T11, T12.
  - **Hecho cuando**: se comprueban y quedan anotados: los cinco estados con datos de prueba
    y tras recargar (con la frase «Aún no has estudiado esta semana» en el estado sin
    actividad); fijar, editar y quitar con la validación de `«300,5»`, `«3e2»`,
    `«+300»`, `«-5»`, `«0»`, `«10081»` y vacío; cancelar y `Escape`; objetivo corrupto con
    campo vacío y sin «Quitar objetivo»; registrar sesión (hoy sí, futura no); cambio de
    objetivo a mitad de semana; formulario abierto al registrar, al cruzar la medianoche y al
    volver a la pestaña; dos pestañas incluido `localStorage.clear()`; teclado y lector de
    pantalla (nombre y valor de la barra, anuncio solo al cambiar el objetivo); 320, 375 y
    1280 px sin scroll horizontal; 1000 sesiones por debajo de 50 ms; consola limpia; «Esta
    semana», racha, récord, mes, mapa y lista sin regresiones; todo abriendo `index.html` con
    doble clic.

- [x] **T14. Actualizar `MEMORY.md` y cerrar**
  - **RF**: criterio de finalización 28; RNF-11.
  - **Depende de**: T13.
  - **Hecho cuando**: `node --test` pasa completo y en verde, no queda código de depuración,
    todas las casillas anteriores están marcadas y `MEMORY.md` registra el estado de la spec
    002, las decisiones relevantes (objetivo en clave nueva, definición estricta del total
    semanal, redondeo solo del objetivo, regla del 1 % y del 99 %, corrección de `AGENTS.md`)
    y la verificación realizada, manteniéndose breve.

# Plan 002 — Objetivo semanal de estudio

## 1. Resumen y alcance

Se añade un objetivo de minutos semanales configurable y persistente, con el progreso de la
semana en curso (lunes–domingo) dentro de la tarjeta «Esta semana» que ya existe. El cálculo
vive en un archivo de lógica pura nuevo; la interfaz se limita a pintar y a reaccionar a
eventos.

El plan cubre los RF-1 a RF-8 y los RNF-1 a RNF-11 de `specs/002-objetivo-semanal/spec.md`
(aprobada el 19 de octubre de 2026) y respeta `docs/constitution.md`. No se modifica la
estadística «Esta semana», ni la racha, ni el récord, ni el mes, ni el mapa de calor, ni el
formulario de sesiones, ni la clave `estudioDiarioSesiones`.

Fuera de alcance, igual que en la spec: historial entre semanas, objetivos por día o por
tema, avisos, prorrateo, exportación y cualquier cambio en el formato de los datos.

## 2. Estado de partida

- La suite actual está en verde: 32 pruebas en `tests/heat-map.test.js` (registro en
  `MEMORY.md`). El implementador debe ejecutar `node --test` antes de empezar y parar si no
  está verde (principio 4 de la constitución).
- `heat-map-logic.js` ya exporta las funciones puras de fecha que este plan reutiliza.
- `app.js` ya tiene `render()`, el temporizador único de medianoche
  (`scheduleMidnightRefresh`), `visibilitychange` y el manejador de `storage`.
- `AGENTS.md` documenta una clave y una forma de datos obsoletas; se corregirá en T12
  (CA-7.8, RNF-11).

### 2.1 Cambios menores ya aplicados a la spec

1. Estado actualizado a «aprobada (19 de octubre de 2026)».
2. CA-5.6 matizado: un recálculo no solo actualiza textos y barra, también la presencia del
   botón «Quitar objetivo» (CA-4.3, CA-5.5). Sin cambio de comportamiento; solo redacción.

## 3. Arquitectura y decisiones técnicas

### 3.1 Archivos que se crean o modifican

| Archivo | Acción | Responsabilidad | RF |
| --- | --- | --- | --- |
| `weekly-goal-logic.js` | Crear | Lógica pura: reutilización de fechas, rango semanal, validación textual del objetivo, lectura del objetivo guardado, total semanal estricto (duplicados, futuros, redondeo), porcentaje, restante, barra, estados y textos. Sin DOM, sin almacenamiento y sin reloj. | RF-1, RF-2, RF-3, RF-4, RF-7, RF-8; RNF-3, RNF-7, RNF-10 |
| `tests/weekly-goal.test.js` | Crear | Pruebas de la lógica con `node --test` y `node:assert/strict`. | RF-1 a RF-3, RF-7, RF-8; RNF-7, RNF-10 |
| `index.html` | Modificar | Bloque del objetivo dentro de la tarjeta «Esta semana», formulario en línea oculto y `weekly-goal-logic.js` cargado antes de `app.js`. | RF-3, RF-4, RF-8 |
| `styles.css` | Modificar | Bloque, botones, barra de progreso, mensajes, formulario, responsive y `prefers-reduced-motion`. | RF-8; RNF-1, RNF-2 |
| `app.js` | Modificar | Render de los cinco estados, formulario, validación, foco, anuncio accesible, persistencia, sincronización y temporizador único. | RF-1, RF-3, RF-4, RF-5, RF-7, RF-8 |
| `AGENTS.md` | Modificar | Corregir clave y forma de los datos (CA-7.8). | RNF-11 |
| `MEMORY.md` | Modificar al terminar | Estado, decisiones y verificación. | — |

No se crea `package.json`. No se añaden dependencias ni pasos de compilación. El orden de
carga en `index.html` es `heat-map-logic.js`, `weekly-goal-logic.js`, `app.js`, todos como
scripts clásicos (nada de `type="module"`, nada de `fetch` local).

### 3.2 Patrón del módulo puro

`weekly-goal-logic.js` sigue el patrón de `heat-map-logic.js`: IIFE con espacio de nombres
global `WeeklyGoalLogic` y exportación CommonJS protegida con `typeof module`.

```text
const WeeklyGoalLogic = (() => {
  const dateApi = (typeof module !== "undefined" && module.exports)
    ? require("./heat-map-logic.js")   // Node (tests)
    : HeatMapLogic;                    // Navegador (global del script anterior)
  ...
  return { ... };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = WeeklyGoalLogic;
}
```

- En el navegador la rama `require` no se evalúa: todo funciona con doble clic en `file://`.
- En Node, el archivo se puede `require` y arrastra `heat-map-logic.js` sin dependencias.
- El módulo nuevo no contiene `document`, `localStorage`, `Date.now` ni `new Date()` sin
  argumentos (RNF-10). La fecha de referencia llega siempre como parámetro `today`.
- `Math.round` se usa para el redondeo a la mitad hacia arriba; no se usan formatos locales
  del navegador para los textos, igual que en la spec 001.

### 3.3 Reutilización de fechas: qué se reutiliza y qué no

| Necesidad | Origen | Decisión |
| --- | --- | --- |
| Validar fecha `AAAA-MM-DD` real | `HeatMapLogic.parseIsoDate` | Se reutiliza. Rechaza `2026-02-30` y `2026-2-3`. |
| Sumar días | `HeatMapLogic.addDays` | Se reutiliza (aritmética a mediodía local, cruza meses, años y bisiestos). |
| Lunes de la semana | `HeatMapLogic.getMonday` | Se reutiliza para el rango lunes–domingo. |
| Día del mes en español | `HeatMapLogic.formatMonthDay` | Se reutiliza para el rango de la semana. |
| Rango accesible «19 al 25 de octubre» | — | Se implementa como función pura nueva `formatWeekRange(start, end)` sobre las dos anteriores. |
| `getTodayDateString`, `getStartOfWeekMonday`, `parseLocalDate` de `app.js` | `app.js` | Se reimplementan como parámetros: `app.js` sigue obteniendo la fecha local de hoy con `getTodayDateString()` y la pasa a la lógica. La lógica no llama a esas funciones ni al reloj. |
| `calculateWeeklyMinutes` de `app.js` | `app.js` | No se modifica ni se reutiliza: sigue alimentando la estadística «Esta semana» tal cual (CA-2.11). La lógica nueva calcula su propio total estricto. |

## 4. Diseño de datos y compatibilidad

### 4.1 Claves de almacenamiento

| Clave | Forma | Uso | Cambios |
| --- | --- | --- | --- |
| `estudioDiarioSesiones` | `[{ id, fecha, tema, minutos }]` | Sesiones (existente) | Ninguno. Solo lectura (CA-7.1). |
| `estudioDiarioObjetivoSemanal` | `{ "minutos": 600 }` | Objetivo (nueva) | Se crea al guardar el primer objetivo; `removeItem` al quitarlo. |

- No hay migración ni transformación de datos (CA-7.6).
- La clave del objetivo es independiente: si falta, la aplicación funciona en modo sin
  objetivo (CA-1.3, CA-7.2).
- Escrituras del objetivo: `setItem` solo al guardar un valor válido y distinto del vigente
  (CA-4.9); `removeItem` al quitar (CA-4.8).
- Si `setItem` o `removeItem` fallan, se informa con «No se pudo guardar el objetivo.
  Inténtalo de nuevo.» y el estado anterior sigue visible (CA-4.10, CA-7.7).

### 4.2 Objetivo guardado: válido, corrupto o ausente

- Válido: objeto no array con `minutos` entero entre 1 y 10080.
- Corrupto o ausente: se trata como «sin objetivo»; **no se borra ni se reescribe** hasta que
  la persona guarde (CA-7.3). En ese estado el formulario abre con el campo vacío y sin
  «Quitar objetivo».
- `JSON.parse` siempre dentro de `try/catch`: un JSON roto no puede romper la aplicación.

## 5. Lógica pura (RF-1, RF-2, RF-3, RF-8; RNF-3, RNF-7, RNF-10)

### 5.1 Funciones

| Función | Entrada | Salida | Responsabilidad | RF |
| --- | --- | --- | --- | --- |
| `getWeekRange(today)` | fecha ISO | `{ start, end }` o `null` | Lunes y domingo de la semana de `today`. | RF-2, RF-6 |
| `formatWeekRange(start, end)` | dos fechas ISO | texto | «19 al 25 de octubre», «28 de septiembre al 4 de octubre», «28 de diciembre al 3 de enero». | RF-8 |
| `isValidGoal(value)` | valor | booleano | Entero finito entre 1 y 10080; sirve tanto para valores guardados como para el resultado de la validación textual. | RF-1, RF-7 |
| `validateGoalInput(rawText)` | texto literal | `{ ok: true, minutes }` o `{ ok: false, error }` | Orden de comprobación de CA-4.5; códigos `empty`, `decimals`, `sign-or-notation`, `too-small`, `too-large`. | RF-4 |
| `getGoalErrorMessage(code)` | código | texto | Mensajes exactos de CA-4.6, en español y en un solo sitio. | RF-4 |
| `parseStoredGoal(rawValue)` | cadena de `localStorage` o `null` | entero o `null` | Lee `{ minutos }`; JSON roto, forma incorrecta o valor fuera de rango → `null`; nunca lanza. | RF-7 |
| `sumWeeklyMinutes(sessions, today)` | sesiones, fecha ISO | entero o `null` | Total semanal estricto y redondeado (CA-2.1 a CA-2.6). | RF-2 |
| `buildProgress(sessions, goal, today)` | sesiones, objetivo, fecha ISO | objeto de progreso o `null` | Orquesta total, porcentaje, restante, barra y estado (CA-2.7 a CA-2.10). `null` si el objetivo o `today` no son válidos. | RF-2, RF-3 |
| `getProgressSummary(progress)` | progreso | texto | «120 de 300 min · 40 %». | RF-3 |
| `getProgressMessage(progress)` | progreso | texto | «Te falta 1 min», «Te faltan 180 min», «¡Objetivo cumplido!», «¡Objetivo superado! +45 min». | RF-3 |
| `getAccessibleLabel(progress)` | progreso | texto | «Semana del 19 al 25 de octubre: 120 de 300 minutos, 40 por ciento. Te faltan 180 minutos.». | RF-8 |

### 5.2 Validación del texto del objetivo (RF-4; CA-4.5, CA-4.6)

Se comprueba el **texto literal** del campo, nunca un valor convertido por el navegador. Por
eso el campo es `input type="text"` con `inputmode="numeric"` (ver 6.3): un `type="number"`
normalizaría «3e2» o «+300» antes de que la lógica pueda verlos.

```text
FUNCIÓN validateGoalInput(textoBruto):
  t = recortar espacio(textoBruto)
  SI t vacío O no contiene ningún dígito: DEVOLVER error «empty»
  SI t contiene "," O ".":                 DEVOLVER error «decimals»
  SI t contiene algún carácter que no sea dígito,
     salvo un único guion inicial:         DEVOLVER error «sign-or-notation»
  SI t empieza por "-" Y el resto son dígitos: DEVOLVER error «too-small»
  n = entero(t)                            // en este punto t es solo dígitos
  SI n = 0:                                DEVOLVER error «too-small»
  SI n > 10080:                            DEVOLVER error «too-large»
  DEVOLVER { ok: verdadero, minutes: n }
```

Mensajes exactos (CA-4.6): `empty` → «Escribe un número entero de minutos.»; `decimals` →
«Escribe un número entero de minutos, sin decimales.»; `sign-or-notation` → «Escribe el
número sin signo ni notación científica, por ejemplo 300.»; `too-small` → «El objetivo debe
ser al menos 1 minuto.»; `too-large` → «El objetivo no puede superar 10080 minutos (168
horas).».

### 5.3 Total semanal estricto (RF-2; CA-2.1 a CA-2.6)

```text
FUNCIÓN sumWeeklyMinutes(sesiones, hoy):
  SI parseIsoDate(hoy) es nulo: DEVOLVER nulo
  SI sesiones no es array:      DEVOLVER 0
  { start, end } = getWeekRange(hoy)
  idsVistos = conjunto
  total = 0

  PARA cada sesión EN sesiones:
    SI sesión null o no es objeto: CONTINUAR
    SI sesión.id no es nulo ni indefinido:
      SI idsVistos contiene sesión.id: CONTINUAR   // primera aparición: se consume aquí,
      idsVistos.AÑADIR(sesión.id)                  // sea válida, inválida o futura
    SI parseIsoDate(sesión.fecha) es nulo: CONTINUAR
    SI minutos no es finito O minutos <= 0: CONTINUAR
    SI sesión.fecha > hoy: CONTINUAR
    SI sesión.fecha < start O sesión.fecha > end: CONTINUAR
    total = total + minutos

  DEVOLVER redondearAlEntero(total)                // mitad hacia arriba
```

Detalles que replican la spec y el mapa de calor:

- El `id` se marca como visto **antes** de validar: `[{id:1, futura}, {id:1, válida}]` da 0
  (CA-2.3, caso de §6 de la spec).
- El redondeo es del **total semanal**, no de cada día (CA-2.5); el mapa de calor sigue
  redondeando por día y no se toca.
- La comparación de fechas es lexicográfica sobre cadenas `AAAA-MM-DD` ya validadas.
- La función no ordena, no filtra in situ ni modifica el array recibido (CA-2.6).
- Complejidad O(n): con 1000 sesiones queda muy por debajo de RNF-4.

### 5.4 Progreso: porcentaje, restante, barra y estado (RF-2, RF-3)

Orden exacto de CA-2.7: total redondeado → porcentaje → restante → barra → estado.

```text
FUNCIÓN buildProgress(sesiones, objetivo, hoy):
  SI NOT isValidGoal(objetivo): DEVOLVER nulo
  SI parseIsoDate(hoy) es nulo:  DEVOLVER nulo
  { start, end } = getWeekRange(hoy)
  minutos = sumWeeklyMinutes(sesiones, hoy)

  porcentaje = redondear(minutos * 100 / objetivo)
  SI minutos > 0 Y porcentaje = 0:            porcentaje = 1     // nunca 0 % con actividad
  SI minutos < objetivo Y porcentaje >= 100:  porcentaje = 99    // no contradecir «Te falta 1 min»

  restante = máximo(0, objetivo - minutos)
  ratio    = mínimo(minutos / objetivo, 1)

  SI minutos = 0:              estado = «idle»
  SI NO, SI minutos < objetivo: estado = «in-progress»
  SI NO, SI minutos = objetivo: estado = «met»
  SI NO:                        estado = «exceeded»

  DEVOLVER { state, minutes, goal: objetivo, percentage, remaining, ratio, start, end }
```

Ejemplos verificables del plan: `1 de 10080 → 1 %`; `299 de 300 → 99 %` y «Te falta 1 min»;
`300 de 300 → 100 %` y «cumplido»; `345 de 300 → 115 %` y «superado +45 min»;
`0 de 300 → 0 %` y «Te faltan 300 min».

Textos (RF-3, RF-8):

| Estado | Título visible | Resumen visible | Mensaje visible | Texto accesible |
| --- | --- | --- | --- | --- |
| `idle` | `Aún no has estudiado esta semana` | `0 de 300 min · 0 %` | `Te faltan 300 min` (o `Te falta 1 min`) | `Semana del 19 al 25 de octubre: 0 de 300 minutos, 0 por ciento. Te faltan 300 minutos.` |
| `in-progress` | — | `120 de 300 min · 40 %` | `Te faltan 180 min` (o `Te falta 1 min`) | `...120 de 300 minutos, 40 por ciento. Te faltan 180 minutos.` |
| `met` | — | `300 de 300 min · 100 %` | `¡Objetivo cumplido!` | `...300 de 300 minutos, 100 por ciento. Objetivo cumplido.` |
| `exceeded` | — | `345 de 300 min · 115 %` | `¡Objetivo superado! +45 min` | `...345 de 300 minutos, 115 por ciento. Objetivo superado por 45 minutos.` |

Singular: `1 min`, `Te falta 1 min`, `+1 min`, `1 minuto` en el texto accesible. Sin separador
de miles: `10080 min`.

## 6. Interfaz (RF-3, RF-4, RF-8; RNF-1, RNF-2)

### 6.1 Estructura y orden de lectura

Todo el bloque vive **dentro** de la tarjeta «Esta semana» (`section.weekly-section`), que
hoy contiene el `h2` y el `p#weekly-minutes`. Se añade debajo, sin quitar nada:

```text
weekly-card
├─ h2 «Esta semana»
├─ p#weekly-minutes «0 min»                (sin cambios: CA-3.7)
├─ div#goal-no-goal                        (estado sin objetivo)
│  ├─ p  «Aún no tienes un objetivo semanal»
│  ├─ p  «Fija cuántos minutos quieres estudiar cada semana para ver tu progreso.»
│  └─ button «Fijar objetivo»
├─ div#goal-active                         (sin actividad, en progreso, cumplido y superado)
│  ├─ p#goal-idle «Aún no has estudiado esta semana»  (solo en el estado sin actividad)
│  ├─ p  «Objetivo semanal: 300 min»
│  ├─ div[role="progressbar"] → relleno visual
│  ├─ p#goal-summary  «120 de 300 min · 40 %»
│  ├─ p#goal-message  «Te faltan 180 min»
│  └─ button «Editar»
├─ p#goal-status (aria-live, oculto a la vista)  ← anuncios del cambio de objetivo
└─ form#goal-form hidden
   ├─ label[for="goal-minutes"] «Minutos por semana»
   ├─ input#goal-minutes type="text" inputmode="numeric" autocomplete="off"
   │      aria-describedby="goal-hint goal-error"
   ├─ p#goal-hint  «Entre 1 y 10080 minutos.»
   ├─ p#goal-error role="alert" hidden
   └─ button «Guardar» · button «Cancelar» · button#goal-remove «Quitar objetivo»
```

Orden de lectura: título, total, objetivo, progreso, mensaje y acción (CA-8.1).

### 6.2 Estados y visibilidad

- Los bloques «sin objetivo» y «activo» se alternan con el atributo `hidden`; nunca con
  `display` calculado desde JS.
- Con objetivo corrupto se muestra el estado «sin objetivo» (CA-7.3).
- «Objetivo semanal: N min» solo aparece cuando hay objetivo válido.
- La barra solo existe cuando hay objetivo: no se muestra en el estado sin objetivo (CA-3.1).

### 6.3 Formulario en línea (RF-4)

- **Campo de texto, no numérico**: `input type="text"` con `inputmode="numeric"`,
  `autocomplete="off"` y `maxlength` holgado (p. ej. 12). `type="number"` normalizaría
  «3e2» y «+300» antes de que la lógica pudiera rechazarlos (CA-4.2, CA-4.5, §6 de la spec).
  El formulario lleva `novalidate` como el de sesiones: la validación es propia y textual.
- Al abrir: si el objetivo guardado es válido, el campo se rellena con su valor; si es
  corrupto o no hay, el campo abre vacío y «Quitar objetivo» queda oculto (CA-4.2, CA-4.3).
- El foco pasa al campo al abrir; `Escape` y «Cancelar» cierran sin guardar y devuelven el
  foco al botón que abrió (CA-4.7).
- Guardar válido: `setItem`, cerrar, refrescar el bloque, devolver el foco y anunciar
  (CA-4.4). Guardar el valor vigente: cerrar sin reescribir la clave (CA-4.9).
- Guardar inválido: mensaje de `getGoalErrorMessage` en `#goal-error` (visible y asociado),
  sin persistir, sin cerrar y con el foco en el campo (CA-4.5, CA-4.6).
- «Quitar objetivo»: `removeItem`, cerrar el formulario, pasar a sin objetivo y anunciar
  (CA-4.8).
- Fallo de almacenamiento: mensaje «No se pudo guardar el objetivo. Inténtalo de nuevo.» y
  estado anterior intacto (CA-4.10).

### 6.4 Barra de progreso y anuncios

- La barra es `role="progressbar"` con `aria-valuemin="0"`, `aria-valuemax="N"`,
  `aria-valuenow` limitado al objetivo (`mín(minutos, objetivo)`) y
  `aria-valuetext` con el texto accesible completo (CA-8.2).
- El relleno visual usa el `ratio` calculado en la lógica, de modo que la barra nunca se
  desborda aunque se supere el objetivo (CA-2.10).
- El color no es la única señal: siempre hay minutos y porcentaje en texto (CA-8.4).
- `p#goal-status` con `aria-live="polite"` anuncia el nuevo estado **solo** cuando cambia el
  objetivo: guardar, quitar o cambio llegado de otra pestaña (CA-8.10). Los recálculos por
  sesiones o por medianoche no escriben en él.

### 6.5 Estilos y responsive (RNF-1, RNF-2)

- El bloque reutiliza el lenguaje visual existente: hoja blanca, borde `--line`, tinta y
  naranja de marca.
- La barra es una pista clara con relleno naranja (`--heat-3`), altura de 10–12 px, radio
  pequeño y `overflow: hidden`; el ancho del relleno se fija con una variable CSS
  (`--goal-progress`) entre 0 y 100 %.
- Botones al menos 44 px de alto en móvil; «Guardar» con el estilo `btn-primary` y
  «Cancelar»/«Quitar objetivo» como botones secundarios con borde.
- Mensaje de error en `--ember-ink` sobre `--ember-soft`, legible y con contraste AA.
- Foco visible en campo y botones (contorno de tinta de 2 px, como el resto del sitio).
- Etiquetas y mensajes a 1rem como mucho; a 320 px nada se corta ni provoca scroll
  horizontal (CA-8.7).
- `@media (prefers-reduced-motion: reduce)`: sin transición en el ancho de la barra
  (CA-8.9).

## 7. Sincronización (RF-5)

- `render()` se amplía con `renderWeeklyGoal(sessions)` después de las estadísticas
  actuales, de modo que registrar una sesión ya refresca el objetivo (CA-5.1).
- `renderWeeklyGoal` es idempotente y **no toca** el estado del formulario:
  - Nunca escribe en `input#goal-minutes` (el valor solo se rellena al abrir, CA-4.2).
  - Nunca cambia el `hidden` de `form#goal-form`.
  - Nunca muestra ni limpia `#goal-error`.
  - Nunca mueve el foco.
  - Sí actualiza textos, barra y la presencia de `#goal-remove` según exista objetivo válido
    (CA-4.3, CA-5.5, CA-5.6).
- Medianoche: se reutiliza `scheduleMidnightRefresh`, que sigue siendo **el único**
  temporizador; su callback ya llama a `render()`, así que el objetivo se recalcula al
  cambiar el día sin añadir temporizadores (CA-5.2, CA-5.7). El lunes el progreso vuelve a 0
  y el objetivo se mantiene (CA-6.3).
- `visibilitychange` visible: `render()` (CA-5.3).
- `storage`: el manejador actual descarta todo lo que no sea la clave de sesiones. Pasa a
  aceptar `estudioDiarioSesiones`, `estudioDiarioObjetivoSemanal` y `event.key === null`
  (borrado completo del almacenamiento) y a llamar a `render()` (CA-5.4).
- Con el formulario abierto y un cambio externo, el texto escrito y el foco se conservan; al
  guardar prevalece el texto del campo (CA-5.5).
- La lógica nunca escribe: las únicas escrituras son las del formulario de sesiones y las del
  formulario del objetivo.

## 8. Estrategia de pruebas

### 8.1 Pruebas automáticas (`node --test`)

- Archivo único: `tests/weekly-goal.test.js`.
- `node:test` y `node:assert/strict`; `require("../weekly-goal-logic.js")`.
- Ninguna prueba usa la fecha del sistema: `today` se pasa siempre explícitamente. Fixture
  base: `today = "2026-10-19"` (lunes), semana del 19 al 25 de octubre de 2026.
- Nombres de los tests en inglés; aserciones y textos esperados en español.
- Puerta: la lógica debe estar en verde antes de tocar la interfaz.

Los casos de la spec §8.1 se reparten en dos bloques separados, porque una cosa es el texto
que escribe la persona y otra el valor que ya está guardado:

**Bloque A — entradas del campo (texto literal, CA-4.5/CA-4.6)**

| Valor introducido | Resultado esperado |
| --- | --- |
| `«300»`, `« 300 »`, `«1»`, `«10080»` | válidos, con el entero correspondiente |
| `«»`, `«   »`, `«treinta»` | `empty` → «Escribe un número entero de minutos.» |
| `«300,5»`, `«300.5»`, `«0,5»` | `decimals` → «… sin decimales.» |
| `«3e2»`, `«+300»`, `«1e3»`, `«3 0 0»` | `sign-or-notation` → «… sin signo ni notación científica…» |
| `«0»` | `too-small` → «El objetivo debe ser al menos 1 minuto.» |
| `«-5»` | `too-small` → «El objetivo debe ser al menos 1 minuto.» |
| `«10081»`, `«99999»` | `too-large` → «… no puede superar 10080 minutos (168 horas).» |
| `null`, `undefined`, número suelto | se tratan como texto y no lanzan excepción |

**Bloque B — valores guardados (JSON, CA-7.3)**

| Valor almacenado | Resultado esperado |
| --- | --- |
| `'{"minutos":600}'` | 600 |
| `'{"minutos":1}'`, `'{"minutos":10080}'` | válidos |
| `'{"minutos":0}'`, `'{"minutos":-5}'`, `'{"minutos":1.5}'` | `null` |
| `'{"minutos":"300"}'`, `'{"minutos":null}'`, `'{}'`, `'[]'`, `'null'` | `null` |
| `'{roto'` | `null`, sin lanzar |
| `null` (clave ausente) | `null` |
| `NaN`, `Infinity` (objeto en memoria) | `null` |

Otras comprobaciones automáticas:

1. **Rango semanal y formato**: `getWeekRange` devuelve lunes y domingo para cada día de la
   semana (lunes, miércoles, domingo), incluido el cruce de mes y de año;
   `formatWeekRange` produce `19 al 25 de octubre`, `28 de septiembre al 4 de octubre` y
   `28 de diciembre al 3 de enero`; `today` inválido → `null`.
2. **Total semanal**: sesiones antes, dentro y después de la semana; sesión de hoy (cuenta);
   sesión futura dentro de la semana (no cuenta); varias sesiones el mismo día (suman);
   minutos 0, negativos, `NaN`, `Infinity` y en texto (se ignoran una a una y las demás
   suman); fechas `2026-2-3`, `2026-02-30` y `19-10-2026` (se ignoran); `sessions` `null`,
   objeto o cadena → 0.
3. **Duplicados**: mismo `id` dos veces válido → solo la primera; `[{id:1, futura},
   {id:1, válida}]` → 0; `[{id:1, minutos 0}, {id:1, válida}]` → 0; dos sesiones sin `id`
   (o con `id` `null`) suman las dos.
4. **Redondeo**: total 14,5 → 15; 10 + 4,5 → 15; enteros sin cambios; el redondeo es del
   total y no altera las sesiones de entrada.
5. **Porcentaje**: 0 % con 0 minutos; 1 % con 1 de 10080; 99 % con 299 de 300; 33 % con 1 de
   3; 40 % con 120 de 300; 100 % exacto; 115 % con 345 de 300; 300 % con 900 de 300.
6. **Restante y barra**: restante 0 al alcanzar y al superar; `Te falta 1 min` en singular;
   ratio 1 en cumplido y superado, y menor que 1 en progreso; nunca mayor que 1.
7. **Estados y textos**: los cinco estados (incluido `buildProgress` → `null` con objetivo
   inválido); resumen, mensaje y singular/plural de cada uno.
8. **Texto accesible**: `Semana del 19 al 25 de octubre: …`, con singular («1 minuto») y con
   el rango que cruza mes y año.
9. **Determinismo y no mutación**: dos llamadas idénticas producen objetos iguales; el array
   de sesiones congelado con `Object.freeze` no se altera.
10. **Pureza**: el código fuente de `weekly-goal-logic.js` no contiene `document`,
    `localStorage`, `Date.now` ni `new Date()` sin argumentos (búsqueda con expresión
    regular), y exporta un objeto con todas las funciones públicas esperadas.

### 8.2 Qué no se automatiza (verificación manual en Chrome)

El DOM, el foco, el almacenamiento, el responsive y los tiempos se verifican a mano:

- Los cinco estados con datos de prueba y tras recargar.
- Fijar, editar y quitar el objetivo; validación de las entradas del bloque A con su mensaje.
- Cancelar y `Escape`: cierre sin guardar y foco devuelto.
- Objetivo corrupto: campo vacío y sin «Quitar objetivo».
- Registrar una sesión actualiza el progreso sin recargar; una futura no lo cambia.
- Cambiar el objetivo a mitad de semana recalcula al instante.
- Formulario abierto mientras se registra una sesión, se cruza la medianoche y se vuelve a la
  pestaña: sigue abierto, con su texto y su foco.
- Dos pestañas: sesiones, objetivo y borrado completo del almacenamiento.
- Teclado y lector de pantalla: nombre y valor de la barra en el inspector, anuncio al
  cambiar el objetivo, sin anuncios repetidos al repintar.
- 320, 375 y 1280 px; en 320, `scrollWidth == clientWidth`.
- 1000 sesiones: recálculo por debajo de 50 ms con las herramientas del navegador.
- Consola limpia y no regresión de racha, récord, semana, mes, mapa y lista.
- Todo abriendo `index.html` con doble clic (`file://`).

## 9. Cobertura de requisitos

| RF | Lógica pura | Interfaz | Pruebas |
| --- | --- | --- | --- |
| RF-1 | `isValidGoal`, `parseStoredGoal` | guardar, editar, quitar y persistir | Bloque B y pureza |
| RF-2 | `sumWeeklyMinutes`, `buildProgress` | resumen, mensaje y barra | Total, duplicados, redondeo, porcentaje |
| RF-3 | `buildProgress` y textos | cinco estados y visibilidad de bloques | Estados y singular/plural |
| RF-4 | `validateGoalInput`, `getGoalErrorMessage` | formulario abrir/cerrar, errores y foco | Bloque A |
| RF-5 | — | `render()`, medianoche, visibilidad y `storage` | Manual con dos pestañas y cambio de día |
| RF-6 | `getWeekRange`, `addDays`, `getMonday` | rango del texto accesible | Rango, cruce de mes y año |
| RF-7 | `parseStoredGoal`, solo lectura de sesiones | mensajes de fallo de almacenamiento | Bloque B y no mutación |
| RF-8 | `formatWeekRange`, `getAccessibleLabel` | barra, aria, responsive y reduced motion | Texto accesible + manual |
| RNF-3, RNF-10 | sin DOM, sin almacenamiento, sin reloj | — | Pureza y determinismo |
| RNF-4 | O(n) + O(1) | render de un bloque | Manual con 1000 sesiones |
| RNF-7 | — | — | `node --test` |
| RNF-11 | — | — | Revisión de `AGENTS.md` y `MEMORY.md` |

## 10. Cumplimiento de la constitución

| Principio | Cómo se cumple |
| --- | --- |
| 1. Simplicidad | HTML, CSS y JS puros; tres scripts clásicos; sin dependencias, build ni servidor. |
| 2. La spec manda | Solo se implementan los RF y CA de la spec 002; nada de historial, avisos ni prorrateo. |
| 3. Lógica separada | `weekly-goal-logic.js` no toca DOM, almacenamiento ni reloj; recibe sesiones, objetivo y `today`. |
| 4. Tests como puerta | La lógica se prueba con `node --test` antes de conectar la interfaz; un rojo bloquea. |
| 5. Datos sagrados | No se toca `estudioDiarioSesiones`; el objetivo vive en su propia clave; nada se borra. |
| 6. Idioma | Código en inglés; textos, mensajes y documentación en español. |

## 11. Riesgos y mitigaciones

- **Romper «Esta semana», la racha o el mapa**: la lógica del objetivo es independiente y
  solo lee sesiones; `calculateWeeklyMinutes` y el resto no se tocan (CA-2.11, RNF-9). Se
  comprueba en la verificación manual que los valores anteriores no cambian.
- **Formulario abierto durante un recálculo**: `renderWeeklyGoal` no escribe en el campo, no
  alterna el `hidden` del formulario, no toca el foco ni el mensaje de error (CA-5.6). Se
  verifica con el formulario abierto al registrar una sesión, al cruzar la medianoche y al
  volver a la pestaña.
- **Temporizadores duplicados**: se reutiliza `scheduleMidnightRefresh`; no se crea ningún
  otro temporizador (CA-5.7). Se comprueba que el callback sigue reprogramando uno solo.
- **`storage` incompleto**: el manejador filtra por clave; se amplía a la clave del objetivo
  y a `key === null` para `localStorage.clear()` (CA-5.4).
- **`type="number"` normalizando entradas**: el campo es texto con `inputmode="numeric"`;
  los tests del bloque A fijan el comportamiento de «3e2», «+300» y «300,5».
- **Escrituras innecesarias**: guardar el valor vigente no reescribe la clave ni dispara
  eventos en otras pestañas (CA-4.9); el objetivo corrupto nunca se borra solo (CA-7.3).
- **Texto accesible enrevesado**: el rango de la semana se prueba con cruce de mes y de año
  para evitar «del 28 de diciembre al 3 de enero» mal formado.
- **Documentación desactualizada**: `AGENTS.md` se corrige en T12 y `MEMORY.md` en T14, con
  la clave y la forma reales (CA-7.8, RNF-11).
- **Repintados en exceso**: el bloque del objetivo es pequeño (unos pocos nodos); no hay
  listas grandes ni recálculo costoso, y el total semanal es O(n) sobre las sesiones.

## 12. Orden de implementación

1. `weekly-goal-logic.js` y `tests/weekly-goal.test.js`: lógica y pruebas hasta verde (T1–T6).
2. `index.html` y `styles.css`: estructura y estilos con datos de ejemplo (T7–T8).
3. `app.js`: render de estados y formulario (T9–T10).
4. `app.js`: sincronización con render, medianoche, visibilidad y `storage` (T11).
5. `AGENTS.md` (T12), verificación manual completa (T13) y `MEMORY.md` (T14).

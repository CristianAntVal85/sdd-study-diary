# Tasks 003 — Tema claro y oscuro

Tareas pequeñas, en orden de dependencia, según `specs/003-tema-claro-oscuro/plan.md` y la spec
aprobada. Los tests de lógica van primero y son puerta: no se avanza con `node --test` en rojo.
No se tocan las sesiones, el objetivo semanal, la racha, el récord, «Esta semana», los días del
mes, el mapa de calor ni sus cálculos. Solo cambian colores y se añade el botón de tema.

Antes de empezar: ejecutar `node --test` y confirmar que la suite actual (123 pruebas) está en
verde; si no, parar y avisar.

## Fase A — Lógica pura y pruebas

- [x] **T1. `theme-logic.js` puro y `tests/theme.test.js`**
  - **RF**: RF-3, RF-4, RF-5, RF-7; RNF-3, RNF-7, RNF-10, RNF-13.
  - **Depende de**: —.
  - **Tests primero**: en `tests/theme.test.js`, bloques A–G del plan: lectura del valor guardado
    (válidos y corruptos, sin lanzar), resolución con y sin elección, alternancia, decisión de
    escritura, serialización con ida y vuelta, etiqueta/estado/icono, y pureza del código fuente
    (sin `document`, `localStorage`, `matchMedia`, `Date.now` ni `new Date()`).
  - **Qué se hace**: crear `theme-logic.js` con el patrón IIFE de `weekly-goal-logic.js`, nombre
    `ThemeLogic`, export CommonJS protegido y las funciones del plan (§3.3): `parseStoredTheme`,
    `resolveTheme`, `toggleTheme`, `shouldWriteTheme`, `serializeTheme`, `getToggleLabel`,
    `isThemeButtonPressed` y `getIconName`. Sin estado, sin efectos y sin tocar sus argumentos.
  - **Hecho cuando**: `node --test` está en verde con los casos nuevos y la suite anterior sin
    cambios; el archivo no contiene DOM, almacenamiento, `matchMedia` ni reloj.

## Fase B — Estructura y arranque

- [x] **T2. `index.html`: cabecera, botón y arranque sin destello**
  - **RF**: RF-1, RF-3, RF-7, RF-8; RNF-4.
  - **Depende de**: T1.
  - **Qué se hace**:
    1. En `<head>`, en este orden: `<script src="theme-logic.js">`, el script en línea de
       arranque y después `styles.css`.
    2. Arranque: lee `estudioDiarioTema` con `try/catch`, crea la única consulta
       `matchMedia("(prefers-color-scheme: dark)")` (si existe), resuelve el tema, escribe
       `data-theme` en `<html>` y expone `window.ThemeRuntime` con `mediaQuery`, `getTheme`,
       `applyTheme`, `setHasChoice` y `subscribe` (§3.4 del plan), con una sola escucha `change`.
    3. `<header class="app-header">` dentro de `<main>` con el `h1` y el botón `#theme-toggle`:
       `type="button"`, etiqueta fija «Modo oscuro», `aria-pressed="false"`, dos SVG en línea
       (`sol` visible, `luna` con `hidden`) con `aria-hidden="true"` y `focusable="false"`, y
       `span.theme-toggle-label`.
    4. Script en línea tras el botón: lee `data-theme` y pone `aria-pressed` e icono iniciales.
    5. `app.js` sigue al final del `body`, después de las dos lógicas.
  - **Hecho cuando**: al abrir con doble clic con el sistema en oscuro y sin clave, el primer
    pintado ya es oscuro; con el sistema en claro y sin clave, claro; no hay destello al recargar
    ni errores en consola; `document.documentElement` lleva `data-theme` antes del CSS.

## Fase C — Estilos

- [x] **T3. `styles.css`: tokens claros y oscuros y componentes**
  - **RF**: RF-2, RF-6, RF-7; RNF-2.
  - **Depende de**: T2.
  - **Qué se hace**:
    1. Completar `:root` con los tokens de la tabla del plan (incluidos `--field`,
       `--line-control`, `--ink-surface`, `--primary-*`, `--secondary-hover-*`, `--row-hover`,
       `--empty-bg`, `--focus-ring`, `--selection-*`, `--goal-fill`, `--heat-future`,
       `--future-opacity`, `--tooltip-*`, `--placeholder` y las cuatro sombras) y aplicar los
       cinco ajustes de contraste del tema claro (CA-6.6).
    2. Añadir `:root[data-theme="oscuro"]` con todos los valores oscuros, `color-scheme: dark` y
       las sombras propias.
    3. Sustituir cada color literal por su token en página, tarjetas, racha, récord, textos,
       campos, marcador, errores, insignias, botones, foco, selección, barra del objetivo, mapa
       (5 niveles, futuros y hover) y tooltip (contorno con `outline` de 2 px, sin moverlo).
  - **Hecho cuando**: no queda ningún `#` ni `rgba(` fuera del bloque de tokens; todos los
    componentes se ven coherentes en ambos temas; alternar con `data-theme` en DevTools no deja
    restos del tema claro; cada par de la tabla cumple el contraste medido.

- [x] **T4. `styles.css`: botón de tema, cabecera, responsive y transiciones**
  - **RF**: RF-1, RF-7, RF-8; RNF-1.
  - **Depende de**: T3.
  - **Qué se hace**:
    1. `.theme-toggle`: mismo lenguaje visual que el botón secundario, `min-height: 44px`,
       `min-width: 44px`, icono + etiqueta, foco visible con `--focus-ring` (outline 3 px,
       `offset 3px`); estado `[aria-pressed="true"]` con `--ember-soft`, `--ember-ink` e `--ink`.
    2. `.app-header`: flex con `wrap`, `space-between`, `gap`, `padding-bottom: 0.85rem` y línea
       inferior de 2 px con `--ink`; el `h1` pierde relleno y borde y conserva su tipografía;
       botón con `margin-left: auto`; etiqueta que puede ocupar dos líneas sin reducir tamaño.
    3. Reglas `theme-switching` para anular transiciones y animaciones, y conservar el bloque de
       `prefers-reduced-motion`.
  - **Hecho cuando**: a 320, 375 y 1280 px no hay scroll horizontal y la cabecera se ve como
    antes salvo el botón; el botón se ve activado sin depender del color; con el teclado el foco
    es visible; al cambiar de tema no se anima ningún color.

## Fase D — Interfaz y sincronización

- [x] **T5. `app.js`: clic, persistencia y sincronización**
  - **RF**: RF-1, RF-4, RF-5, RF-7; RNF-9, RNF-11.
  - **Depende de**: T2, T3, T4.
  - **Qué se hace**:
    1. Constante de la clave `estudioDiarioTema` y `updateThemeButton()` (lee el tema aplicado y
       ajusta `aria-pressed` e icono; la etiqueta no cambia).
    2. Al cargar: `ThemeRuntime.subscribe(updateThemeButton)` una sola vez y una llamada inicial.
    3. Clic: `toggleTheme` → `shouldWriteTheme` → `setItem(serializeTheme(...))` en `try/catch`
       → `applyTheme` → `setHasChoice(true)`. Si la escritura falla, sin mensaje: elección de
       sesión (CA-4.7).
    4. Ampliar el `handleStorageChange` existente: valor válido → aplica y `setHasChoice(true)`;
       `newValue === null` o valor ilegible → resuelve con el sistema, aplica y
       `setHasChoice(false)`; `event.key === null` hace lo mismo para el tema. Las ramas de
       sesiones y objetivo no cambian.
  - **Hecho cuando**: el botón alterna con clic, Enter y Espacio; recargar conserva la elección;
    borrar la clave desde otra pestaña devuelve al modo automático; un cambio del sistema se
    aplica solo si no hay elección; el número de escuchas de `matchMedia` no aumenta al alternar,
    repintar ni volver a la pestaña; el tema no llama a `render()`.

## Fase E — Documentación y verificación

- [x] **T6. `AGENTS.md` y `MEMORY.md`**
  - **RF**: RNF-12.
  - **Depende de**: T5.
  - **Qué se hace**: documentar en `AGENTS.md` la clave `estudioDiarioTema` con su forma
    `{ "tema": "claro" | "oscuro" }`, las reglas de decisión (elección guardada manda; sin
    elección, sistema en vivo; escritura solo al pulsar) y añadir la clave a «Para empezar de
    cero». En `MEMORY.md`, anotar estado, decisiones (arranque en línea, tokens, elección de
    sesión) y resultado de la verificación, sin pasar de ~50 líneas.
  - **Hecho cuando**: ambos documentos describen el comportamiento real, con las tres claves y sin
    datos sensibles.

- [x] **T7. Verificación manual completa en Chrome**
  - **RF**: todos (RF-1 a RF-9; RNF-1 a RNF-13, en lo verificable a mano).
  - **Depende de**: T4, T5, T6.
  - **Qué se hace**: recorrer la lista de §8.2 del plan: primer pintado sin destello (CPU 6×),
    todos los componentes en ambos temas, medición de contraste, botón (etiqueta, estado, icono,
    44 px, teclado, foco), 320/375/1280 sin scroll, zoom 200 % y 400 %, alto contraste, movimiento
    reducido, hover y activo, `theme-switching` en un fotograma, persistencia, valor corrupto,
    clave ausente, borrado total, dos pestañas, almacenamiento bloqueado y `setItem` fallando (con
    `Page.addScriptToEvaluateOnNewDocument`), una sola consulta, no regresión de datos y
    comparación del tema claro con la captura de referencia.
  - **Hecho cuando**: todo lo anterior pasa y queda anotado en `MEMORY.md`; cualquier desviación se
    corrige o se devuelve a la spec antes de dar la tarea por cerrada.

## Fase F — Enmienda 003.1: el botón pasa a ser de acción (20 de octubre de 2026)

Cambio pedido por la persona usuaria (spec §12): la etiqueta del botón nombra el tema al que se
cambia y deja de ser fija. Solo afecta al botón; el resto de la spec no cambia.

- [x] **F1. `theme-logic.js`: etiqueta e icono variables**
  - **RF**: RF-1, RF-7.
  - **Depende de**: T1.
  - **Tests primero**: en `tests/theme.test.js`, el bloque F pasa a comprobar que
    `getToggleLabel("claro")` → «Modo oscuro» y `getToggleLabel("oscuro")` → «Modo claro», que
    `getIconName("claro")` → `luna` y `getIconName("oscuro")` → `sol`, que el módulo ya no expone
    ninguna función de estado pulsado y que el bloque G expone exactamente las siete funciones.
  - **Qué se hace**: `getToggleLabel(theme)` y `getIconName(theme)` dependen del tema (el icono
    nombra la acción, no el tema en uso) y se elimina `isThemeButtonPressed`.
  - **Hecho cuando**: `node --test` en verde.

- [x] **F2. `index.html`: botón sin `aria-pressed`, con etiqueta e icono iniciales**
  - **RF**: RF-1, RF-3, RF-7.
  - **Depende de**: F1.
  - **Qué se hace**: el botón pierde `aria-pressed`; el HTML inicial trae «Modo oscuro» y la luna
    visibles (lo del tema claro); el script en línea que sigue al botón pone la etiqueta de
    `getToggleLabel` y muestra el SVG de `getIconName` del tema aplicado.

- [x] **F3. `styles.css`: el estilo destacado lo selecciona el tema aplicado**
  - **RF**: RF-1, RF-6.
  - **Depende de**: F2.
  - **Qué se hace**: `.theme-toggle[aria-pressed="true"]` pasa a
    `:root[data-theme="oscuro"] .theme-toggle`, con los mismos tokens.

- [x] **F4. `app.js`: `updateThemeButton` pinta la etiqueta**
  - **RF**: RF-1, RF-5.
  - **Depende de**: F1.
  - **Qué se hace**: `updateThemeButton()` escribe `getToggleLabel(tema)` en el `span` de la
    etiqueta y alterna los SVG con `getIconName(tema)`; ya no pone `aria-pressed`.

- [x] **F5. Verificación en Chrome y documentación**
  - **RF**: RNF-12.
  - **Depende de**: F2, F3, F4.
  - **Qué se hace**: comprobar etiqueta, icono, nombre accesible y ausencia de `aria-pressed` en
    los dos temas; alternar con clic, Enter y Espacio; recargar, seguir al sistema y sincronizar
    con otra pestaña; 320/375/1280 sin scroll y consola limpia; actualizar `AGENTS.md` y
    `MEMORY.md`.

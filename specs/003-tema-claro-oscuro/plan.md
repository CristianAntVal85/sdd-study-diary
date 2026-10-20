# Plan 003 — Tema claro y oscuro

## 1. Resumen y alcance

Se añade un tema oscuro completo y un botón de acción de tema en la cabecera, con elección
recordada, modo automático interno que sigue al navegador mientras no haya elección explícita y
arranque sin destello. La decisión del tema vive en un archivo de lógica pura nuevo; el arranque
de la página aplica el tema antes del primer pintado; la interfaz se limita a pintar y a
reaccionar a eventos.

> **Nota de enmienda 003.1 (20 de octubre de 2026).** El botón deja de ser un interruptor con
> etiqueta fija «Modo oscuro» y `aria-pressed`. Pasa a ser un botón de acción: con el tema claro
> muestra la luna y «Modo oscuro»; con el tema oscuro, el sol y «Modo claro». No lleva
> `aria-pressed` y el nombre accesible es siempre la etiqueta visible del momento. El estilo
> destacado se conserva en el tema oscuro, ahora seleccionado por `data-theme="oscuro"`. Lo
> descrito en §3.3 (etiqueta), §3.4 (segundo script), §3.5 (`updateThemeButton`), §6.1, §6.2,
> §6.3, §6.4, §8.2 y §9 incorpora ya esta enmienda; todo lo demás —resolución, persistencia,
> sincronización, paleta y datos— no cambia.

El plan cubre los RF-1 a RF-9 y los RNF-1 a RNF-13 de `specs/003-tema-claro-oscuro/spec.md`
(aprobada el 20 de octubre de 2026) y respeta `docs/constitution.md`. No se modifican las
sesiones, el objetivo semanal, la racha, el récord, «Esta semana», los días del mes, el mapa de
calor ni ninguno de sus cálculos: el tema solo cambia colores.

Fuera de alcance, igual que en la spec: más de dos temas, un tercer estado visible «sistema»,
tema por hora, por sección o por tarjeta, cambio de tipografía o tamaños, tema propio de alto
contraste, sincronización entre dispositivos y exportación o impresión con tema.

### 1.1 Cambios menores ya aplicados a la spec

1. Estado actualizado a «aprobada (20 de octubre de 2026)».
2. CA-5.6 matizado con «cuando el navegador admite la consulta», para no contradecir CA-9.5.
3. CA-6.8 enumera ya `--shadow-press` entre las sombras que necesitan valor por tema.

## 2. Estado de partida

- La suite actual está en verde: 123 pruebas (32 del mapa + 91 del objetivo, según `MEMORY.md`).
  El implementador debe ejecutar `node --test` antes de empezar y parar si no está verde
  (principio 4 de la constitución).
- `styles.css` tiene un único `:root` con variables del tema claro y varias excepciones con color
  escrito a mano (`#f7f9fc` en campos, `#f5f8fc` en hover de fila y del secundario, `#f9fbfd` en
  el estado vacío, `#ffffff` en el texto del primario, `#9c2d0b` en su hover, `#64748b` en el
  marcador de posición, `rgba(...)` en sombras y en el halo de foco, y `#f04e23` en la selección).
  Todas se convierten en tokens (T3, T4).
- La cabecera es un `h1` suelto: concentra la tipografía, el `padding-bottom: 0.85rem` y la línea
  inferior de 2 px. El plan traslada relleno y línea a un `<header>` nuevo (T2, T4).
- `app.js` ya tiene `render()`, el único temporizador de medianoche, `visibilitychange` y un
  manejador de `storage` que ya atiende dos claves y `key === null`; el tema se suma a ese
  manejador sin crear otro.
- `heat-map-logic.js` y `weekly-goal-logic.js` fijan el patrón de módulo puro que sigue
  `theme-logic.js`: IIFE con espacio de nombres global, export CommonJS protegido y pruebas con
  `node --test`.

## 3. Arquitectura y decisiones técnicas

### 3.1 Archivos que se crean o modifican

| Archivo | Acción | Responsabilidad | RF |
| --- | --- | --- | --- |
| `theme-logic.js` | Crear | Lógica pura del tema: lectura del valor guardado, resolución del tema, alternancia, decisión de escritura, serialización y etiqueta e icono de acción del botón. Sin DOM, sin `localStorage`, sin `matchMedia`, sin reloj. | RF-3, RF-4, RF-5, RF-7; RNF-3, RNF-7, RNF-10, RNF-13 |
| `tests/theme.test.js` | Crear | Pruebas de la lógica con `node --test` y `node:assert/strict`, incluida la pureza por lectura del código fuente. | RF-3, RF-4, RF-7; RNF-7, RNF-10 |
| `index.html` | Modificar | `theme-logic.js` y el arranque en línea antes de la hoja de estilos; `<header class="app-header">` con `h1` y botón; botón de acción con dos SVG y etiqueta que cambia con el tema; segundo script en línea tras el botón. | RF-1, RF-3, RF-7, RF-8 |
| `styles.css` | Modificar | Tokens claros (con los cinco ajustes) y bloque oscuro; tokens aplicados a todos los componentes, incluido el mapa, el tooltip y las sombras; botón de tema, cabecera y responsive; `theme-switching` y movimiento reducido. | RF-2, RF-6, RF-7, RF-8; RNF-1, RNF-2 |
| `app.js` | Modificar | Clic del botón, persistencia y elección de sesión, etiqueta e icono de acción, suscripción a la consulta única, `storage` con la clave nueva y `key === null`, sin escuchas nuevas. | RF-1, RF-4, RF-5, RF-7; RNF-9, RNF-11 |
| `AGENTS.md` | Modificar | Documentar `estudioDiarioTema`, su forma y el modelo de decisión; añadir la clave a «Para empezar de cero». | RNF-12 |
| `MEMORY.md` | Modificar al terminar | Estado, decisiones y verificación del tema. | — |

No se crea `package.json`. No se añaden dependencias ni pasos de compilación. No se crea ningún
archivo de arranque aparte: el arranque es el script en línea que la spec ya prevé.

### 3.2 Orden de carga y `file://`

```text
<head>
  <script src="theme-logic.js"></script>   ← lógica pura, antes del CSS
  <script>… arranque no puro …</script>    ← lee el tema, lo aplica, crea la única consulta
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="container">
    <header class="app-header">
      <h1>Diario de Estudio</h1>
      <button id="theme-toggle" …>…</button>
      <script>… icono y etiqueta iniciales …</script>
    </header>
    …
  </main>
  <script src="heat-map-logic.js"></script>
  <script src="weekly-goal-logic.js"></script>
  <script src="app.js"></script>
</body>
```

- Todo son scripts clásicos locales: nada de `type="module"`, `fetch`, XHR ni red. Funciona con
  doble clic en `file://` (CA-3.5, CA-9.2).
- El tema se aplica **antes** de que el CSS se cargue, así que la primera pintura ya sale con el
  tema correcto (CA-3.3, RNF-4).
- El script tras el botón corre antes de que exista `app.js`, y también antes del primer pintado.

### 3.3 Módulo puro `theme-logic.js` (RF-3, RF-4, RF-5, RF-7)

Mismo patrón que `weekly-goal-logic.js`:

```js
"use strict";

const ThemeLogic = (() => {
  const THEMES = ["claro", "oscuro"];

  function parseStoredTheme(rawValue) { /* … */ }
  function resolveTheme(storedChoice, systemPrefersDark) { /* … */ }
  function toggleTheme(theme) { /* … */ }
  function shouldWriteTheme(currentStored, requested) { /* … */ }
  function serializeTheme(theme) { /* … */ }
  function getToggleLabel(theme) { /* «Modo oscuro» | «Modo claro» */ }
  function getIconName(theme) { /* «luna» | «sol» */ }

  return { /* … */ };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = ThemeLogic;
}
```

- **Sin** `document`, `localStorage`, `matchMedia`, `Date.now` ni `new Date()` (RNF-10). No hay
  «hoy» que pasar: las entradas son `storedChoice` (texto tal cual o `null`) y
  `systemPrefersDark` (booleano), y la salida es un tema o un booleano.
- El módulo no lee ni escribe nada: solo decide (RNF-13). La consulta, la escucha, el
  almacenamiento y el documento viven en el arranque y en `app.js`.

API y contrato:

| Función | Entrada | Salida | Reglas | CA |
| --- | --- | --- | --- | --- |
| `parseStoredTheme(rawValue)` | texto de `localStorage` o `null` | `"claro"`, `"oscuro"` o `null` | JSON válido con objeto no array y `tema` exactamente `claro` u `oscuro`; cualquier otra cosa → `null`; nunca lanza; no modifica la entrada | CA-4.4 |
| `resolveTheme(storedChoice, systemPrefersDark)` | texto guardado y booleano | `"claro"` / `"oscuro"` | Elección válida manda; sin elección válida, `systemPrefersDark === true` → oscuro; en cualquier otro caso, claro | CA-3.1, CA-3.2, CA-5.1, CA-5.2, CA-9.5 |
| `toggleTheme(theme)` | tema | el otro tema | Solo existen dos valores; una entrada inválida se trata como claro | CA-2.1, CA-7.3 |
| `shouldWriteTheme(currentStored, requested)` | texto guardado y tema pedido | booleano | `false` solo si el guardado es válido y coincide con el pedido; `true` si difiere, si falta o si está corrupto | CA-4.2, CA-4.6 |
| `serializeTheme(theme)` | tema | texto JSON | Exactamente `{"tema":"claro"}` o `{"tema":"oscuro"}` | CA-4.1 |
| `getToggleLabel(theme)` | tema | `"Modo oscuro"` / `"Modo claro"` | Etiqueta de acción en español: «Modo oscuro» con claro y «Modo claro» con oscuro | CA-1.3, CA-1.4, CA-7.3 |
| `getIconName(theme)` | tema | `"luna"` / `"sol"` | Luna con claro y sol con oscuro (arranque y app eligen el SVG por este valor) | CA-1.3 |

### 3.4 Arranque no puro en la cabecera (RF-3, RF-5, RNF-4)

Un script en línea corto dentro de `<head>`, entre `theme-logic.js` y la hoja de estilos:

1. Lee `estudioDiarioTema` con `try/catch` (`null` si el almacenamiento falla o está bloqueado).
2. Crea **una** consulta `window.matchMedia("(prefers-color-scheme: dark)")` si el navegador la
   admite, y guarda si el sistema prefiere oscuro.
3. Resuelve el tema con `ThemeLogic.resolveTheme(...)` y lo escribe en
   `document.documentElement.dataset.theme`.
4. Añade **una** escucha `change` a esa consulta: si no hay elección explícita, vuelve a resolver
   con la nueva preferencia y aplica el tema (nunca escribe en el almacenamiento).
5. Expone un runtime mínimo para el resto de la página:

```js
window.ThemeRuntime = {
  mediaQuery: mql,                 // MediaQueryList o null
  getTheme(),                      // lee data-theme
  applyTheme(theme),               // pone data-theme, activa theme-switching y avisa a los suscriptores
  setHasChoice(bool),              // elección explícita (guardada o de sesión)
  subscribe(callback)              // callbacks en un array; NO añade escuchas al MediaQueryList
};
```

- `applyTheme` es **el único** sitio que escribe `data-theme`: añade la clase `theme-switching` a
  `<html>`, cambia el atributo y retira la clase en el siguiente `requestAnimationFrame`
  (CA-2.6). Así la neutralización de transiciones cubre también los cambios del sistema y los de
  otra pestaña.
- `subscribe` guarda funciones en un array y no registra escuchas nuevas: el único
  `addEventListener("change")` es el del paso 4 (CA-5.6).
- Si no hay `matchMedia`, `mql` es `null`, el sistema se considera «sin preferencia» (claro) y el
  botón sigue funcionando (CA-9.5).
- Si el almacenamiento está bloqueado, la lectura devuelve `null` y se usa el tema del sistema;
  el arranque no muestra nada ni rompe la página (CA-3.6, CA-4.7).

El segundo script en línea (tras el botón) solo aplica lo que ya está decidido: lee `data-theme`,
pone en el `span` la etiqueta que diga `getToggleLabel` y muestra el SVG que diga `getIconName`. No
pone `aria-pressed` —el botón es de acción— y no resuelve nada por su cuenta (CA-3.4).

### 3.5 `app.js` (RF-1, RF-4, RF-5)

- Al cargar: `ThemeRuntime.subscribe(updateThemeButton)` y `updateThemeButton()` una sola vez.
  `updateThemeButton` escribe en el `span` la etiqueta de `getToggleLabel(tema)` y alterna la
  visibilidad de los dos SVG según `getIconName(tema)`. No toca `aria-pressed`, porque el botón no
  lo lleva.
- Clic: `next = ThemeLogic.toggleTheme(ThemeRuntime.getTheme())`; si
  `ThemeLogic.shouldWriteTheme(rawStored, next)`, intenta `setItem(THEME_STORAGE_KEY,
  ThemeLogic.serializeTheme(next))` dentro de `try/catch`; después `ThemeRuntime.applyTheme(next)`
  y `ThemeRuntime.setHasChoice(true)`. Si `setItem` falla, **no** hay mensaje: la elección vale
  para la sesión y al recargar se vuelve al modo automático (CA-4.7).
- El `storage` que ya existe se amplía con la clave del tema: si llega un valor válido, se aplica
  ese tema y `setHasChoice(true)`; si la clave desaparece (`newValue === null`) o el valor es
  ilegible, se resuelve con el sistema, se aplica y `setHasChoice(false)` (CA-5.3, CA-5.4). Con
  `event.key === null` (borrado total) se hace lo mismo para el tema.
- El tema **no** llama a `render()`: no hay datos que recalcular (CA-2.3). Solo se actualiza el
  botón; el `storage` de sesiones y del objetivo sigue su curso actual.
- Nada de escuchas nuevas: ni `matchMedia`, ni `change`, ni un segundo `storage`.

### 3.6 Decisiones técnicas y alternativas descartadas

| Decisión | Alternativa descartada |
| --- | --- |
| Tokens en `:root` y un bloque `:root[data-theme="oscuro"]` que los sobrescribe. | Dos hojas de estilo conmutadas o `link.disabled`: más peticiones, posible destello y más código. |
| `data-theme` en `<html>`, escrito antes del CSS. | Clase en `<body>`: llega más tarde y obliga a esperar al `DOMContentLoaded`, con destello. |
| Arranque en línea dentro de `<head>`, expuesto como `window.ThemeRuntime`. | Un archivo `theme-boot.js` aparte: no está en la lista de archivos aprobada por la spec. |
| `applyTheme` único que pone `data-theme`, activa `theme-switching` y avisa a suscriptores. | Que el clic, el sistema y el `storage` pinten cada uno por su lado: tres caminos que se desincronizan. |
| `toggleTheme` en el módulo puro. | `theme === "oscuro" ? "claro" : "oscuro"` repetido en el arranque, en `app.js` y en las pruebas. |
| `shouldWriteTheme` decide si se escribe (CA-4.6). | Escribir siempre y confiar en que el navegador ignore el valor repetido: dispara `storage` y no es verificable. |
| Dos SVG en el HTML, con `hidden` conmutado. | Un solo SVG cuyo `path` cambia por JS: más DOM dinámico y sin contenido útil si el script falla. |
| Contorno del tooltip con `outline` (no ocupa espacio). | `border`: cambia el tamaño medido y obliga a recolocar el tooltip. |
| Celdas futuras con `--heat-future` y `--future-opacity`. | Mantener `opacity: 0.55` en oscuro: el futuro se confunde con la tarjeta. |
| Relleno de la barra con token propio `--goal-fill`. | Reutilizar `--heat-3`: en claro queda en 2,7:1 sobre la pista. |
| Botón de tema activado reutilizando `--ember-soft`, `--ember-ink` e `--ink`. | Tokens nuevos para el botón: duplican valores que ya cambian con el tema. |

## 4. Diseño de datos y compatibilidad

| Clave | Forma | Uso | Cambios |
| --- | --- | --- | --- |
| `estudioDiarioSesiones` | `[{ id, fecha, tema, minutos }]` | Sesiones (existente) | Ninguno; solo lectura. |
| `estudioDiarioObjetivoSemanal` | `{ "minutos": 600 }` | Objetivo (existente) | Ninguno; solo lectura. |
| `estudioDiarioTema` | `{ "tema": "claro" }` o `{ "tema": "oscuro" }` | Tema elegido (nueva) | Se escribe solo al pulsar el botón; nunca al cargar, resolver o repintar. |

- La clave es opcional: si falta o es ilegible, se sigue al navegador (CA-3.1, CA-4.4).
- Un valor corrupto **no se borra ni se reescribe** al leerlo; solo se sustituye cuando la
  persona guarde una elección nueva (CA-4.4).
- `JSON.parse` y `setItem` siempre dentro de `try/catch`: ni un JSON roto ni un almacenamiento
  bloqueado pueden romper la página (CA-3.6, CA-9.3).
- Elección de sesión: si `setItem` falla, el tema cambia y deja de seguir al sistema hasta
  recargar; no hay aviso visual (CA-4.7, CA-5.2).
- Escrituras nunca en las otras dos claves ni derivadas de ellas (CA-4.5, CA-9.6).

## 5. Lógica pura: algoritmos

```text
FUNCIÓN parseStoredTheme(texto):
  SI texto no es cadena: DEVOLVER nulo
  INTENTAR valor = JSON.parse(texto)           // cualquier error → nulo
  SI valor es nulo O no es objeto O es lista: DEVOLVER nulo
  SI valor.tema = "claro" O valor.tema = "oscuro": DEVOLVER valor.tema
  DEVOLVER nulo

FUNCIÓN resolveTheme(textoGuardado, sistemaPrefiereOscuro):
  guardado = parseStoredTheme(textoGuardado)
  SI guardado NO es nulo: DEVOLVER guardado
  SI sistemaPrefiereOscuro = verdadero: DEVOLVER "oscuro"
  DEVOLVER "claro"

FUNCIÓN shouldWriteTheme(textoGuardado, pedido):
  guardado = parseStoredTheme(textoGuardado)
  DEVOLVER guardado = nulo O guardado ≠ pedido

FUNCIÓN toggleTheme(tema):
  SI tema = "oscuro": DEVOLVER "claro"
  DEVOLVER "oscuro"                             // entrada inválida → claro
```

- `serializeTheme`, `getToggleLabel` y `getIconName` son constantes derivadas del tema; no
  tienen estado.
- Ninguna función ordena, filtra ni modifica sus argumentos.

## 6. Interfaz

### 6.1 HTML: cabecera y botón (RF-1, RF-8)

```text
<header class="app-header">
  <h1>Diario de Estudio</h1>
  <button type="button" class="theme-toggle" id="theme-toggle">
    <svg data-theme-icon="sol" aria-hidden="true" focusable="false" hidden>…</svg>
    <svg data-theme-icon="luna" aria-hidden="true" focusable="false">…</svg>
    <span class="theme-toggle-label">Modo oscuro</span>
  </button>
  <script>…</script>
</header>
```

- El nombre accesible es la etiqueta visible; no se añade `aria-label` distinto ni región viva
  (CA-1.3, CA-1.4, CA-7.3).
- Sin `aria-pressed` ni ningún otro estado pulsado: el botón es una acción (CA-1.4).
- El HTML inicial trae la etiqueta «Modo oscuro» y la luna visibles, que es lo que corresponde
  al tema claro; el script que sigue al botón lo corrige al tema realmente aplicado.
- Con el tema oscuro el botón se ve destacado; el estilo se apoya en tokens (6.3).
- La línea inferior y el `padding-bottom: 0.85rem` pasan del `h1` al `.app-header`; el `h1`
  conserva tipografía, tamaño y color (CA-8.5).
- El `<header>` va dentro de `<main>`: no es un landmark de navegación (CA-8.5).
- El botón es el primer elemento enfocable del documento (CA-1.7).

### 6.2 Comportamiento del botón (RF-1, RF-7)

- Clic, Enter y Espacio alternan el tema (CA-2.1, CA-7.1).
- La etiqueta y el icono nombran la acción: «Modo oscuro» con luna en claro y «Modo claro» con
  sol en oscuro (CA-1.3).
- Con el tema oscuro, el botón se ve destacado con fondo y borde propios, para que el tema en
  uso no dependa solo del icono ni del texto (CA-1.3).
- Área táctil ≥ 44 × 44 px: `min-height: 44px`, relleno lateral suficiente y `min-width` de 44 px
  (CA-1.5).
- El foco visible usa `--focus-ring` con 3 px y `outline-offset: 3px`, como el resto de botones
  (CA-7.2).

### 6.3 Tokens CSS (RF-2, RF-6; RNF-2)

`:root` mantiene el tema claro con los cinco ajustes de contraste permitidos; el bloque
`:root[data-theme="oscuro"]` sobrescribe valores. Ningún componente con color escrito a mano: todo
sale de tokens, para que el criterio 12 de la spec sea cierto.

| Token | Claro | Oscuro | Uso | Nota de contraste |
| --- | --- | --- | --- | --- |
| `color-scheme` | `light` | `dark` | controles nativos | CA-6.5 |
| `--paper` | `#e9eef6` | `#14181f` | fondo de página | — |
| `--paper-line` | `rgba(16,31,56,0.05)` | `rgba(233,238,246,0.05)` | cuadrícula | 1,13:1 en oscuro |
| `--sheet` | `#ffffff` | `#1c222c` | tarjetas | 1,11:1 sobre papel |
| `--field` | `#f7f9fc` | `#202832` | fondo de campos | 1,07:1 sobre tarjeta |
| `--ink` | `#101f38` | `#eef2f8` | texto principal | 14,2:1 sobre tarjeta |
| `--ink-soft` | `#56657e` | `#a7b4c6` | texto secundario | 7,6:1 sobre tarjeta |
| `--line` | `#c9d5e4` | `#3a4553` | bordes de tarjeta y separadores | 1,64:1 (decorativo) |
| `--line-control` | `#7b8aa0` (nuevo) | `#63718a` | borde de campos y botón secundario | 3,3:1 y 3,0:1 |
| `--ember` | `#f04e23` | `#ff6b3d` | acento, bordes de aviso, hover del mapa | 6,3:1 sobre papel |
| `--ember-ink` | `#b8360f` | `#ff8f63` | textos en naranja y errores | 7,1:1 sobre tarjeta |
| `--ember-soft` | `#fdeee8` | `#3a2018` | error, insignia y botón activado | — |
| `--on-ink` | `#f6f9fd` | `#eef2f8` | texto sobre el bloque oscuro | 17:1 sobre `#0b1016` |
| `--on-ink-soft` | `#b9c6d8` | `#a7b4c6` | etiquetas del bloque oscuro | 9,1:1 sobre `#0b1016` |
| `--ink-surface` | `#101f38` | `#0b1016` | fondo de la tarjeta de racha | 1,07:1 en oscuro + sombra |
| `--primary-bg` | `#b8360f` | `#ff6b3d` | fondo del botón primario | — |
| `--primary-text` | `#ffffff` | `#14181f` | texto del primario | 5,9:1 y 6,3:1 |
| `--primary-border` | `#101f38` | `#14181f` | borde del primario | — |
| `--primary-hover` | `#9c2d0b` | `#ff8358` | hover del primario | 7,3:1 en oscuro |
| `--primary-shadow` | `#101f38` | `#0b1016` | sombra dura de 3 px del primario | decorativa |
| `--secondary-hover-bg` | `#f5f8fc` | `#242c38` | hover del secundario | 12,5:1 de texto en oscuro |
| `--secondary-hover-border` | `#56657e` | `#a7b4c6` | borde en hover del secundario | 6,7:1 en oscuro |
| `--row-hover` | `#f5f8fc` | `#232b36` | hover de fila de sesión | 1,12:1 (pista sutil) |
| `--empty-bg` | `#f9fbfd` | `#171d26` | estado vacío | borde discontinuo 3,4:1 |
| `--focus-ring` | `#b8360f` (ajuste) | `#ff6b3d` | anillo de foco global y de campos | 5,9:1 y 5,3:1 |
| `--selection-bg` | `#b8360f` (ajuste) | `#ff6b3d` | selección de texto | 5,9:1 y 6,3:1 |
| `--selection-text` | `#ffffff` | `#14181f` | texto seleccionado | — |
| `--placeholder` | `#64748b` | `#8e9cb0` | marcador de posición | 4,5:1 y 5,3:1 sobre el campo |
| `--shadow-hard` | `4px 4px 0 rgba(16,31,56,0.08)` | `4px 4px 0 rgba(0,0,0,0.45)` | sombra de tarjetas | decorativa |
| `--shadow-chip` | `2px 2px 0 rgba(16,31,56,0.06)` | `2px 2px 0 rgba(0,0,0,0.5)` | sombra de la fila del récord | decorativa |
| `--shadow-tooltip` | `0 4px 14px rgba(16,31,56,0.25)` | `0 6px 18px rgba(0,0,0,0.55)` | sombra del tooltip | decorativa |
| `--shadow-press` | `1px 1px 0 #101f38` | `1px 1px 0 #0b1016` | sombra del primario al pulsarlo | decorativa |
| `--heat-0` | `#dce5f0` | `#2c3441` | nivel 0 / pista de la barra | 1,27:1 sobre tarjeta |
| `--heat-1` | `#ffc9ac` | `#6b3f2c` | nivel 1 | paso 1,42 |
| `--heat-2` | `#ff9f72` | `#a85732` | nivel 2 | paso 1,72 |
| `--heat-3` | `#e85f2a` | `#ea6b31` | nivel 3 | paso 1,63 |
| `--heat-4` | `#b8330b` | `#ff9f63` | nivel 4 | paso 1,56 |
| `--heat-future` | `#dce5f0` | `#232a35` | celdas futuras | más apagadas que el nivel 0 |
| `--future-opacity` | `0.55` | `1` | atenuación de las celdas futuras | conserva el aspecto claro |
| `--goal-fill` | `#b8360f` (ajuste) | `#ea6b31` | relleno de la barra del objetivo | 4,6:1 y 4,0:1 sobre la pista |
| `--tooltip-bg` | `#101f38` | `#e9eef6` | fondo del tooltip | — |
| `--tooltip-text` | `#f6f9fd` | `#101f38` | texto del tooltip | 14,1:1 en oscuro |
| `--tooltip-outline` | `transparent` | `#101f38` | contorno de 2 px | 8,2:1 y 5,2:1 sobre niveles 3 y 4 |

Reglas de aplicación (nada de colores sueltos):

| Componente | Tokens | Notas |
| --- | --- | --- |
| Página y cuadrícula | `--paper`, `--paper-line`, `--ink` | Igual que hoy; cambian los valores con el tema. |
| `h1`, `h2`, textos | `--ink` | Sin cambios de tamaño ni tipografía. |
| Tarjetas, formularios, mapa | `--sheet`, `--line`, `--shadow-hard` | Bordes de 1 px visibles en ambos temas. |
| Tarjeta de racha | `--ink-surface`, `--on-ink`, `--on-ink-soft`, `--ember` | La sombra de 6 px sigue en `--ember`. |
| Fila del récord | `--sheet`, `--ink-soft`, `--line`, `--shadow-chip` | — |
| Campos | `--field`, `--line-control`, `--ink`, `--placeholder` | Anillo de foco con `--focus-ring`. |
| Errores e insignias | `--ember-soft`, `--ember-ink` | — |
| Botón primario | `--primary-bg`, `--primary-text`, `--primary-border`, `--primary-shadow`, `--primary-hover` | `:active` usa `--shadow-press`. |
| Botón secundario y de tema inactivo | `--sheet`, `--ink`, `--line-control`, `--secondary-hover-bg`, `--secondary-hover-border` | — |
| Botón de tema destacado | `--ember-soft`, `--ember-ink`, `--ink` | `:root[data-theme="oscuro"] .theme-toggle`. |
| Barra del objetivo | `--heat-0` (pista), `--line`, `--goal-fill` | — |
| Mapa de calor | `--heat-0` … `--heat-4`, `--heat-future`, `--future-opacity`, `--ember` (hover y foco) | Niveles con luminancia creciente. |
| Tooltip | `--tooltip-bg`, `--tooltip-text`, `--tooltip-outline`, `--shadow-tooltip` | Contorno por `outline`, sin mover la posición. |
| Lista y estado vacío | `--line`, `--row-hover`, `--empty-bg`, `--ink-soft` | — |
| Selección y foco | `--selection-bg`, `--selection-text`, `--focus-ring` | Ajuste de contraste en claro. |

Ajustes del tema claro (los cinco de CA-6.6): halo de foco `1,9:1 → 5,9:1`, borde de control
`#c9d5e4 → #7b8aa0` solo en campos y secundario (sin tocar `--line`), selección `3,6:1 → 5,9:1`,
relleno de barra `2,7:1 → 4,6:1` y anillo de foco de campos `1,2:1 → 5,6:1`.

### 6.4 Cabecera y responsive (RF-8; RNF-1)

- `.app-header`: `display: flex`, `flex-wrap: wrap`, `align-items: center`,
  `justify-content: space-between`, `gap: 0.75rem 1rem`, `padding-bottom: 0.85rem` y
  `border-bottom: 2px solid var(--ink)`.
- `.app-header h1`: sin `padding-bottom` ni borde inferior; conserva `font-size`, `line-height`,
  `letter-spacing` y color.
- Botón con `margin-left: auto` para quedar siempre a la derecha, también cuando cae a su propia
  fila a 320 px (CA-8.1).
- Etiqueta con `white-space: normal` y `text-align: center`: puede ocupar dos líneas sin reducir
  la tipografía (CA-8.1, CA-8.4).
- A 375 px y más, título y botón comparten fila con separación suficiente (CA-8.2); la línea
  inferior cierra la cabecera y no desalinea las tarjetas (CA-8.3).

### 6.5 Transiciones y movimiento reducido (CA-2.6, CA-7.5)

- `.theme-switching, .theme-switching *, .theme-switching *::before, .theme-switching *::after
  { transition: none !important; animation: none !important; }`.
- La clase la pone y la retira `ThemeRuntime.applyTheme` (antes y en el `requestAnimationFrame`
  siguiente), así que ningún cambio de tema anima colores.
- Se conserva el bloque `@media (prefers-reduced-motion: reduce)` actual y se añade
  `scroll-behavior: auto` si hiciera falta; el cambio de tema ya no anima nada.
- No se añaden transiciones nuevas.

## 7. Sincronización (RF-5)

| Origen del cambio | Quién lo detecta | Qué ocurre |
| --- | --- | --- |
| Clic en el botón | `app.js` | Alterna, guarda si procede, aplica y actualiza el botón. |
| Cambio del sistema | La única escucha `change` del arranque | Si no hay elección explícita, resuelve y aplica; avisa a los suscriptores. |
| Otra pestaña escribe el tema | `handleStorageChange` de `app.js` | Aplica el valor válido o vuelve al sistema si la clave se borró. |
| `localStorage.clear()` | `handleStorageChange` con `key === null` | Vuelve al sistema y deja de haber elección. |
| Recarga | El arranque | Resuelve antes de pintar, sin destello. |

- El tema nunca provoca `render()`: no hay datos que recalcular (CA-2.3).
- El `storage` de sesiones y del objetivo sigue igual; el del tema solo toca el botón.

## 8. Estrategia de pruebas

### 8.1 Pruebas automáticas (`node --test`, `tests/theme.test.js`)

- `node:test`, `node:assert/strict`, `require("../theme-logic.js")`; sin fecha del sistema en
  ningún caso (la lógica no tiene reloj).
- Nombres de los tests en inglés; textos esperados en español.
- Puerta: la lógica debe estar en verde antes de tocar la interfaz.

| Bloque | Casos |
| --- | --- |
| A. Lectura del tema guardado | `{"tema":"oscuro"}` → `oscuro`; `{"tema":"claro"}` → `claro`; `{"tema":"oscuro"} ` con espacios → válido; comillas simples, `"oscuro"` suelto, `null`, `[]`, `{"modo":"oscuro"}`, `{"tema":"morado"}`, `{"tema":1}`, `{"tema":"OSCURO"}`, JSON roto, cadena vacía, número suelto y `null` → `null`; nunca lanza; no modifica la entrada. |
| B. Resolución | Sin elección + sistema oscuro → oscuro; sin elección + sistema claro → claro; sin elección + preferencia desconocida (`undefined`/`null`) → claro; elección oscura + sistema claro → oscuro; elección clara + sistema oscuro → claro; elección corrupta + sistema oscuro → oscuro. |
| C. Alternancia | claro → oscuro → claro; dos alternancias vuelven al inicio; nunca devuelve otro valor; entrada inválida → claro. |
| D. Decisión de escritura | Guardado igual al pedido → `false`; distinto → `true`; clave ausente → `true`; valor corrupto → `true`; mismo tema tras corrupción → `true`. |
| E. Serialización | `serializeTheme` produce exactamente `{"tema":"claro"}` / `{"tema":"oscuro"}`; ida y vuelta con `parseStoredTheme`; nunca produce otro texto. |
| F. Etiqueta e icono de la acción | `getToggleLabel("claro")` → «Modo oscuro» y `getToggleLabel("oscuro")` → «Modo claro»; `getIconName("claro")` → `luna` y `getIconName("oscuro")` → `sol`; el módulo no expone ninguna función de estado pulsado. |
| G. Pureza y determinismo | El código fuente no contiene `document`, `localStorage`, `matchMedia`, `Date.now` ni `new Date()` sin argumentos; expone todas las funciones esperadas; misma entrada → mismo resultado; argumentos congelados intactos. |

### 8.2 Verificación manual en Chrome

- **Primer pintado**: emular `prefers-color-scheme: dark` y `light` sin clave; recargar con CPU
  limitada 6× y grabar el primer fotograma: nunca aparece el tema contrario. En Performance, el
  script en línea dura menos de 16 ms y termina antes del primer pintado.
- **Componentes**: fondo y cuadrícula, título, tarjetas, racha, récord, esta semana, objetivo
  (sin objetivo, en progreso, cumplido, superado), formulario de sesiones, formulario del
  objetivo, errores, barra, mapa (5 niveles + futuros), tooltip, insignias, lista, estado vacío y
  selección, en ambos temas.
- **Contraste**: medir cada par de la tabla del plan sobre la superficie real (marcador y borde
  sobre el campo); texto ≥ 4,5:1, foco/barra/bordes de control ≥ 3:1.
- **Botón**: etiqueta e icono de la acción en cada tema («Modo oscuro» + luna en claro, «Modo
  claro» + sol en oscuro), sin `aria-pressed`, nombre accesible igual a la etiqueta visible,
  estilo destacado en oscuro, área ≥ 44 × 44, Enter y Espacio, foco visible, sin región viva
  adicional.
- **Responsive**: 320, 375 y 1280 px en ambos temas, sin scroll horizontal; a 320 px, header
  apilado, etiqueta en dos líneas, botón alineado a la derecha, tipografía sin reducir; zoom 200 %
  y 400 %; alto contraste; movimiento reducido.
- **Estados**: hover y activo del botón, del primario y del secundario; hover de fila; foco del
  campo (anillo de 3 px). No se exige hover en campos ni activo en filas.
- **Sin destello ni mezcla**: con `transition` activa en un campo y el ratón sobre un botón,
  grabar a 60 fps: el cambio se resuelve en un fotograma y `theme-switching` desaparece al
  siguiente.
- **Persistencia**: recargar, cerrar y abrir; valor corrupto (se conserva y se sigue al sistema);
  clave ausente; borrado total desde otra pestaña.
- **Una sola consulta**: contar `matchMedia` y `addEventListener` inyectando el contador con
  `Page.addScriptToEvaluateOnNewDocument` antes de cargar; alternar 20 veces y volver a la
  pestaña 5 veces sin que aumente; `app.js` no crea ninguna.
- **Dos pestañas**: cambiar en una actualiza la otra; borrar el almacenamiento devuelve las dos
  al modo automático.
- **Almacenamiento bloqueado antes de cargar** (`Page.addScriptToEvaluateOnNewDocument`): abre con
  el tema del sistema; con solo `setItem` fallando: alterna, no sigue al sistema en la sesión y,
  al recargar, vuelve a seguirlo, sin mensajes nuevos en consola.
- **No regresión**: sesiones y objetivo idénticos byte a byte antes y después de alternar diez
  veces; racha, récord, semana, mes, mapa y lista con los mismos valores; 1000 sesiones y cambio
  por debajo de 100 ms.
- **Tema claro**: comparar con la captura de referencia; solo cambian los cinco ajustes, el botón
  nuevo y la separación de la cabecera (0,85 rem).

## 9. Cobertura de requisitos

| RF | Lógica pura | Interfaz / arranque | Pruebas |
| --- | --- | --- | --- |
| RF-1 Botón en la cabecera | `getToggleLabel`, `getIconName` | `index.html` (header, botón, SVG), `styles.css` (aspecto), `app.js` (evento) | Manual: etiqueta, icono, 44 px, teclado |
| RF-2 Alternancia | `toggleTheme` | `ThemeRuntime.applyTheme`, tokens en ambos temas | Manual: todos los componentes |
| RF-3 Tema inicial | `resolveTheme`, `parseStoredTheme` | Arranque en `<head>`, `data-theme` antes del CSS | Bloques A, B y G |
| RF-4 Elección y memoria | `shouldWriteTheme`, `serializeTheme`, `parseStoredTheme` | `app.js`: `setItem` solo al pulsar; `storage` | Bloques A, D y E |
| RF-5 Modo automático y sincronización | `resolveTheme` | Una consulta y una escucha en el arranque; suscripción; `storage` | Bloque B + manual de dos pestañas y sistema |
| RF-6 Paleta | — | Tabla de tokens y reglas por componente | Manual de contraste y componentes |
| RF-7 Accesibilidad | `getToggleLabel`, `getIconName` | Etiqueta visible como nombre accesible, SVG decorativos, foco, movimiento reducido, alto contraste; sin `aria-pressed` | Bloque F + manual de teclado y contraste |
| RF-8 Responsive y cabecera | — | `.app-header`, botón, media queries | Manual 320/375/1280, zoom |
| RF-9 Datos y compatibilidad | Pureza del módulo | `file://`, scripts clásicos, sin tocar claves ajenas | Bloque G + manual de no regresión |
| RNF-1, RNF-2 | — | Tokens y responsive | Manual |
| RNF-3, RNF-10 | Sin DOM, sin almacenamiento, sin `matchMedia`, sin reloj | — | Bloques B y G |
| RNF-4 | `resolveTheme` en O(1) | Arranque mínimo y sin peticiones | Manual con Performance |
| RNF-7 | — | — | `node --test` |
| RNF-12 | — | `AGENTS.md` y `MEMORY.md` | Revisión de documentos |
| RNF-13 | Una sola implementación | Arranque y `app.js` llaman al módulo | Bloque G y revisión |

## 10. Cumplimiento de la constitución

| Principio | Cómo se cumple |
| --- | --- |
| 1. Simplicidad | HTML, CSS y JS puros; cuatro scripts clásicos y un arranque en línea; sin dependencias, build ni servidor; funciona con doble clic. |
| 2. La spec manda | Solo se implementan los RF y CA de la spec 003; nada de terceros estados, temas por hora ni cambios de tipografía. |
| 3. Lógica separada | `theme-logic.js` no toca DOM, almacenamiento, consulta del sistema ni reloj; recibe el valor guardado y la preferencia como datos. |
| 4. Tests como puerta | `node --test` con `tests/theme.test.js` antes de conectar la interfaz; un rojo bloquea. |
| 5. Datos sagrados | Las sesiones y el objetivo se leen igual y no se escriben; el tema vive en su clave; un valor corrupto nunca se borra solo. |
| 6. Idioma | Código en inglés; textos, etiqueta y documentación en español. |

## 11. Riesgos y mitigaciones

- **Destello del tema contrario**: el orden `theme-logic.js → arranque → CSS` y el `data-theme`
  escrito antes de la primera pintura lo evitan; se verifica con CPU 6× y grabación de pantalla.
- **Doble `matchMedia` o escuchas acumuladas**: la consulta y su única escucha viven en el
  arranque; `app.js` solo se suscribe a un array de callbacks. Se cuenta con
  `Page.addScriptToEvaluateOnNewDocument` antes de cargar (CA-5.6).
- **Especificidad CSS**: `:root[data-theme="oscuro"]` gana a `:root`; aun así, ningún componente
  debe usar colores literales, o el tema oscuro dejaría restos claros. Se comprueba con una
  búsqueda de `#` y `rgba(` fuera del bloque de tokens.
- **Contraste insuficiente**: los pares del plan están medidos; la verificación repite la
  medición sobre la superficie real (campo para marcador y borde) y con `::selection` y barra.
- **Geometría de la cabecera**: mover relleno y línea al `<header>` puede cambiar la separación o
  el ancho disponible; se compara con la captura de referencia y se comprueba a 320, 375 y 1280.
- **Transiciones existentes**: campos y botones tienen transiciones; sin `theme-switching` se
  vería una mezcla de colores. La clase las anula y se retira en el fotograma siguiente.
- **Tema oscuro en mapa y tooltip**: las celdas futuras necesitan token propio (la opacidad 0.55
  las confunde con la tarjeta) y el tooltip necesita contorno (1,73:1 sobre el nivel 4).
- **`file://`**: nada de módulos ES, `fetch` ni rutas absolutas; scripts clásicos relativos y
  `localStorage` con `try/catch`, que en algunos contextos de archivo puede fallar.
- **Escrituras innecesarias o destructivas**: `shouldWriteTheme` evita reescribir; un valor
  corrupto se conserva; las otras dos claves no se tocan.
- **Botón que pierde el estado tras un cambio externo**: todos los caminos pasan por
  `applyTheme`, que avisa a los suscriptores; el botón se repinta siempre desde el tema aplicado.

## 12. Orden de implementación

1. `theme-logic.js` y `tests/theme.test.js` hasta verde (T1).
2. `index.html`: cabecera, botón, arranque y orden de scripts (T2).
3. `styles.css`: tokens y componentes (T3); botón, cabecera, responsive y transiciones (T4).
4. `app.js`: clic, persistencia, botón y `storage` (T5).
5. Documentación (T6) y verificación manual completa (T7).
6. Enmienda 003.1: etiqueta e icono de la acción, sin `aria-pressed` (Fase F de `tasks.md`).

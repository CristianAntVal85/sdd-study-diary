# Plan 001 — Mapa de calor de estudio

## 1. Resumen y alcance

Se añade un mapa de calor de 12 semanas entre las estadísticas actuales y el formulario.
La lógica de fechas, agrupación y niveles vive en un archivo puro; la interfaz se limita a
pintar y a reaccionar a eventos. No se modifica el formato de los datos, ni el formulario,
ni las estadísticas existentes, ni la racha.

El plan cubre los RF-1 a RF-8 de `specs/001-heat-map/spec.md` y respeta
`docs/constitution.md`. Cada sección indica qué RF cubre.

## 2. Archivos que se crean o modifican

| Archivo | Acción | Responsabilidad | RF |
| --- | --- | --- | --- |
| `heat-map-logic.js` | Crear | Funciones puras de fechas, periodo, agrupación, niveles, etiquetas, resumen y foco. Sin DOM, sin almacenamiento y sin leer el reloj. | RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-8 |
| `tests/heat-map.test.js` | Crear | Pruebas de la lógica con `node --test` y `node:assert`. | RF-1 a RF-6, RF-8; RNF-4, RNF-8 |
| `index.html` | Modificar | Sección del mapa, resumen accesible, etiquetas estáticas de días, contenedor de meses, tooltip y orden de scripts. | RF-1, RF-4, RF-5, RF-6 |
| `styles.css` | Modificar | Cuadrícula, cinco niveles de color, tooltip, foco, etiquetas y adaptación a móvil. | RF-1, RF-3, RF-4, RF-5, RF-6; RNF-1, RNF-2 |
| `app.js` | Modificar | Render del mapa, tooltip, foco itinerante, teclado, temporizador de medianoche, visibilidad y evento `storage`. | RF-5, RF-6, RF-7, RF-8; RNF-2, RNF-3 |
| `MEMORY.md` | Modificar al terminar | Registrar decisiones y verificación. | — |

No se crea `package.json`. No se añaden dependencias ni pasos de compilación. El orden de
carga será `heat-map-logic.js` y después `app.js`, ambos como scripts clásicos. No se usan
módulos ES.

En el navegador, `heat-map-logic.js` deja disponible `HeatMapLogic` como global clásico.
En Node, un bloque CommonJS protegido con `typeof module` permite `require` para los tests;
en el navegador ese bloque no se ejecuta.

## 3. Flujo de datos

1. `app.js` obtiene la fecha local de hoy con la función existente `getTodayDateString()`.
2. `app.js` pasa `sessions` y `today` a `HeatMapLogic.buildData(...)`.
3. La lógica devuelve un objeto con 84 días ya calculados.
4. `app.js` pinta etiquetas, celdas, resumen y tooltip.
5. Al registrar una sesión, al cambiar de pestaña, al volver a ella o al recibir un cambio
   de otra pestaña, `app.js` vuelve a leer los datos y repite los pasos 1 a 4.

La lógica nunca lee `localStorage` ni el reloj: recibe las sesiones y `today` como
parámetros. Esto permite probarla en Node sin navegador y cumple el principio 3 de la
constitución.

## 4. Lógica pura (RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-8)

### 4.1 Modelo de datos

El mapa se construye en dos pasos: un periodo de 84 días y una lista de sesiones.

- **Periodo**: `{ start, end, today, todayIndex, weeks: 12, days, studiedDays }`.
  - `start`: lunes de la semana situada 11 semanas antes de la semana de hoy.
  - `end`: domingo de la semana de hoy.
  - `today`: fecha de referencia recibida.
  - `todayIndex`: posición de hoy dentro de `days` (0 a 83).
  - `days`: 84 elementos, en orden cronológico.
- **Día**: `{ date, weekIndex, dayIndex, minutes, level, isFuture }`.
  - `weekIndex`: 0 a 11; `dayIndex`: 0 (lunes) a 6 (domingo).
  - `minutes`: total redondeado; 0 si no hay sesiones válidas.
  - `level`: 0 a 4; los días futuros siempre son 0.
  - `isFuture`: `true` si `date > today`.
- **Sesión**: se leen solo `id`, `fecha` y `minutos`; el resto se ignora. No se modifica
  ninguna sesión.

### 4.2 Fechas y formato

Todas las fechas son cadenas `AAAA-MM-DD` en hora local. No se usa `toISOString()`, ni
`new Date("AAAA-MM-DD")`, ni aritmética de milisegundos. La aritmética se hace con
`new Date(año, mes - 1, día, 12)` para que los cambios de hora no desplacen el día.

| Función | Entrada | Salida | Responsabilidad | RF |
| --- | --- | --- | --- | --- |
| `parseIsoDate` | `"AAAA-MM-DD"` | `{ year, month, day }` o `null` | Valida formato y fecha real (rechaza 30 feb, 13 meses, etc.). | RF-1, RF-8 |
| `toIsoDate` | año, mes, día | `"AAAA-MM-DD"` | Compone la cadena con ceros a la izquierda. | RF-1 |
| `addDays` | fecha ISO, entero | fecha ISO | Suma o resta días usando mediodía local; soporta meses, años y bisiestos. | RF-1, RF-2 |
| `getWeekdayIndex` | fecha ISO | 0 a 6 | Lunes = 0, domingo = 6. | RF-1 |
| `getMonday` | fecha ISO | fecha ISO | Lunes de la semana que contiene la fecha. | RF-1 |
| `formatShortDate` | fecha ISO | `"19 oct"` | Fecha abreviada para el tooltip, sin año. | RF-5 |
| `formatLongDate` | fecha ISO | `"lunes 19 de octubre"` | Fecha para las etiquetas accesibles de cada celda, sin año. | RF-6 |
| `formatMonthDay` | fecha ISO | `"3 de agosto"` | Fecha sin día de la semana para el resumen accesible. | RF-6 |

Los nombres de meses y días son constantes en español dentro de la lógica; no se usa
`toLocaleDateString` para evitar diferencias entre navegadores y Node.

### 4.3 Agrupación, niveles y textos

| Función | Entrada | Salida | Responsabilidad | RF |
| --- | --- | --- | --- | --- |
| `isValidMinutes` | valor | booleano | Número finito y mayor que cero. | RF-2, RF-8 |
| `isValidSession` | sesión | booleano | Objeto con `fecha` válida y `minutos` válidos. No exige `tema`. | RF-8 |
| `aggregateMinutes` | sesiones, `today` | objeto fecha → minutos | Suma por día, ignora futuras e inválidas, deduplica por `id` y redondea cada total. | RF-2, RF-8 |
| `getLevel` | minutos | 0 a 4 | Aplica los umbrales: 0 / 1–14 / 15–29 / 30–59 / 60+. | RF-3 |
| `buildData` | sesiones, `today` | objeto del mapa o `null` | Orquesta periodo, agrupación, niveles y `studiedDays`. | RF-1, RF-2, RF-3 |
| `getMonthLabels` | días | lista `{ weekIndex, label }` | Etiqueta la primera columna del periodo y cada cambio de mes. | RF-4 |
| `formatTooltip` | día | texto o `null` | `"19 oct · 45 min"`; `null` si es futuro o no tiene minutos. Usa `"1 min"`. | RF-5 |
| `getCellLabel` | día | texto | `"lunes 19 de octubre, 45 minutos de estudio"` o `"..., sin sesiones"`. | RF-6 |
| `getSummary` | datos | texto | `"Del 3 de agosto al 19 de octubre: 23 días con estudio"`, con singular y plural. | RF-6 |
| `moveFocus` | índice, tecla, último índice | índice | Flechas: ±1 día, ±7 semanas; no sale del rango enfocable. | RF-6 |

`buildData` devuelve `null` solo si `today` no es una fecha válida. Si `sessions` no es un
array, se trata como vacío y se devuelven los 84 días en nivel 0. Si una sesión es inválida,
se ignora pero permanece intacta en el almacenamiento.

### 4.4 Algoritmo del mapa (pseudocódigo)

```text
FUNCIÓN buildData(sesiones, hoy):
  SI parseIsoDate(hoy) es nulo: DEVOLVER nulo

  lunesActual = getMonday(hoy)
  inicio = addDays(lunesActual, -77)
  fin = addDays(lunesActual, 6)
  minutosPorFecha = aggregateMinutes(sesiones, hoy)

  días = []
  PARA i DESDE 0 HASTA 83:
    fecha = addDays(inicio, i)
    minutos = minutosPorFecha[fecha] O 0
    esFuturo = fecha > hoy
    nivel = SI esFuturo ENTONCES 0 SINO getLevel(minutos)
    días.AÑADIR({
      date: fecha,
      weekIndex: divisiónEntera(i, 7),
      dayIndex: i módulo 7,
      minutes: minutos,
      level: nivel,
      isFuture: esFuturo
    })

  índiceHoy = posición de hoy en días
  díasEstudiados = contar días con NO esFuturo Y minutos > 0

  DEVOLVER {
    start: inicio, end: fin, today: hoy, todayIndex: índiceHoy,
    weeks: 12, days: días, studiedDays: díasEstudiados
  }
```

```text
FUNCIÓN aggregateMinutes(sesiones, hoy):
  SI sesiones no es array: DEVOLVER {}
  idsVistos = conjunto vacío
  totales = objeto vacío

  PARA cada sesión EN sesiones:
    SI sesión no es objeto: CONTINUAR
    SI sesión.id no es nulo:
      SI idsVistos contiene sesión.id: CONTINUAR
      idsVistos.AÑADIR(sesión.id)
    SI isValidSession(sesión) es falso: CONTINUAR
    SI sesión.fecha > hoy: CONTINUAR
    totales[sesión.fecha] = (totales[sesión.fecha] O 0) + sesión.minutos

  PARA cada fecha EN totales:
    totales[fecha] = redondearAlEntero(totales[fecha])

  DEVOLVER totales
```

```text
FUNCIÓN getMonthLabels(días):
  etiquetas = []
  mesAnterior = nulo
  PARA cada día EN días:
    mes = parseIsoDate(día.date).month
    SI mes != mesAnterior:
      etiquetas.AÑADIR({ weekIndex: día.weekIndex, label: MES_CORTO[mes - 1] })
      mesAnterior = mes
  DEVOLVER etiquetas
```

```text
FUNCIÓN moveFocus(índice, tecla, último):
  candidato = índice
  SI tecla = Izquierda: candidato = índice - 7
  SI tecla = Derecha:   candidato = índice + 7
  SI tecla = Arriba:    candidato = índice - 1
  SI tecla = Abajo:     candidato = índice + 1
  SI candidato < 0 O candidato > último: DEVOLVER índice
  DEVOLVER candidato
```

Complejidad: O(n) para las sesiones y O(84) para el mapa; con 1000 sesiones queda muy por
debajo del límite de RNF-3. No se ordenan las sesiones ni se hacen búsquedas por día.

## 5. Interfaz (RF-1, RF-3, RF-4, RF-5, RF-6, RF-7)

### 5.1 Estructura y colocación

La sección se inserta en `index.html` justo después de la tarjeta «Esta semana» y antes
del formulario. Mantiene el mismo lenguaje visual que las demás tarjetas: hoja blanca,
borde, sombra dura y título serif.

```text
heatmap-section
├─ h2 «Mapa de calor»
├─ p.visually-hidden  resumen del periodo y días estudiados
├─ p.visually-hidden  ayuda «Usa las flechas para recorrer los días»
├─ heatmap-chart      (grupo accesible)
│  ├─ heatmap-months   (12 columnas; solo lectura visual)
│  ├─ heatmap-weekdays (7 etiquetas L M X J V S D)
│  └─ heatmap-grid     (84 botones, uno por día)
└─ heatmap-tooltip    (un único elemento, oculto por defecto)
```

- El resumen y la ayuda son invisibles pero legibles por lector de pantalla; no se usa
  `display: none`.
- Las etiquetas de meses y días llevan `aria-hidden="true"`: la fecha completa ya está en
  la etiqueta de cada celda.
- El tooltip es visual y lleva `aria-hidden="true"`; la información accesible vive en el
  `aria-label` de la celda, así no se anuncia dos veces.
- `heat-map-logic.js` se carga antes de `app.js`.

### 5.2 Pintado de la cuadrícula

`app.js` añade `renderHeatMap(sessions)` y la llama desde el `render()` existente, después
de las estadísticas actuales. Pasos:

1. `today = getTodayDateString()`; `data = HeatMapLogic.buildData(sessions, today)`.
2. Si `data` es `null`, se vacía la cuadrícula y se oculta el resumen; no se lanza error.
3. Se actualiza el resumen con `getSummary(data)`.
4. Se pintan las etiquetas de mes: un elemento por etiqueta, colocado en su columna
   (`grid-column-start = weekIndex + 1`), con texto de tres letras.
5. Se vacía la cuadrícula y se crean 84 botones en orden cronológico:
   - `type="button"`, clase `heatmap-cell`, `data-date` y `data-level`.
   - `aria-label` con `getCellLabel(day)`.
   - `tabindex="0"` solo en la celda enfocada (hoy al inicio); el resto `-1`.
   - Los días futuros se crean `disabled` y con `aria-hidden="true"`, sin etiqueta.
6. Se guarda `data` en una variable de módulo para que el tooltip y el teclado no tengan
   que recalcular.
7. Si antes del repintado el foco estaba dentro de la cuadrícula, se recupera la fecha
   enfocada; si sigue existiendo y no es futura, se devuelve el foco. Si no, se enfoca hoy.
8. Se cierra cualquier tooltip abierto.

El texto de las celdas no se genera con `innerHTML`: solo se usan `textContent`,
`setAttribute` y `dataset`. Con 84 celdas, reconstruirlas en cada actualización es más
simple que actualizarlas en sitio y no afecta al rendimiento.

La cuadrícula se pinta con CSS Grid de 12 columnas y 7 filas, en orden cronológico, con
las celdas cuadradas y una separación de 2–3 px. La última columna es la semana actual;
las celdas futuras se ven más apagadas y no responden a clics ni reciben foco.

### 5.3 Tooltip (RF-5)

Se usa un único elemento `role="tooltip"` con `position: fixed`, texto oscuro sobre tinta y
`pointer-events: none`. Nunca se usa el atributo `title` nativo.

- **Apertura**:
  - Ratón: al entrar en una celda con minutos, solo en dispositivos con hover.
  - Teclado: al recibir foco visible (`:focus-visible`).
  - Táctil: al tocar la celda (`pointerup` con `pointerType` táctil o lápiz).
- **Contenido**: `formatTooltip(day)` → `"19 oct · 45 min"`. No se muestra en días con 0
  minutos ni en días futuros.
- **Cierre**: segundo toque en la misma celda, toque fuera del mapa, scroll, cambio de
  tamaño, `Escape`, salida del foco o vuelta a la pestaña. Solo hay uno visible a la vez.
- **Posición**: se calcula con `getBoundingClientRect()`; por defecto encima de la celda y,
  si no cabe, debajo. La coordenada horizontal se limita a 8 px de los bordes de la ventana.
- **Accesibilidad**: el tooltip es visual (`aria-hidden="true"`); el `aria-label` de la
  celda ya contiene la misma información, de modo que un lector de pantalla no la repite.

El clic de ratón no alterna el tooltip: el hover ya lo muestra. En táctil, el primer toque
abre y el segundo cierra. En dispositivos híbridos conviven ambos comportamientos.

### 5.4 Teclado y lectores de pantalla (RF-6)

- El mapa es una sola parada de tabulación: exactamente una celda tiene `tabindex="0"`.
- Flechas izquierda/derecha: misma posición de la semana anterior/siguiente (±7 días).
- Flechas arriba/abajo: día anterior/siguiente (±1 día).
- El foco no puede salir del rango enfocable: desde hoy no se avanza a días futuros.
- `Escape` cierra el tooltip sin mover el foco.
- El contenedor es un grupo con nombre accesible («Mapa de calor») y descripción (resumen
  y ayuda). Cada celda es un botón con fecha y minutos:
  - `"lunes 19 de octubre, 45 minutos de estudio"`
  - `"martes 20 de octubre, 1 minuto de estudio"`
  - `"miércoles 21 de octubre, sin sesiones"`
- Las celdas futuras no se anuncian ni se enfocan.
- El foco visible se dibuja con contorno de tinta de 2 px y separación de 1 px; no se
  depende solo del color.
- Se cumple WCAG 2.1 AA: contraste, foco visible, nombre accesible y alternativa textual.

### 5.5 Actualización (RF-7)

- **Al registrar**: el `render()` existente se amplía con `renderHeatMap(sessions)`. Una
  sesión de hoy o pasada repinta; una futura no cambia nada.
- **Medianoche**: se programa un `setTimeout` hasta la próxima medianoche local + 1 s. Al
  dispararse, se vuelve a renderizar y se reprograma. Se recalcula la próxima medianoche
  cada vez, así que los cambios de hora no acumulan error. Se cancela y reprograma al
  volver a la pestaña.
- **Pestaña visible**: `visibilitychange` → si está visible, `render()` y reprogramar el
  temporizador; se cierra el tooltip.
- **Otra pestaña**: `storage` → si la clave es la de sesiones o el almacenamiento se ha
  limpiado, `render()`. El evento no se dispara en la pestaña que hizo el cambio, que ya
  repinta al enviar el formulario.
- **Foco**: si el repintado ocurre mientras una celda tiene el foco, se restaura la misma
  fecha; si ya no existe, se enfoca hoy.

`renderHeatMap` nunca escribe en el almacenamiento. Las únicas escrituras siguen siendo las
del formulario existente.

### 5.6 Estilos y responsive (RF-3, RF-4; RNF-1, RNF-2)

- La sección reutiliza la tarjeta blanca, el borde y la sombra dura del resto de la página.
- La cuadrícula se limita a unos 360 px de ancho en escritorio y se centra; en móvil ocupa
  el ancho disponible. Las celdas son cuadradas (`aspect-ratio: 1`), con 2–3 px de
  separación y esquinas de 2–3 px.
- Etiquetas de mes de 3 letras y 9–10 px; etiquetas de día de 1 letra, alineadas con las
  filas. No se usan mayúsculas forzadas ni etiquetas decorativas extra.
- Colores de nivel, con luminancia decreciente para que se distingan también en escala de
  grises:

| Nivel | Color | Uso |
| --- | --- | --- |
| 0 | `#dce5f0` | Sin estudio |
| 1 | `#ffc9ac` | 1–14 min |
| 2 | `#ff9f72` | 15–29 min |
| 3 | `#e85f2a` | 30–59 min |
| 4 | `#b8330b` | 60+ min |

- Los días futuros usan el nivel 0 con opacidad reducida y `cursor: default`.
- Hover: contorno naranja de 2 px. Foco: contorno de tinta de 2 px. Ninguno cambia el
  tamaño de la celda, para no solapar vecinas.
- Tooltip: fondo tinta, texto claro, 0.75 rem, radio 6 px, sombra suave, `z-index` alto.
- A 320 px no debe haber scroll horizontal. Las celdas quedan en torno a 18 px y las
  etiquetas de 9 px; se verifica con captura y con `scrollWidth == clientWidth`.
- Se añade la utilidad `.visually-hidden` (recorte accesible) para el resumen y la ayuda.

## 6. Decisiones técnicas y alternativas descartadas

| Decisión | Por qué | Alternativa descartada |
| --- | --- | --- |
| Lógica en `heat-map-logic.js`, con un único espacio de nombres `HeatMapLogic` | Separa cálculo e interfaz, evita colisiones con funciones existentes y se puede cargar en Node. | Añadir las funciones a `app.js`: no se pueden probar sin simular el DOM. Usar `vm` con un DOM falso: frágil y más difícil de entender. |
| Scripts clásicos y exportación CommonJS protegida con `typeof module` | Funciona con doble clic en `file://`; los tests usan `require` sin dependencias. | Módulos ES: bloqueados por `file://`. Bundler: añade build y dependencias. |
| Fechas ISO y aritmética a mediodía local | Evita desplazamientos por UTC y por cambios de hora; es serializable y determinista. | `toISOString()` y `new Date("AAAA-MM-DD")`: desplazan el día. Milisegundos: fallan con DST. |
| Calcular los 84 días de una vez | 84 elementos es trivial y deja el render simple y determinista. | Calcular al vuelo por celda: repite trabajo y complica el tooltip. Virtualizar: innecesario. |
| Reconstruir la cuadrícula en cada render | 84 botones; el código es más simple y no hay estado parcial que sincronizar. | Actualizar celdas en sitio: más código y más riesgo de desincronización. |
| Botones con foco itinerante y flechas | Accesible, válido y fácil de mantener; una sola parada de tabulación. | `role="grid"` con filas y columnas: más ARIA y más puntos de error. 84 paradas de tabulación: agotador. |
| Tooltip único con `position: fixed` | Evita recortes por tarjetas, sombras o scroll; el ajuste a los bordes es directo. | Tooltip absoluto dentro de la tarjeta: se recorta. `title` nativo: sin control visual ni táctil. |
| Días futuros `disabled` y `aria-hidden` | Quedan fuera del teclado y del lector de pantalla, como pide la spec. | Dejarlos enfocables: foco en días sin información y lógica extra. |
| Temporizador a medianoche + `visibilitychange` | Preciso, sin sondeo constante y resistente a pestañas en segundo plano. | `setInterval` cada minuto: trabajo inútil. Recalcular solo al cargar: mapa obsoleto. |
| Escuchar `storage` | Sincroniza otras pestañas al instante, sin sondeo. | Sondear `localStorage`: coste y retraso. |
| No tocar racha, semana, mes ni lista | La spec excluye cambios en las estadísticas existentes; reduce el riesgo. | Refactorizarlas también: fuera de alcance y riesgo de regresión. |
| `node:test` y `node:assert` | Sin instalar nada, como exige la constitución. | Jest/Vitest: dependencias y configuración. |

## 7. Estrategia de tests (RNF-8; RF-1 a RF-6, RF-8)

### 7.1 Organización

- Un único archivo: `tests/heat-map.test.js`.
- `node:test` para los casos y `node:assert/strict` para las aserciones.
- `require("../heat-map-logic.js")` obtiene `HeatMapLogic`; no se simula DOM ni
  `localStorage`.
- Todas las pruebas pasan `today` explícitamente; ninguna usa la fecha del sistema.
- Los nombres de los tests van en inglés, según la constitución.
- Comando: `node --test` desde la raíz. También `node --test tests/heat-map.test.js`.
- Puerta: la lógica debe estar en verde antes de conectar la interfaz. Un test en rojo
  bloquea el avance (principio 4).

Fixture base: `today = "2026-10-19"` (lunes). Periodo esperado: `2026-08-03` a
`2026-10-25`, 84 días, `todayIndex = 77`, 6 días futuros.

### 7.2 Casos por requisito

**RF-1 — Periodo y cuadrícula**
- 12 columnas y 7 filas: 84 días, `weeks = 12`.
- `start` es lunes y `end` es domingo.
- `start` está 11 semanas antes del lunes de hoy.
- `todayIndex` correcto y patrón lunes–domingo en `dayIndex`.
- Hoy lunes y hoy domingo producen el mismo periodo, con distinto `todayIndex`.
- Periodo que cruza año: `today = "2026-01-01"` → inicio `2025-10-13`, fin `2026-01-04`.
- Año bisiesto: un periodo con `2024-02-29` lo incluye una sola vez.
- Cambio de hora: `addDays("2026-03-28", 2) === "2026-03-30"` y el día de la semana es
  correcto.

**RF-2 — Minutos por día**
- Varias sesiones del mismo día se suman.
- Una sesión futura no suma ni crea día estudiado.
- Una sesión anterior al periodo no aparece en el mapa ni en `studiedDays`.
- Una sesión de hoy sí cuenta (límite superior inclusivo).
- Total fraccionario 14,5 → 15.
- 1000 sesiones se agrupan correctamente.

**RF-3 — Niveles**
- Valores límite: 0 → 0; 1 y 14 → 1; 15 y 29 → 2; 30 y 59 → 3; 60 y 999 → 4.
- Un día futuro siempre tiene nivel 0.
- El nivel se calcula con el total ya redondeado.

**RF-4 — Etiquetas**
- El periodo de ejemplo produce `ago` en la semana 0, `sep` en la 4 y `oct` en la 8.
- La primera columna siempre lleva etiqueta.
- No hay `weekIndex` repetidos y las etiquetas están en orden.
- Un periodo que cruza año produce etiquetas coherentes (`oct`, `nov`, `dic`, `ene`).

**RF-5 — Tooltip**
- `"19 oct · 45 min"`, `"19 oct · 1 min"`.
- Devuelve `null` para 0 minutos y para días futuros.
- No incluye año.

**RF-6 — Teclado y accesibilidad**
- Etiqueta de celda: 45 minutos, 1 minuto y «sin sesiones».
- Resumen: 0, 1 y varios días, con singular y plural; termina en hoy, no en el domingo.
- `moveFocus`: ±1 y ±7; no sale por izquierda, arriba, derecha ni abajo; desde hoy no
  avanza a futuros; los cruces de semana funcionan.

**RF-8 — Datos**
- Minutos 0, negativos, texto, `NaN` e `Infinity` se ignoran.
- Fecha `"2026-02-30"`, fecha vacía o ausente se ignoran.
- Dos sesiones con el mismo `id`: solo cuenta la primera.
- `sessions` nulo, objeto o cadena: mapa de 84 días en nivel 0, sin excepción.
- `today` inválido: `buildData` devuelve `null`.
- `isValidSession` acepta fecha y minutos válidos y rechaza el resto.
- Las sesiones de entrada no se mutan (se congelan con `Object.freeze` en el test).

**RNF-4 — Determinismo**
- Dos llamadas con las mismas sesiones y el mismo `today` producen objetos iguales.

### 7.3 Qué no se automatiza

No se prueban con `node --test` el DOM, el tooltip, el foco, el responsive ni los tiempos,
porque exigirían un navegador o dependencias. Esos puntos se verifican a mano:

- Abrir con doble clic (`file://`) y comprobar que no hay errores en consola.
- 1280, 375 y 320 px; en 320, `scrollWidth == clientWidth`.
- Estados vacío, 1 sesión, los cuatro niveles y días futuros.
- Hover, toque, segundo toque, toque fuera, scroll y `Escape`.
- Una sola parada de tabulación, flechas, foco visible y etiquetas en el árbol de
  accesibilidad.
- Alta de sesión: el mapa se actualiza; alta futura: no cambia.
- Dos pestañas: el mapa se sincroniza.
- Vuelta a la pestaña y simulación de cambio de día.
- 1000 sesiones: sin retardo perceptible.
- Racha, récord, semana, mes y lista siguen igual.

## 8. Cobertura de requisitos

| RF | Lógica | Interfaz | Pruebas |
| --- | --- | --- | --- |
| RF-1 | `buildData`, fechas | 84 celdas, 12 columnas, orden y días futuros | Periodo, límites, bisiesto, DST |
| RF-2 | `aggregateMinutes`, `buildData` | minutos por celda y exclusión de futuros | Suma, futuros, fuera de periodo, redondeo |
| RF-3 | `getLevel` | cinco colores y gris para nivel 0 | Umbrales 0/1/14/15/29/30/59/60 |
| RF-4 | `getMonthLabels` | etiquetas de mes y de días | Etiquetas del periodo y cruce de año |
| RF-5 | `formatTooltip` | tooltip, cierre, posición y dispositivo | Formatos y `null`; manual de interacción |
| RF-6 | `getCellLabel`, `getSummary`, `moveFocus` | grupo, botones, foco itinerante y resumen | Etiquetas, resumen y límites de foco; manual de teclado |
| RF-7 | — | `render()`, medianoche, visibilidad y `storage` | Manual con dos pestañas y cambio de día |
| RF-8 | validación, deduplicación, solo lectura | no escribe datos | Datos inválidos, duplicados, no mutación |
| RNF-1 | — | CSS responsive | Manual a 320/375 px |
| RNF-2 | etiquetas accesibles | ARIA, foco, contraste | Tests de textos + manual |
| RNF-3 | O(n) + 84 | render de 84 botones | Manual con 1000 sesiones |
| RNF-4 | `today` como parámetro | sin reloj en la lógica | Test de determinismo |
| RNF-5 | no recibe almacenamiento | no escribe | Revisión de código |
| RNF-6 | scripts clásicos | sin build ni servidor | Manual `file://` |
| RNF-7 | textos en español | interfaz en español | Revisión |
| RNF-8 | — | — | `node --test` |

## 9. Cumplimiento de la constitución

| Principio | Cómo se cumple |
| --- | --- |
| 1. Simplicidad | HTML, CSS y JS puros; dos scripts clásicos; sin dependencias, build ni servidor. |
| 2. La spec manda | Solo se implementan los RF de `specs/001-heat-map/spec.md`; no hay navegación, filtros, leyenda ni clic para registrar. |
| 3. Lógica separada | `heat-map-logic.js` no toca DOM, `localStorage` ni el reloj; recibe sesiones y `today`. `app.js` solo pinta y escucha eventos. |
| 4. Tests como puerta | `node --test` con `node:test` y `node:assert`; la lógica se prueba antes de conectar la interfaz; un rojo bloquea. |
| 5. Datos sagrados | No cambia clave ni formato; el mapa es de solo lectura; ignora datos inválidos sin borrarlos; fechas locales a mediodía. |
| 6. Idioma | Identificadores y nombres de funciones nuevos en inglés; interfaz, textos y documentación en español. |

## 10. Riesgos y mitigaciones

- **Tooltip en híbridos**: se separa hover (`(hover: hover)`) de toque (`pointerType`);
  si un dispositivo hace ambas cosas, el peor caso es cerrar y volver a abrir.
- **Pérdida de foco al repintar**: se guarda la fecha enfocada y se restaura después.
- **Temporizador en segundo plano**: los navegadores lo frenan; `visibilitychange` obliga
  a recalcular al volver.
- **Cambio de hora**: toda la aritmética usa mediodía local; los tests cubren el salto.
- **Lector de pantalla**: el grupo de botones no anuncia filas/columnas; el resumen, la
  ayuda y las etiquetas completas compensan. Se revisa el árbol de accesibilidad a mano.
- **Celdas pequeñas a 320 px**: se aceptan ~18 px (WCAG 2.1 AA no exige tamaño mínimo);
  el teclado y el resumen ofrecen alternativa.

## 11. Orden de implementación

1. `heat-map-logic.js` y `tests/heat-map.test.js`; ejecutar `node --test` hasta verde.
2. Sección en `index.html` y estilos en `styles.css` con datos de ejemplo estáticos.
3. `renderHeatMap` en `app.js` y llamada desde `render()`.
4. Tooltip, foco itinerante, teclado, medianoche, visibilidad y `storage`.
5. Verificación manual (móvil, teclado, dos pestañas, 1000 sesiones, consola) y
   actualización de `MEMORY.md`.







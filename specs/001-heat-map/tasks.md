# Tasks 001 — Mapa de calor

Tareas pequeñas (20–30 min), en orden de dependencia. No se empieza una tarea hasta que la
anterior esté en verde. Los tests de lógica son puerta: no se avanza con `node --test` en
rojo. No se tocan datos, formulario, racha ni estadísticas existentes.

## Fase A — Lógica pura y pruebas

- [x] **T1. Crear el esqueleto de `heat-map-logic.js`**
  - **RF**: base para RF-1 a RF-8.
  - **Depende de**: —
  - **Hecho cuando**: `node --check heat-map-logic.js` pasa y `node -e "console.log(typeof require('./heat-map-logic.js'))"` imprime `object`; el archivo no contiene `document`, `localStorage` ni `Date.now`.

- [x] **T2. Implementar y probar las funciones de fecha**
  - **RF**: RF-1, RF-8.
  - **Depende de**: T1.
  - **Hecho cuando**: pasan los tests de `parseIsoDate`, `toIsoDate`, `addDays`, `getWeekdayIndex` y `getMonday`: `2026-10-19` es lunes, `2026-02-30` se rechaza, `2024-02-29` es válida, `addDays("2025-12-31", 1) === "2026-01-01"` y `addDays("2026-03-28", 2) === "2026-03-30"`.

- [x] **T3. Implementar y probar los formatos en español**
  - **RF**: RF-5, RF-6.
  - **Depende de**: T2.
  - **Hecho cuando**: los tests confirman `formatShortDate("2026-10-19") === "19 oct"`, `formatLongDate(...) === "lunes 19 de octubre"` y `formatMonthDay(...) === "19 de octubre"`, todo en minúsculas y sin año.

- [x] **T4. Implementar validadores y niveles**
  - **RF**: RF-2, RF-3, RF-8.
  - **Depende de**: T2.
  - **Hecho cuando**: pasan los tests de `isValidMinutes`, `isValidSession` y `getLevel` con 0, 1, 14, 15, 29, 30, 59, 60 y 999, y con 0, negativos, texto, `NaN` e `Infinity` como inválidos.

- [x] **T5. Implementar la agrupación de minutos por día**
  - **RF**: RF-2, RF-8; RNF-3, RNF-5.
  - **Depende de**: T4.
  - **Hecho cuando**: los tests confirman suma de varias sesiones (45 + 30 = 75), futuro ignorado, `id` duplicado contado una sola vez, 14,5 → 15, 1000 sesiones correctas y que el array de entrada no se muta.

- [x] **T6. Construir el periodo y el modelo de 84 días**
  - **RF**: RF-1, RF-2, RF-3; RNF-4.
  - **Depende de**: T2, T4, T5.
  - **Hecho cuando**: con `today = "2026-10-19"` devuelve `start = "2026-08-03"`, `end = "2026-10-25"`, 84 días, `todayIndex = 77` y 6 futuros; `today` inválido devuelve `null`; sesiones no-array devuelven 84 días en nivel 0; dos llamadas idénticas son iguales.

- [x] **T7. Implementar y probar las etiquetas de mes**
  - **RF**: RF-4.
  - **Depende de**: T6.
  - **Hecho cuando**: el periodo de ejemplo produce `ago` en la semana 0, `sep` en la 4 y `oct` en la 8; la primera columna siempre lleva etiqueta; no hay `weekIndex` repetidos; el cruce de año devuelve etiquetas coherentes.

- [x] **T8. Implementar tooltip, etiqueta de celda y resumen**
  - **RF**: RF-5, RF-6; RNF-7.
  - **Depende de**: T2, T6.
  - **Hecho cuando**: pasan los tests de `"19 oct · 45 min"`, `"19 oct · 1 min"`, `null` para 0 y futuros, etiquetas de 45 minutos / 1 minuto / «sin sesiones» y resumen con 0, 1 y varios días, todo en español.

- [x] **T9. Implementar y probar el movimiento de foco**
  - **RF**: RF-6.
  - **Depende de**: T6.
  - **Hecho cuando**: los tests confirman ±1 y ±7, los cuatro bordes no salen del rango, los cruces de semana funcionan y desde `todayIndex` no se avanza a días futuros.

- [x] **T10. Cerrar la suite de lógica**
  - **RF**: RF-1 a RF-6, RF-8; RNF-4, RNF-8.
  - **Depende de**: T2 a T9.
  - **Hecho cuando**: `node --test` pasa completo, todas las funciones exportadas tienen al menos un test y `grep` no encuentra `document`, `localStorage` ni `Date.now` en `heat-map-logic.js`.

## Fase B — Estructura, render y estilos

- [x] **T11. Insertar la sección del mapa en `index.html`**
  - **RF**: RF-1, RF-4, RF-5, RF-6; RNF-6, RNF-7.
  - **Depende de**: T1.
  - **Hecho cuando**: la sección está entre «Esta semana» y el formulario, con título, resumen y ayuda ocultos, contenedores de meses/días/cuadrícula, tooltip y `heat-map-logic.js` cargado antes de `app.js`; abre desde `file://` sin errores en consola.

- [x] **T12. Pintar las 84 celdas, el resumen y los días futuros**
  - **RF**: RF-1, RF-2, RF-3, RF-8; RNF-3, RNF-5.
  - **Depende de**: T6, T8, T11.
  - **Hecho cuando**: `renderHeatMap(sessions)` se llama desde `render()`; DevTools cuenta 84 botones con `data-date` correlativos, 6 futuros `disabled`, un resumen correcto y el mapa se actualiza al guardar una sesión sin escribir datos extra.

- [x] **T13. Pintar las etiquetas de mes y comprobar las de día**
  - **RF**: RF-4.
  - **Depende de**: T7, T12.
  - **Hecho cuando**: el periodo de ejemplo muestra `ago`, `sep` y `oct` en las columnas 1, 5 y 9; las etiquetas de día L M X J V S D están alineadas; todas llevan `aria-hidden` y no hay duplicados.

- [x] **T14. Maquetar la cuadrícula adaptativa**
  - **RF**: RF-1, RF-4; RNF-1, RNF-7.
  - **Depende de**: T12, T13.
  - **Hecho cuando**: la cuadrícula es 12×7, las celdas son cuadradas, hay separación visible y las etiquetas están alineadas; a 320, 375 y 1280 px no hay scroll horizontal ni etiquetas cortadas.

- [x] **T15. Estilar los cinco niveles, futuros y foco**
  - **RF**: RF-3, RF-6; RNF-2.
  - **Depende de**: T14.
  - **Hecho cuando**: los cinco niveles se distinguen también en escala de grises, los futuros se ven apagados, el hover dibuja contorno naranja, el foco dibuja contorno de tinta y nada cambia de tamaño ni se solapa.

- [x] **T16. Estilar el tooltip y la utilidad accesible**
  - **RF**: RF-5; RNF-2.
  - **Depende de**: T14.
  - **Hecho cuando**: el tooltip tiene fondo tinta, texto claro, posición fija, `pointer-events: none` y `z-index` alto; `.visually-hidden` oculta el resumen a la vista pero sigue presente en el árbol de accesibilidad.

- [x] **T17. Revisar la interfaz estática a tres anchos**
  - **RF**: RF-3, RF-4; RNF-1.
  - **Depende de**: T15, T16.
  - **Hecho cuando**: capturas a 1280, 375 y 320 px revisadas; en 320 `scrollWidth == clientWidth`; se ven los cinco niveles, las etiquetas y el estado vacío sin recortes.

## Fase C — Teclado, tooltip y actualización

- [x] **T18. Implementar foco itinerante y flechas**
  - **RF**: RF-6; RNF-2.
  - **Depende de**: T12, T15.
  - **Hecho cuando**: hay exactamente un `tabindex="0"` (hoy al inicio); las flechas mueven ±1 y ±7 sin salir del rango; el foco no llega a futuros; tras repintar se recupera la fecha enfocada.

- [x] **T19. Abrir y posicionar el tooltip**
  - **RF**: RF-5; RNF-2.
  - **Depende de**: T16, T18.
  - **Hecho cuando**: hover, foco visible y toque muestran «19 oct · 45 min» solo en días con minutos; no aparece en 0 ni en futuros; cerca de un borde se voltea o se ajusta y nunca sale de la ventana.

- [x] **T20. Cerrar el tooltip en todos los casos**
  - **RF**: RF-5; RNF-2.
  - **Depende de**: T19.
  - **Hecho cuando**: segundo toque, toque fuera, scroll, cambio de tamaño, `Escape` y salida del foco lo cierran; solo hay uno visible; en táctil el primer toque abre y el segundo cierra.

- [x] **T21. Recalcular a medianoche y al volver a la pestaña**
  - **RF**: RF-7.
  - **Depende de**: T12.
  - **Hecho cuando**: al simular el cambio de día el mapa se repinta y el temporizador se reprograma; al volver a la pestaña se recalcula y se cierra el tooltip; no quedan temporizadores duplicados.

- [x] **T22. Sincronizar cambios de otras pestañas**
  - **RF**: RF-7.
  - **Depende de**: T12.
  - **Hecho cuando**: con dos pestañas abiertas, guardar en una actualiza el mapa de la otra sin recargar; limpiar el almacenamiento también actualiza.

## Fase D — Verificación y cierre

- [x] **T23. Verificar teclado, lector de pantalla y móvil**
  - **RF**: RF-5, RF-6; RNF-1, RNF-2, RNF-6.
  - **Depende de**: T17, T18, T19, T20.
  - **Hecho cuando**: una sola parada de tabulación, flechas y `Escape` funcionan; el árbol de accesibilidad anuncia fecha y minutos de cada día; a 320 px no hay scroll; todo funciona abriendo `index.html` con doble clic.

- [x] **T24. Verificar actualización, rendimiento y no regresión**
  - **RF**: RF-7, RF-8; RNF-3, RNF-5.
  - **Depende de**: T21, T22, T23.
  - **Hecho cuando**: una sesión de hoy actualiza el mapa y una futura no; con 1000 sesiones no hay retardo perceptible; la consola está limpia; racha, récord, semana, mes y lista siguen igual y los datos guardados no cambian.

- [x] **T25. Cerrar la suite y actualizar la memoria**
  - **RF**: RF-1 a RF-8; RNF-8.
  - **Depende de**: T24.
  - **Hecho cuando**: `node --test` pasa completo, no queda código de depuración, todas las casillas anteriores están marcadas y `MEMORY.md` registra las decisiones y la verificación.


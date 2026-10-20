# AGENTS.md — Diario de Estudio 

Web estática para registrar sesiones de estudio y motivarse viendo la racha de días 
seguidos. Proyecto didáctico: el código debe poder entenderlo alguien que empieza a 
programar. 

## Stack y estructura 
- HTML, CSS y JavaScript puros: sin frameworks, librerías, npm, bundler ni build. 
- `index.html` (estructura), `styles.css` (estilos), `app.js` (interfaz y datos), `heat-map-logic.js`, `weekly-goal-logic.js` y `theme-logic.js` (lógica pura, sin DOM ni almacenamiento). 
- Debe funcionar abriendo `index.html` con doble clic (`file://`): nada de módulos ES (`type="module"`), `fetch` a archivos locales ni nada que requiera servidor. 

## Convenciones 
- Textos de la interfaz en español. 
- Código simple, nombres descriptivos y comentarios solo donde aporten. 
- Diseño limpio y responsive; cualquier pantalla nueva debe verse bien en el móvil.

## Datos 
- localStorage, clave `estudioDiarioSesiones`: array de `{ id, fecha: "AAAA-MM-DD", tema, minutos }`. 
- El objetivo semanal vive aparte, en la clave `estudioDiarioObjetivoSemanal`, con la forma `{ minutos }`; es opcional. 
- El tema vive en la clave `estudioDiarioTema`, con la forma `{ "tema": "claro" | "oscuro" }`; es opcional. 
- La elección guardada manda; sin una elección legible se sigue `prefers-color-scheme` en vivo, sin escribir nada. Solo se escribe al pulsar el botón de tema, y las otras dos claves no se tocan. 
- El botón de tema es de acción: su etiqueta y su icono nombran el tema al que se cambia («Modo oscuro» y luna con el tema claro; «Modo claro» y sol con el oscuro). Sin `aria-pressed`: el nombre accesible es la etiqueta visible. 
- Si cambias la forma de los datos, mantén compatibilidad con lo ya guardado o el usuario perderá sus sesiones. 

## Fechas y racha (fácil equivocarse) 
- Trabaja siempre con la fecha local del usuario. Nunca uses `toISOString()` ni `new Date  ("AAAA-MM-DD")`: se interpretan en UTC y desplazan el día. 
- Racha = días consecutivos con al menos 1 sesión que terminan hoy. Si hoy no hay sesión pero ayer sí, la racha sigue viva y se cuenta desde ayer. 
- Varias sesiones el mismo día cuentan como un solo día. Las fechas futuras no suman. 

## Forma de trabajar 
- Haz solo lo que se pide: no añadas funcionalidades por tu cuenta. 
- Cambios pequeños y enfocados; no reescribas lo que ya funciona. 
- Al terminar, resume qué has cambiado y cualquier decisión que deba revisar. 

## Memoria
- Al empezar, lee siempre 'MEMORY.md' para conocer el estado del proyecto y las decisiones tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su porqué) y errores a evitar.
-Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una reglapermanente, propón moverlo a 'AGENTS.md' en lugar de dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales).

# Comandos 
- Tests: `node --test` 
 
## Reglas 
- Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código. 

## Límites
- ✅ Siempre: respetar las reglas de fechas y racha, mantener los textos en español. 
-Siempre actualizar 'MEMORY.md' al terminar cada tarea.
- ⚠ Pregunta antes: crear archivos nuevos, cambiar el formato de los datos guardados. 
- Nunca: añadir dependencias, frameworks o un paso de build. 

## Verificación 
- La lógica pura se prueba con `node --test`; no hay que instalar paquetes. Después de cada cambio, verifica con el MCP de Chrome DevTools: abre `index.html`, prueba la funcionalidad, revisa la consola y comprueba la vista móvil. 
- Para empezar de cero: DevTools → Application → Local Storage → borrar las claves `estudioDiarioSesiones`, `estudioDiarioObjetivoSemanal` y `estudioDiarioTema`. 
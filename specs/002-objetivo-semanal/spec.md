# Spec 002 — Objetivo semanal de estudio

**Estado:** aprobada (19 de octubre de 2026)

## 1. Contexto y objetivo

El Diario de Estudio registra sesiones y muestra la racha, el récord, los minutos de la
semana, los días del mes y un mapa de calor de 12 semanas. La estadística «Esta semana»
indica cuánto se ha estudiado, pero no cuánto se pretendía estudiar: sin una meta, ese
número no dice si la semana va bien o mal.

Objetivo: permitir fijar un objetivo de minutos por semana y mostrar el progreso de la
semana en curso frente a ese objetivo, con un mensaje claro de cuánto falta o cuánto se ha
superado, para motivar a mantener el hábito.

El objetivo vive en la tarjeta «Esta semana»: no se crea una sección nueva ni se duplica la
información semanal ya existente. La estadística «Esta semana» se queda exactamente como
está hoy; el progreso del objetivo usa una definición propia y estricta (RF-2).

## 2. Usuarios

- **Persona que estudia** (usuario principal): quiere una meta semanal sencilla y ver de un
  vistazo si va por buen camino, sin llevar cuentas a mano.
- **Persona que estudia desde el móvil**: necesita fijar y consultar el objetivo con pocos
  toques y sin desplazamiento horizontal.
- **Persona que navega con teclado o lector de pantalla**: necesita fijar el objetivo,
  entender el progreso y conocer el porcentaje sin depender del color ni del ratón.
- **Persona que mantiene el proyecto** (usuario secundario): necesita que la funcionalidad
  sea comprensible, verificable y que no ponga en riesgo las sesiones ya guardadas.

## 3. Historias de usuario

- **HU-1**: Como persona que estudia, quiero fijar cuántos minutos quiero estudiar cada
  semana para tener una meta concreta.
- **HU-2**: Como persona que estudia, quiero ver cuántos minutos llevo de la semana y qué
  porcentaje representan para saber si voy a cumplir.
- **HU-3**: Como persona que estudia, quiero saber cuánto me falta o cuánto he superado el
  objetivo para ajustar mi esfuerzo.
- **HU-4**: Como persona que estudia, quiero que el objetivo siga ahí la semana siguiente y
  que el progreso empiece de cero, para no reconfigurarlo cada lunes.
- **HU-5**: Como persona que estudia, quiero poder cambiar o quitar el objetivo cuando mi
  disponibilidad cambie, sin perder mis sesiones.
- **HU-6**: Como persona que usa teclado o lector de pantalla, quiero fijar el objetivo y
  consultar el progreso con la misma información que con el ratón.

## 4. Requisitos funcionales

### RF-1 — Objetivo semanal configurable y persistente

El objetivo es una cantidad de minutos por semana, definida por la persona y recordada
entre visitas.

- **CA-1.1** (ubicuo) El sistema debe permitir definir un objetivo de minutos semanales
  como número entero entre 1 y 10080 minutos (de 1 minuto a 168 horas).
- **CA-1.2** (ubicuo) El objetivo definido debe aplicarse a la semana en curso y a todas las
  semanas siguientes sin volver a configurarlo; es un único objetivo recurrente. No debe
  existir un objetivo distinto por semana ni un historial de objetivos.
- **CA-1.3** (ubicuo) El sistema debe guardar el objetivo en una clave de almacenamiento
  propia, `estudioDiarioObjetivoSemanal`, con la forma `{ "minutos": 600 }`; mientras no se
  guarde ningún objetivo, esa clave no debe existir.
- **CA-1.4** (ubicuo) El sistema debe conservar el objetivo al recargar la página, al cerrar
  y volver a abrir el navegador y al volver más tarde.
- **CA-1.5** (condición) Si no hay ningún objetivo guardado, entonces el sistema debe
  mostrar el estado «sin objetivo» descrito en RF-3.
- **CA-1.6** (ubicuo) Definir, cambiar o quitar el objetivo no debe crear, modificar ni
  reinterpretar ninguna sesión.

### RF-2 — Progreso de la semana actual

El progreso compara los minutos de la semana en curso con el objetivo vigente, usando una
definición propia y estricta de los minutos semanales. La estadística «Esta semana» no se
modifica (CA-3.7).

- **CA-2.1** (ubicuo) El sistema debe calcular los minutos de la semana actual de lunes a
  domingo en hora local, sumando las sesiones cuya fecha esté dentro de esa semana y no sea
  posterior a hoy.
- **CA-2.2** (ubicuo) El sistema debe considerar válida una sesión solo si su fecha es una
  fecha `AAAA-MM-DD` existente en el calendario y sus minutos son un número finito mayor que
  cero; cada sesión inválida se ignora individualmente y las demás siguen contando.
- **CA-2.3** (condición) Si varias sesiones comparten el mismo identificador, entonces el
  sistema debe contar solo la primera aparición en la lista, con independencia de que esa
  primera sesión sea válida, inválida o posterior a hoy; el identificador se consume al
  encontrarlo, igual que hace el mapa de calor. Por ejemplo, una sesión futura y después otra
  válida con el mismo identificador dan 0 minutos.
- **CA-2.4** (condición) Si una sesión tiene fecha posterior a hoy, entonces el sistema no
  debe contarla, aunque pertenezca a la semana en curso.
- **CA-2.5** (ubicuo) El sistema debe redondear el total semanal al minuto entero más
  cercano (mitad hacia arriba) antes de compararlo con el objetivo.
- **CA-2.6** (ubicuo) El sistema no debe modificar, ordenar ni reescribir la lista de
  sesiones que recibe para el cálculo.
- **CA-2.7** (ubicuo) El sistema debe calcular en este orden exacto: (1) total semanal
  redondeado, (2) porcentaje, (3) minutos restantes, (4) avance de la barra y (5) estado y
  textos.
- **CA-2.8** (ubicuo) El sistema debe calcular el porcentaje como el entero más cercano de
  `total × 100 / objetivo`, aplicando en este orden: si hay actividad y el entero resultante
  es 0, mostrar 1 %; si no se ha alcanzado el objetivo y el entero resultante es 100 o más,
  mostrar 99 %; si el objetivo está alcanzado o superado, mostrar el valor real sin límite
  superior.
- **CA-2.9** (ubicuo) El sistema debe calcular los minutos restantes como el objetivo menos
  el total redondeado, con un mínimo de 0.
- **CA-2.10** (ubicuo) El sistema debe representar el avance de la barra como la proporción
  entre el total redondeado y el objetivo, limitada a 1; la barra nunca debe desbordarse
  aunque se supere el objetivo.
- **CA-2.11** (ubicuo) El sistema debe dejar la estadística «Esta semana» tal como está hoy:
  sin sanear y sin redondear. Su valor puede diferir del total usado por el objetivo solo
  cuando existan datos inválidos, fraccionarios o identificadores duplicados, y esa
  diferencia es aceptada y documentada.

### RF-3 — Estados y mensajes

La tarjeta «Esta semana» debe distinguir cinco estados y mostrar siempre el total semanal
existente.

| Estado | Condición |
| --- | --- |
| Sin objetivo | No hay objetivo guardado o el guardado no es válido |
| Sin actividad | Hay objetivo y 0 minutos esta semana |
| En progreso | Hay objetivo y entre 1 minuto y objetivo − 1 |
| Cumplido | El total redondeado iguala el objetivo |
| Superado | El total redondeado supera el objetivo |

- **CA-3.1** (condición) Si no hay objetivo, entonces el sistema debe mostrar «Aún no tienes
  un objetivo semanal», la explicación «Fija cuántos minutos quieres estudiar cada semana
  para ver tu progreso.» y un botón «Fijar objetivo», sin barra de progreso ni porcentaje.
- **CA-3.2** (condición) Si hay objetivo y 0 minutos, entonces el sistema debe mostrar
  «Aún no has estudiado esta semana», «0 de N min · 0 %» y «Te faltan N min», con «Te falta 1
  min» si el objetivo es de 1 minuto.
- **CA-3.3** (condición) Si hay objetivo y los minutos son mayores que 0 y menores que el
  objetivo, entonces el sistema debe mostrar «X de N min · P %» y «Te faltan Z min».
- **CA-3.4** (condición) Si los minutos igualan el objetivo, entonces el sistema debe mostrar
  «¡Objetivo cumplido!» y «N de N min · 100 %», sin mensaje de minutos sobrantes.
- **CA-3.5** (condición) Si los minutos superan el objetivo, entonces el sistema debe mostrar
  «¡Objetivo superado! +Z min» y «X de N min · P %» con el porcentaje real y la barra llena.
- **CA-3.6** (ubicuo) El sistema debe usar el singular «Te falta 1 min», «1 de N min» y «+1
  min» cuando el valor sea 1, y el plural en el resto de casos, sin mensajes
  culpabilizadores y sin ocultar el porcentaje real cuando supere 100.
- **CA-3.7** (ubicuo) El sistema debe mantener el total de minutos de «Esta semana» con el
  mismo cálculo, el mismo saneado (ninguno) y el mismo formato que antes de esta
  funcionalidad; el redondeo al minuto se aplica solo al progreso del objetivo.
- **CA-3.8** (ubicuo) El sistema solo debe mostrar el progreso de la semana en curso; no debe
  mostrar semanas anteriores, semanas cumplidas ni avisos al terminar la semana.

### RF-4 — Fijar, editar y quitar el objetivo

- **CA-4.1** (ubicuo) El sistema debe ofrecer «Fijar objetivo» cuando no hay objetivo y
  «Editar» cuando ya existe, dentro de la tarjeta «Esta semana».
- **CA-4.2** (evento) Cuando la persona activa ese botón, el sistema debe mostrar un
  formulario en la propia tarjeta con un campo numérico etiquetado «Minutos por semana»,
  preparado para enteros entre 1 y 10080, con el valor actual si el objetivo es válido y
  vacío si no lo es, y los botones «Guardar» y «Cancelar». El campo debe exponer el texto
  literal tal como se escribió, sin convertirlo ni normalizarlo, para poder distinguir «3e2»
  de «300».
- **CA-4.3** (condición) Si existe un objetivo válido, entonces el formulario debe ofrecer
  además «Quitar objetivo»; si el objetivo guardado no es válido, ese botón no debe
  mostrarse; si el objetivo cambia desde otra pestaña con el formulario abierto, el botón
  debe aparecer o desaparecer según corresponda sin cerrar el formulario ni mover el foco
  (CA-5.5).
- **CA-4.4** (evento) Cuando se guarda un valor válido, el sistema debe persistirlo, cerrar
  el formulario, actualizar el estado al instante y devolver el foco al botón que lo abrió.
- **CA-4.5** (condición) Si el texto literal del campo, tras quitar los espacios exteriores,
  no es un entero válido, entonces el sistema debe mostrar el mensaje correspondiente junto
  al campo, no guardar nada y mantener el formulario abierto con el foco en el campo. La
  validación se hace sobre el texto literal del campo, no sobre un valor normalizado por el
  navegador, y debe seguir este orden exacto de comprobación: (1) vacío o sin ningún dígito;
  (2) contiene una coma o un punto; (3) contiene un signo, una letra o cualquier carácter que
  no sea un dígito, salvo un único guion inicial; (4) empieza por guion y el resto son
  dígitos; (5) es 0; (6) es mayor que 10080.
- **CA-4.6** (ubicuo) Los mensajes de error deben ser exactamente: «Escribe un número entero
  de minutos.» para vacío o sin dígitos (paso 1), «Escribe un número entero de minutos, sin
  decimales.» para decimales (paso 2), «Escribe el número sin signo ni notación científica,
  por ejemplo 300.» para signo, notación científica o caracteres no admitidos (paso 3), «El
  objetivo debe ser al menos 1 minuto.» para cero o negativos (pasos 4 y 5) y «El objetivo no
  puede superar 10080 minutos (168 horas).» para valores mayores que 10080 (paso 6).
- **CA-4.7** (evento) Cuando se pulsa «Cancelar» o la tecla Escape, el sistema debe cerrar el
  formulario sin guardar, descartar lo escrito y devolver el foco al botón que lo abrió.
- **CA-4.8** (evento) Cuando se pulsa «Quitar objetivo», el sistema debe eliminar la clave
  del objetivo del almacenamiento, volver al estado sin objetivo y conservar todas las
  sesiones; otra pestaña abierta debe pasar también al estado sin objetivo.
- **CA-4.9** (ubicuo) Guardar un objetivo igual al vigente debe cerrar el formulario sin
  error, sin reescribir la clave y sin provocar cambios en otras pestañas.
- **CA-4.10** (condición) Si el almacenamiento falla al guardar o al quitar, entonces el
  sistema debe mostrar «No se pudo guardar el objetivo. Inténtalo de nuevo.» y mantener el
  estado anterior visible.

### RF-5 — Actualización y sincronización

- **CA-5.1** (evento) Cuando se registra una sesión, el sistema debe recalcular el progreso
  sin recargar la página.
- **CA-5.2** (evento) Cuando cambia el día local con la página abierta, el sistema debe
  recalcular el progreso; si el nuevo día es lunes, el progreso debe empezar de cero.
- **CA-5.3** (evento) Cuando la pestaña vuelve a estar visible después de estar oculta, el
  sistema debe recalcular el progreso con los datos actuales.
- **CA-5.4** (evento) Cuando cambian los datos en otra pestaña del mismo navegador, el
  sistema debe reflejarlo sin recargar; debe atender los cambios de la clave de sesiones, los
  de la clave del objetivo y el borrado completo del almacenamiento.
- **CA-5.5** (condición) Si el formulario del objetivo está abierto y otra pestaña cambia,
  crea o quita el objetivo, entonces el sistema debe conservar el texto escrito y el foco en
  el campo, mostrar u ocultar «Quitar objetivo» según exista o no un objetivo válido,
  recalcular el progreso con el objetivo guardado más reciente y, al pulsar «Guardar»,
  persistir el texto del campo tal como esté en ese momento, aunque coincida con el valor que
  tenía al abrir el formulario.
- **CA-5.6** (ubicuo) Ningún recálculo por registrar una sesión, cambiar el día, volver a la
  pestaña o recibir un cambio de otra pestaña debe cerrar el formulario del objetivo, borrar
  lo escrito, mover el foco ni mostrar un mensaje de error; solo debe actualizar los textos,
  la barra y la presencia del botón «Quitar objetivo» (CA-4.3, CA-5.5).
- **CA-5.7** (ubicuo) El sistema debe usar un único temporizador para el cambio de día y no
  debe acumular temporizadores al recalcular.
- **CA-5.8** (ubicuo) Un fallo al leer los datos no debe impedir que el resto de la
  aplicación siga funcionando.

### RF-6 — Semana, fechas y cambio de semana

- **CA-6.1** (ubicuo) El sistema debe considerar la semana de lunes a domingo en la hora
  local del usuario, sin usar la hora universal (UTC).
- **CA-6.2** (ubicuo) El sistema no debe prorratear el objetivo: la meta es la misma tanto
  si hoy es lunes como si es domingo.
- **CA-6.3** (evento) Cuando se pasa de domingo a lunes, el sistema debe reiniciar el
  progreso a 0 y mantener el objetivo guardado.
- **CA-6.4** (ubicuo) El cambio de hora estacional, el cambio de año y el 29 de febrero no
  deben duplicar, perder ni desplazar ningún día de la semana.
- **CA-6.5** (ubicuo) Una sesión registrada a las 00:30 debe pertenecer al día local en que
  se registró.
- **CA-6.6** (ubicuo) Una sesión de hoy debe contar; solo se excluye lo posterior a hoy.
- **CA-6.7** (evento) Cuando se guarda un objetivo nuevo en cualquier día de la semana, el
  sistema debe aplicar ese objetivo de inmediato a la semana en curso y recalcular el
  progreso sin esperar al lunes y sin prorrateo.

### RF-7 — Datos y compatibilidad

- **CA-7.1** (ubicuo) El sistema no debe escribir, modificar ni eliminar ninguna sesión ni la
  clave `estudioDiarioSesiones`.
- **CA-7.2** (ubicuo) El objetivo debe guardarse en una clave nueva e independiente; la
  ausencia de esa clave no debe afectar al resto de la aplicación.
- **CA-7.3** (condición) Si el objetivo guardado está corrupto, no es un objeto con
  `minutos`, no es un entero o está fuera del rango 1–10080, entonces el sistema debe
  tratarlo como «sin objetivo», no borrarlo ni reescribirlo hasta que la persona guarde uno
  nuevo, y abrir el formulario con el campo vacío y sin «Quitar objetivo».
- **CA-7.4** (condición) Si una sesión no tiene una fecha `AAAA-MM-DD` válida o sus minutos
  no son un número finito mayor que cero, entonces el sistema debe ignorar esa sesión y
  seguir sumando las demás, sin borrar ni reescribir nada.
- **CA-7.5** (ubicuo) Quitar el objetivo no debe tocar las sesiones ni sus estadísticas.
- **CA-7.6** (ubicuo) La funcionalidad debe funcionar con los datos ya guardados por
  versiones anteriores, sin migraciones ni pasos manuales.
- **CA-7.7** (condición) Si el almacenamiento local no está disponible, entonces la
  aplicación debe seguir funcionando en modo sin objetivo y avisar al intentar guardar.
- **CA-7.8** (ubicuo) `AGENTS.md` describe una clave y una forma de datos obsoletas
  (`diario-estudio-sesiones` y `{ date, topic, minutes }`); durante la implementación debe
  corregirse a la clave real `estudioDiarioSesiones` y a la forma `{ id, fecha, tema,
  minutos }`, sin cambiar el comportamiento del código.

### RF-8 — Interfaz, accesibilidad y móvil

- **CA-8.1** (ubicuo) El bloque del objetivo debe formar parte de la tarjeta «Esta semana»,
  debajo del total de minutos, con un orden de lectura lógico: título, total, objetivo,
  progreso, mensaje y acción.
- **CA-8.2** (ubicuo) La barra de progreso debe exponerse como `progressbar` con valor
  mínimo 0, máximo el objetivo y valor actual limitado al objetivo, y debe acompañarse de un
  texto accesible con el rango de la semana y el estado, por ejemplo «Semana del 19 al 25 de
  octubre: 0 de 300 minutos, 0 por ciento. Te faltan 300 minutos.», «Semana del 19 al 25 de
  octubre: 120 de 300 minutos, 40 por ciento. Te faltan 180 minutos.», «Semana del 19 al 25
  de octubre: 300 de 300 minutos, 100 por ciento. Objetivo cumplido.» o «Semana del 19 al 25
  de octubre: 345 de 300 minutos, 115 por ciento. Objetivo superado por 45 minutos.».
- **CA-8.3** (ubicuo) El rango de la semana del texto accesible debe escribirse con los días
  y los meses en español, y seguir siendo correcto cuando la semana cruza dos meses o dos
  años, por ejemplo «Semana del 28 de septiembre al 4 de octubre» o «Semana del 28 de
  diciembre al 3 de enero».
- **CA-8.4** (ubicuo) La información no debe depender solo del color: debe haber siempre
  texto con los minutos y el porcentaje.
- **CA-8.5** (ubicuo) El campo, los botones y el formulario deben ser operables con teclado,
  con foco visible y en orden lógico.
- **CA-8.6** (ubicuo) Cada campo debe tener etiqueta asociada y los errores deben anunciarse
  y quedar asociados al campo.
- **CA-8.7** (condición) Si la pantalla mide 320 px de ancho, entonces el formulario, la
  barra y los mensajes deben verse completos, sin desplazamiento horizontal, y los botones
  deben tener al menos 44 px de alto.
- **CA-8.8** (ubicuo) Todos los textos visibles deben estar en español, con «min» como
  abreviatura, singular y plural correctos y sin separador de miles en las cifras («10080
  min»).
- **CA-8.9** (condición) Si el sistema operativo pide reducir el movimiento, entonces la
  barra no debe animarse.
- **CA-8.10** (evento) Cuando el objetivo cambia por guardarlo, quitarlo o por un cambio
  llegado de otra pestaña, el sistema debe anunciar el nuevo estado a los lectores de
  pantalla, sin repetir el anuncio en los recálculos provocados por sesiones o por el cambio
  de día.

## 5. Requisitos no funcionales

- **RNF-1** (responsive) A 320 px, 375 px y 1280 px la tarjeta debe verse completa, sin
  desplazamiento horizontal y sin textos cortados.
- **RNF-2** (accesibilidad) La funcionalidad debe cumplir WCAG 2.1 nivel AA: foco visible,
  contraste suficiente, etiquetas asociadas, errores anunciados y alternativa textual al
  color.
- **RNF-3** (determinismo) Con las mismas sesiones, el mismo objetivo y la misma fecha de
  referencia, el progreso y los mensajes deben ser siempre idénticos; la fecha de referencia
  se recibe como dato de entrada.
- **RNF-4** (rendimiento) Con hasta 1000 sesiones, el recálculo y el repintado deben
  completarse en menos de 50 ms en un equipo de gama media.
- **RNF-5** (simplicidad) La funcionalidad no debe requerir instalación, dependencias,
  servidor ni pasos de compilación; debe funcionar abriendo la aplicación con doble clic
  desde el sistema de archivos.
- **RNF-6** (idioma) Código en inglés; interfaz y documentación en español.
- **RNF-7** (pruebas) La validación del objetivo, la lectura del objetivo guardado, el rango
  semanal, la suma estricta de minutos, los identificadores duplicados, el redondeo, el
  porcentaje, los minutos restantes, la barra y los cinco estados deben estar cubiertos por
  pruebas automatizadas con `node --test`, sin instalar paquetes; no se puede dar por
  terminada con pruebas en rojo.
- **RNF-8** (datos) Las sesiones existentes deben quedar intactas; no se altera su formato,
  su clave ni su contenido.
- **RNF-9** (sin regresiones) Racha, récord, «Esta semana», días del mes, mapa de calor,
  formulario y lista de sesiones deben seguir funcionando exactamente igual; «Esta semana»
  no se sanea y no se redondea.
- **RNF-10** (pureza) La lógica nueva de fechas, suma, redondeo, porcentaje, restante, barra
  y estados no debe acceder al DOM, al almacenamiento ni al reloj: no puede contener
  `document`, `localStorage`, `Date.now` ni `new Date()` sin argumentos; la fecha de
  referencia llega como parámetro.
- **RNF-11** (documentación) `AGENTS.md` y `MEMORY.md` deben quedar coherentes con la clave
  `estudioDiarioSesiones` y la forma `{ id, fecha, tema, minutos }` al terminar.

Estos requisitos se aplican junto con `docs/constitution.md`.

## 6. Casos límite

- Sin ninguna sesión: 0 de N min, 0 % y «Aún no has estudiado esta semana».
- Sesiones solo de semanas anteriores: el progreso de esta semana es 0.
- Sesiones solo con fecha futura dentro de la semana: no cuentan; el progreso es 0.
- Sesión de hoy: cuenta (límite superior inclusivo).
- Objetivo exacto: 1 minuto con 1 minuto, 300 con 300, 10080 con 10080 → «¡Objetivo
  cumplido!», 100 %.
- Objetivo superado por 1 minuto: 301 de 300 → «+1 min» y barra llena; el porcentaje real es
  100,33 % y se redondea a 100.
- Objetivo muy superado: 900 de 300 → 300 % real y «+600 min».
- 299 de 300: 99,67 % se redondea a 100, pero como no se ha alcanzado se muestra 99 % y
  «Te falta 1 min».
- 1 de 3: 33 % y «Te faltan 2 min».
- 1 de 10080: 0,0099 % se redondea a 0, pero como hay actividad se muestra 1 %; «Te faltan
  10079 min».
- 0 de 300: 0 % y «Te faltan 300 min».
- Objetivo de 1 minuto con 0 minutos: 0 % y «Te falta 1 min».
- Total semanal fraccionario, por ejemplo 14,5: el objetivo redondea a 15; «Esta semana»
  sigue mostrando 14,5, sin redondear.
- Sesiones con identificador duplicado: para el objetivo cuenta solo la primera aparición,
  sea válida, inválida o futura; «Esta semana» las cuenta todas, así que los dos valores
  pueden diferir con este dato corrupto.
- Sesión futura y después sesión válida con el mismo identificador: el objetivo cuenta 0
  minutos, porque el identificador se consume en la primera aparición.
- Sesión con minutos 0, negativos, `NaN`, `Infinity` o en texto: se ignora solo esa sesión y
  las demás siguen sumando.
- Sesión con fecha mal formada (`2026-2-3`, `2026-02-30`, `19-10-2026`) o que no es texto: se
  ignora solo esa sesión, sin borrarla.
- JSON corrupto o valor que no es una lista en las sesiones: 0 minutos para el objetivo, sin
  borrar ni reescribir; el mapa de calor sigue mostrándose vacío como hoy.
- Objetivo guardado como 0, negativo, decimal, texto, `null`, array u objeto sin `minutos`:
  se trata como sin objetivo, no se borra, el formulario abre con el campo vacío y sin
  «Quitar objetivo».
- Clave del objetivo ausente: estado sin objetivo; las sesiones se leen con normalidad.
- Almacenamiento lleno o bloqueado: mensaje «No se pudo guardar el objetivo. Inténtalo de
  nuevo.» y estado anterior visible.
- Quitar el objetivo y recargar: sigue sin objetivo; la clave ya no existe.
- Guardar el mismo objetivo: se cierra el formulario, no se reescribe la clave y no se
  notifica a otras pestañas.
- Cambiar el objetivo a mitad de semana: el nuevo objetivo se aplica de inmediato a la
  semana en curso, sin prorrateo.
- Domingo a las 23:59: sigue siendo la misma semana.
- Lunes a las 00:00 con la página abierta: el progreso vuelve a 0, el objetivo se mantiene y
  el formulario, si estaba abierto, sigue abierto con su texto.
- Semana que cruza un cambio de mes o de año: el rango y los textos siguen siendo correctos.
- Cambio de hora estacional: no se duplica ni se pierde ningún día.
- Año bisiesto: el 29 de febrero se trata como cualquier otro día.
- Dos pestañas abiertas: registrar una sesión o cambiar el objetivo en una actualiza la otra.
- Otra pestaña borra el almacenamiento completo: la vista pasa a sin objetivo y 0 minutos.
- Formulario abierto y cambio externo del objetivo: no se pierde lo escrito ni el foco; al
  guardar prevalece el texto del campo.
- Medianoche, registro de sesión o vuelta a la pestaña con el formulario abierto: no se
  cierra el formulario ni se borra lo escrito.
- Zoom del navegador al 400 % sobre 1280 px: la tarjeta se adapta como a 320 px.
- Entrada con espacios alrededor (« 300 »): se acepta como 300.
- Entrada con coma decimal («300,5») o con punto decimal («300.5»): se rechaza con el mensaje
  de decimales.
- Entrada en notación científica («3e2») o con signo positivo («+300»): se rechaza con el
  mensaje de signo o notación científica.
- Entrada negativa («-5»): se rechaza con «El objetivo debe ser al menos 1 minuto.».
- Entrada con letras o símbolos («treinta»): se rechaza con «Escribe un número entero de
  minutos.»; con espacios interiores («3 0 0») se rechaza con el mensaje de caracteres no
  admitidos.
- Objetivo de 10080 minutos: válido; 10081: rechazado con su mensaje.

## 7. Fuera de alcance

- Historial de objetivos por semana, comparación entre semanas o registro de semanas
  cumplidas.
- Objetivos diarios, mensuales o por tema.
- Rachas de objetivos cumplidos, insignias, confeti o animaciones de celebración.
- Avisos, recordatorios, notificaciones o sonidos.
- Prorrateo del objetivo por días transcurridos o por días festivos.
- Introducir el objetivo en horas o en otro formato distinto de minutos.
- Sanear, redondear o cambiar el cálculo de la estadística «Esta semana», del mapa de calor,
  de la racha, del récord o de los días del mes.
- Cambiar la clave o la forma de los datos de las sesiones.
- Editar o eliminar sesiones desde el bloque del objetivo.
- Exportación, impresión o sincronización entre dispositivos.
- Selección de zona horaria o corrección del reloj del sistema.

## 8. Estrategia de verificación

### 8.1 Pruebas automáticas de lógica pura (`node --test`)

La lógica se separa de la interfaz y del almacenamiento, recibe las sesiones, el objetivo y
la fecha de referencia como datos, y no lee el reloj. Debe probarse:

1. **Validación del objetivo**: 1 y 10080 válidos; 0, negativos, decimales con punto y con
   coma, notación científica («3e2»), signo positivo («+300»), texto, `null`, `NaN`,
   `Infinity` y fuera de rango rechazados, cada uno con el mensaje del orden de comprobación
   de CA-4.5; espacios exteriores aceptados.
2. **Lectura del objetivo guardado**: objeto válido, JSON corrupto, forma incorrecta, valor
   fuera de rango y clave ausente → sin objetivo; nunca se lanza una excepción; el objetivo
   guardado no se modifica al leerlo.
3. **Rango semanal**: lunes a domingo para cada día de la semana; domingo 23:59; lunes
   00:00; semana que cruza mes y año; 29 de febrero; días de cambio de hora estacional.
4. **Minutos de la semana**: sesiones antes, dentro y después de la semana; sesión de hoy;
   sesiones futuras; varias sesiones el mismo día; minutos 0, negativos, `NaN`, `Infinity` y
   en texto; fechas mal formadas; identificadores duplicados, contando solo la primera
   aparición aunque sea inválida o futura (sesión futura seguida de otra válida con el mismo
   identificador → 0 minutos).
5. **Redondeo**: total 14,5 → 15; totales enteros sin cambios; el redondeo no afecta a la
   estadística «Esta semana».
6. **Porcentaje**: 0 % con 0 minutos; 1 % cuando hay actividad y el redondeo daría 0 (1 de
   10080); 99 % cuando el redondeo daría 100 sin alcanzar (299 de 300); 33, 40, 100, 115 y
   300 % como valores reales.
7. **Restante y barra**: restante con mínimo 0 y en singular cuando vale 1; proporción de
   barra limitada a 1 en el objetivo cumplido y superado.
8. **Estados**: los cinco estados (sin objetivo, sin actividad, en progreso, cumplido y
   superado) con sus textos en español, singular y plural.
9. **Texto accesible**: rango de la semana, incluido el cruce de mes y de año, minutos,
   porcentaje y estado.
10. **Determinismo, no mutación y pureza**: misma entrada, mismo resultado; las sesiones
    recibidas no se modifican; el módulo no contiene `document`, `localStorage`, `Date.now`
    ni `new Date()` sin argumentos.

### 8.2 Verificación manual en Chrome

- Los cinco estados se ven correctamente con datos de prueba y tras recargar.
- Fijar, editar y quitar el objetivo, con validación de entradas vacías, 0, negativos («-5»),
  decimales con coma y con punto, notación científica («3e2»), signo positivo («+300»),
  10081 y texto, cada una con su mensaje.
- Con datos corruptos en el almacenamiento (sesión futura y después válida con el mismo
  identificador, minutos en texto, fecha mal formada), el progreso del objetivo las ignora
  una a una y «Esta semana» no cambia respecto a antes de esta funcionalidad.
- Cancelar y Escape cierran el formulario sin guardar y devuelven el foco.
- Con objetivo corrupto guardado: campo vacío y sin botón «Quitar objetivo».
- Registrar una sesión actualiza el progreso sin recargar; una sesión futura no lo cambia.
- Cambiar el objetivo a mitad de semana recalcula al instante el progreso de la semana en
  curso, sin prorrateo.
- Con el formulario abierto, registrar una sesión, esperar la medianoche y volver a la
  pestaña: el formulario sigue abierto con su texto y su foco.
- Comprobar que no aparece ningún historial de semanas anteriores ni avisos al terminar la
  semana.
- Cambiar el día (reloj del sistema o emulación por CDP) reinicia el progreso el lunes y lo
  mantiene el resto de días, sin acumular temporizadores.
- Dos pestañas sincronizan sesiones, objetivo y borrado completo del almacenamiento.
- Recorrido completo con teclado y comprobación del nombre y el valor accesibles de la barra
  con el inspector de accesibilidad.
- Vistas a 320, 375 y 1280 px sin scroll horizontal y sin textos cortados.
- Con 1000 sesiones, el recálculo se mide con las herramientas del navegador y queda por
  debajo de 50 ms.
- Consola limpia; «Esta semana», racha, récord, mes, mapa y lista sin cambios.

## 9. Criterios de finalización

1. Se puede fijar un objetivo de 300 minutos y sigue ahí tras recargar y tras cerrar el
   navegador.
2. Con 120 minutos esta semana y objetivo 300, se ve «120 de 300 min · 40 %» y «Te faltan 180
   min».
3. Con 0 minutos y objetivo 300, se ve 0 %, la barra vacía y «Te faltan 300 min».
4. Con 300 minutos exactos se ve «¡Objetivo cumplido!» y 100 %, sin mensaje de sobrante.
5. Con 345 minutos y objetivo 300 se ve «¡Objetivo superado! +45 min», 115 % y la barra
   llena, sin desbordarse.
6. Sin objetivo guardado se ve «Aún no tienes un objetivo semanal», la explicación y el botón
   «Fijar objetivo».
7. Se puede editar y quitar el objetivo; al quitarlo se elimina su clave, vuelve el estado
   sin objetivo y las sesiones siguen intactas.
8. Las entradas vacías, 0, negativas, con signo positivo, en notación científica, decimales,
   con letras, con espacios interiores y mayores que 10080 muestran su mensaje exacto y no se
   guardan, sin que el navegador las convierta antes.
9. Con objetivo 10080 y 1 minuto estudiado se ve 1 % (no 0 %), y con 299 de 300 se ve 99 % (no
   100 %) y «Te falta 1 min».
10. El objetivo 10080 se acepta y 10081 se rechaza con su mensaje.
11. Registrar una sesión de hoy actualiza el progreso sin recargar; una sesión futura no lo
    cambia.
12. Cambiar el objetivo un miércoles recalcula al instante el progreso de esa misma semana,
    sin prorrateo y sin esperar al lunes.
13. Al cambiar de semana el progreso vuelve a 0 y el objetivo se conserva.
14. Solo se muestra el progreso de la semana en curso: no aparecen semanas anteriores ni
    avisos al terminar la semana.
15. El objetivo guardado corrupto se trata como sin objetivo, no se borra y el formulario
    abre vacío y sin «Quitar objetivo».
16. Las sesiones inválidas (minutos 0, negativos, `NaN`, `Infinity`, texto o fecha mal
    formada) se ignoran una a una y las demás siguen contando, sin borrar ni reescribir nada.
17. Con identificadores duplicados, el objetivo cuenta solo la primera aparición, sea válida,
    inválida o futura, y la diferencia con «Esta semana» queda documentada.
18. Si el almacenamiento falla al guardar o al quitar, aparece «No se pudo guardar el
    objetivo. Inténtalo de nuevo.» y el estado anterior sigue visible.
19. Los recálculos por sesión, medianoche, vuelta a la pestaña o cambio en otra pestaña no
    cierran el formulario, no borran lo escrito ni roban el foco.
20. El borrado completo del almacenamiento desde otra pestaña devuelve la vista a sin
    objetivo y 0 minutos.
21. A 320 px no hay desplazamiento horizontal y el formulario es usable con el pulgar.
22. La barra tiene nombre y valor accesibles, los cambios de objetivo se anuncian y todo se
    opera con teclado.
23. «Esta semana» sigue mostrando el mismo valor que antes para los mismos datos: sin sanear
    y sin redondear.
24. Racha, récord, mes, mapa de calor y lista siguen funcionando igual.
25. Con 1000 sesiones, el recálculo tarda menos de 50 ms según las herramientas del navegador.
26. La consola del navegador no muestra errores.
27. Las pruebas de la lógica pasan con `node --test` sin instalar paquetes.
28. `MEMORY.md` y `AGENTS.md` quedan actualizados con la clave y la forma reales de los datos.

## 10. Decisiones confirmadas y asumidas

Las decisiones marcadas **(usuario)** fueron confirmadas por la persona usuaria el 19 de
octubre de 2026. Las marcadas **(equipo)** son resoluciones menores tomadas para cerrar los
hallazgos de la revisión, eligiendo siempre la opción más simple, y no cambian el
comportamiento de producto. Cada una indica la alternativa descartada.

- **(usuario) Objetivo fijo y recurrente**: un único valor en minutos que se repite todas las
  semanas, incluida la actual. Alternativa descartada: un objetivo distinto por semana con
  historial.
- **(usuario) Objetivo reversible**: se puede quitar y volver al estado sin objetivo,
  conservando las sesiones. Alternativa descartada: permitir solo cambiar el valor.
- **(usuario) Edición en la tarjeta «Esta semana»**: el bloque vive bajo el total semanal,
  con un formulario en línea. Alternativa descartada: una sección aparte.
- **(usuario) Progreso completo**: minutos llevados frente al objetivo, barra visual,
  porcentaje y «Te faltan X min». Alternativa descartada: mostrar solo el texto.
- **(usuario) Exceso**: «¡Objetivo superado! +Z min» junto a «X de N min · P %» y la barra
  llena. Alternativa descartada: una celebración animada.
- **(usuario) Cambio inmediato a mitad de semana**: el nuevo objetivo se aplica en el acto a
  la semana en curso. Alternativa descartada: aplicarlo desde el lunes siguiente.
- **(usuario) Sin historial ni avisos**: solo el progreso de la semana actual. Alternativa
  descartada: un historial de objetivos.
- **(usuario) Corrección de `AGENTS.md`**: se aprueba corregir la clave y la forma de datos
  obsoletas durante la implementación. Alternativa descartada: dejar la documentación como
  está y convivir con el error.
- **(usuario) Definición estricta propia del total semanal**: el objetivo sanea, deduplica por
  identificador y redondea por su cuenta; «Esta semana» no se toca. Alternativa descartada:
  sanear y redondear también «Esta semana», que cambiaría una estadística ya existente.
- **(usuario) Duplicados**: cuenta solo la primera aparición con cada identificador, sea
  válida, inválida o futura, como el mapa de calor. Alternativa descartada: contarlas todas,
  que inflaría el progreso con datos corruptos.
- **(usuario) Redondeo solo en el objetivo**: «Esta semana» conserva su valor literal.
  Alternativa descartada: redondear ambos, que alteraría el valor que ya se muestra hoy.
- **(equipo) Porcentaje**: se redondea al entero más cercano con dos salvaguardas: 1 % cuando
  hay actividad y el redondeo daría 0, y 99 % cuando el redondeo daría 100 sin alcanzar el
  objetivo. Alternativa descartada: truncar, que mostraría 0 % habiendo estudiado y 99,67 %
  como 99 % sin necesidad de la regla.
- **(equipo) Orden de cálculo**: total redondeado, porcentaje, restante, barra y estado.
  Alternativa descartada: calcular el porcentaje sobre el total sin redondear, que puede
  mostrar 100 % con «Te falta 1 min».
- **(equipo) Validación sobre el texto literal**: el campo conserva lo escrito y se valida
  como texto, con un orden fijo de comprobaciones, para poder rechazar «3e2», «+300» y «-5»
  con un mensaje propio y no depender de la conversión a número del navegador. Alternativa
  descartada: leer el valor numérico del campo, que convertiría «3e2» en 300 y lo aceptaría.
- **(equipo) Cifras sin separador de miles**: «10080 min», para no depender de la
  configuración regional. Alternativa descartada: «10 080 min».
- **(equipo) Quitar con `removeItem`**: la clave desaparece en lugar de guardar un valor
  nulo. Alternativa descartada: guardar `{ minutos: null }`, que exigiría más reglas.
- **(equipo) Guardar el mismo valor no reescribe**: se cierra el formulario sin cambios ni
  avisos a otras pestañas. Alternativa descartada: reescribir siempre, que genera eventos
  innecesarios.
- **(equipo) Objetivo corrupto**: se muestra sin objetivo, el campo abre vacío y el botón
  «Quitar objetivo» no aparece, porque no hay objetivo válido que quitar. Alternativa
  descartada: precargar el valor corrupto, que confundiría.
- **(equipo) Sin interferencia**: ningún recálculo cierra el formulario, borra lo escrito,
  mueve el foco ni muestra errores, y el temporizador de medianoche sigue siendo único.
  Alternativa descartada: repintar toda la tarjeta desde cero, que rompería la edición.
- **(equipo) Sincronización completa**: se atienden las dos claves y el borrado total del
  almacenamiento; con el formulario abierto prevalece el texto del campo al guardar.
  Alternativa descartada: ignorar el borrado completo, que dejaría la vista desactualizada.
- **(equipo) Anuncio accesible**: el estado se anuncia al cambiar el objetivo, no en cada
  repintado, para no saturar al lector de pantalla. Alternativa descartada: anunciar cada
  recálculo.
- **(equipo) Reutilización de fechas**: el cálculo reutiliza las funciones puras de fecha ya
  existentes en el proyecto (parseo `AAAA-MM-DD`, suma de días, lunes de la semana,
  aritmética a mediodía local) y no duplica reglas de calendario; lo que hoy vive en `app.js`
  leyendo el reloj se sustituye por entradas explícitas: la fecha de referencia llega como
  parámetro. Alternativa descartada: reimplementar el calendario desde cero.
- **(equipo) Pruebas**: la lógica se prueba con `node --test` por exigencia de la
  constitución; la interfaz se verifica manualmente en Chrome.

## 11. Dudas abiertas

Ninguna. Todas las decisiones de producto están confirmadas y las resoluciones menores de la
revisión están recogidas en la sección 10.

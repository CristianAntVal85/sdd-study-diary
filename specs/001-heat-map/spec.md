# Spec 001 — Mapa de calor de estudio

## 1. Contexto y objetivo

El Diario de Estudio ya registra sesiones y muestra racha actual, récord, minutos de la
semana y días del mes. Esos números resumen el esfuerzo, pero no dejan ver el hábito:
los huecos, las rachas cortas y los días intensos quedan ocultos.

Objetivo: ofrecer una vista visual de las últimas 12 semanas donde cada día estudiado se
colorea según los minutos dedicados, para que la persona vea de un vistazo su constancia
y detecte patrones (días fuertes, días flojos, ausencias).

El mapa se sitúa entre las estadísticas actuales (racha, récord y semana) y el formulario
de registro, con el título «Mapa de calor».

## 2. Usuarios

- **Persona que estudia** (usuario principal): registra sesiones a diario o casi a diario y
  quiere motivación visual sin analizar tablas.
- **Persona que navega con teclado o lector de pantalla**: necesita consultar el mapa sin
  depender del ratón ni del color.
- **Persona que mantiene el proyecto** (usuario secundario): necesita que la funcionalidad
  sea comprensible y verificable sin herramientas avanzadas.

## 3. Historias de usuario

- **HU-1**: Como persona que estudia, quiero ver mis últimas 12 semanas en un mapa para
  comprobar de un vistazo si mantengo el hábito.
- **HU-2**: Como persona que estudia, quiero que los días con más minutos destaquen más,
  para identificar mis mejores días y compararlos.
- **HU-3**: Como persona que estudia, quiero consultar cuántos minutos estudié un día
  concreto, para recordar qué hice ese día.
- **HU-4**: Como persona que estudia desde el móvil, quiero ver el mapa completo sin
  desplazamiento horizontal, para consultarlo cómodamente.
- **HU-5**: Como persona que usa teclado o lector de pantalla, quiero recorrer el mapa y
  conocer la fecha y los minutos de cada día, para obtener la misma información que con
  el ratón.

## 4. Requisitos funcionales

### RF-1 — Periodo y cuadrícula

El mapa cubre las 12 semanas naturales (lunes a domingo) que terminan en la semana que
contiene la fecha actual. La última columna es la semana en curso.

- **CA-1.1** (ubicuo) El sistema debe mostrar 12 columnas semanales y 7 filas diarias:
  84 celdas, una por fecha.
- **CA-1.2** (ubicuo) El sistema debe comenzar en el lunes de la semana situada 11 semanas
  antes de la semana actual y terminar en el domingo de la semana actual.
- **CA-1.3** (ubicuo) El sistema debe ordenar cada columna de lunes a domingo y las columnas
  de la más antigua a la más reciente.
- **CA-1.4** (condición) Si una fecha es posterior a hoy, entonces el sistema debe mostrarla
  en gris neutro, sin minutos, sin información emergente y fuera del recorrido de teclado y
  de lector de pantalla.

Ejemplo verificable: con fecha de referencia el lunes 19 de octubre de 2026, el periodo va
del lunes 3 de agosto al domingo 25 de octubre de 2026.

### RF-2 — Minutos por día

Los minutos de un día son la suma de los minutos válidos de las sesiones registradas con esa
fecha local. Las sesiones con fecha posterior a hoy no cuentan.

- **CA-2.1** (ubicuo) El sistema debe sumar los minutos válidos de todas las sesiones de un
  mismo día en un único valor diario.
- **CA-2.2** (condición) Si una sesión tiene fecha posterior a hoy, entonces el sistema debe
  ignorarla por completo (ni color, ni minutos, ni información emergente).
- **CA-2.3** (condición) Si una sesión tiene fecha anterior al inicio del periodo, entonces
  el sistema no debe representarla en el mapa.
- **CA-2.4** (ubicuo) El sistema debe agrupar por fecha local, sin que los cambios de hora
  estacionales alteren el día asignado a una sesión.

### RF-3 — Intensidad del color

Cada día se representa con uno de cinco estados, según sus minutos totales:

| Estado | Minutos del día |
| --- | --- |
| Sin estudio | 0 |
| Nivel 1 | 1 a 14 |
| Nivel 2 | 15 a 29 |
| Nivel 3 | 30 a 59 |
| Nivel 4 | 60 o más |

- **CA-3.1** (ubicuo) El sistema debe mostrar los días sin estudio en gris neutro,
  claramente distinto de los cuatro niveles.
- **CA-3.2** (ubicuo) El sistema debe asignar el nivel según los umbrales de la tabla,
  incluyendo los valores límite (1, 15, 30 y 60) en el nivel superior correspondiente.
- **CA-3.3** (ubicuo) El sistema debe usar la escala naranja de la marca con intensidad
  creciente; los cinco estados deben seguir siendo distinguibles en una imagen en escala
  de grises.
- **CA-3.4** (ubicuo) El sistema debe separar visualmente las celdas para que cada día sea
  identificable de forma individual.

### RF-4 — Etiquetas

- **CA-4.1** (ubicuo) El sistema debe mostrar una etiqueta de mes de tres letras sobre la
  primera columna de cada mes y sobre la primera columna del periodo.
- **CA-4.2** (ubicuo) El sistema debe mostrar las iniciales «L M X J V S D» a la izquierda,
  alineadas con las siete filas.
- **CA-4.3** (condición) Si la pantalla mide 320 px de ancho, entonces las etiquetas y las
  celdas deben seguir siendo legibles y no deben provocar desplazamiento horizontal.

### RF-5 — Consulta de un día

- **CA-5.1** (evento) Cuando el puntero entra en un día con estudio, el sistema debe mostrar
  la fecha abreviada y los minutos totales, con el formato «19 oct · 45 min».
- **CA-5.2** (evento) Cuando la persona toca un día con estudio en una pantalla táctil, el
  sistema debe mostrar la misma información.
- **CA-5.3** (evento) Cuando un día con estudio recibe el foco, el sistema debe mostrar la
  misma información.
- **CA-5.4** (condición) Si el día no tiene estudio o es futuro, entonces el sistema no debe
  mostrar información emergente.
- **CA-5.5** (evento) Cuando se toca de nuevo la celda, se toca fuera del mapa, se hace
  scroll, se pulsa Escape o el foco sale del mapa, el sistema debe ocultar la información.
- **CA-5.6** (ubicuo) El sistema no debe mostrar más de una información emergente a la vez y
  debe mantenerla dentro de la ventana, ajustándola si se acerca a un borde.
- **CA-5.7** (ubicuo) El sistema debe usar «1 min» para un único minuto y omitir el año en
  la fecha.

### RF-6 — Teclado y lectores de pantalla

- **CA-6.1** (ubicuo) El mapa debe ser una sola parada de tabulación.
- **CA-6.2** (evento) Cuando el mapa tiene el foco, las flechas izquierda y derecha deben
  mover el foco a la semana anterior o siguiente, y las flechas arriba y abajo al día
  anterior o siguiente, sin salir del periodo visible.
- **CA-6.3** (ubicuo) El foco debe ser visible y tener contraste suficiente con las celdas
  y con el fondo.
- **CA-6.4** (ubicuo) Cada día debe anunciar su fecha y sus minutos, por ejemplo «lunes 19
  de octubre, 45 minutos de estudio» o «martes 20 de octubre, sin sesiones».
- **CA-6.5** (ubicuo) Antes de la cuadrícula debe leerse un resumen con el periodo y el
  número de días con estudio, por ejemplo «Del 3 de agosto al 19 de octubre: 23 días con
  estudio».
- **CA-6.6** (ubicuo) Las celdas futuras no deben ser alcanzables por teclado ni anunciadas
  por el lector de pantalla.

### RF-7 — Actualización

- **CA-7.1** (evento) Cuando se registra una sesión con fecha de hoy o pasada, el sistema
  debe actualizar el mapa sin recargar la página.
- **CA-7.2** (evento) Cuando se registra una sesión con fecha futura, el sistema no debe
  modificar el mapa.
- **CA-7.3** (evento) Cuando cambia el día local con la página abierta, el sistema debe
  recalcular y repintar el mapa.
- **CA-7.4** (evento) Cuando la pestaña vuelve a estar visible después de estar oculta, el
  sistema debe recalcular el mapa y cerrar cualquier información emergente abierta.
- **CA-7.5** (evento) Cuando los datos cambian en otra pestaña del navegador, el sistema debe
  actualizar el mapa.

### RF-8 — Datos y coherencia

- **CA-8.1** (ubicuo) El mapa debe usar exactamente las mismas sesiones que el resto de
  estadísticas de la aplicación.
- **CA-8.2** (ubicuo) El mapa no debe escribir, modificar ni eliminar ninguna sesión
  guardada.
- **CA-8.3** (condición) Si una sesión no tiene una fecha válida o sus minutos no son un
  número finito mayor que cero, entonces el sistema debe ignorarla para el mapa y conservarla
  intacta en el almacenamiento.
- **CA-8.4** (ubicuo) El sistema debe sumar los minutos fraccionarios y redondear el total
  diario al minuto entero más cercano para asignar el nivel y mostrar el texto.
- **CA-8.5** (condición) Si los datos guardados están corruptos o no tienen el formato
  esperado, entonces el sistema debe mostrar el mapa vacío sin borrar ni reescribir nada.

## 5. Requisitos no funcionales

- **RNF-1** (responsive) A 320 px y a 375 px de ancho, el mapa debe verse completo, sin
  desplazamiento horizontal, con celdas y etiquetas legibles.
- **RNF-2** (accesibilidad) El mapa debe cumplir WCAG 2.1 nivel AA: foco visible, contraste
  suficiente y alternativa textual para cada día.
- **RNF-3** (rendimiento) Con hasta 1000 sesiones, el cálculo y el repintado deben completarse
  en menos de 100 ms en un equipo de gama media, medido con las herramientas del navegador.
- **RNF-4** (determinismo) Con las mismas sesiones y la misma fecha de referencia, el mapa
  debe ser siempre idéntico; la fecha de referencia se recibe como dato de entrada.
- **RNF-5** (datos) El mapa debe ser de solo lectura: no altera el formato, la clave ni el
  contenido de los datos ya guardados.
- **RNF-6** (simplicidad) La funcionalidad no debe requerir instalación, dependencias,
  servidor ni pasos de compilación; debe funcionar abriendo la aplicación con doble clic
  desde el sistema de archivos.
- **RNF-7** (idioma) Todos los textos visibles deben estar en español.
- **RNF-8** (pruebas) La lógica de periodo, agrupación, niveles y exclusión de fechas futuras
  debe estar cubierta por pruebas automatizadas con `node --test`, sin instalar paquetes; no
  se puede dar por terminada con pruebas en rojo.

Estos requisitos se aplican junto con `docs/constitution.md`.

## 6. Casos límite

- Sin ninguna sesión: los 84 días se muestran en gris, sin información emergente, y el
  resumen indica 0 días con estudio.
- Solo hay sesiones con fecha futura: todos los días se muestran en gris.
- Sesiones anteriores al inicio del periodo: no aparecen ni afectan al resumen.
- Varias sesiones el mismo día: se suman; el día cuenta una sola vez.
- Día con exactamente 15, 30 o 60 minutos: nivel 2, 3 y 4 respectivamente.
- Sesión con 0, minutos negativos o minutos en texto: se ignora, pero las demás sesiones
  válidas de ese día siguen sumando.
- Total diario fraccionario, por ejemplo 14,5: se redondea a 15 y se clasifica como nivel 2.
- Sesión registrada a las 00:30: pertenece al día local en que se registró.
- Medianoche con la página abierta: el mapa se recalcula, el periodo puede desplazarse una
  columna y la información emergente se cierra.
- Cambio de domingo a lunes: la semana actual pasa a ser la siguiente y el periodo avanza.
- Cambio de hora estacional: el día no se duplica ni se pierde.
- Año bisiesto: el 29 de febrero se trata como cualquier otro día.
- Periodo que cruza un cambio de mes o de año: las etiquetas de mes siguen siendo correctas.
- Hoy es lunes: hoy es la primera celda de la última columna. Hoy es domingo: hoy es la
  última celda del periodo.
- Sesión con fecha de hoy: cuenta (límite superior inclusivo); solo se excluye lo posterior
  a hoy.
- Información emergente cerca de un borde: se ajusta para no salir de la ventana.
- Rotación de pantalla o cambio de tamaño con la información abierta: se recoloca o se
  cierra sin dejar restos.
- Zoom del navegador al 400 % sobre una ventana de 1280 px: el mapa se adapta como a 320 px.
- Datos corruptos, almacenamiento vacío o sesiones sin fecha: mapa vacío y datos intactos.
- Dos sesiones con el mismo identificador: solo cuenta la primera.
- Datos modificados en otra pestaña: el mapa se actualiza al recibir el cambio.

## 7. Fuera de alcance

- Navegación a periodos anteriores o posteriores.
- Registrar, editar o eliminar sesiones desde el mapa.
- Filtrar por tema o por duración.
- Leyenda, configuración de umbrales o de colores.
- Objetivos diarios, comparaciones entre periodos, exportación o impresión.
- Avisos o cambios en el formulario por registrar fechas futuras.
- Cambios en el formato de los datos, en las estadísticas existentes o en la racha.
- Selección de zona horaria o corrección del reloj del sistema.

## 8. Criterios de finalización

1. Con fecha de referencia el lunes 19 de octubre de 2026, el mapa muestra 12 columnas y
   84 celdas, de la semana del 3 de agosto a la del 25 de octubre.
2. Los cinco estados se alcanzan con datos de prueba en los valores límite (0, 1, 14, 15,
   29, 30, 59 y 60 minutos).
3. Los días futuros de la semana actual se ven en gris, no muestran información y no reciben
   foco.
4. La consulta de un día muestra «19 oct · 45 min» y se cierra al tocar de nuevo, tocar
   fuera, hacer scroll o pulsar Escape.
5. El mapa se recorre con las flechas, el foco es visible y un lector de pantalla anuncia
   fecha y minutos de cada día.
6. A 320 px de ancho no hay desplazamiento horizontal y las etiquetas de meses y días se
   leen.
7. Registrar una sesión de hoy actualiza el mapa sin recargar; registrar una futura no lo
   cambia.
8. Al simular el cambio de día y la vuelta a la pestaña, el mapa se recalcula.
9. Los datos inválidos se ignoran en el mapa y permanecen intactos en el almacenamiento.
10. La consola del navegador no muestra errores.
11. Racha, récord, semana, mes y lista de sesiones siguen funcionando igual.
12. Las pruebas de la lógica pasan con `node --test` sin instalar paquetes.
13. `MEMORY.md` queda actualizado al terminar.

## 9. Decisiones asumidas

Estas decisiones resuelven las dudas del QA y no requieren nueva confirmación:

- **Etiquetas**: meses siempre a tres letras y una sola vez por mes, en su primera columna;
  días con una letra. Evita repetir información y ahorra ancho en móvil.
- **Fecha del texto**: sin año y con «min»; el periodo nunca supera 12 semanas y el año se
  deduce del contexto.
- **Días futuros**: visibles en gris, pero fuera del foco y del lector de pantalla, para no
  anunciar días que aún no existen.
- **Resumen accesible**: termina en hoy, no en el domingo futuro, porque los días futuros no
  aportan información.
- **Minutos válidos**: número finito mayor que cero; los fraccionarios se redondean al entero
  más cercano (mitad hacia arriba) para clasificar y mostrar.
- **Identificadores duplicados**: cuenta solo la primera sesión con ese identificador, para
  evitar doble cómputo de datos corruptos.
- **Datos corruptos**: se muestran como mapa vacío y nunca se corrigen ni se borran.
- **Información emergente**: una sola a la vez, ajustada a la ventana y cerrada al hacer
  scroll o al volver a la pestaña.
- **Navegación por teclado**: una parada de tabulación y flechas dentro del mapa; izquierda y
  derecha cambian de semana, arriba y abajo de día.
- **Reflow**: se verifica a 320 px, equivalente a 1280 px con zoom al 400 %.
- **Pruebas**: la lógica se prueba con `node --test` por exigencia de la constitución, aunque
  la interfaz se verifique manualmente.
- **Sin leyenda**: las etiquetas, la información emergente y el resumen accesible cubren la
  información; una leyenda queda fuera de alcance.

## 10. Dudas abiertas

Ninguna. Todas las ambigüedades detectadas en la revisión de QA están resueltas en esta
versión de la spec.

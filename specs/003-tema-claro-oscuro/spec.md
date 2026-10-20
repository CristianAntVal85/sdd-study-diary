# Spec 003 — Tema claro y oscuro

**Estado:** aprobada (20 de octubre de 2026). Las decisiones de producto están confirmadas por la
persona usuaria (sección 10); el plan técnico y las tareas están en `plan.md` y `tasks.md`.

**Enmienda 003.1 (20 de octubre de 2026):** el botón pasa a ser un botón de acción, con etiqueta e
icono que nombran el tema al que se cambia y sin `aria-pressed` (sección 12). Sustituye el
interruptor con etiqueta fija de la versión aprobada; el resto de la spec no cambia.

## 1. Contexto y objetivo

El Diario de Estudio tiene hoy una única apariencia: papel claro con cuadrícula, tarjetas
blancas y acento naranja. Quien estudia de noche, con la luz apagada, recibe una pantalla muy
luminosa; quien tiene el sistema en modo oscuro ve la aplicación desentonar con el resto de sus
ventanas.

Objetivo: ofrecer un tema oscuro completo y un botón para alternar entre claro y oscuro,
situado arriba a la derecha y mimetizado con el diseño «bitácora» actual. Al abrir por primera
vez, la aplicación debe usar el tema que prefiere el navegador, sin destellos ni saltos, y
recordar la elección de la persona cuando esta la haga explícitamente.

El botón es un botón de acción: su etiqueta y su icono nombran el tema al que se cambia. Con el
tema claro muestra la luna y «Modo oscuro»; con el tema oscuro, el sol y «Modo claro». Con el
tema oscuro el botón conserva además el estilo destacado —fondo y borde propios— que indica que
ese es el tema en uso. Mientras la persona no haya elegido, la aplicación funciona en un modo
automático interno que sigue al navegador; ese modo no aparece en la interfaz, que solo ofrece
claro y oscuro.

El tema es una preferencia de presentación: no cambia ningún dato ni ningún cálculo de estudio,
ni el contenido de la página. Solo cambia el color.

## 2. Usuarios

- **Persona que estudia de noche** (usuario principal): necesita una interfaz oscura para no
  deslumbrarse y para descansar la vista.
- **Persona que estudia de día**: quiere el tema claro de siempre y que la aplicación no le
  cambie sola la apariencia.
- **Persona que ya usa el modo oscuro en su sistema**: espera que la aplicación lo respete al
  abrirla, sin tener que configurar nada.
- **Persona que navega con teclado, lector de pantalla o alto contraste**: necesita operar el
  botón, saber en qué tema está y leer todo el contenido con contraste suficiente, sin depender
  del color.
- **Persona que mantiene el proyecto** (usuario secundario): necesita una solución simple, sin
  dependencias, que funcione con doble clic y que no ponga en riesgo las sesiones ya guardadas.

## 3. Historias de usuario

- **HU-1**: Como persona que estudia de noche, quiero una versión oscura de la aplicación para
  no deslumbrarme.
- **HU-2**: Como persona que tiene el sistema en modo oscuro, quiero que la aplicación se abra
  ya en oscuro, sin tener que pulsar nada.
- **HU-3**: Como persona que estudia, quiero cambiar de tema con un solo control visible arriba
  a la derecha, sin buscar ajustes escondidos.
- **HU-4**: Como persona que estudia, quiero que mi elección de tema siga ahí al recargar y al
  volver otro día.
- **HU-5**: Como persona que estudia, quiero que la aplicación no cambie de apariencia a mis
  espaldas cuando el sistema cambia de tema, si yo ya elegí uno.
- **HU-6**: Como persona que usa teclado o lector de pantalla, quiero saber qué hace el botón y
  en qué tema estoy, y ver el foco en todo momento.

## 4. Requisitos funcionales

### RF-1 — Botón de tema en la cabecera

- **CA-1.1** (ubicuo) El sistema debe mostrar un botón de tema en la zona superior del contenido,
  alineado a la derecha y separado del título «Diario de Estudio»; a partir de 375 px debe
  compartir fila con el título y a 320 px puede quedar en una fila propia, alineado también a la
  derecha (RF-8). Debe integrarse en la cabecera existente, sin crear una sección, tarjeta, barra
  de herramientas ni menú nuevos.
- **CA-1.2** (ubicuo) El botón debe parecer parte del diseño actual: forma de control compacto
  con borde y esquinas redondeadas como los botones secundarios, tipografía y tamaño de texto
  del proyecto y su icono con el mismo tratamiento sobrio que los iconos de la racha y del
  récord, es decir, el mismo tamaño, alineación y peso visual (el medio no se copia: los iconos
  actuales son emoji y el del botón es SVG). No debe ser un control flotante ajeno ni un enlace
  de texto suelto.
- **CA-1.3** (ubicuo) El botón debe mostrar un icono y una etiqueta visible que nombren la acción,
  en español: con el tema claro, luna y «Modo oscuro» (pasar a oscuro); con el tema oscuro, sol y
  «Modo claro» (pasar a claro). El icono debe ser SVG en línea —no emoji— y decorativo para la
  tecnología de asistencia, porque la etiqueta ya nombra la acción. En el tema oscuro el botón debe
  verse además destacado, con un fondo y un borde propios distintos de su aspecto en claro, de modo
  que el tema en uso no dependa solo del icono ni del texto.
- **CA-1.4** (ubicuo) El botón debe ser un botón de acción, no un interruptor con estado fijo: no
  debe llevar `aria-pressed` ni ningún otro estado pulsado, y su nombre accesible debe coincidir
  exactamente con la etiqueta visible de cada momento («Modo oscuro» en claro y «Modo claro» en
  oscuro). No debe existir ninguna otra forma de anunciar el estado ni un texto alternativo
  distinto del visible, y la etiqueta nunca debe reducirse ni abreviarse para que quepa.
- **CA-1.5** (ubicuo) El área táctil del botón debe medir al menos 44 × 44 px, contando relleno
  y borde, sin estirarse al ancho completo de la pantalla.
- **CA-1.6** (evento) Cuando la página se abre o se recarga, el botón debe reflejar el tema
  realmente aplicado —etiqueta, icono y estilo—, venga de una elección guardada, de una elección
  de la sesión o de la preferencia del navegador.
- **CA-1.7** (ubicuo) El botón debe ser el primer elemento enfocable de la página y su orden de
  tabulación debe coincidir con el visual: el recorrido empieza en la zona superior del
  contenido, alineado a la derecha —a partir de 375 px, en la fila del título— y sigue hacia el
  contenido.
- **CA-1.8** (ubicuo) El botón debe tener exactamente dos estados visibles, claro y oscuro. No
  debe existir en la interfaz ningún control, opción ni etiqueta de estado «automático» o
  «sistema»: el modo automático es interno y sigue al sistema mientras no haya una elección
  explícita, guardada o tomada en la sesión (CA-4.7 y RF-5).

### RF-2 — Alternancia entre claro y oscuro

- **CA-2.1** (evento) Cuando la persona activa el botón, el sistema debe cambiar entre claro y
  oscuro de inmediato, sin recargar la página, sin navegar y sin volver a calcular ni repintar
  los datos.
- **CA-2.2** (ubicuo) El cambio debe alcanzar a toda la interfaz visible: fondo de la página y
  su cuadrícula, título, textos y textos secundarios, tarjetas, tarjeta de racha, récord,
  estadísticas, formularios y campos con sus textos de ayuda, marcadores de posición y estados
  de foco, botones primario y secundario con sus estados normal, hover y activo, mensajes de
  error, barra de progreso del objetivo, mapa de calor con sus cinco niveles y sus días
  futuros, información emergente del mapa, insignias de minutos, lista de sesiones, estado
  vacío, selección de texto e indicadores de foco.
- **CA-2.3** (ubicuo) Alternar el tema no debe modificar ningún dato ni ningún cálculo de
  estudio: sesiones, racha, récord, «Esta semana», objetivo semanal, días del mes, mapa de
  calor y lista deben quedar exactamente iguales.
- **CA-2.4** (ubicuo) Alternar el tema no debe cerrar formularios, borrar lo escrito, mover el
  foco, perder el contexto de la información emergente ni mostrar mensajes; si la información
  emergente del mapa está abierta, debe seguir legible con la paleta nueva y su contorno.
- **CA-2.5** (ubicuo) Alternar el tema no debe mover la posición del desplazamiento ni
  reordenar bloques; el cambio es de color, no de estructura.
- **CA-2.6** (ubicuo) El cambio de colores debe ser instantáneo, sin mezcla de tonos entre un
  fotograma y el siguiente. Para lograrlo, las transiciones ya existentes de campos y botones
  deben neutralizarse mientras dura el cambio con una clase temporal en el elemento raíz
  (por ejemplo `theme-switching`), retirada en el fotograma siguiente; no debe quedar ninguna
  animación ni transición de color en curso al terminar el cambio.

### RF-3 — Tema inicial según el navegador

- **CA-3.1** (condición) Si no hay una elección guardada legible —porque la clave no existe o
  porque el almacenamiento no se puede leer— y el navegador prefiere el tema oscuro, entonces
  el sistema debe abrir en oscuro.
- **CA-3.2** (condición) Si no hay una elección guardada legible y el navegador prefiere el
  tema claro, no expresa ninguna preferencia o no puede expresarla, entonces el sistema debe
  abrir en claro. El tema claro es el punto de partida razonable: es la apariencia actual del
  proyecto y no impone una pantalla negra a quien nunca eligió nada.
- **CA-3.3** (ubicuo) El tema aplicable debe decidirse y aplicarse antes de la primera pintura:
  al abrir o recargar no debe verse ni un instante el tema contrario al que corresponde (sin
  destello). La resolución debe vivir en un módulo puro, `theme-logic.js`, cargado como script
  clásico local en la cabecera del documento, antes de la hoja de estilos y antes del resto de
  scripts, seguido de un script en línea que aplique el tema al documento y que sea el único
  punto que crea la consulta del sistema y su escucha (CA-5.6); justo después del botón, otro
  pequeño script en línea debe aplicarle el icono y la etiqueta que corresponden al tema aplicado.
  Todo ello ocurre antes de que se pinte el contenido, de modo que el botón nunca aparece con el
  texto o el icono del tema equivocado.
- **CA-3.4** (ubicuo) `theme-logic.js` debe ser el único sitio donde se decide el tema: el
  arranque, la interfaz y las pruebas deben usar sus funciones, sin duplicar reglas. Debe ser un
  módulo puro —sin documento, sin almacenamiento, sin `matchMedia` y sin reloj—, un IIFE que
  exponga `ThemeLogic` con export CommonJS protegido, como el resto de la lógica del proyecto, y
  debe ser el mismo módulo que se prueba con `node --test`. La parte no pura —crear la consulta
  del sistema, escuchar sus cambios, leer y escribir el almacenamiento y tocar el documento—
  vive en el arranque de la página, que solo llama a esas funciones puras.
- **CA-3.5** (ubicuo) Cargar scripts locales clásicos con `<script src>` es válido y es lo que
  ya hace el proyecto; lo prohibido es `fetch`, `XMLHttpRequest`, módulos ES, cualquier petición
  de red, un servidor o un paso de compilación. La comprobación inicial no debe retrasar la
  carga de forma perceptible ni añadir peticiones de red.
- **CA-3.6** (condición) Si el almacenamiento no está disponible o no se puede leer, entonces
  debe usarse el tema del sistema (CA-3.1 y CA-3.2) y la página debe seguir cargando con
  normalidad, sin excepciones ni mensajes de error visibles.

### RF-4 — Elección explícita y memoria

- **CA-4.1** (evento) Cuando la persona cambia el tema con el botón, el sistema debe guardar su
  elección en una clave propia, `estudioDiarioTema`, con la forma `{ "tema": "oscuro" }` o
  `{ "tema": "claro" }`.
- **CA-4.2** (ubicuo) La clave solo debe escribirse cuando la persona elija un tema: abrir la
  página, resolver el tema, repintar, sincronizar con otra pestaña o seguir al sistema no deben
  escribirla nunca.
- **CA-4.3** (ubicuo) La elección guardada debe respetarse al recargar, al cerrar y volver a
  abrir el navegador y al volver más tarde, con independencia de lo que prefiera el sistema en
  ese momento.
- **CA-4.4** (ubicuo) La lectura debe ser tolerante: si el valor guardado está corrupto, no es
  un objeto, no tiene `tema` o su `tema` no es exactamente `claro` u `oscuro`, debe tratarse
  como «sin elección», seguirse al navegador y conservarse el valor tal cual, sin borrarlo ni
  reescribirlo; solo se sustituye cuando la persona guarde una elección nueva.
- **CA-4.5** (ubicuo) Guardar el tema no debe crear, modificar ni borrar ninguna sesión ni el
  objetivo semanal: `estudioDiarioSesiones` y `estudioDiarioObjetivoSemanal` deben quedar
  intactas, byte a byte.
- **CA-4.6** (ubicuo) Guardar un tema igual al ya guardado no debe reescribir la clave ni
  provocar cambios en otras pestañas. Como el botón siempre alterna, la regla se resuelve en una
  función pura de decisión de escritura (tema pedido frente a tema guardado) y la aplicación solo
  escribe cuando el tema resultante difiere del guardado o el guardado es ilegible.
- **CA-4.7** (condición) Si el almacenamiento no está disponible o la escritura falla, entonces
  la pulsación debe contar como elección explícita durante la sesión actual: el tema cambia,
  deja de seguir al sistema y no se muestra ningún mensaje de error. Al recargar, como no se
  guardó nada, se vuelve a seguir al sistema.
- **CA-4.8** (ubicuo) La elección de tema es una preferencia de presentación: no debe influir
  en ninguna estadística ni en ninguna decisión de la aplicación.

### RF-5 — Modo automático interno y sincronización

- **CA-5.1** (evento) Mientras no haya elección explícita —ni guardada ni tomada en la sesión
  actual por un fallo de escritura—, cuando el sistema cambie de tema con la página abierta, la
  página debe seguir el cambio de inmediato, sin recargar.
- **CA-5.2** (condición) Si ya hay una elección guardada, entonces un cambio de tema del sistema
  no debe alterar la página, tampoco después de recargar. Una elección hecha solo en la sesión
  actual por un fallo de escritura se respeta únicamente en esa sesión (CA-4.7).
- **CA-5.3** (evento) Cuando el tema cambie en otra pestaña del mismo navegador, la página debe
  adoptarlo sin recargar, y el botón debe mostrar la etiqueta y el icono correspondientes.
- **CA-5.4** (condición) Si otra pestaña borra todo el almacenamiento o elimina la clave del
  tema, entonces la página debe volver al modo automático y seguir al navegador.
- **CA-5.5** (ubicuo) Ningún cambio de tema —por el botón, por el sistema o por otra pestaña—
  debe cerrar formularios, borrar lo escrito, mover el foco ni recalcular datos; no debe añadirse
  ningún anuncio adicional: la etiqueta del botón ya nombra la acción y el tema en uso se ve en su
  estilo (CA-7.3).
- **CA-5.6** (ubicuo) Debe existir una sola consulta de la preferencia del sistema
  `(prefers-color-scheme: dark)` y una sola escucha de sus cambios, cuando el navegador admite
  la consulta. Las crea el arranque no puro de la página —el script en línea de la cabecera—, no
  `theme-logic.js`, que solo recibe la preferencia como dato; `app.js` reutiliza la consulta o la
  suscripción única que ese arranque expone, sin crear otra. Alternar el tema, repintar o volver
  a la pestaña no debe crear consultas ni escuchas nuevas.

### RF-6 — Paleta oscura completa

- **CA-6.1** (ubicuo) El tema oscuro debe ser una paleta diseñada, no una inversión automática
  de colores. Debe conservar la identidad «bitácora»: papel con cuadrícula tenue, títulos con
  la tipografía serif, acento naranja, sombras duras y bordes definidos.
- **CA-6.2** (ubicuo) Las superficies deben seguir distinguiéndose entre sí, pero su separación
  no se exige por un contraste de 3:1: se aceptan los ratios medidos y documentados en la
  sección 10 (tarjeta sobre papel 1,11:1; bloque de racha sobre papel 1,07:1; campo sobre
  tarjeta 1,07:1; cuadrícula sobre papel 1,13:1), y la separación se refuerza con bordes,
  sombras y el propio contenido. Lo que no se admite es que dos superficies sean idénticas.
- **CA-6.3** (ubicuo) El mapa de calor debe conservar el estado sin estudio, los cuatro niveles
  de estudio y los días futuros, con luminancia estrictamente creciente y distinguibles también en
  una imagen en escala de grises; el estado sin estudio debe seguir viéndose sobre la tarjeta y
  los días futuros deben verse más apagados que él. En el tema oscuro, además, los pasos entre
  niveles contiguos deben quedar entre 1,42:1 y 1,72:1. El tema claro conserva sus pasos
  preexistentes —1,16:1, 1,36:1, 1,71:1 y 1,74:1— y no se modifica, por CA-6.6.
- **CA-6.4** (ubicuo) La barra de progreso del objetivo debe mantener su pista y su relleno
  claramente diferenciados (relleno sobre pista de 3:1 o más); los mensajes de error y las
  insignias de minutos deben conservar su fondo propio y su texto legible. La información
  emergente del mapa debe distinguirse de cualquier celda: su relleno solo alcanza 1,73:1 sobre
  el nivel 4 y 2,71:1 sobre el nivel 3, así que debe llevar un contorno de 2 px del color de su
  texto (8,2:1 sobre el nivel 4 y 5,2:1 sobre el nivel 3) además de su sombra.
- **CA-6.5** (ubicuo) El esquema de color del navegador debe corresponder al tema (`light` o
  `dark`), de modo que el selector de fecha, las barras de desplazamiento y el resaltado nativo
  no aparezcan en claro sobre la interfaz oscura ni al revés.
- **CA-6.6** (ubicuo) El tema claro debe conservar su aspecto actual, con una excepción: el botón
  de tema es nuevo y se integra con los tokens del tema claro (fondo blanco, texto tinta,
  `--line-control` y estado activado con fondo `#fdeee8`, borde `#b8360f` y texto `#101f38`).
  Los únicos ajustes de color permitidos en los elementos existentes son los cinco necesarios
  para cumplir RNF-2: halo de foco global, borde de los controles, color de selección, relleno de
  la barra de progreso y anillo de foco de los campos, con los valores de la sección 10. El borde
  general de tarjetas y separadores no debe cambiarse y la cabecera debe conservar la misma
  separación entre el título y su línea inferior (CA-8.5).
- **CA-6.7** (ubicuo) Cada tema debe tener su propio tono de acento para texto cuando el naranja
  de marca no alcance el contraste exigido sobre ese fondo; el naranja debe seguir siendo el
  color de marca en ambos temas, sin introducir una segunda familia de color.
- **CA-6.8** (ubicuo) Las sombras decorativas existentes —la sombra dura de las tarjetas, la de
  la fila del récord, la de la información emergente y la del botón primario al pulsarlo
  (`--shadow-press`)— deben tener su propio valor por tema, de modo que no quede ninguna sombra
  calculada con colores del tema claro cuando está activo el oscuro.

Componentes que la paleta oscura debe cubrir sin dejar ninguno con colores del tema claro:

| Componente | Debe conservar |
| --- | --- |
| Fondo de página y cuadrícula | papel oscuro reconocible, cuadrícula tenue, sin bandas |
| Título y textos | contraste de texto normal y de texto secundario |
| Tarjetas y sombras | separación entre tarjeta y fondo, sombra dura propia del tema |
| Tarjeta de racha | bloque destacado, número de racha, etiquetas |
| Botón de tema | aspecto normal en claro y destacado en oscuro, distinguibles por fondo y borde, no solo por icono |
| Botón primario | fondo naranja, texto oscuro legible, borde y sombra, estados hover y activo |
| Botón secundario | fondo, borde propio, texto y estado hover |
| Campos de formulario | fondo, borde propio, texto, marcador de posición, anillo de foco |
| Mensajes de error y ayudas | fondo de error, texto, borde de aviso |
| Barra de progreso | pista, relleno, borde |
| Mapa de calor | niveles 0 a 4, días futuros, celdas al pasar el puntero |
| Información emergente | fondo, texto, contorno, sombra propia del tema |
| Insignias, lista y fila al pasar | fondo de insignia, texto, separadores, realce de fila |
| Fila del récord | fondo, borde y sombra propia del tema |
| Estado vacío y selección | fondo, borde discontinuo, texto, color de selección |

### RF-7 — Accesibilidad

- **CA-7.1** (ubicuo) El botón debe ser operable con teclado mediante Enter y Espacio, sin
  atrapar el foco ni alterar el resto del recorrido.
- **CA-7.2** (ubicuo) El foco debe ser visible en el botón y en todos los controles en ambos
  temas, con un indicador de al menos 3:1 respecto a lo que lo rodea; no basta con un cambio
  sutil de tono.
- **CA-7.3** (ubicuo) El tema en uso no debe depender solo del color: deben coincidir siempre la
  etiqueta visible («Modo oscuro» en claro y «Modo claro» en oscuro), el icono (luna en claro y
  sol en oscuro), el nombre accesible —igual a la etiqueta del momento— y el estilo destacado del
  botón cuando el tema es el oscuro. No debe añadirse ninguna región viva ni `aria-pressed`: al
  cambiar la etiqueta y su nombre accesible, el botón ya anuncia la acción sin un segundo mensaje.
- **CA-7.4** (ubicuo) Las etiquetas, los iconos y los textos del botón deben estar en español,
  ser coherentes con el tema visible y no revelar información distinta de la que se ve.
- **CA-7.5** (condición) Si el sistema pide reducir el movimiento, entonces no debe haber
  ninguna animación ni transición asociada al cambio de tema.
- **CA-7.6** (condición) Si el navegador fuerza un modo de alto contraste, entonces el botón
  debe seguir siendo visible, operable y con su etiqueta legible, y el foco no debe perderse.
- **CA-7.7** (condición) Si se amplía la página hasta el 400 %, entonces la cabecera, el botón y
  el contenido deben seguir siendo utilizables y sin desplazamiento horizontal.

### RF-8 — Responsive y cabecera

- **CA-8.1** (condición) Si la pantalla mide 320 px de ancho, entonces la cabecera puede
  apilarse en dos filas: el título hasta en dos líneas y, debajo, el botón alineado al borde
  derecho del contenido. La etiqueta del botón puede ocupar dos líneas, pero su tamaño de letra
  no debe reducirse, no debe solaparse con el título y no debe aparecer desplazamiento
  horizontal.
- **CA-8.2** (condición) Si la pantalla mide 375 px o 1280 px, entonces el botón debe quedar en
  la misma fila que el título, alineado arriba a la derecha y con separación suficiente para no
  confundirse con él.
- **CA-8.3** (ubicuo) La cabecera debe conservar la alineación y los márgenes del contenido, y
  su línea inferior debe seguir cerrándola: el botón no debe desplazar, estrechar ni desalinear
  las tarjetas de debajo.
- **CA-8.4** (condición) Si el texto crece por el zoom del navegador o por el tamaño de letra
  del sistema, entonces la etiqueta debe seguir legible y completa, sin recortes, sin tapar el
  título y sin desplazamiento horizontal.
- **CA-8.5** (ubicuo) La cabecera actual es solo el título. El cambio debe envolver el título y
  el botón en un `<header class="app-header">` dentro del contenedor existente, con la línea
  inferior de 2 px en el propio header; el `h1` conserva tipografía, tamaño y color y deja de
  dibujar esa línea. El relleno inferior de 0,85 rem que hoy separa el título de su línea pasa
  del `h1` al header, de modo que esa separación no cambia. No debe ser un landmark de
  navegación —al estar dentro de `main` no crea un segundo banner— ni necesitar nombre
  accesible, y el orden del documento debe ser título y después botón.

### RF-9 — Datos y compatibilidad

- **CA-9.1** (ubicuo) El tema no debe alterar la lectura, el cálculo ni la escritura de las
  sesiones ni del objetivo semanal; la racha, el récord, «Esta semana», los días del mes, el
  mapa de calor y la lista deben seguir funcionando exactamente igual en ambos temas.
- **CA-9.2** (ubicuo) La funcionalidad debe seguir sin dependencias, sin instalación y sin paso
  de compilación; se permiten los scripts clásicos locales, como los que ya usa el proyecto, y
  se prohíben los módulos ES, `fetch`, `XMLHttpRequest` y cualquier petición de red. Debe
  funcionar con doble clic sobre el archivo de la página.
- **CA-9.3** (condición) Si falla la lectura o la escritura del tema, entonces el resto de la
  aplicación debe seguir funcionando: estadísticas, objetivo, mapa y lista se pintan igual.
- **CA-9.4** (ubicuo) La nueva clave debe ser opcional y compatible con lo ya guardado: su
  ausencia no debe cambiar ningún comportamiento existente ni exigir migraciones.
- **CA-9.5** (condición) Si el navegador no admite la consulta de preferencia de tema, entonces
  debe abrirse en claro y el botón debe seguir alternando y recordando la elección.
- **CA-9.6** (ubicuo) El tema no debe guardarse nunca en las claves de sesiones ni del objetivo,
  ni derivarse de ellas.

## 5. Requisitos no funcionales

- **RNF-1** (responsive) A 320 px, 375 px y 1280 px la cabecera con el botón debe verse
  completa, sin desplazamiento horizontal y sin solapamientos.
- **RNF-2** (accesibilidad) Ambos temas deben cumplir WCAG 2.1 nivel AA: texto normal con
  contraste de al menos 4,5:1, texto grande con al menos 3:1, indicadores de foco y límites de
  controles que solo se perciben por el borde con al menos 3:1, información nunca solo por color
  y todo operable con teclado. En el tema claro no cambia ningún elemento existente salvo los
  cinco ajustes de CA-6.6; el botón de tema es nuevo y se integra con los tokens claros.
- **RNF-3** (determinismo) Con la misma elección guardada y la misma preferencia del sistema, el
  tema aplicado debe ser siempre el mismo; la preferencia del sistema entra como dato, no se
  consulta dentro del módulo de decisión.
- **RNF-4** (sin destello) La primera pintura debe mostrar ya el tema correcto. La comprobación
  inicial debe resolverse en menos de 16 ms, no debe añadir peticiones de red y debe terminar
  antes del primer pintado del contenido.
- **RNF-5** (simplicidad) Sin dependencias, sin build, sin servidor y compatible con `file://`.
- **RNF-6** (idioma) Código en inglés; interfaz, textos del botón y documentación en español.
- **RNF-7** (pruebas) La lectura de la elección guardada, la resolución del tema, la alternancia,
  la serialización, la decisión de escritura y la etiqueta y el icono de acción del botón deben
  estar cubiertos en `tests/theme.test.js` con `node --test`, sin instalar paquetes; no se puede
  dar por terminada con pruebas en rojo.
- **RNF-8** (datos) Las sesiones y el objetivo semanal deben quedar intactos: misma clave, mismo
  formato y mismo contenido antes y después de usar el tema.
- **RNF-9** (sin regresiones) Racha, récord, «Esta semana», objetivo, días del mes, mapa de
  calor, formulario y lista deben comportarse igual que antes en ambos temas.
- **RNF-10** (pureza) El módulo que decide el tema no debe acceder al documento, al
  almacenamiento, a la consulta de preferencia del navegador ni al reloj, y no debe contener
  `matchMedia`: recibe la elección guardada (texto tal cual) y la preferencia del sistema como
  datos y devuelve el tema o la decisión de escribir. La consulta del sistema, su escucha, el
  almacenamiento y el documento quedan en el arranque no puro de la página.
- **RNF-11** (rendimiento) Alternar el tema no debe volver a pintar la lista de sesiones ni el
  mapa: con 1000 sesiones el cambio debe completarse en menos de 100 ms y sin recalcular
  estadísticas.
- **RNF-12** (documentación) `AGENTS.md` y `MEMORY.md` deben recoger al terminar la clave
  `estudioDiarioTema`, su forma y el modelo de decisión del tema; la clave debe figurar también
  en la lista «Para empezar de cero» de `AGENTS.md`, junto a las otras dos.
- **RNF-13** (una sola fuente de verdad) La decisión del tema debe existir una sola vez, en
  `theme-logic.js`; ni el script inicial ni `app.js` deben duplicar reglas de lectura,
  resolución o alternancia.

Estos requisitos se aplican junto con `docs/constitution.md`.

## 6. Casos límite

- Sin clave y sistema en oscuro: abre en oscuro. Sin clave y sistema en claro: abre en claro.
- Sin preferencia del sistema o navegador que no la admite: abre en claro.
- `localStorage` no disponible al cargar (bloqueado, cuota agotada, restringido en `file://`):
  abre con el tema del sistema, la aplicación funciona y no hay mensajes ni excepciones; el
  botón alterna en la sesión.
- La lectura del tema lanza una excepción con el almacenamiento disponible: se trata como «sin
  elección legible» y se usa el tema del sistema.
- Elección guardada «oscuro» con el sistema en claro: abre en oscuro. Elección «claro» con el
  sistema en oscuro: abre en claro.
- El sistema cambia de tema con la página abierta y no hay elección (ni guardada ni de sesión):
  la página sigue el cambio al instante.
- El sistema cambia de tema y hay elección: la página no cambia.
- Recarga tras elegir: se conserva la elección, aunque el sistema prefiera lo contrario.
- La escritura falla al elegir: el tema cambia, deja de seguir al sistema durante esa sesión, no
  aparece ningún mensaje y, al recargar, se vuelve a seguir al sistema.
- La escritura falla y después el sistema cambia de tema: la página no cambia en esa sesión.
- Valor corrupto en la clave del tema (`{tema:"oscuro"}` con comillas simples, `"oscuro"` suelto,
  `null`, `[]`, `{"modo":"oscuro"}`, `{"tema":"morado"}`, `{"tema":1}`): se sigue al navegador,
  el valor se conserva y el botón sigue funcionando; al elegir se sustituye por uno válido.
- Clave ausente: modo automático, sin escrituras.
- Dos pestañas abiertas: cambiar el tema en una lo cambia en la otra; si las dos cambian a la
  vez, gana la última escritura y ambas acaban en el mismo tema.
- Otra pestaña borra todo el almacenamiento: la vista vuelve al modo automático.
- Pulsaciones rápidas y repetidas: alterna en orden, termina en el estado esperado y no acumula
  consultas ni escuchas del sistema.
- Cambio de tema con el formulario de sesión a medio rellenar o el del objetivo abierto con un
  error visible: no se borra ni se cierra nada, el foco no se mueve y el tema cambia.
- Cambio de tema con la información emergente del mapa abierta sobre una celda de nivel 3 o 4:
  sigue legible gracias a su contorno y a la paleta nueva.
- Cambio de tema con el puntero sobre un botón o un campo (estado hover o transición en curso):
  el cambio es instantáneo, sin mezcla de colores.
- Página desplazada a mitad: alternar no cambia la posición del desplazamiento.
- Alternar diez veces con 1000 sesiones: la lista y el mapa no se reconstruyen y las cifras son
  idénticas.
- Botón con foco y pulsación con teclado: el foco se queda en el botón y no se dispara ningún
  desplazamiento.
- A 320 px: cabecera apilada, etiqueta en dos líneas, botón de 44 × 44 px como mínimo, sin
  solapamientos ni desplazamiento horizontal.
- Zoom al 200 % y al 400 %, tamaño de letra del sistema aumentado: la etiqueta se lee completa y
  no tapa el título.
- Modo de alto contraste: el botón sigue visible y operable y su etiqueta se distingue sin
  depender del fondo.
- Movimiento reducido: el cambio de tema no anima nada, ni siquiera al desactivar la clase
  temporal de transiciones.
- Lectura o escritura del tema bloqueada por el navegador: sin excepciones y sin errores nuevos
  del tema en consola —se aceptan los avisos preexistentes de `app.js` por las sesiones o el
  objetivo—, y la página se pinta con normalidad.
- El botón (etiqueta, icono y estilo destacado) coincide siempre con el tema aplicado, venga del
  botón, del sistema, de otra pestaña, de una elección de sesión o de una recarga.
- Los cambios llegados de otra pestaña o del sistema actualizan a la vez el tema, la etiqueta, el
  icono y el estilo destacado, sin dejar el botón desincronizado.
- Sesión de hoy registrada y tema alternado: la racha, el récord, la semana, el objetivo, el mes,
  el mapa y la lista no cambian de valor.

## 7. Fuera de alcance

- Temas personalizados, editables o por paletas; más de dos temas.
- Un tercer estado visible «seguir al sistema» en el botón; el modo automático es interno
  (sección 10).
- Cambiar automáticamente de tema por la hora del día, la posición del sol o un horario.
- Tema por sección, por tarjeta o por día de la semana.
- Cambiar el tamaño de la letra, el espaciado o la tipografía.
- Un modo de alto contraste propio de la aplicación.
- Cambiar el color de la barra del navegador o del sistema operativo.
- Sincronizar la preferencia entre dispositivos o cuentas.
- Exportar, importar o imprimir con un tema concreto.
- Rediseñar la paleta clara más allá de los cinco ajustes de contraste de CA-6.6.
- Añadir botones, menús o ajustes adicionales de apariencia.

## 8. Estrategia de verificación

### 8.1 Pruebas automáticas de lógica pura (`node --test`, `tests/theme.test.js`)

La decisión del tema se separa de la interfaz y del almacenamiento: el módulo puro recibe la
elección guardada (texto tal cual) y la preferencia del sistema como datos, y devuelve el tema o
la decisión de escribir. Sus funciones —por ejemplo `resolveTheme(storedChoice,
systemPrefersDark)` y `shouldWriteTheme(currentStored, requested)`— son las que usan el arranque
y la interfaz. Debe probarse:

1. **Lectura de la elección guardada**: `{"tema":"oscuro"}` y `{"tema":"claro"}` válidos; JSON
   corrupto, `null`, listas, números, texto suelto, objeto sin `tema` y `tema` con valor
   inválido se tratan como «sin elección»; nunca se lanza una excepción; el valor recibido no se
   modifica.
2. **Resolución del tema**: sin elección con sistema oscuro → oscuro; sin elección con sistema
   claro → claro; sin elección con preferencia desconocida → claro; elección oscura con sistema
   claro → oscuro; elección clara con sistema oscuro → claro. La preferencia del sistema nunca
   se consulta dentro del módulo: entra como parámetro.
3. **Alternancia**: claro → oscuro → claro; alternar dos veces vuelve al punto de partida;
   alternar nunca produce un valor distinto de «claro» u «oscuro».
4. **Serialización**: el texto guardado es JSON válido con la forma `{"tema":"oscuro"}` o
   `{"tema":"claro"}`, y se puede volver a leer con la función de lectura.
5. **Etiqueta e icono de acción**: la etiqueta es «Modo oscuro» con el tema claro y «Modo claro»
   con el oscuro, exacta y en español; el icono es luna con el tema claro y sol con el oscuro. Las
   dos funciones devuelven siempre uno de esos dos pares y no dependen de ningún otro dato que el
   tema; no existe ninguna función de estado pulsado ni de `aria-pressed`.
6. **Decisión de escritura** (CA-4.6): con un tema pedido igual al guardado válido, la función
   indica que no hay que escribir; con un tema distinto, o con la clave ausente o ilegible,
   indica que sí. Nunca propone escribir dos veces el mismo valor seguido.
7. **Determinismo, no mutación y pureza**: misma entrada, mismo resultado; los datos recibidos
   no se modifican; el módulo no contiene `document`, `localStorage`, `matchMedia`, `Date.now`
   ni `new Date()` sin argumentos, ni las claves de sesiones o del objetivo, y expone
   `ThemeLogic` con export CommonJS protegido. La consulta del sistema y su escucha no están en
   el módulo: se comprueban en el arranque (CA-5.6).
8. **Una sola fuente de verdad**: el arranque de la página y la interfaz llaman a las funciones
   del módulo; no hay una segunda implementación de la lectura, la resolución ni la alternancia
   (se comprueba en la revisión del código).

### 8.2 Verificación manual en Chrome

- Guardar una captura de referencia del tema claro antes del cambio, para comparar al final.
- Con DevTools en `file://`, emular `prefers-color-scheme: dark` y `light` sin clave guardada:
  la aplicación abre en el tema emulado; sin ninguna preferencia, abre en claro.
- Sin destello: recargar con la CPU limitada (6×) y revisar el primer fotograma con una
  grabación de pantalla; nunca se ve el tema contrario al que corresponde. En el panel
  Performance, el script en línea de la cabecera debe durar menos de 16 ms y terminar antes del
  primer pintado (RNF-4).
- Pulsar el botón: el cambio es inmediato y completo, sin componentes que se queden con colores
  del otro tema; recargar y cerrar y abrir el navegador conservan la elección.
- Comprobar que el botón solo tiene dos estados visibles y que no existe ningún otro control ni
  etiqueta de apariencia ni opción «sistema» en la página.
- CA-4.6 (mismo tema): con el botón, que siempre alterna, el caso se prueba en la función pura de
  decisión de escritura (tema pedido igual al guardado → no escribir; distinto o guardado
  ilegible → escribir) y en la página se comprueba con un contador sobre
  `Storage.prototype.setItem`: cargar con una elección guardada igual al tema resuelto, esperar,
  volver a la pestaña y registrar una sesión no debe producir ninguna escritura del tema;
  alternar diez veces debe producir exactamente diez escrituras, con valores alternos y nunca dos
  iguales seguidas.
- CA-5.6 (un solo `matchMedia`, sin acumular escuchas): inyectar **antes de cargar**, con
  `Page.addScriptToEvaluateOnNewDocument`, un contador que envuelva `window.matchMedia` y
  `addEventListener` de la consulta delegando en los originales; cargar y comprobar que el
  arranque crea una sola consulta y una sola escucha y que `app.js` no crea ninguna (el total
  sigue siendo uno). Después, alternar veinte veces, cambiar de pestaña cinco veces y registrar
  una sesión: el contador no debe aumentar. Repetir con la pestaña recién cargada para descartar
  que la consulta se cree solo en el primer arranque.
- CA-2.6 (sin animación): con `transition` activa en un campo enfocado y con el ratón sobre un
  botón, grabar el cambio a 60 fps y comprobar que se resuelve en un solo fotograma, sin tonos
  intermedios; comprobar que la clase temporal de transiciones desaparece en el fotograma
  siguiente y que no queda ninguna transición de color en curso.
- CA-6.5 (controles nativos): comprobar que el esquema de color calculado es `dark` o `light`
  según el tema, y abrir el selector de fecha, desplazar la página y seleccionar texto para ver
  que no aparece ningún control claro sobre la interfaz oscura ni al revés.
- Con elección guardada, cambiar la emulación del sistema: la página no cambia. Borrar la clave
  y repetir: la página sigue el sistema.
- Dos pestañas con la misma página: el tema se sincroniza en ambos sentidos; borrar todo el
  almacenamiento desde una devuelve las dos al modo automático.
- Bloquear el almacenamiento **antes de cargar**: inyectar la sustitución con
  `Page.addScriptToEvaluateOnNewDocument` (o el equivalente de DevTools) para que falle también
  la lectura del tema inicial, y recargar; la aplicación debe abrir con el tema del sistema, sin
  mensajes en la interfaz y sin excepciones no controladas —se aceptan los `console.error` que
  `app.js` ya emite al fallar las sesiones o el objetivo—. Repetir fallando solo la escritura
  (`setItem`) y comprobar CA-4.7: alterna, no sigue al sistema en esa sesión y, al recargar,
  vuelve a seguirlo.
- Escribir valores corruptos en la clave desde Application → Local Storage y recargar: se sigue
  al navegador, el valor no se borra y el botón funciona.
- Medir contraste con el selector de color de DevTools en cada par de la tabla de la sección 10,
  en los dos temas y **sobre la superficie real**: el marcador de posición y el borde de control
  se miden sobre el fondo del campo, no sobre la tarjeta. Texto ≥ 4,5:1; foco, barra y límites de
  control ≥ 3:1. Repetir la medición de las superficies y aceptar los ratios documentados
  (1,06–1,13).
- Comprobar que los tokens oscuros son los acordados (papel `#14181f`, tarjeta `#1c222c`, acento
  `#ff6b3d`) y que el botón primario oscuro usa texto oscuro.
- CA-6.6 (tema claro antes/después): comparar con la captura de referencia y confirmar que solo
  cambian el halo de foco global, el borde de los controles, la selección, el relleno de la barra
  y el anillo de foco de los campos; nada de tipografía, tamaños, márgenes ni el borde de las
  tarjetas. Comprobar también que la separación entre el título y la línea inferior de la
  cabecera mide lo mismo que antes (0,85 rem de relleno inferior, ahora en el header).
- Captura en escala de grises del mapa de calor en ambos temas: los cinco niveles y los días
  futuros se distinguen entre sí.
- Información emergente sobre celdas de nivel 0, 3 y 4: comprobar que el contorno la separa en
  todos los casos.
- CA-1.5: medir con el inspector la caja del botón (incluido relleno y borde) y comprobar que es
  de al menos 44 × 44 px y que su centro es accionable.
- Estados que existen de verdad, con los pseudosestados forzados de DevTools y en ambos temas:
  hover y activo del botón de tema, del primario y del secundario; hover de la fila de sesión;
  foco del campo de formulario (que además debe mostrar su anillo de 3 px). No se exige hover en
  los campos ni activo en las filas, porque la interfaz no los tiene.
- Recorrido completo con teclado desde la carga: el primer tabulador llega al botón, Enter y
  Espacio lo accionan, el foco es visible y no se pierde en ningún control.
- Inspector de accesibilidad: nombre del botón igual a su etiqueta visible —«Modo oscuro» con
  tema claro y «Modo claro» con tema oscuro—, sin `aria-pressed` ni ningún estado pulsado;
  comprobar que no existe región viva adicional ni doble anuncio; repetir tras un cambio llegado
  de otra pestaña y comprobar que la etiqueta, el icono y el estilo destacado coinciden con el
  tema.
- Formulario de sesión a medio rellenar y formulario del objetivo abierto con error: alternar el
  tema varias veces no borra, no cierra ni mueve el foco.
- Página desplazada a mitad: alternar no cambia la posición del desplazamiento.
- Vistas a 320, 375 y 1280 px en ambos temas, sin desplazamiento horizontal, sin solapamientos y
  con el botón en la zona superior alineado a la derecha —a 375 px y más, en la fila del
  título—; a 320 px, comprobar el apilado, la etiqueta en dos líneas, el botón alineado a la
  derecha y que el tamaño de letra no se reduce.
- Zoom al 200 % y al 400 %, tamaño de letra del sistema aumentado, `prefers-reduced-motion:
  reduce` y `forced-colors: active` emulados desde DevTools.
- Con 1000 sesiones: alternar el tema no reconstruye la lista ni el mapa y completa el cambio en
  menos de 100 ms según las herramientas del navegador.
- Consola sin errores nuevos del tema antes y después de alternar; los `console.error` que
  `app.js` ya registra al fallar el almacenamiento de sesiones u objetivo se aceptan como
  preexistentes. Sesiones y objetivo idénticos byte a byte antes y después de alternar diez
  veces; racha, récord, semana, objetivo, mes, mapa y lista con los mismos valores.

## 9. Criterios de finalización

1. Al abrir por primera vez con el sistema en oscuro, la aplicación aparece ya en oscuro, sin
   destello del tema claro.
2. Al abrir por primera vez con el sistema en claro o sin preferencia, aparece en claro.
3. Existe un botón en la zona superior del contenido, alineado a la derecha e integrado en la
   cabecera —a partir de 375 px, en la fila del título—, que alterna entre claro y oscuro con dos
   estados visibles —sin estado «sistema»— y no crea ninguna sección nueva.
4. El botón se ve como parte del diseño «bitácora» y no rompe la cabecera a 320, 375 ni 1280 px;
   a 320 px puede apilarse, con la etiqueta en dos líneas, el botón alineado a la derecha y sin
   desplazamiento horizontal.
5. El área táctil del botón mide al menos 44 × 44 px.
6. La elección guardada se conserva al recargar y al cerrar y volver a abrir el navegador; la
   tomada solo en la sesión por un fallo de escritura se respeta únicamente en esa sesión.
7. La elección se guarda en `estudioDiarioTema` con la forma `{"tema":"oscuro"}`, la clave solo
   se escribe al elegir y las sesiones y el objetivo semanal no cambian en absoluto.
8. Sin elección, la aplicación sigue en vivo los cambios de tema del sistema; con elección, los
   ignora.
9. Dos pestañas sincronizan el tema; el borrado completo del almacenamiento devuelve al modo
   automático.
10. Un valor corrupto en la clave del tema no rompe nada: se sigue al navegador, el valor se
    conserva y el botón funciona.
11. Con el almacenamiento bloqueado antes de cargar, la aplicación abre con el tema del sistema;
    con la escritura fallando, el tema alterna en la sesión, sin mensajes, y al recargar vuelve a
    seguir al sistema.
12. El tema oscuro usa los tokens acordados (papel `#14181f`, tarjeta `#1c222c`, acento
    `#ff6b3d`, primario con texto `#14181f`) y cubre todos los componentes de la tabla de RF-6:
    fondo, tarjetas y sus sombras, tarjeta de racha, fila del récord, botón de tema en sus dos
    estados, textos, bordes, campos, botones con sus estados, foco, errores, barra, mapa,
    información emergente, insignias, lista, estado vacío y selección; ningún componente conserva
    un color ni una sombra calculados para el tema claro. Los ratios de superficie son los
    aceptados (1,06–1,13) y los de texto, 4,5:1 o más.
13. El mapa de calor mantiene cinco niveles con luminancia creciente y, en el tema oscuro, pasos
    de 1,42:1 a 1,72:1; en el tema claro conserva los pasos preexistentes (1,16:1, 1,36:1, 1,71:1
    y 1,74:1) sin cambios por CA-6.6. Los niveles son distinguibles en escala de grises y los días
    futuros siguen viéndose inactivos.
14. Textos con contraste de al menos 4,5:1 y foco, barra y límites de control con al menos 3:1
    en ambos temas, incluidos los cinco ajustes del tema claro.
15. El botón es de acción: su etiqueta y su icono nombran el tema al que se cambia —luna y «Modo
    oscuro» en claro; sol y «Modo claro» en oscuro—, el nombre accesible coincide con la etiqueta
    visible, no hay `aria-pressed` ni estado pulsado, y con el tema oscuro el botón se ve destacado
    por fondo y borde, no solo por el icono. Se opera con teclado y el foco es visible en ambos
    temas.
16. Alternar el tema no cierra formularios, no borra lo escrito, no mueve el foco, no salta el
    desplazamiento, no recalcula datos y no deja transiciones a medias.
17. Racha, récord, «Esta semana», objetivo, días del mes, mapa de calor y lista siguen mostrando
    los mismos valores que antes en ambos temas.
18. La consola no muestra errores nuevos del tema y `node --test` pasa sin instalar paquetes; los
    `console.error` preexistentes de `app.js` por el almacenamiento de sesiones u objetivo no
    cuentan.
19. `AGENTS.md` y `MEMORY.md` recogen la clave `estudioDiarioTema`, su forma y el modelo de
    decisión, y la clave aparece en la lista «Para empezar de cero» de `AGENTS.md`.
20. El tema claro conserva su aspecto salvo los cinco ajustes de contraste y la misma separación
    entre título y línea de la cabecera, comprobado contra la captura de referencia.

## 10. Decisiones confirmadas y asumidas

Las decisiones marcadas **(usuario)** fueron confirmadas por la persona usuaria el 20 de octubre
de 2026 y definen el producto: no se cambian sin una nueva petición. Las marcadas **(equipo)**
son resoluciones técnicas o menores para que la spec sea verificable; cada una indica la
alternativa descartada.

- **(usuario) La elección se recuerda**: si la persona elige claro u oscuro, la elección se
  guarda y se mantiene al recargar y en visitas posteriores; solo desaparece si se borra el
  almacenamiento. Alternativa descartada: volver a seguir al navegador en cada apertura, que
  obligaría a reelegir el tema cada día.
- **(usuario) Dos estados visibles**: el botón alterna solo entre claro y oscuro; mientras no
  haya una elección explícita —guardada o tomada en la sesión—, el modo automático sigue al
  sistema en vivo (RF-5) y el botón muestra el estado resultante. Alternativa descartada: un
  control cíclico de tres estados, más complejo de explicar y de usar, o un botón que solo
  leyera el sistema al abrir.
- **(usuario) Botón de acción** (enmienda 003.1): la etiqueta y el icono nombran el tema al que se
  cambia —«Modo oscuro» con luna en claro y «Modo claro» con sol en oscuro—, sin `aria-pressed`, de
  modo que el nombre accesible siempre coincide con la etiqueta visible; el tema en uso se refuerza
  con el estilo destacado del botón. Alternativa descartada: el interruptor con etiqueta fija
  «Modo oscuro» y `aria-pressed`, que fue la decisión inicial, porque la persona usuaria pidió que
  la palabra cambiara con el tema.
- **(equipo) Icono de acción**: luna con el tema claro y sol con el tema oscuro, para que el icono
  acompañe a la etiqueta y anuncie el destino. Alternativa descartada: sol en claro y luna en
  oscuro (el icono del tema en uso), que junto a una etiqueta de acción diría lo contrario de lo
  que hace el botón.
- **(usuario) Seguir al navegador en vivo** mientras no haya elección explícita; con elección
  guardada, la página no cambia cuando cambia el sistema. Alternativa descartada: leer la
  preferencia solo al abrir, que dejaría la página con el tema antiguo hasta recargar.
- **(usuario) Paleta oscura**: fondo `#14181f`, tarjetas `#1c222c` y naranja de marca `#ff6b3d`,
  conservando el aire de bitácora (papel con cuadrícula, títulos con serif, sombras duras) y el
  acento cálido. Alternativa descartada: invertir los colores del tema claro, que produciría una
  interfaz lavada y perdería la identidad de la bitácora.
- **(equipo) Iconos SVG en línea**: se dibujan con SVG en el documento, no con emoji, para no
  depender de fuentes de emoji ni de su renderizado. Alternativa descartada: emoji, que ya ha
  dado problemas de fuentes en las pruebas del proyecto.
- **(equipo) Sin región viva**: la etiqueta cambiante —y su nombre accesible, que la iguala— ya
  comunica la acción y el tema en uso; no se añade `aria-live` ni otro mensaje. Alternativa
  descartada: una región de estado, que duplicaría el anuncio en la mayoría de lectores.
- **(equipo) Una sola consulta del sistema, creada fuera del módulo puro**: el arranque no puro
  —el script en línea de la cabecera— crea la consulta `(prefers-color-scheme: dark)`, su única
  escucha y lee el almacenamiento, y pasa esos datos a las funciones puras de `theme-logic.js`;
  `app.js` reutiliza esa consulta o la suscripción única que el arranque expone, sin crear otra
  (CA-5.6). Alternativa descartada: crear la consulta dentro de `theme-logic.js`, que rompería la
  pureza y la posibilidad de probarlo con `node --test`, o que cada archivo hiciera su
  `matchMedia`, que acumularía consultas y escuchas.
- **(equipo) Módulo puro compartido `theme-logic.js`**: IIFE puro —sin documento, sin
  almacenamiento, sin `matchMedia` y sin reloj— con `ThemeLogic` y export CommonJS protegido; se
  carga como script clásico en la cabecera, antes de la hoja de estilos, seguido del arranque en
  línea (no puro) que lee el almacenamiento, crea la consulta y la escucha, aplica el tema y usa
  las funciones puras; un segundo script en línea justo después del botón le aplica el icono y la
  etiqueta del tema aplicado (también antes del primer pintado). El mismo módulo se
  prueba con `node --test` en `tests/theme.test.js`. Los scripts locales clásicos son válidos; lo
  prohibido es `fetch`, XHR, módulos ES, red, servidor o build. Alternativa descartada: decidir el
  tema dos veces (una en un script suelto y otra en `app.js`), que crearía dos fuentes de verdad y
  una sin pruebas, o meter la consulta y el almacenamiento dentro del módulo, que lo volvería
  impuro y no se podría probar con `node --test`.
- **(equipo) Cabecera como fila del título**: `<header class="app-header">` dentro del contenedor
  con el `h1` y el botón, la línea inferior en el header, el `h1` sin esa línea y el relleno
  inferior de 0,85 rem trasladado del `h1` al header, para que la separación entre título y línea
  no cambie. No es un landmark de navegación (queda dentro de `main`) ni lleva nombre accesible.
  Alternativa descartada: un `<nav>` o un `banner` nuevo, que añadiría un landmark innecesario
  para un solo control.
- **(equipo) Sin elección legible se usa el tema del sistema**: clave ausente, valor ilegible o
  almacenamiento inaccesible se tratan igual; el claro solo se aplica cuando el sistema prefiere
  claro o no expresa preferencia. Alternativa descartada: caer siempre en claro, que ignoraría la
  preferencia del sistema cuando el almacenamiento falla.
- **(equipo) Fallo de escritura = elección de la sesión**: la pulsación deja de seguir al sistema
  en esa sesión y, al recargar, vuelve el modo automático, sin avisos. Alternativa descartada:
  mostrar un error, que añadiría ruido por una preferencia menor.
- **(equipo) Valor corrupto tolerado**: se trata como «sin elección» y se conserva; solo se
  sustituye al guardar una elección nueva. Alternativa descartada: borrarlo al leerlo, que
  escribiría sin que la persona lo pida.
- **(equipo) Fallback claro** cuando el sistema no expresa preferencia. Alternativa descartada:
  abrir en oscuro por defecto, que sorprendería a quien nunca eligió nada.
- **(equipo) Cambio instantáneo**: sin transición de colores; mientras dura el cambio se aplica
  una clase temporal en el elemento raíz que anula las transiciones de campos y botones y se
  retira en el fotograma siguiente. Alternativa descartada: un fundido entre paletas, que además
  chocaría con el movimiento reducido.
- **(equipo) Primario oscuro con texto oscuro**: fondo `#ff6b3d` y texto `#14181f`; el blanco
  sobre ese naranja solo alcanza 2,83:1 y queda descartado. El par elegido mide 6,3:1 y cumple AA
  (la cifra 5,82:1 correspondía a `#101f38`, no a este par). Alternativa descartada: oscurecer el
  naranja hasta `#b8360f` para poder usar blanco, que perdería el acento cálido acordado.
- **(equipo) Sombras por tema**: las sombras decorativas existentes se convierten en tokens con
  valor propio en cada tema: `--shadow-hard` (tarjetas), `--shadow-chip` (fila del récord),
  `--shadow-tooltip` (información emergente) y `--shadow-press` (el `1px 1px 0 var(--ink)` del
  botón primario al pulsarlo, que en oscuro se volvería claro y parecería un brillo). Alternativa
  descartada: dejar las sombras claras fijas, que en oscuro se verían como manchas claras y
  dejarían componentes con colores del tema claro (CA-6.8).
- **(equipo) Superficies medidas y aceptadas**: la separación entre superficies no llega a 3:1 y
  se acepta de forma explícita: tarjeta sobre papel 1,11:1; bloque de racha sobre papel 1,07:1;
  campo sobre tarjeta 1,07:1; cuadrícula sobre papel 1,13:1; realce de fila 1,12:1; estado vacío
  1,06:1 (con borde discontinuo de 3,4:1). Alternativa descartada: exigir 3:1 entre superficies,
  que oscurecería las tarjetas hasta casi el negro y rompería la jerarquía de la bitácora.
- **(equipo) Token propio de borde de control**: `--line-control` se usa solo en campos y botón
  secundario, en ambos temas; `--line` sigue siendo el borde de tarjetas y separadores.
  Alternativa descartada: oscurecer `--line`, que cambiaría el borde de todas las tarjetas.
- **(equipo) Medición sobre la superficie real**: el marcador de posición y el borde de control se
  miden sobre el fondo del campo, y los pasos del mapa entre niveles contiguos se acotan al tema
  oscuro (1,42:1 a 1,72:1), que es donde se fijan; el tema claro conserva los suyos por CA-6.6.
  Alternativa descartada: medirlos sobre la tarjeta, que daría cifras más favorables pero falsas.
- **(equipo) Información emergente con contorno**: 2 px del color de su texto, porque su relleno
  solo alcanza 1,73:1 sobre el nivel 4 y 2,71:1 sobre el nivel 3. Alternativa descartada: confiar
  solo en la sombra, que se pierde sobre las celdas más claras.
- **(equipo) Etiqueta que puede partirse en dos líneas a 320 px**, sin reducir el tamaño de letra
  y con la cabecera apilada si hace falta. Alternativa descartada: acortar el texto o bajar la
  tipografía, que empeoraría la legibilidad.
- **(equipo) Archivos nuevos aprobados con la spec**: `theme-logic.js` y `tests/theme.test.js`
  (la persona usuaria los aprueba al aprobar esta spec). Alternativa descartada: meter la lógica
  dentro de `app.js`, que no se puede probar sin navegador ni cargar antes de la hoja de estilos.
- **(equipo) Pruebas**: la lógica se prueba con `node --test`; la parte visual y de comportamiento
  se verifica manualmente en Chrome, incluida la emulación de preferencias y la inyección de
  fallos de almacenamiento antes de cargar.

Paleta oscura: tokens concretos y contrastes medidos (ratio del par indicado; el marcador de
posición y el borde de control se miden sobre el fondo del campo).

| Token | Valor | Uso | Contraste |
| --- | --- | --- | --- |
| `color-scheme` | `dark` | controles nativos | — |
| Papel | `#14181f` | fondo de la página | — |
| Cuadrícula | `rgba(233, 238, 246, 0.05)` | líneas del papel | 1,13:1 sobre papel |
| Tarjeta | `#1c222c` | tarjetas y bloques | 1,11:1 sobre papel |
| Tinta | `#eef2f8` | texto principal | 15,8:1 sobre papel y 14,2:1 sobre tarjeta |
| Tinta suave | `#a7b4c6` | textos secundarios | 8,5:1 sobre papel y 7,6:1 sobre tarjeta |
| `--line` | `#3a4553` | separadores y bordes de tarjeta | 1,64:1 sobre tarjeta (decorativo) |
| `--line-control` | `#63718a` | borde de campos y botón secundario | 3,0:1 sobre campo y 3,2:1 sobre tarjeta |
| Fondo de campo | `#202832` | campos de formulario | 1,07:1 sobre tarjeta, se percibe por el borde |
| Acento de marca | `#ff6b3d` | bordes, relleno, foco | 6,3:1 sobre papel y 5,7:1 sobre tarjeta |
| Acento para texto | `#ff8f63` | textos en naranja y errores | 7,1:1 sobre tarjeta y 6,7:1 sobre su fondo |
| Fondo de error o insignia | `#3a2018` | error del objetivo y píldora de minutos | — |
| `--on-ink` | `#eef2f8` | texto del bloque de racha | 17:1 sobre `#0b1016` |
| `--on-ink-soft` | `#a7b4c6` | etiquetas del bloque de racha | 9,1:1 sobre `#0b1016` |
| Bloque de racha | fondo `#0b1016`, sombra `#ff6b3d` | tarjeta de racha | 1,07:1 sobre papel, con sombra |
| Botón primario | fondo `#ff6b3d`, texto y borde `#14181f`, sombra 3 px `#0b1016` | acción principal | 6,3:1 texto/fondo |
| Botón primario hover | fondo `#ff8358`, texto `#14181f` | hover | 7,3:1 |
| Botón secundario | fondo `#1c222c`, texto `#eef2f8`, borde `#63718a` | acciones secundarias y botón de tema inactivo | 14,2:1 y 3,2:1 de borde |
| Botón secundario hover | fondo `#242c38`, borde `#a7b4c6` | hover | 1,14:1 de fondo, 12,5:1 de texto y 6,7:1 de borde |
| Botón de tema destacado | fondo `#3a2018`, texto `#eef2f8`, borde `#ff8f63` | botón con el tema oscuro en uso | 13,4:1 de texto y 7,1:1 de borde sobre tarjeta |
| Fila de sesión hover | `#232b36` | realce de fila | 1,12:1 sobre tarjeta (pista sutil aceptada) |
| Estado vacío | fondo `#171d26`, borde discontinuo `#63718a`, texto `--ink-soft` | sin sesiones | texto 8,1:1; borde 3,4:1 |
| `--shadow-hard` | `4px 4px 0 rgba(0, 0, 0, 0.45)` | sombra de tarjetas | decorativa |
| `--shadow-chip` | `2px 2px 0 rgba(0, 0, 0, 0.5)` | sombra de la fila del récord | decorativa |
| `--shadow-tooltip` | `0 6px 18px rgba(0, 0, 0, 0.55)` | sombra de la información emergente | decorativa |
| `--shadow-press` | `1px 1px 0 #0b1016` | sombra del botón primario al pulsarlo (antes tomaba `--ink`) | decorativa |
| `::selection` | fondo `#ff6b3d`, texto `#14181f` | selección de texto | 6,3:1 |
| Mapa de calor 0 a 4 | `#2c3441`, `#6b3f2c`, `#a85732`, `#ea6b31`, `#ff9f63` | cinco niveles | luminancia 0,034 → 0,470; pasos 1,42 a 1,72 (solo tema oscuro) |
| Relleno de la barra | `#ea6b31` sobre pista `#2c3441` | progreso del objetivo | 4,0:1 entre relleno y pista |
| Anillo de foco de campos | `#ff6b3d`, 3 px | foco de campos | 5,3:1 sobre el campo |
| Marcador de posición | `#8e9cb0` | texto de ejemplo | 5,3:1 sobre el campo |
| Información emergente | fondo `#e9eef6`, texto y contorno de 2 px `#101f38` | información emergente del mapa | 14,1:1; contorno 8,2:1 sobre nivel 4 y 5,2:1 sobre nivel 3 |

Los cinco niveles del mapa se distinguen en escala de grises y los días futuros se pintan con el
nivel 0 atenuado.

Ajustes permitidos del tema claro (los únicos de CA-6.6), con su medición actual y la nueva:

| Elemento | Ahora | Nuevo valor | Contraste |
| --- | --- | --- | --- |
| Halo de foco global | naranja translúcido, 1,9:1 sobre blanco | `#b8360f` | 5,9:1 sobre blanco |
| Borde de campos y botón secundario | `#c9d5e4`, 1,5:1 | `#7b8aa0` (token `--line-control` propio) | 3,5:1 sobre blanco y 3,3:1 sobre el campo |
| `::selection` | blanco sobre `#f04e23`, 3,6:1 | blanco sobre `#b8360f` | 5,9:1 |
| Relleno de la barra | `#e85f2a` sobre pista `#dce5f0`, 2,7:1 | `#b8360f` sobre la misma pista | 4,6:1 |
| Anillo de foco de los campos | sombra translúcida, 1,2:1 y sin `outline` | 3 px `#b8360f` | 5,6:1 sobre el campo |
| Botón de tema (nuevo) | no existe | inactivo: fondo blanco, borde `#7b8aa0`; activado: fondo `#fdeee8`, borde `#b8360f`, texto `#101f38` | 5,9:1 de borde y 14,6:1 de texto en el estado activado |

No cambia ningún otro color, tamaño, margen ni tipografía del tema claro; el botón de tema es el
único elemento nuevo y `--line` sigue gobernando el borde de tarjetas y separadores. Las sombras
existentes conservan su valor claro pero pasan a tokens: `--shadow-chip:` `2px 2px 0
rgba(16, 31, 56, 0.06)` para la fila del récord, `--shadow-tooltip:` `0 4px 14px rgba(16, 31,
56, 0.25)` para la información emergente y `--shadow-press:` `1px 1px 0 #101f38` para el botón
primario al pulsarlo (hoy `1px 1px 0 var(--ink)`).

## 11. Dudas abiertas

Ninguna. Las cinco decisiones de producto (recordar la elección, dos estados visibles con el modo
automático siguiendo al sistema en vivo, botón de acción con etiqueta e icono cambiantes y sin
estado pulsado, seguir al navegador mientras no haya una elección explícita y la paleta oscura con
`#14181f`, `#1c222c` y `#ff6b3d`) están confirmadas en la sección 10, junto con las resoluciones
técnicas de la revisión (entre ellas el mapeo luna/sol del icono y la pureza de `theme-logic.js`).

## 12. Enmienda 003.1 (20 de octubre de 2026)

Cambio pedido por la persona usuaria: «el botón del modo claro/oscuro siempre pone modo oscuro; me
gustaría que la palabra “oscuro” realmente sea una variable, que cuando el modo es oscuro ponga
“claro”, y cuando el modo es claro ponga “oscuro”». La enmienda sustituye el interruptor con
etiqueta fija y `aria-pressed` por un botón de acción. No cambia nada más.

### 12.1 Comportamiento nuevo

| Tema aplicado | Icono | Etiqueta y nombre accesible | Estilo del botón | Acción al pulsar |
| --- | --- | --- | --- | --- |
| Claro | Luna | «Modo oscuro» | aspecto normal (fondo blanco, borde `--line-control`) | pasar a oscuro |
| Oscuro | Sol | «Modo claro» | destacado (fondo `--ember-soft`, borde `--ember-ink`, texto `--ink`) | pasar a claro |

- El icono y la etiqueta nombran la acción, no el tema en uso: la luna en claro anuncia que se
  puede pasar a oscuro y el sol en oscuro, que se puede pasar a claro.
- Sin `aria-pressed` ni ningún otro estado pulsado: el botón es una acción, no un interruptor con
  estado fijo. El nombre accesible es la propia etiqueta visible de cada momento, sin `aria-label`
  ni texto alternativo distinto.
- El estilo destacado del tema oscuro se conserva, ahora seleccionado por el tema aplicado
  (`data-theme="oscuro"`), no por `aria-pressed`.
- Sigue sin haber un tercer estado visible ni una opción «sistema»; el modo automático interno
  (RF-5) no cambia, y el botón muestra la acción que corresponde al tema resultante, venga del
  botón, del sistema, de otra pestaña o de una recarga.
- No se añade región viva ni anuncio adicional: la etiqueta cambiante ya informa de la acción.

### 12.2 Requisitos que cambian

- **RF-1**: CA-1.3, CA-1.4 y CA-1.6 quedan como se describen arriba; CA-1.5 y CA-1.7 no cambian.
- **CA-3.3**: el script en línea que sigue al botón aplica icono y etiqueta, no `aria-pressed`.
- **CA-5.3** y **CA-5.5**: se refieren a etiqueta, icono y estilo; no hay `aria-pressed`.
- **RF-7 / CA-7.3**: accesibilidad descrita por etiqueta visible, nombre accesible igual y estilo
  destacado; sin `aria-pressed` y sin región viva.
- **RNF-7**: las pruebas cubren la etiqueta y el icono de acción, en lugar de un estado pulsado.
- **Sección 8.1, punto 5**: «Etiqueta e icono de acción» sustituye a «Etiqueta y estado».
- **Sección 8.2**: el inspector de accesibilidad comprueba el nombre igual a la etiqueta del
  momento y la ausencia de `aria-pressed`.
- **Sección 9, criterio 15** y **sección 10, decisiones de usuario del botón y del icono** quedan
  reescritos según esta tabla.
- **Sección 11**: la quinta decisión de producto pasa a ser «botón de acción».

### 12.3 Lo que no cambia

- La resolución del tema (`resolveTheme`), la lectura tolerante del valor guardado, la decisión de
  escritura, la persistencia, el fallback al sistema, la elección de sesión, la sincronización
  entre pestañas y la única consulta del sistema: idénticos.
- La paleta de ambos temas, los tokens, las sombras, los contrastes y los cinco ajustes del tema
  claro: idénticos.
- Las claves `estudioDiarioSesiones`, `estudioDiarioObjetivoSemanal` y `estudioDiarioTema` y sus
  formatos: idénticos.
- El tamaño táctil de 44 × 44 px, la posición en la cabecera, el orden de tabulación, el foco
  visible, el comportamiento a 320, 375 y 1280 px y el cambio instantáneo sin transiciones.
- Las funciones de etiqueta e icono siguen viviendo en `theme-logic.js`, que sigue siendo puro; lo
  único que desaparece es la función que devolvía el estado pulsado. La etiqueta deja de ser una
  constante y pasa a depender del tema, como el icono.

### 12.4 Verificación

- Pruebas puras: `getToggleLabel("claro")` → «Modo oscuro»; `getToggleLabel("oscuro")` → «Modo
  claro»; `getIconName("claro")` → luna; `getIconName("oscuro")` → sol; el módulo no expone
  ninguna función de estado pulsado y sigue sin DOM, almacenamiento, `matchMedia` ni reloj;
  `node --test` en verde.
- Chrome: etiqueta y nombre accesible cambian al alternar y al recibir el tema del sistema o de
  otra pestaña; el botón no tiene `aria-pressed`; en oscuro se ve destacado y en claro, normal; el
  icono coincide con la etiqueta; el foco, el tamaño táctil, la cabecera y el resto de la
  interfaz siguen igual en ambos temas.

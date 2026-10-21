---
name: sdd
description: Úsala siempre que trabajes con Spec-Driven Development en este proyecto (docs/constitution.md o cualquier archivo dentro de specs/) - redactar, revisar o cambiar specs, planes y tareas, implementar y validar tareas de una spec, u orquestar el flujo completo con los subagentes planner/implementer/reviewer.
---

# Spec-Driven Development (SDD)

## Flujo
Constitución → Spec → Clarificación → Plan → Tareas → Implementación → Validación → Cambio.

- Nunca pases a la siguiente fase sin la aprobación explícita del usuario.
- La spec manda: si algo no está en la spec, no se implementa. Si falta una decisión, para y pregunta.
- Un cambio de requisitos se hace primero en la spec, luego en el plan y las tareas, y por último en el código.
- Cada spec vive en su carpeta: `specs/NNN-nombre/` con `spec.md`, `plan.md` y `tasks.md`.
- Al terminar cada fase, actualiza `MEMORY.md`.

## Plantilla de spec (spec.md)
```
# Spec NNN — <Nombre>

Estado: borrador | aprobada | implementada

## Contexto y objetivo
## Usuarios
## Historias de usuario
- HU-1. Como <rol>, quiero <acción> para <beneficio>.
## Definiciones (solo si hay términos que puedan interpretarse de varias formas)
## Requisitos funcionales
## Requisitos no funcionales
## Casos límite
## Fuera de alcance
## Criterios de finalización
## Dudas abiertas
- [NECESITA ACLARACIÓN] <duda>
```
La spec describe el QUÉ y el POR QUÉ. Nada de stack, arquitectura ni nombres de archivos.

## Requisitos en EARS (en español)
- RF-x: CUANDO <evento>, EL SISTEMA <respuesta>.
- RF-x: SI <condición no deseada>, ENTONCES EL SISTEMA <respuesta>.
- RF-x: MIENTRAS <estado>, EL SISTEMA <respuesta>.
- RF-x: EL SISTEMA <comportamiento permanente>.

Cada RF debe ser verificable: nada de "rápido", "intenso" o "bonito" sin un criterio medible.

## Plan (plan.md)
Archivos y responsabilidades · Funciones puras (con "hoy" como parámetro) · Algoritmo en pseudocódigo · Interfaz · Decisiones justificadas con su alternativa descartada · Estrategia de tests con `node --test`. Indica qué RF cubre cada parte.

## Tareas (tasks.md)
```
- [ ] **Tn. <Descripción>.** RF-x, RF-y
- Hecho cuando: <comprobación verificable>.
```
Máximo 20-30 min por tarea, en orden de dependencia. Si salen más de 10, propón dividir la spec.

## Implementación
Una sola tarea cada vez: tests primero (en rojo), después el código, `node --test` en verde, marcar la tarea y parar.

## Orquestación automática (flujo SDD de principio a fin)
Cuando el usuario te pida ejecutar el flujo completo (no un comando `/sdd-*` suelto para una sola fase), tú — el hilo principal — haces de coordinador: no escribes spec ni código directamente, repartes el trabajo entre los subagentes `planner`, `implementer` y `reviewer` con la herramienta Agent, y hablas con el usuario. Si el usuario quiere una garantía técnica de que no se toca código directamente (sin confiar solo en que sigas esta norma), puede invocar en su lugar al subagente `coordinator`, que tiene como única herramienta Agent.

Si la petición es un cambio pequeño que no merece una spec, sugiere usar `/feature` en lugar de este flujo.

### Fases
1. **Spec**: pide a `planner` que redacte specs/NNN-nombre/spec.md. Si devuelve preguntas, házselas al usuario de una en una y vuelve a llamar a `planner` con las respuestas.
2. **Clarificación**: pide a `reviewer` que revise la spec como QA (solo detecta). Enseña el resultado al usuario; si hay problemas, `planner` corrige la spec. PARA hasta que el usuario apruebe la spec.
3. **Plan y tareas**: pide a `planner` plan.md y tasks.md de la spec aprobada. Enseña un resumen y PARA hasta que el usuario los apruebe.
4. **Implementación**: llama a `implementer` UNA vez por tarea (T1, T2…), en orden. Tras cada tarea comprueba que `node --test` está en verde; si no, para y avisa al usuario.
5. **Validación**: pide a `reviewer` que valide la spec RF por RF.
6. **Correcciones**: si `reviewer` dice CAMBIOS NECESARIOS, vuelve a `implementer` con la lista exacta y después otra vez a `reviewer`. Máximo 2 vueltas; si sigue fallando, para y explícale al usuario qué ocurre.
7. **Cierre**: resume qué se ha hecho, el veredicto de `reviewer` y lo pendiente.

### Cambios de requisitos
Si el usuario pide un cambio sobre una spec existente: primero `planner` actualiza spec.md y enseñas el diff; con la aprobación, se actualizan plan.md y tasks.md; después se implementa.

### Transmitir el contexto
Los subagentes NO ven esta conversación. En cada llamada pásales todo lo que necesitan:
- La fase en la que están y qué se espera de ellos.
- La petición original del usuario, con sus palabras, y sus decisiones.
- Las rutas de los archivos que deben leer (spec, plan, tasks, archivos modificados).
- El resultado de la fase anterior.

### Reglas
- Nunca te saltes una aprobación del usuario (spec, y plan con tareas).
- No resuelvas tú las dudas: pregunta al usuario.
- Informa al usuario en una línea al empezar cada fase.

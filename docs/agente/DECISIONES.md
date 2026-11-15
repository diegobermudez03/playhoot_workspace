# Decisiones del agente y consultas al creador

Tres listas: **D** decisiones técnicas (las toma el agente), **V** valores por defecto elegidos (ajustables, el creador puede vetarlos), **C** consultas de producto (las decide el creador).

## C — Consultas al creador

| ID | Estado | Bloquea | Pregunta | Recomendación del agente |
|---|---|---|---|---|
| C-01 | abierta | H3 (unirse como invitado) | **¿Qué se le pide a un invitado al unirse a una partida general?** La especificación exige declarar edad solo para crear, contratar o administrar (P19§1); pero limita a los menores a clases y grupos familiares autorizados, y en EE. UU./Canadá solo admite adultos (P35§1). No dice si quien solo juega declara algo. | Mantener "alias y jugar". Añadir en esa misma pantalla una sola línea de confirmación ("Tengo la edad mínima de mi país para usar Playhoot") con el país sugerido por ubicación aproximada y editable. Quien indique ser menor solo puede entrar a clases y grupos familiares autorizados. Sin fecha de nacimiento ni documento. Alternativa: no preguntar nada y tratar como adulto mientras no haya información en contra (menos fricción, menos control). |
| C-02 | abierta | H8 (grupos familiares) | **¿Qué forma tiene el "grupo familiar privado"** de P21§4 y P35§4? Los parches fijan sus reglas (el representante autoriza a su menor para un grupo identificado; no se extiende a otros anfitriones ni a partidas públicas) pero no su recorrido. | Un adulto con cuenta (gratis o Personal) crea un grupo privado con nombre e invita por enlace. Cada menor entra con una identidad propia del grupo (alias), autorizada por su representante: el propio anfitrión para sus hijos, o la página de autorización por correo para otros representantes. Las partidas del grupo solo admiten a sus miembros y a adultos invitados. Misma maquinaria que las clases (credencial individual, autorización, retirada), sin notas ni materiales. |
| C-03 | prevista | H2 (sistema de diseño) | **Dirección visual.** La base pide definirla con el agente como diseñador. Un error aquí obliga a rehacer todo el frontend. | El agente prepara 2–3 direcciones renderizadas sobre pantallas reales (inicio, lobby, panel de profesor) y recomienda una; el creador elige o dice "decide tú". Única consulta planificada de diseño. |

## D — Decisiones técnicas

**D-001 · Árbol de dominios objetivo (propuesta inicial; se cierra en T-002).**
Se conservan `api`, `orchestrator`, `composer`, `identity`, `game`, `play`, `notifications`, `classroom`, `plan` de la base. Cambios respecto a la base, amparados por P15§6:
- `play` se divide en `versions` (borradores, fuentes, builds, recursos de versión, previews), `session` (ciclo de vida de la partida, participantes, resultados, historial), `runtime` (en vivo) y `replay` (grabación, reproducción, retención, sustitución de identidades). Hoy `versions` vive dentro de `play/session`.
- `creation` nuevo dominio de primer nivel: brief, conversaciones, trabajos de IA y su medición, accesos de IA externa por borrador, resultados de validación. Motivo: tiene datos y reglas propias (P15§1) y hoy está repartido entre orchestrator, composer, api e identity.
- `library` nuevo: biblioteca de recursos de la plataforma (registros, versiones, estados, licencias, variantes).
- `billing` y `budget` nuevos junto a `plan`: las tres responsabilidades de P15§4 como tres dominios (cobros con el proveedor · derechos y saldos · gasto, reservas, admisión y corte). `budget` es transversal: toda operación con costo le pide admisión.
- `compliance` nuevo: matriz de mercados y funciones, declaraciones de edad y residencia, aceptaciones versionadas, cobertura de autorizaciones de menores y página del representante, solicitudes de privacidad, registro de proveedores. Motivo: son reglas y evidencias legales con retención propia; `identity` queda en autenticación y acceso.
- `support` (el `report` de la base): reportes, casos, conversaciones, formulario público, correo entrante. `moderation`: revisión de publicación, medidas graduadas, clasificación automática, acciones del sistema, apelaciones.
- `analytics`: recibe eventos por cola desde los dominios; tablas propias de análisis.
- `discovery` existente (stub) se elimina: el catálogo y la búsqueda son de `game`.
- Paquetes compartidos que no son dominios: cola transaccional + DLQ, límites por ventana, almacenamiento de objetos, logs, métricas.

**D-002 · Tres repos git.** El workspace (`repos/`) pasa a ser un repo propio para especificación, plan y sitio de documentación, con `playhoot/` y `playhoot_frontend/` ignorados. Motivo: el plan y los relevos son la memoria entre sesiones y no tenían historial.

**D-003 · Diseño como documentación.** El diseño de cada hito se escribe como datos del sitio `docs/sistema` en estado `planeado`; implementar los pasa a `implementado`. No hay documentos de diseño paralelos.

**D-004 · Se retira el proceso documental anterior** de ambos repos (`docs/ai`, WORK, Projects, HUMAN_REVIEW, AI_CONTEXT, Logic Mirror, CURRENT_STATE). Se conservan los estándares de ingeniería y los ADR técnicos como referencia. Lo ejecuta T-003.

**D-005 · WIP heredado.** Los cambios sin commit del 7-nov (grants de un solo uso para subir recursos; medidas de imagen/audio) se confirman tal cual como punto de partida: compilan y sus pruebas pasan. Se reconcilian con P10 cuando llegue H7.

**D-006 · Frontend: se conserva la arquitectura, se rehace la presentación.** Paquetes, fronteras por lint, protocolo, GameHost, puente y SDK se mantienen. Se rehacen identidad visual, sistema de diseño y pantallas; se añade renderizado en servidor o prerender para SEO (decisión concreta en H2).

**D-007 · Idioma.** Documentos del agente y sitio de documentación en español (mismo vocabulario que la especificación). Código, identificadores y commits en inglés.

## V — Valores por defecto

Los valores operativos que la especificación no fija (ventanas antiabuso, tamaños de página, reintentos) se eligen al implementar, quedan configurables y se listan aquí y en la documentación de la operación. Derivados ya de la especificación:

| ID | Valor | Origen |
|---|---|---|
| V-01 | Techo de IA gratuita por cuenta: 300 créditos por 30 días (30 % de los 1 000 del plan más barato), dentro de la bolsa global de USD 10/mes repartida por semanas | B: reglas de negocio, P28§3, P30§5 |

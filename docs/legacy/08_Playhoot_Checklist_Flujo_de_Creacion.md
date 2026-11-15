# 08 Playhoot — Checklist del flujo de creación (alineación con el nuevo enfoque)

Fuente: checklist producida con la IA conversacional después de los documentos 06 (estrategia de producto) y 07 (costos de IA para Teacher), entregada por el humano el 2026-11-05. Es el criterio vigente para el flujo de creación y prevalece sobre el plan 04 y sobre decisiones anteriores tomadas en conversación cuando entren en conflicto (el humano, 2026-11-05). Prioridades: P0 imprescindible, P1 importante, P2 posterior.

## Aclaración del humano sobre plantillas (2026-11-05)

Una plantilla no es un juego preparado y fijo para la herramienta de IA: es cualquier juego publicado en Playhoot que su creador marcó como utilizable como plantilla (los creadores conservan los derechos; por defecto un juego no lo es). Algunos de esos juegos los marca además el equipo de Playhoot como destacados para la IA: son los que la IA ve primero ("nuestras plantillas top por tipo de juego"). Todo es configurable desde el backend, nada está escrito en el código del MCP. La IA puede hacer discovery de plantillas igual que el buscador del usuario: por categorías y por palabras clave, recibiendo la metadata que existe en la base de datos (nada generado por IA), y puede pedir ver un juego concreto (su código) para decidir si le sirve. Hay que optimizar para que vaya al grano y no gaste contexto leyendo muchos juegos. Implementación en dos pasos: primero toda la parte de consumo por la IA asumiendo que el servicio de búsqueda existe (implementación vacía detrás de su puerto); después, el servicio real de discovery, cómo se marca un juego como plantilla o como destacado y cómo se agregan más.

## A. Modelo fundamental de autoría

P0
- Separación clara SourceRevision → Build → PublishedVersion.
- El agente modifica source editable, nunca un bundle publicado.
- Cada revisión es identificable inequívocamente.
- Una revisión contiene o referencia exactamente el estado de frontend, backend, shared, manifest/config y assets declarados.
- Crear una revisión nueva no destruye revisiones anteriores.
- Se puede restaurar/crear una nueva revisión desde una revisión histórica.
- Un build está ligado a una revisión exacta.
- Los resultados de build/test/simulación indican qué revisión/build probaron.
- Publicar utiliza el mismo build que fue probado, sin rebuild silencioso.
- Una versión publicada es inmutable.
- Editar un juego publicado crea un nuevo draft/source revision.

P1
- Las revisiones guardan metadata/provenance: quién/qué las creó, parent revision, template usado, módulos aplicados, SDK version.
- Existe diff entre revisiones.
- Existe rollback sencillo.

## B. El proyecto es la fuente de verdad, no la memoria del LLM

P0
- Un agente nuevo, sin conversación anterior, puede reconstruir completamente el estado del proyecto.
- El agente puede preguntar cuál es la revisión actual.
- Puede obtener hashes/versiones de cada archivo sin descargar todo el contenido.
- Puede leer individualmente frontend, backend, shared, configuración y asset manifest.
- Una respuesta normal de get_project_state no devuelve automáticamente todo el código.
- El estado resumido indica revisión; por área hash/size/version; assets required/ready/missing; build last_status/build_id; tests latest_summary.
- El agente solo descarga un archivo completo cuando realmente lo necesita.
- Después de una escritura recibe nueva revision_id + hashes actualizados.
- Si el agente modifica la revisión N pero el proyecto está en N+1, hay control de concurrencia y no hay overwrite silencioso.

P1
- El contexto del agente puede conservar temporalmente archivos leídos.
- La capa del agente sabe cuándo su copia quedó stale.
- Existe una operación tipo read_changed_files_since(revision).

## C. Escrituras eficientes: patch en el agente, snapshot completo en Playhoot

P0
- El agente no está obligado a regenerar un archivo completo para cambiar una línea.
- Existe una operación equivalente a patch_file / apply_patch.
- La capa trusted de Playhoot lee el snapshot actual, aplica el patch, valida el resultado y persiste el archivo completo en la nueva revisión.
- Un patch inválido falla sin corromper la revisión actual.
- El agente puede elegir replace_file cuando el cambio es sustancial.
- El API canónico puede seguir usando snapshots completos; la optimización puede ocurrir en la tool layer.

P1
- El sistema devuelve un diff de lo aplicado.
- Cambios triviales pueden agruparse en una sola revisión.
- El agent runner evita crear 15 revisiones para 15 cambios mecánicos consecutivos.

## D. Herramientas del agente

P0 — capacidades equivalentes a: get_project_state, read_file, replace_file, patch_file, create_revision, list_revisions, restore_revision, build, get_build_result, run_simulation, get_simulation_result, list_assets, declare_asset, request_asset_upload, register_asset, get_sdk_capabilities, get_sdk_docs, search_templates, inspect_template, instantiate_template. Los nombres pueden ser distintos; importan las capacidades.

P1
- Operaciones largas devuelven job_id y se pueden consultar después.
- Tienen idempotency key.
- Errores con códigos estructurados, no solo strings.
- Resultados con explicación humana breve y datos estructurados.

## E. Templates / recipes

Dos niveles: BASE TEMPLATE + CAPABILITY MODULES / RECIPES (ej. SpatialWorld2D + PlayerMovement + ProjectileShooter). Más controlable que pedir "mezcla el template A con el B".

E1. Catálogo (P0)
- Templates disponibles mediante un catálogo persistente (en DB).
- Cada template tiene ID/version, descripción semántica entendible por el agente, familias de juegos que resuelve, capabilities, SDK version/profile compatible.
- Su source es versionado e inmutable (el registro apunta a una revisión exacta e inmutable).
- Instanciarlo copia/deriva un draft; modificarlo no modifica el template original.

E2. Matching (P0)
- Flujo: user request → derive capabilities → search catalog → inspect top candidates → suitable? sí: instantiate + minimal customization; no: blank/minimal project.
- El agente no recibe automáticamente el código de todos los templates.
- Puede buscar por capabilities, game family, interaction model, player count, realtime/discrete, assessment, spatial requirements.
- Search devuelve metadata compacta; solo los mejores candidatos se inspeccionan en detalle.
- El agente puede decidir explícitamente "ningún template encaja".

E3. Composición (P1)
- Se distingue base template de module/recipe.
- Cada módulo declara dependencies, provided capabilities, conflicts, extension points, files/touch points.
- El servidor puede rechazar combinaciones incompatibles; orden de composición determinista.
- La IA no resuelve manualmente merge conflicts; el resultado es un proyecto normal editable.
- No hacer inicialmente: combinación arbitraria de N templates, inheritance graph gigantesco, template engine propio complejo. Primera versión: 1 base + N módulos compatibles.

## F. Templates como herramienta de COGS (P1)

- Preferir "configure existing behavior" sobre "rewrite behavior".
- Los templates exponen parámetros semánticos (duración, rondas, velocidad, mapa, scoring, preguntas, equipos, colores, assets) modificables sin reescribir arquitectura.
- El agente conoce qué es configurable.
- Medir % de juegos que nacen de template y código nuevo generado template-based vs scratch: generated_LOC / successful_game, generated_tokens / successful_game.

## G. SDK orientado a generación por IA (P0)

- El SDK encapsula comportamientos repetitivos; el juego no reimplementa timers, scores, turns, teams, cards, zones, inventories, common input, responsive presentation, basic animation, assets, spatial helpers cuando el SDK puede hacerlo.
- API declarativa cuando sea razonable; tipos simples; errores claros para el agente.
- SDK versionado; el build fija una versión concreta; un juego publicado nunca pasa silenciosamente a otro SDK.

## H. El agente no recibe toda la documentación del SDK en cada prompt

P0
- SDK index (cards, board, quiz, spatial, animation, assets, simulation...).
- Resumen compacto de capabilities; documentación específica y ejemplos por capability bajo demanda.
- No ingerir todo el manual por juego; ejemplos diseñados para copiar/adaptar.
- La documentación distingue requisitos, recomendaciones y escape hatches.

P1
- Búsqueda semántica sobre docs; el agent runner introduce solo secciones relevantes; fragmentos con SDK version.

## I. Contexto inicial del agente (P0)

Contiene solo información estable: qué es Playhoot; authoritative backend; modelo frontend/backend/shared; límites de seguridad; source/revision/build semantics; cómo usar las tools; cómo consultar SDK/templates; política de assets; política de testing; criterio de "done". No incluye todo el SDK, todos los templates, todo el código ni todos los resultados históricos.

## J. Flujo ideal del agente

1 Understand request · 2 Compact game brief · 3 Capabilities · 4 Search template/recipes · 5 Instantiate foundation · 6 Read only relevant SDK docs · 7 Modify source · 8 Build · 9 Fix deterministic errors · 10 Simulate · 11 Fix logic · 12 Resolve/generate assets · 13 Build exact candidate · 14 Human preview · 15 Publish same tested build.

P0: todo el recorrido con APIs/tools; ningún paso requiere manipular DB/storage; el agente sabe en qué fase está; el proyecto conserva un breve resume context.

## K. Game Brief antes del código (P1)

players, goal, game loop, actions, private information, round structure, scoring, ending condition, required capabilities, required assets, assessment if education. Se persiste con el draft; puede actualizarse; templates se buscan con base en él; simulaciones se derivan parcialmente de él; se compara juego final vs intención.

## L. Material del profesor (P0 para Teacher)

PDF/PPTX/DOCX/web: separar ingestión de creación (parse → chunk → structured metadata → retrievable corpus). Extracción una vez; fragmentos recuperables; brief reusable; mismo material para varias actividades; límites de tamaño/páginas/tokens/archivos. P1: conservar fragmentos usados; colección a nivel de curso.

## M. Assets

M1 (P0): el source declara qué assets necesita; asset manifest; estados declared/missing/uploaded/validated; la UI y el agente ven exactamente qué falta.
M2: signed upload URL; subida directa; Playhoot valida y registra; el código referencia asset IDs/logical keys; sin network fetch desde el juego. (Nota: en Playhoot los bytes que el backend valida pasan por el backend — `docs/engineering/standards/object-storage.md` del backend; lo esencial es que no pasen por el contexto del LLM.)

## N. SVG primero (P1)

Orden: HTML/CSS → SVG → asset/icono built-in de Playhoot → asset del usuario → raster generado. SVG como source/componente sin image-generation; el SDK facilita scaling, coloring, transforms, animation; guía contra SVG monstruosos; animaciones con abstracciones del SDK/CSS/JS.

## O. Biblioteca de sonido (P1)

Librería Playhoot de SFX comunes con logical keys (ui.click, ui.success, ui.error, game.coin, game.hit, game.whoosh, game.countdown, card.draw, card.flip), descubribles desde SDK docs, optimizados/licenciados. P2: música/loops; audio generation cuando aporte valor.

## P. Generación raster (P1)

Tool que genera, guarda, registra y devuelve asset_id; el LLM no maneja base64; presupuesto máximo de imágenes por job; límite de retries; reutilizar assets; transformaciones deterministas (crop, resize, background removal, conversión) sin llamar al modelo.

## Q. Build loop (P0)

TypeScript; bundle determinista; SDK/profile pinning; validators; static restrictions; asset validation; manifest validation. Resultado compacto para IA (FAILED, archivo, código, línea, mensaje, N errors total) y get_full_build_log() aparte.

## R. Fixes deterministas antes de otro LLM call (P1)

Distinguir auto-fixable / agent-fixable / unrecoverable platform error; auto-fixes no consumen generation loop.

## S. Simulación para el agente (P0)

Mismo runtime semantics que producción; virtual/deterministic time; seed; synthetic participants; COMMAND; SAMPLE transitions; timers; observation points; assertions; inspección del global authoritative state solo en authoring/test.

## T. Escenarios compactos (P1)

Scenario DSL/JSON compacto (P1 hold moveRight 1000–1800 ms...) que Playhoot compila a eventos reales; input segments; expected state; reutilizables; versionados con el proyecto.

## U. Resultados de simulación compactos (P0)

Por defecto un resumen (FAIL, assertion, actual, observation, state_ref); read_state(state_ref) bajo demanda; proyecciones inspeccionables individualmente; states grandes referenciados por ID.

## V. Screenshots/render (P2)

render(build, scenario, participant, viewport) con el frontend real, build exacto, headless, screenshot, vision opcional, límites.

## W. Human preview (P0)

Build exacto; jugar/controlar participantes sintéticos; cambiar perspectiva; misma test session; cambiar de participante neutraliza held inputs; reset/replay; lo visto es exactamente el candidato a publicar.

## X. Integrated AI y external AI usan el mismo Creation Service (P0)

Browser, MCP e Internal Agent sobre el mismo servicio: mismas SourceRevisions, build service, asset system, simulation service, validations, publish pipeline.

## Y. Manual copy/paste sigue siendo first-class (P0)

Pegar backend, frontend, shared; subir assets; pegar change package; crea una revisión normal; errores consultables por una IA externa.

## Z. Model provider abstraction (P1)

Abstracción de model execution; roles MATERIAL_PROCESSOR, BUILDER, REPAIR, VISION, IMAGE mapeables a modelos; cambiar modelo no cambia contratos del Creation Service.

## AA. Routing de modelos (P1)

Cheap model para material/metadata/summaries; builder model; strong fallback solo tras fallos repetidos; máximo de repairs antes de escalar; máximo absoluto de iterations; spend budget por job; final controlado.

## AB. Prompt/context caching (P1)

Prefijo estable (platform, SDK subset, tools) antes que lo específico; sin timestamps en el prefijo; SDK docs versionadas y cacheables; medir cached input.

## AC. Cost budgets (P0 para Playhoot AI monetizada)

max_model_calls, max_input_tokens, max_output_tokens, max_image_generations, max_builds, max_simulations, max_wall_time, max_dollar_budget; el LLM no amplía sus límites; el servidor los aplica; llegar al límite deja el proyecto recuperable.

## AD. Instrumentación económica (P0 antes de cobrar Teacher Pro)

Por job: provider, model, input/cached/output/reasoning tokens, model cost, image generations/cost, tool calls, build attempts, simulations, repairs, elapsed time, template used, generated LOC, accepted/rejected. KPI: AI cost per successful activity.

## AE. Métricas de calidad

first/second-build success rate; median y P90 repairs/game; simulation pass rate; preview → publish conversion; human corrections after AI; time to first playable; time to publish; cruzadas por model, template, game family, SDK capability.

## AF. Template economics

template-based vs scratch: cost/game, tokens/game, build attempts, repair attempts, time-to-preview, publish success.

## AG. Repeated failure protection (P0)

Detecta errores repetidos; no repite el mismo intento; retrocede a revisión buena; cambia estrategia/template; escala modelo; hard iteration limit.

## AH. Last-known-good revision (P0)

El sistema conoce last_good_revision; el agente puede restaurarla; un intento malo nunca destruye el trabajo bueno.

## AI. Template failure fallback

Abandonar un template sin reiniciar el proyecto manualmente; conservar brief/assets útiles; crear otra revisión desde otro template; el historial conserva qué ocurrió.

## AJ. Assets no inflan el context (P0)

El LLM recibe asset_id, type, dimensions, description; nunca blobs base64; vision solo con el asset relevante; thumbnails cuando basten.

## AK. Security boundaries (P0)

Permisos del Authoring Agent ≠ permisos del Game Runtime; la IA escribe draft; el juego publicado no obtiene credenciales; backend generado sin red, filesystem, environment ni secrets; frontend generado sin auth tokens ni credenciales de storage.

## AL. Publish no es autonomía total de la IA (P0)

La IA deja el candidato listo y puede recomendar publicar; el humano confirma.

## AM. Template catalog inicial

Bases: Quiz/reveal; Turn-based board; Cards/hand/zones; Classification/manipulation; Spatial world; Educational simulation; Shared creative canvas. Módulos: teams, timer, rounds, score, private information, voting, inventory/resources, projectiles, collectibles, movement, pathfinding, assessment.

## AN. Template vs Example vs Recipe/module

Example: para que la IA aprenda cómo se usa una parte del SDK. Template: source diseñado para clonarse/modificarse. Recipe/module: comportamiento componible. El catálogo los diferencia; el agente no clona un ejemplo documental como si fuera producción; examples pequeños; templates con QA más fuerte; modules declaran compatibilidad.

## AO. Acceptance tests end-to-end

1. Juego mínimo scratch ("dos jugadores, gana el primero que pulse diez veces"): crear, build, simulate, preview sin template.
2. Template casi perfecto ("quiz de 10 preguntas sobre fotosíntesis"): localizar quiz template, modificar principalmente contenido/config, poco source custom.
3. Composición ("dos jugadores caminan por un mapa y pueden dispararse"): SpatialWorld + Movement + Projectile sin reimplementar movimiento/colisiones/proyectiles.
4. Profesor + PDF: ingest una vez, retrieval, sin reenvío completo durante repairs.
5. Bug pequeño de una línea: la IA usa patch, no regenera 10k tokens.
6. Lógica incorrecta (compila pero scoring mal): la simulación lo detecta; inspect state → patch → resimulate.
7. Asset faltante (backgroundForest): UI/agente muestran missing; la IA integrada genera/registra o reemplaza por SVG.
8. Pérdida total del contexto del agente: un agente nuevo lee el estado, identifica el trabajo y continúa.
9. Concurrencia: dos agentes parten de revision 20; A escribe 21; B escribe sobre 20 → conflict, nunca overwrite.
10. Budget exhaustion: el agente se detiene dejando last-good revision, errores y resume context, sin seguir gastando.

## AP. Lo que NO exigir todavía

Marketplace de templates; contribuciones de terceros; visual editor completo; publish autónomo; screenshot vision loop obligatorio; self-hosted LLM; fine-tuned model; vector DB sofisticada si basta metadata; composición arbitraria de infinitos templates; generación de música; bots inteligentes jugando todos los tests.

## AQ. Las cinco preocupaciones principales

1. El agente recibe demasiado contexto. 2. Toda corrección reescribe archivos enteros. 3. Templates solo como "archivos que la IA puede copiar", sin capabilities ni semántica. 4. Simulation sin las semánticas reales del runtime. 5. No se mide costo por creación.

## Filosofía

User intent / material → Game Brief → capability selection → template search → base + reusable modules → relevant SDK subset → small custom source → build → deterministic test → small patch/repair → assets where needed → human preview → exact tested publish. Cada cosa que pasa de "el LLM la inventa" a "Playhoot ya sabe hacerla" reduce a la vez tokens, bugs, iteraciones, latencia y costo.

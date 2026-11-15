# Especificación del sitio de documentación del sistema

Requisito personal del creador. Lo construye T-001; lo mantienen todas las tareas.

## 1. Para quién y para qué

El creador no lee código. Quiere entender la **arquitectura del software**: dominios, datos, operaciones, flujos entre dominios, puntos de entrada y pantallas. Abre el sitio, ve poco, y despliega solo lo que le interesa.

- Sí: árbol de dominios, esquema de datos, qué lee y escribe cada operación, reglas de negocio principales, pasos de un flujo y por qué dominios pasa, ciclos de vida, endpoints, pantallas y sus llamadas.
- No: helpers, DTO, firmas, patrones de diseño, callbacks. No diagramas de secuencia.
- Aspecto: sobrio y legible. Sin animaciones ni decoración. Debe entenderse sin instrucciones.

## 2. Forma técnica

- Sitio estático que se abre con doble clic (`file://`): `docs/sistema/index.html` + `app.js` + `estilo.css`. Sin frameworks, sin build, sin dependencias, sin red.
- Los **datos** viven junto al código que describen y se cargan con `<script>`:
  - `playhoot/docs/sistema/manifest.js` → lista de archivos de datos del backend (uno por dominio).
  - `playhoot_frontend/docs/sistema/manifest.js` → pantallas y llamadas.
  - El `index.html` carga ambos manifiestos por ruta relativa (`../../playhoot/docs/sistema/manifest.js`); cada manifiesto hace `PH.cargar([...archivos])` y el sitio los añade como `<script>` en orden. Si un repo no está, el sitio funciona con lo que haya y lo avisa.
- Cada archivo de datos llama funciones de registro: `PH.dominio({...})`, `PH.tabla({...})`, `PH.operacion({...})`, `PH.flujo({...})`, `PH.endpoint({...})`, `PH.pantalla({...})`.
- Navegación por hash, una URL por entidad: `index.html#/dominio/play.session`, `#/operacion/play.session.crear-sesion`, `#/flujo/crear-sesion`, `#/endpoint/POST:/v1/sessions`, `#/tabla/play.session.play_sessions`, `#/pantalla/lobby-anfitrion`. Copiar la URL reproduce la vista.

## 3. Modelo de datos

Todos llevan `id` único, `nombre`, `resumen` (una frase) y `estado`: `planeado` | `implementado` | `verificado`. Texto en español; identificadores de código tal cual.

**dominio** — `id` (`play`, `play.session`), `padre` (id o `null`), `tipo` (`tradicional` | `entrada` | `orquestador` | `compositor` | `proceso`), `responsabilidades[]`, `noConoce[]` (lo que deliberadamente ignora), `fuentes[]` (p. ej. `P15§2`).

**tabla** — `id` (`<dominio>.<nombre_real>`), `dominio`, `proposito`, `columnas[{n, tipo, nota}]`, `indices[]`, `historial` (cómo se rastrea el cambio: tabla de cambios, escritura única, o `infraestructura` si está exenta), `referencias[{columna, a}]` donde `a` es entidad lógica de otro dominio (por identificador externo) o tabla del mismo dominio.

**operacion** — operación que expone un dominio. `id` (`<dominio>.<verbo>`), `dominio`, `tipo` (`caso-de-uso` | `workflow`), `efecto` (`lectura` | `escritura`), `lee[]` y `escribe[]` (ids de tabla), `reglas[]` (las principales, en lenguaje llano), `limites[]` (`{que, valor, origen: plan|dominio}`), `pasos[]` (si es workflow interno), `ciclo` (opcional: `{estados[], transiciones[{de, a, por}]}`), `encola[]` (tareas de cola que deja), `llamaSubdominios[]` (ids de operación de subdominios hijos), `fuentes[]`.

**flujo** — operación que cruza dominios. `id`, `coordinador` (`orchestrator` | `composer`), `efecto`, `pasos[{n, dominio, operacion, cuando, siFalla}]`, `persistencia` (`ninguna` | `pasos-registrados` | `cola`), `idempotencia`, `compensacion`, `ciclo` (opcional), `fuentes[]`.

**endpoint** — `id` (`METODO:/ruta` o `WS:/ruta` o `MCP:herramienta`), `transporte` (`http` | `ws` | `mcp`), `acceso` (`anonimo` | `invitado` | `cuenta` | `profesor` | `estudiante` | `admin` | `ia-externa` | `proveedor`), `invoca` (id de flujo u operación), `limiteDeRed`.

**pantalla** — `id`, `ruta`, `modo` (`normal` | `profesor` | `estudiante` | `admin`), `acceso`, `muestra`, `acciones[{nombre, llama: endpointId, navegaA: pantallaId}]`, `variantes` (`horizontal+vertical` | `unica`).

## 4. Vistas y puntos de entrada

Barra superior fija con: Inicio · Dominios · Operaciones · Flujos · Datos · Endpoints · Pantallas · Ciclos de vida · buscador.

| Vista | Muestra (plegado por defecto) |
|---|---|
| Inicio | Qué es cada sección, conteos por estado (planeado/implementado/verificado), accesos. |
| Dominios | Árbol de dominios. Página de dominio: responsabilidades → subdominios → operaciones que expone → tablas → de quién depende y quién lo usa. |
| Operaciones | Todas las operaciones expuestas, filtrables por dominio, efecto y estado. |
| Flujos | Todos los flujos orquestados. Página de flujo: pasos en orden, cada uno con su dominio; condiciones; persistencia e idempotencia; ciclo de vida; **dominios que toca** (árbol). |
| Datos | Por dominio: lista de entidades; al desplegar, columnas e índices. |
| Endpoints | Por área y transporte; cada uno enlaza a lo que invoca. |
| Pantallas | Grafo como lista navegable: pantalla → a cuáles navega → qué llama. |
| Ciclos de vida | Todas las máquinas de estados (de tablas, operaciones y flujos) en un solo índice. |

Reglas de interacción:
- Toda referencia a otra entidad es una fila con dos gestos: **flecha** = desplegar ahí mismo (anidable sin límite: flujo → paso → operación → tabla → columnas); **nombre** = ir a su página.
- Página de operación hoja (sin llamadas a subdominios): solo *qué lee*, *qué escribe*, *reglas principales*, y quién la usa (flujos, endpoints).
- Página de cualquier entidad: sección "Se llega desde" con todos los que la referencian (así el mismo contenido tiene varios puntos de entrada).
- Recorrido completo posible: pantalla → llamada HTTP → flujo → operaciones → tablas.
- El estado se ve como una etiqueta discreta; filtro global "solo implementado".
- Nada de texto largo: frases cortas; el detalle va en niveles desplegables.

## 5. Validación

`tools/validar-docs.mjs` (Node, sin dependencias), ejecutable desde la raíz del workspace:
- ids únicos; campos obligatorios; toda referencia resuelve (`dominio`, `lee`, `escribe`, `invoca`, `operacion` de pasos, `llama`, `navegaA`, `padre`).
- un `flujo` solo puede tener `coordinador` orchestrator/composer; una `operacion` de dominio no referencia tablas de otro dominio de primer nivel (regla de arquitectura).
- salida: errores con archivo e id; código de salida ≠ 0 si hay errores.

Cobertura contra el código (segunda etapa, una tarea por repo cuando la estructura esté estable): una prueba en backend que compara rutas registradas y tablas de las migraciones con los datos en estado `implementado`; una prueba en frontend que compara las rutas del router con las pantallas.

## 6. Mantenimiento

- Tarea de diseño (nivel A): añade o cambia entidades en `planeado`.
- Tarea de implementación: las pasa a `implementado` y corrige lo que haya cambiado al construir.
- Validación de hito: `verificado` cuando hay evidencia de comportamiento (prueba de recorrido).
- Un dato de documentación que contradiga al código es un defecto: se corrige en la misma tarea que lo detecta.

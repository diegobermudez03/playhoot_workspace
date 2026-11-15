# Método de trabajo del agente

Vigente desde el 15-nov-2026. Sustituye todos los procesos anteriores de ambos repos (WORK, ADR obligatorios, HUMAN_REVIEW, Logic Mirror, compuertas de aprobación).

## 1. Roles

| Quién | Qué decide o hace |
|---|---|
| **Creador** | Decisiones de producto no tomadas en `docs/definitivos/`. Seguir o parar por consumo. Ejecuta lo que el agente no puede: abrir sesiones con el modelo y esfuerzo indicados, instalar herramientas, crear cuentas, aportar archivos. |
| **Agente líder** (cualquier sesión) | Todo lo demás: plan, orden, arquitectura, código, pruebas, documentación, commits y push. No pide aprobación por tarea. |

El creador no revisa código ni transporta información entre sesiones. Todo lo que una sesión necesita está en el repositorio.

## 2. Dónde vive cada cosa

| Ruta (desde la raíz del workspace) | Contenido |
|---|---|
| `docs/definitivos/` | Especificación de producto (39 DOCX). `md/` = texto extraído para leer y buscar (`tools/docx2md.py` lo regenera). |
| `docs/agente/ESPECIFICACION.md` | Mapa resuelto: qué fuente manda en cada tema y qué dice. |
| `docs/agente/ESTADO.md` | **Punto de entrada de cada sesión**: tarea siguiente, modelo, qué está a medias. |
| `docs/agente/PLAN.md` | Hitos y tablero de tareas. |
| `docs/agente/tareas/T-NNN.md` | Encargo autocontenido de cada tarea y su resultado. |
| `docs/agente/relevos/` | Relevo cuando una tarea queda a medias. |
| `docs/agente/DECISIONES.md` | Decisiones técnicas del agente, valores por defecto elegidos y consultas al creador. |
| `docs/agente/PENDIENTES_CREADOR.md` | Lo que solo el creador puede hacer y para cuándo. |
| `docs/agente/BRECHAS.md` | Diferencias entre el código actual y la especificación. |
| `docs/agente/inventario/` | Fotografía del código al 15-nov-2026. |
| `docs/sistema/` | Documentación HTML del sistema para el creador (sitio). Sus datos viven en cada repo: `playhoot/docs/sistema/`, `playhoot_frontend/docs/sistema/`. |
| `docs/historico/` | Planes viejos 02–08: capa inferior, solo valen donde nada superior los contradiga. |
| `playhoot/`, `playhoot_frontend/` | Repos de código, cada uno con su git y su `AGENTS.md` técnico. |

## 3. Ciclo de una sesión

**Inicio**
1. Leer `ESTADO.md` y la tarea indicada (`tareas/T-NNN.md`). Leer solo lo que la tarea lista; no explorar de más.
2. Registrar el consumo inicial (§5).
3. Si la sesión corre con un modelo o esfuerzo distinto del que pide la tarea, decirlo en una línea y continuar salvo que la tarea lo marque como obligatorio.

**Trabajo**
4. Implementar según la capa superior de la especificación. Ante una diferencia con el código o con documentos viejos: se hace lo que diga la especificación y se anota en `BRECHAS.md` si no estaba.
5. Hueco de producto (algo que no está decidido ni se infiere): registrar en `DECISIONES.md` como consulta `C-NN` con la opción recomendada. Si no bloquea, seguir con el resto; si bloquea, parar esa parte.
6. Decisión técnica relevante (estructura de dominios, contratos entre dominios, proveedores técnicos, patrones): una entrada `D-NN` breve en `DECISIONES.md`. Sin ADR ni plantillas.

**Cierre** — una tarea está hecha cuando:
- [ ] El comportamiento cumple las secciones de la especificación citadas en la tarea.
- [ ] Las verificaciones del repo pasan (backend: `go build ./... && go vet ./... && go test ./...`; frontend: `npm run check`).
- [ ] La documentación del sistema (`docs/sistema` de cada repo tocado) refleja el cambio y su validador pasa.
- [ ] `PLAN.md`, `ESTADO.md` y el resultado en `tareas/T-NNN.md` están actualizados.
- [ ] Commit y push en cada repo tocado (§6).

**Mensaje final al creador**, siempre con esta forma y nada más:
1. Qué quedó hecho (2–4 líneas, sin detalle de código).
2. Consumo: inicial → final de ventana de 5 h y semanal, o "no medido".
3. Consultas abiertas que necesitan respuesta (si hay).
4. Orden siguiente: `Abre una sesión nueva en la carpeta repos · modelo X · esfuerzo Y · escribe: Tarea T-NNN`.

Después del cierre la sesión no acepta tareas nuevas: responde que se abra otra. Una sesión hace **una tarea**; puede encadenar otra solo si ambas son de tamaño S y la segunda usa el mismo modelo.

**Relevo:** si una tarea no termina en su sesión (contexto largo, pausa por consumo), se escribe `relevos/T-NNN-relevo-K.md` con: hecho, pendiente exacto, archivos a medio tocar, verificación que falta. `ESTADO.md` apunta al relevo.

## 4. Modelo y esfuerzo por tipo de tarea

El agente no puede cambiar su propio modelo: cada tarea declara el que necesita y el creador abre la sesión así.

| Nivel | Modelo · esfuerzo | Para qué |
|---|---|---|
| **A** | Fable · high | Diseño de dominios y contratos, lógica de riesgo (créditos, cobros, presupuesto y corte, concurrencia de sesiones, permisos, privacidad y borrado), dirección visual, replanificación. |
| **B** | Opus · medium | Implementar algo ya diseñado que requiere criterio: casos de uso, workflows, endpoints, pantallas con estado, pruebas. Es el nivel habitual. |
| **C** | Sonnet · medium | Trabajo bien especificado y repetitivo: pantallas de administración tipo listado/detalle, textos e idiomas, carga de datos de documentación, renombres, pruebas adicionales. |

- Subir un nivel solo si la tarea lo justifica por escrito. `xhigh`/`max` únicamente en tareas A marcadas así.
- Dentro de una sesión, delegar en subagentes con modelo más barato lo que sea búsqueda amplia o lectura masiva (`Explore`/`sonnet`/`haiku`), y conservar en la sesión principal el diseño, la integración y la verificación. No delegar lo que cabe en pocas llamadas.
- Las tareas A que diseñan un hito **escriben el diseño como datos de la documentación del sistema en estado `planeado`** y dejan redactadas las tareas B/C que lo implementan. Así el diseño no se transmite por conversación.

## 5. Consumo

Regla del creador: si durante un tramo de trabajo la ventana de 5 h sube más de 20 puntos o la semanal más de 2, parar y avisar; el creador decide si se sigue.

- Fuente automática: `.claude/usage.json` en la raíz del workspace (lo escribe el script de statusline `.claude/usage-statusline.mjs`). Si existe y su `ts` es de los últimos minutos, se lee al inicio y al cierre.
- Si no existe o está viejo: el agente no puede ejecutar `/usage`. Se estima el tamaño del trabajo hecho y se pide al creador que mire `/usage` en cada punto de pausa.
- Puntos de pausa obligatorios: el cierre de cada tarea, y dentro de tareas L los puntos que la tarea marque.
- No sobrepensar: sin exploraciones abiertas, sin releer lo ya resumido en `ESPECIFICACION.md` salvo el parche que gobierna la tarea, sin documentos intermedios que nadie leerá.

## 6. Git

- Tres repos independientes: `playhoot/` (backend), `playhoot_frontend/` (frontend) y el workspace (esta carpeta: especificación, plan y sitio de documentación). Cada commit se hace **dentro del directorio del repo que corresponde**.
- Solo `git add`, `git commit -m "..."` y `git push` desde la terminal del creador, con su identidad ya configurada. **Sin líneas de coautoría, sin atribución al agente, sin tokens ni credenciales del agente, sin `gh`.**
- Rama `main`, historial lineal. Un commit por paso coherente con las verificaciones en verde; push inmediato.
- Mensaje: `T-NNN: resumen en imperativo` (inglés, como el código).
- Nunca `--no-verify`, `--force`, ni reescritura de historia publicada.
- Antes del primer despliegue las migraciones se editan en su archivo original; se avisa al creador cuando debe recrear la BD local.

## 7. Documentación del sistema (requisito del creador)

Sitio HTML navegable y desplegable en `docs/sistema/index.html`. Especificación en `docs/agente/disenos/documentacion-sistema.md`. Reglas permanentes:

- Nivel de detalle: dominios y subdominios, esquema de datos por dominio, operaciones expuestas, flujos orquestados (pasos, condiciones, saga/persistencia, estados), endpoints, pantallas y sus llamadas. En una operación hoja: qué lee, qué escribe y las reglas de negocio principales.
- **No** se documenta diseño de código: helpers, DTO, patrones, firmas.
- Todo plegado por defecto; cada entidad tiene URL propia y se llega a ella desde varios puntos de entrada (dominio, operación, flujo, endpoint, pantalla, tabla).
- Sin diagramas de secuencia. Sin decoración: legible y sobria.
- Cada elemento lleva estado: `planeado` · `implementado` · `verificado`.
- Es parte de la definición de hecho de toda tarea. Un validador en cada repo comprueba que la documentación y el código no diverjan.

## 8. Reglas de ingeniería que se conservan

Los estándares técnicos existentes de cada repo siguen vigentes como capa inferior (compatibles con la especificación): convenciones de pruebas, repositorios y SQL (sin literales: constantes enlazadas como parámetros; inserts con `Create()`), almacenamiento de objetos (URL firmada solo cuando los bytes no pasan por el backend), logs y métricas, fronteras de paquetes del frontend, textos de usuario e i18n. Cada `AGENTS.md` de repo los enumera.

## 9. Entregas

- **Entrega 1 (local, proveedores simulados):** objetivo de este plan. Ningún código "provisional que luego se reemplaza": se construye la interfaz definitiva y un proveedor local real o simulado detrás del puerto.
- **Entrega 2 (integraciones reales):** con el creador, tras su prueba de la entrega 1.
- Lo que solo se puede cerrar con proveedores, dinero o trámites reales va a `PENDIENTES_CREADOR.md` con responsable y condición de cierre.

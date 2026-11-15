# Playhoot — entrada para el agente

Esta carpeta es el **workspace** de Playhoot: tres repos git independientes.

| Carpeta | Qué es |
|---|---|
| `.` (esta) | Especificación de producto, plan del agente y sitio de documentación del sistema. |
| `playhoot/` | Backend (Go). Tiene su propio `AGENTS.md` técnico. |
| `playhoot_frontend/` | Frontend (TypeScript, React). Tiene su propio `AGENTS.md` técnico. |

## Quién eres aquí

El **líder técnico en piloto automático**. El creador ya tomó las decisiones de producto y no revisa código ni aprueba tareas. Tú planificas, implementas, pruebas, documentas, haces commit y push. Solo dependes de él para: una decisión de producto que no esté tomada ni se pueda inferir, continuar o no tras una pausa por consumo, y acciones que no puedes ejecutar (abrir sesiones con otro modelo, instalar, crear cuentas, aportar archivos).

## Al empezar cualquier sesión

1. Lee `docs/agente/ESTADO.md`. Dice cuál es la tarea siguiente y qué quedó a medias.
2. Si el creador escribió `Tarea T-NNN`, lee `docs/agente/tareas/T-NNN.md` y sigue su sección "Leer antes". Si escribió otra cosa, atiéndela dentro de estas reglas.
3. Sigue `docs/agente/METODO.md` (ciclo de sesión, definición de hecho, consumo, git, forma del mensaje final). Es obligatorio y corto.

## Fuente de la verdad (de mayor a menor)

1. Parches `docs/definitivos/post_NN_*.docx` en los asuntos que regulan.
2. Documento base `docs/definitivos/playhoot.docx`.
3. Código actual y documentos antiguos, solo donde nada anterior los contradiga.

Texto para leer y buscar: `docs/definitivos/md/`. Mapa ya resuelto por tema: `docs/agente/ESPECIFICACION.md` — empieza siempre por ahí y lee completo el parche que gobierna lo que vayas a implementar. Si el código contradice la especificación, se cambia el código.

## Reglas que no se negocian

- **Git:** cada repo se confirma desde su propia carpeta con `git add`, `git commit -m` y `git push` simples. Nunca líneas de coautoría ni atribución al agente, nunca credenciales propias, nunca `gh`. Detalle en `METODO.md` §6.
- **Producto:** no decidas producto. Lo no decidido va a `docs/agente/DECISIONES.md` como consulta con recomendación.
- **Documentación del sistema:** toda tarea que cambie dominios, datos, operaciones, flujos, endpoints o pantallas actualiza los datos del sitio `docs/sistema` en el mismo trabajo (`METODO.md` §7).
- **Consumo:** no sobrepienses ni explores de más; pausa donde `METODO.md` §5 lo indica.
- **Cierre:** una sesión, una tarea. Tras el mensaje final no aceptes más trabajo: pide abrir otra sesión.
- **Proceso anterior retirado:** ignora `docs/ai/`, WORK, Projects, `HUMAN_REVIEW.md`, `AI_CONTEXT.md`, `CURRENT_STATE.md` y el Logic Mirror si aún aparecen en algún repo; no los sigas ni los actualices.

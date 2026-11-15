# Brechas: código actual frente a la especificación

Fotografía al 15-nov-2026 (detalle del código en `inventario/`). Regla: donde hay diferencia, manda la especificación. Esta lista orienta el plan; cada hito la afina al empezar.

Leyenda: ✅ existe y sirve · 🔧 existe y hay que cambiarlo · ➕ no existe.

## Resumen

Lo construido es el **núcleo técnico de jugar y de crear con IA externa**, y está bien hecho: dominios aislados sin llamadas directas, historial de datos, idempotencia, sandbox, runtime en tiempo real, SDK v1, aislamiento del juego en el navegador. Es aproximadamente la cuarta parte del alcance de fase 1.
No existe nada de: planes y pagos, créditos, presupuesto, profesor/estudiante, notificaciones, reportes y soporte, moderación, administración, Discovery público, historial y reproducción de replays, IA integrada, biblioteca de recursos, mercados y edad, analítica, cola transaccional.

## Transversal (backend)

| Tema | Estado | Qué falta o cambia |
|---|---|---|
| Aislamiento entre dominios | ✅ | Solo orchestrator/composer/api combinan dominios. `api` llama directo a operaciones de un solo dominio: se mantiene. |
| Historial de datos (data trailing) | ✅ | Estándar existente; aplicarlo a todo lo nuevo. |
| Cola transaccional + DLQ | ➕ | No hay. Hoy: tabla de builds como cola y una cola en memoria para replays. Todo lo asíncrono debe pasar al paquete común. |
| Orquestación con persistencia | 🔧 | Orchestrator no tiene estado; repara bajo demanda. Válido para lo actual; pagos y notas necesitarán pasos pendientes recuperables (P15§6). |
| Límites por plan pasados por el caller | ➕ | Único límite: 1 sesión activa por creador (variable de entorno). |
| Control de costos y admisión | ➕ | Nada mide ni limita gasto. |
| Métricas y alertas | 🔧 | Solo escriben al log (previsto para la entrega 2). Las métricas de resultado lógico por operación existen como patrón. |
| Analítica en BD | ➕ | |
| Varias instancias | 🔧 | `ownership` es un marcador; una sola instancia. Aceptable para fase 1. |
| Borrado de usuarios y juegos | ➕ | `games.deleted_at` nunca se escribe; no hay borrado de cuentas. |

## Identidad y acceso

| Tema | Estado | Qué falta o cambia |
|---|---|---|
| Invitado, cuenta, Google, proveedor local | ✅ | Google nunca probado contra el real (entrega 2). |
| Upgrade de invitado sin fusión con cuentas existentes | ✅ | Coincide con P03§10. |
| Código por correo | ➕ | P03§8. |
| Caducidad de invitados a 90 días | 🔧 | Hoy no caducan. |
| Edad declarada, país, matriz de mercados | ➕ | P19, P35. |
| Modos normal/profesor/estudiante | ➕ | Solo niveles anónimo < invitado < cuenta. |
| Identidad de estudiante por clase con credencial | ➕ | P03§2-7. |
| Vincular métodos, recuperación, perfil | ➕ | |
| Administrador con segundo factor | ➕ | No hay rol de plataforma. |
| Límite de cambios de nombre | ➕ | Hay historial, no límite. |
| OAuth para IA (MCP) | 🔧 | Alcance por **cuenta** (`games`: todos los juegos). P10§1 exige autorización **por borrador**. |
| Enlace de IA (7 días, revocable) | 🔧 | Hoy da lectura y escritura. P10§2: el enlace solo consulta; escribir exige autorización aparte. |

## Juegos, versiones y publicación

| Tema | Estado | Qué falta o cambia |
|---|---|---|
| Juego, ficha, logo y fotos, ediciones | ✅ | |
| Versión borrador → ejecutable inmutable | ✅ | Falta distinguir las cuatro condiciones de P15§2 (en edición, elegida, aprobada, fijada). |
| Versiones dentro de `play/session` | 🔧 | Separar en `play/versions` (P15§2). |
| Publicación | 🔧 | Hoy automática. Falta solicitud, revisión de admin sobre versión + ficha + recursos, y mantener la aprobada anterior mientras se revisa. |
| Historial de versiones, volver a una anterior, despublicar, eliminar | ➕ | |
| Declaración de contenido privado | ➕ | |
| Plantillas | 🔧 | La mecánica de copiar existe; nadie puede marcar un juego como plantilla; falta permiso explícito, procedencia, recomendadas administrables. |
| Categorías y tags | ➕ | Solo tipos sin tablas. |
| Discovery público, búsqueda, ficha pública | ➕ | `discovery` es un stub vacío. |
| Marca académica, idiomas, dispositivos en ficha | 🔧 | Idiomas y dispositivos se calculan en el build; falta exponerlos y la marca académica. |
| Cupos de juegos y creaciones | ➕ | |

## Sesiones y replays

| Tema | Estado | Qué falta o cambia |
|---|---|---|
| Crear, lobby, código y enlace, iniciar, cancelar | ✅ | |
| Runtime (comandos, samples, ticks, vistas, checkpoints) | ✅ | Se conserva. |
| Motivos de cierre | ✅ | Cubren P06§10. |
| Límites de duración (30 min, 10 min, 4 h) | ✅ | Falta el aviso previo y "Seguimos aquí". |
| Anfitrión que juega o dirige | 🔧 | Existe "unirme a jugar"; falta la elección con predeterminado y permisos de perspectiva según modo. |
| Reconexión | 🔧 | Gracia de transporte de 3 s; P06§3 exige 60 s conservando puesto. |
| Expulsar | ➕ | |
| Cerrar/reabrir admisiones | ➕ | |
| Un solo control activo, "Continuar aquí" | 🔧 | El cierre `replaced` existe; falta el recorrido. |
| Recuperación tras fallo de plataforma | 🔧 | Recuperación perezosa desde checkpoint; falta no descontar los 60 s durante la caída y comunicar incertidumbre. |
| Repetir partida cerrada | ➕ | |
| Reserva y consumo de usos, jugadores por plan | ➕ | |
| Sesión de clase (validación por Classroom) | ➕ | |
| Resultados por participante (notas) | ➕ | Sin contrato de resultados. |
| Historial de sesiones | ➕ | |
| Replay: grabación | ✅ | |
| Replay: reproducción, permisos, retención de 12 meses, sustitución de identidades | ➕ | |

## Creación

| Tema | Estado | Qué falta o cambia |
|---|---|---|
| Borrador con revisiones, diff, restaurar, conflicto optimista, idempotencia | ✅ | Cumple P10§5. |
| Builds, diagnósticos, previsualización, simulaciones con escenarios | ✅ | |
| MCP + API para IA externa, guía del SDK explorable | ✅ | Reconciliar permisos con P10 (arriba). |
| Flujo manual copiar-pegar | 🔧 | Existe en un espacio de trabajo de 9 secciones; la especificación pide enlaces específicos por operación y pantallas simples. |
| Brief | ✅ | `brief.json`. |
| Capturas/renders desde simulación | ➕ | |
| Imágenes de presentación automáticas | ➕ | |
| IA integrada (chat, trabajos, modelos, tope, créditos, investigación web) | ➕ | |
| Biblioteca de recursos administrable, pendientes, variantes | ➕ | |
| SDK: juego continuo 2D (movimiento, colisiones, proyectiles, cámaras…) | 🔧 | SDK v1 orientado a fases, comandos y componentes; hay dos juegos canvas de prueba. Ampliar (P36§5). |
| Reporte de error de creación | ➕ | |
| Dominio propio de creación | 🔧 | Repartido entre orchestrator, composer, api e identity. |

## Lo que no existe (dominios completos)

| Área | Parches |
|---|---|
| Plan, cobros, compras, reembolsos, prueba, protección de precio | P11, P23, P26–P28 |
| Créditos de IA | P12, P28 |
| Presupuesto, reservas, control de costos y apagón | P12, P30, P32 |
| Classroom: clases, estudiantes, materiales, actividades, notas, exportación | P02, P03, P07, P08 |
| Autorizaciones de menores, acuerdos, aceptaciones, solicitudes de privacidad | P20–P22 |
| Notificaciones in-app y correo (Resend/SES) | P14, P29, P31 |
| Reportes, soporte, correo entrante | P13, P33 |
| Moderación y medidas graduadas | P13 |
| Administración (todo) | B, P16 |
| Analítica | P34 |
| Retención y borrado programados | P02§9-11 |

## Frontend

| Tema | Estado | Qué falta o cambia |
|---|---|---|
| Arquitectura por paquetes, fronteras por lint, capas | ✅ | Tres rutas llaman al cliente sin pasar por estado: corregir. |
| GameHost, puente, aislamiento del juego, SDK cliente | ✅ | |
| i18n es/en/pt-BR con paridad | ✅ | |
| Navegación por path | ✅ | |
| Unirse, lobby, jugar, anfitrión, creación con IA externa, mis juegos, autenticación | ✅ | Se rehace su presentación. |
| Identidad visual | 🔧 | La actual ("noche de juegos", búho) es la que el creador rechaza. Se redefine. |
| Dos implementaciones por pantalla (horizontal/vertical) | 🔧 | Híbrido: algunas pantallas con variantes, otras con clases. |
| SEO | ➕ | SPA pura sin render en servidor ni metadatos por ruta. |
| PWA | 🔧 | Manifiesto sin iconos ni service worker. |
| WCAG 2.2 AA | 🔧 | Sin verificación. |
| Todo lo demás | ➕ | Inicio/Discovery, ficha, perfil, historial y replay, notificaciones, planes y compras, profesor, estudiante, soporte, administración, chat de IA. |
| App móvil | — | Diferida por P01§5; se retira `apps/mobile`. |

## Proceso y documentación

| Tema | Estado | Qué falta o cambia |
|---|---|---|
| Proceso por WORK/ADR/revisión humana | 🔧 | Contradice P01§2. Retirado por `METODO.md`; limpieza en T-003. |
| Logic Mirror (pseudocódigo Go) | 🔧 | Lo sustituye el sitio `docs/sistema`. |
| `CURRENT_STATE.md` y README | 🔧 | Desactualizados respecto al código. Los sustituye el sitio. |
| Exclusiones antiguas (pagos después del lanzamiento, capa de profesor fuera de alcance, IA propia fuera de alcance) | 🔧 | Anuladas por P01§3. |

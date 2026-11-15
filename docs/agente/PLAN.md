# Plan de implementación — fase 1, entrega 1 (local)

Plan **por olas**: los hitos y su orden están fijados; las tareas de cada hito las escribe su tarea de diseño (nivel A) al llegar a él. Así no se planifica en detalle lo que cambiará al construir lo anterior.

Objetivo: todos los flujos y reglas de `docs/definitivos/` ejecutables en local con proveedores simulados (ver `ESPECIFICACION.md` §1). Estimación gruesa: **120–160 sesiones**. Se afina al cerrar H1.

## Cómo se ordena

1. Primero lo que todo lo demás necesita (documentación, cola, límites, costos, notificaciones, mercados).
2. Después por rebanadas verticales: cada hito entrega backend + pantallas + su parte de administración + su documentación.
3. Lo que ya existe se reconcilia cuando su hito llega, no antes.
4. Cada hito cierra con un recorrido demostrable de sus comportamientos (P16§2).

## Hitos

| # | Hito | Contenido | Fuentes | Depende de | Sesiones |
|---|---|---|---|---|---|
| H0 | Método y documentación base | Sitio de documentación, arquitectura objetivo, limpieza de repos, carga de lo existente | METODO, B | — | 5–6 |
| H1 | Cimientos del backend | Cola transaccional + DLQ; convención de límites; `budget` mínimo (medición y admisión de costos, estados de restricción); `plan` mínimo (límites gratuitos configurables); `notifications` (in-app + correo simulado con modos Resend/SES); `compliance` núcleo (matriz de mercados, declaraciones, aceptaciones); `analytics` (ingesta por cola); administrador con segundo factor y registro de acciones | B: principios, P12, P29–P32, P34, P35 | H0 | 10–12 |
| H2 | Base del frontend e identidad visual | Render para SEO y PWA; **dirección visual (C-03)**; sistema de diseño; estructura con barra fija, switch de modos e idioma; autenticación contextual; base de la web de administración; accesibilidad AA como criterio | B: frontend/UI, P01§5, P14 | H0 (puede alternarse con H1) | 8–10 |
| H3 | Identidad y acceso | Código por correo; edad y país; invitados a 90 días; vincular métodos; perfil; modos; borrado de cuenta; entrada pública | P03, P19, P35, P14§1 · **C-01** | H1, H2 | 7–9 |
| H4 | Juegos, versiones, publicación y Discovery | Separar `play/versions`; cuatro condiciones de versión; revisión de publicación; despublicar/eliminar; plantillas con permiso y procedencia; categorías y tags; Discovery, búsqueda y ficha; mis juegos; cupos | P04, P05, P14§2, P15 | H1–H3 | 10–12 |
| H5 | Sesiones, historial y replays | Anfitrión, admisiones, 60 s, expulsión, control único, avisos, recuperación, repetir; reserva y consumo de usos; historial; reproductor; permisos; retención; sustitución de identidades | P06, P02§9-10, P13§5 | H4 | 10–12 |
| H6 | Planes, cobros, créditos y control de costos | Catálogo administrable; suscripciones y compras con proveedor simulado; prorrateos, cancelación, recuperación, reembolsos, disputas, descuento, precio protegido; prueba de Profesor; créditos; reservas y fondos; topes, restricción, pausa y apagón | P11, P12, P23, P26–P28, P30, P32 | H1, H3 | 14–18 |
| H7 | Creación con IA, SDK y biblioteca | Dominio `creation`; IA externa según P10 (consulta vs. modificación por borrador, MCP reconciliado, flujo manual por enlaces); capturas y presentación; biblioteca de recursos y su administración; SDK 2D continuo; IA integrada con proveedores simulados (trabajos, tope, créditos, investigación web); chat | P09, P10, P24, P25, P36, P37 | H4, H6 | 18–24 |
| H8 | Profesor: clases, actividades y calificaciones | Clases, estudiantes y credenciales; autorizaciones existentes y nuevas; acuerdo de tratamiento; materiales; contexto; biblioteca del profesor; actividades; sesiones de clase; notas, nota final y exportación; modos profesor y estudiante; grupos familiares | P02, P03, P07, P08, P20–P22 · **C-02** | H5, H6, H7 | 16–20 |
| H9 | Soporte, reportes y moderación | Tipos de reporte, casos, formulario público, correo entrante simulado, apelaciones; medidas graduadas; clasificación automática simulada; acciones del sistema | P13, P33 | H4, H5 | 6–8 |
| H10 | Administración y analítica (cierre) | Completar lo que cada hito no haya entregado: usuarios, juegos, colas, paneles de presupuesto y analítica de creadores | B: admin, P16§3, P34 | todos | 6–8 |
| H11 | Privacidad operativa, retención y respaldo | Borrados y purgas programadas; solicitudes de privacidad; registro de proveedores; respaldo y restauración en local | P02§9-11, P16§4, P22 | H8 | 4–6 |
| H12 | Contenido de lanzamiento | Juegos destacados (mayoría de juego continuo), plantillas académicas, inventario de recursos con pendientes para el operador | P09§7-10, P25§2, P36§3 | H7 | 6–10 |
| H13 | Validación de la entrega 1 | Recorridos completos con fallos y reintentos; evidencia por regla; inventario de entrega; guía para correr todo en local o en una VM | P16, índice 00§7 | todos | 4–6 |

Después: prueba del creador → iteración → **entrega 2** (integraciones reales, con el creador) → condiciones de producción (`PENDIENTES_CREADOR.md`).

## Tablero

Estados: `pendiente` · `en curso` · `hecha` · `bloqueada`. Tamaño: S, M, L. Nivel: ver `METODO.md` §4.

### H0 — Método y documentación base

| Tarea | Qué | Nivel | Tamaño | Estado |
|---|---|---|---|---|
| T-000 | Lectura completa, mapa de especificación, inventario, brechas, método, plan, repos listos | A | L | hecha |
| T-001 | Sitio de documentación del sistema: estructura, vistas, validador y datos semilla | B | M | pendiente |
| T-002 | Arquitectura objetivo: cerrar D-001 y cargar dominios, responsabilidades, dependencias y catálogo de flujos en `planeado` | A | L | pendiente |
| T-003 | Limpieza de ambos repos: retirar proceso documental viejo, binario versionado, carpetas vacías | C | M | pendiente |
| T-004 | Cargar en la documentación lo existente del backend como `implementado` | C | L | pendiente |
| T-005 | Cargar en la documentación lo existente del frontend como `implementado` | C | M | pendiente |

Orden: T-001 → T-003 → T-002 → T-004 → T-005.

### H1 — Cimientos del backend

| Tarea | Qué | Nivel | Tamaño | Estado |
|---|---|---|---|---|
| T-100 | Diseño de H1: decide paquetes compartidos y dominios nuevos mínimos, los documenta en `planeado` y escribe T-101… | A | L | pendiente |

### H2 en adelante

Cada hito empieza con `T-N00` (diseño, nivel A) que escribe sus tareas aquí.

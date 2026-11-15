# Mapa de la especificación (resuelto por capas)

> Qué es: el índice de trabajo del agente sobre `docs/definitivos/`. Para cada tema dice **qué fuente manda** y **qué quedó decidido**, ya aplicadas las sustituciones entre capas.
> Qué no es: no reemplaza los originales. Antes de implementar una funcionalidad se lee **completo** el parche que la gobierna (texto en `docs/definitivos/md/`).
> Cierre documental: 15-nov-2026 (base + post_01…post_37 + índice 00).

## 0. Cómo se resuelve una regla

1. **Parche `post_NN`** que regule el asunto → manda.
2. Si ningún parche lo toca → **`playhoot.docx`** (base).
3. Si la base tampoco lo toca → código actual y documentos viejos (`docs/historico/`, docs de cada repo), solo si son compatibles con lo anterior.

- Entre parches solo valen las **sustituciones expresas** (tabla §25). Número o fecha no resuelven una contradicción no declarada → se consulta al creador.
- El código acredita qué está implementado, nunca que una diferencia esté aceptada. Reconciliar = hacer lo que diga la capa superior.
- Notación: `B:` sección de la base · `P07§3` parche 07 sección 3.

## 1. Alcance de fase 1 y entregas — P01, P16, P17, P36, índice 00

- Alcance = todo lo de la base y parches: juegos generales, creación/edición con IA (3 rutas), sesiones multijugador, Discovery y reutilización, Profesor/estudiante, clases y calificaciones, planes y pagos, reportes/soporte, notificaciones, administración. Nada sale del alcance por no estar implementado (P01§3). **Personal y Profesor completos**, sin priorizar una (P17§2).
- Plataforma: **web completa escritorio + móvil y PWA instalable** (opcional para el usuario). Apps de tiendas diferidas (P01§5). **Sin push de ningún tipo** (P29). **Sin anuncios** (P37§1). **Sin analítica externa** (P34). **Sin IA generativa durante partidas** (P36§2).
- Idiomas de interfaz: español, inglés, portugués. Francés pospuesto (P01§7, P18§3).
- **Entrega 1 (local):** todos los flujos y reglas ejecutables con infraestructura local y proveedores simulados (permisos, límites, compras simuladas, fallos). Puertos listos para conectar proveedores reales. IA con respuestas preparadas (no demuestra calidad real). (B: propósito, P01§4, P16§1)
- **Entrega 2 (integrada):** se conectan proveedores reales (auth, IA, cobros, correo) tras la iteración del creador sobre la entrega 1.
- **Producción:** además exige cerrar condiciones de §24. La prueba final del creador no sustituye la validación del equipo ni exige aprobar cada etapa (P16§6).
- Nombre "Playhoot" es de trabajo: nombre, logo y dominio deben poder cambiarse sin perder funcionalidad ni datos; el agente no elige ni compra dominio (P36§7).

## 2. Autonomía del agente y consultas — B: propósito/modo de trabajo, P01§2, índice 00§7

- El agente elabora su plan, elige el orden y resuelve código, contratos concretos, organización interna, pruebas, algoritmos, almacenamiento, librerías.
- Se **consulta al creador** solo si una elección cambia: proveedor estratégico, precio, beneficio contratado, mercado, datos recogidos, permiso de reutilización, exposición financiera o alcance funcional; ante contradicción no resuelta; o limitación comprobada que impida entregar. Al nivel de abstracción de la base (dominios y su coordinación), nunca más granular.
- Sin aprobación rutinaria por unidad de trabajo. Sin esperar pruebas de usuario por etapa: el creador prueba al final de la entrega 1.
- Reglas de negocio no definidas pero necesarias: proponer y preguntar (B: reglas no definidas). Valores operativos menores: se fijan por defecto, configurables, y se registran en `DECISIONES.md`.
- Sesiones acotadas con documento de relevo; control de consumo (`/usage`: +20 % ventana 5 h o +2 % semanal → parar y avisar). Ver `METODO.md`.
- El agente también actúa como compliance/legal/contable: detectar lo que complique el lanzamiento; lo diferible se registra como pendiente con responsable (B: lanzamiento).

## 3. Principios técnicos no debatibles — B: principios

**Backend**
- **Data trailing** de toda fila relacional (valor anterior, cuándo, por qué). No aplica a streaming/datos de sesión en vivo (replay best-effort) ni a tablas de infraestructura (cache/colas).
- Normalizar sin sacrificar optimización. **Toda query scoped** con índices declarados; nunca full scan.
- **Top domains = servicios independientes** (una sola unidad desplegable hoy): tablas propias; sin transacción abierta durante llamadas fuera del dominio; **sin llamadas directas entre top domains** (solo vía orchestrator/composer); referencias cruzadas solo por identificadores externos. Árbol, no grafo: un subdominio solo lo conoce su padre. Cada dominio decide sus reglas internas.
- Firmas exportadas de un dominio solo usan tipos propios (excepción: orchestrator y composer).
- Sin complejidad de infraestructura innecesaria: un contenedor; cache/colas detrás de interfaces (mapa en memoria, tablas). Sandbox sí es proceso separado.
- **Todo lo asíncrono usa txqueue + dead letter queue** (paquete genérico compartido; tabla y worker por dominio; tareas idempotentes at-least-once; código de servicio / de cola / de procesador separados para migrar a outbox+cola real). Admin ve todas las DLQ y puede reintentar o cancelar.
- Observabilidad: logs que permitan reconstruir el recorrido entre dominios; métricas por endpoint (solo HTTP) **y** métrica de resultado lógico propia de cada operación de dominio; dependencia entre servicios visible. Analítica de largo plazo en BD desacoplada de la lógica (outbox o similar).
- Diseño de código: cada dominio tradicional tiene `workflows/` (ciclos de vida multi-paso) y `usecases/` (operación independiente). Tests: tabla de casos `map[string]func`, mocks con assert de parámetros, repos contra BD efímera.
- **Límites en 3 niveles** (B: reglas de negocio, plan): red (API, rate limiting), lógicos del dominio (casi toda escritura), capacidad por plan (Plan los define; el caller los pasa; el dominio dueño verifica el uso real y aplica el más restrictivo; se monitorea si lo recibido excede el propio).

**Frontend**
- Capas: UI (solo render + estado de UI) / estado-servicio (única capa lógica) / llamadas externas. Lógica en backend; composer puede exponer endpoints acoplados a pantallas.
- **Adaptativa:** cada pantalla con 2 implementaciones (horizontal y vertical) compartiendo componentes; cada una además responsive.
- Navegación por path: la URL define pantalla e input (copiar/pegar reproduce la pantalla si hay permisos).
- SEO como objetivo (búsquedas por categoría, no por marca). WCAG 2.2 AA (P14§3).
- **No AI slop.** Identidad visual propia, profesional, viva (animaciones de retroalimentación). Assets pendientes se registran en lista `pending_assets` con placeholder (B: UI).

## 4. Mercados, edad y menores — P02, P18, P19, P20, P21, P22, P35

- **Matriz (P35§1):** Colombia y México: Personal y Profesor completos; menores solo como participantes autorizados en clases o grupos familiares privados. Argentina y Chile: igual, tras condiciones del operador. EE. UU. (50 estados + DC) y Canadá salvo Quebec: solo adultos (incl. enseñanza a adultos); menores pospuestos. **Perú: preparado pero desactivado.** Resto (Brasil, Quebec, UE/EEE, RU, demás): pospuestos; desde ahí solo información pública, sin uso interactivo ni comercial.
- La matriz es configurable por mercado y función; activar un mercado exige condiciones reales (avisos, acuerdos, transferencias). Idioma ≠ país.
- **Funciones de adultos (P02§1):** crear/editar juegos, usar IA de creación, publicar/plantillas, crear/administrar sesiones y clases, contratar/comprar. Menores: jugar y participar; además pedir ayuda, reportar, ejercer derechos y ver sus resultados.
- **Edad declarada (P19, P35§3):** para crear, contratar o administrar se declara país (y estado/provincia) y haber alcanzado la edad exigida. Umbrales: 18 en CO/MX/AR/CL; EE. UU. 18 salvo Alabama y Nebraska 19, Mississippi 21; Canadá 18 en AB/MB/ON/PE/SK y 19 en el resto habilitado. Se guarda declaración y fecha como *edad declarada* (nunca "verificada"). Sin fecha de nacimiento, documento ni foto por defecto. Google/correo/tarjeta no prueban edad. No se puede eludir cambiando la respuesta repetidamente; corrección por soporte.
- Conocimiento de minoría (declaración, contexto de clase u otra información) activa restricciones aunque alguien diga ser adulto (P21§6).
- **Control territorial (P35§5):** considera al participante, no solo al profesor; aplica al ingreso y a la carga previa de datos. Señales: residencia declarada + ubicación aproximada; sin GPS; VPN/viaje no son sanción.
- **Profesor (P19§4, P20):** abierto a docentes, tutores, formadores; sin título ni correo institucional. Antes de incorporar alumnos reales: indica si actúa por cuenta propia o por institución, nombre y contacto confirmado, institución y función; declara autoridad; acepta **acuerdo de tratamiento** versionado y descargable (P22§2). Puede registrarse, probar y preparar con datos ficticios sin eso.
- **Autorizaciones existentes (P20):** registro de cobertura por alumno (quién conserva la evidencia, origen/referencia, fecha, alcance, vigencia, quién registró); permite registro en lote; separado del perfil académico; sin subir documentos por alumno. Autorización pendiente/retirada/insuficiente bloquea a ese alumno, no a la clase. Nunca mostrar "verificada por Playhoot".
- **Autorizaciones nuevas (P21):** página para el representante: correo confirmado por código, sin cuenta ni plan; ve organizador, datos, finalidades, accesos, conservación y cómo retirar; aceptación expresa con evidencia; constancia; consulta y retirada autenticadas (el profesor no puede anular la retirada). Datos del adulto: nombre, correo confirmado, condición de representante.
- **Grupos familiares privados (P21§4, P35§4):** el representante autoriza a su menor para un grupo identificado; no se extiende a otros anfitriones, clases ni partidas públicas; nadie autoriza menores ajenos.
- **Aceptaciones distinguibles y registradas (P22§3):** condiciones de uso/contratación; tratamiento de datos propios; acuerdo de datos de clases; opcionales (marketing).
- **Roles sobre datos (P22§1):** institución o profesor independiente decide finalidades de la clase y Playhoot trata por su cuenta; Playhoot responde por cuentas, suscripciones y juego general.
- **Entrada única de solicitudes de privacidad (P22§5):** acceso, corrección, eliminación, retirada; incluso sin cuenta; con seguimiento; identidad/autoridad comprobadas proporcionalmente.
- **Registro consultable de proveedores** (función, datos, países) (P22§6).
- Datos escolares: nunca publicidad, entrenamiento ni analítica comercial propia (P22§4, P34§4).

## 5. Identidad y acceso — B: identity y flujos de autenticación, P03, P15§3,§5

- Identity: cuentas, perfil (display name), upgrade, identificador lógico estable, resolución de tokens, tipos de cuenta/roles/modos y **permiso general de operación**. El scoping sobre el recurso concreto lo hace el dominio dueño.
- Tipos: sin cuenta (navega lo máximo posible) · **invitado** (solo display name, ligado al dispositivo; caduca a 90 días de inactividad, informado desde el inicio — P02§9) · **cuenta registrada** · identidad de **estudiante por clase**.
- **Métodos (P03§8):** Google (destacado) + **código de un solo uso por correo**. Sin contraseña propia. Otros proveedores cuando haga falta.
- Pantalla de autenticación contextual: recibe del llamador el motivo y si exige cuenta real; prioriza el tipo de cuenta más simple que sirva; al terminar vuelve a la operación conservando destino y datos (B, P14§1).
- **Upgrade de invitado (P03§10):** registrar cuenta nueva conserva identidad e historial. Iniciar sesión en cuenta existente no fusiona (se avisa).
- Vincular métodos (P03§11): acreditando control de cuenta y método; coincidencia de correo no fusiona. Recuperación por métodos vinculados (P03§12).
- **Modos (P03§9):** normal y profesor = misma cuenta general; estudiante = identidad separada. Switch visible de 3 modos; profesor sin plan ve presentación + invitación. `GET mis datos` indica identidad y rol al frontend.
- Vigencia de derechos (P15§5): tener token de profesor no mantiene funciones de pago tras vencer la suscripción; las operaciones que las requieren verifican derechos vigentes (precisa la base). Valores enviados por navegador o IA no conceden permisos ni cupos.
- **Estudiante (P02§5, P03§2-7):** identidad propia de una clase; campos: nombre (el profesor puede exigirlo), alias (obligatorio si no hay nombre; alias efectivo = alias o nombre), identificador interno del profesor (opcional, nunca visible como nombre de jugador). **Credencial individual, privada y revocable** (enlace personal, QR o código secreto) que permite volver desde otro dispositivo; nombre/alias/código de clase no son secretos (sustituye la contraseña opcional de la base). Solicitud por enlace/código de clase + aprobación del profesor; invitación individual puede incluir la aprobación. Antes de admitir: sin acceso a materiales ni lista. Recuperación: el profesor reemite credencial (invalida la anterior y sus sesiones). "Recordar en este dispositivo" opcional; varios accesos independientes por dispositivo sin cuenta central; cerrar sesión no borra datos.
- **Protección del adulto (P03§7):** salir del modo estudiante no abre la cuenta del adulto; recuperarla exige desbloqueo.
- Cambios de display name con límite lógico por ventana (B).
- Salir de invitado: advertencia de pérdida + oferta de upgrade; elimina acceso y datos que correspondan, **sin** romper replays compartidos (P02§10, §15).

## 6. Juegos, versiones y publicación — B: game/play, P04, P15§1-2, P13§3

- **Game:** juego lógico, dueño, ficha (nombre, descripción, portada), visibilidad, permiso de reutilización, marca académica, categoría (una) y tags (varios), límites de tenencia y creación, búsqueda. No conoce scripts ni ejecuta.
- **Play / Versiones:** contenido de cada versión (scripts frontend/backend/compartido, recursos), condición de ejecutable. **Play / Sesiones+Runtime:** lobby, participantes, partida, reconexión, cierre, resultados originales, grabación. Sandbox: proceso separado.
- **Cuatro condiciones de versión que no se confunden (P15§2):** en edición · lista y elegida para nuevas partidas · aprobada para Discovery · fijada en una sesión existente.
- Borrador → lista: supera controles (compila, ejecuta, mínimos de P09§2) **y** el creador la da explícitamente por terminada (P04§1).
- **Versión lista = congelada, incluidos recursos** (imágenes, audio, animaciones). Cambiar cualquiera prepara versión nueva (sustituye la base que permitía cambiar assets libremente). Nombre, descripción y portada se editan aparte; si son públicos pasan por revisión (P04§2,§4).
- Se puede mantener la versión actual jugable mientras se trabaja la siguiente, o dejar el juego no disponible. Se puede volver a una versión anterior disponible y autorizada (P04§5).
- **Publicación (P04§4):** la revisión aprueba una combinación concreta versión + ficha pública + recursos. Aprobar una no aprueba la siguiente. Durante la revisión de una actualización, Discovery sigue con la anterior aprobada. Juegos privados no generan tarea de revisión, pero sí cumplen reglas de contenido y seguridad.
- Declaración obligatoria de contenido privado: con datos/imágenes privadas no puede ser público (B). Con datos personales de una clase: acceso restringido a esa clase también al ejecutarse (P02§14).
- Despublicar ≠ eliminar ≠ bloqueo administrativo. Retirada/eliminación ordinaria no interrumpe partidas existentes ni borra replays ajenos (P04§6).
- Ficha en Discovery (P14§2): idiomas, jugadores, dispositivos/controles, académico, soporte de notas, plantilla; capturas de la versión ofrecida; estadísticas reales u omitidas.
- Imágenes (B, P09§4): portada del usuario, o captura elegida por la IA, o render inicial. Imágenes de descripción solo por capturas de simulación; IA integrada: mínimo 3.

## 7. Plantillas y reutilización — P05, B: crear juego

- Publicar ≠ permitir reutilización. Plantilla **desactivada por defecto**; aceptación explícita que explica el efecto duradero.
- Permiso estándar: copiar, modificar, combinar dentro de Playhoot (uso personal, educativo y comercial, sin regalías), con IA integrada o externa. No da distribución fuera ni amplía licencias de terceros.
- Copia = juego independiente desde una versión concreta; se conserva **procedencia y créditos** (también al combinar). No se arrastran chats, alumnos, notas ni contexto privado. Cada derivación necesita su propia aprobación para publicarse.
- Desactivar plantilla impide copias nuevas, no afecta derivaciones existentes.
- Recursos: solo se copian los autorizados para reutilización; los incompatibles se excluyen o sustituyen antes de habilitar.
- **Plantillas recomendadas:** selección administrativa acotada, por categorías, que la IA ve siempre primero; distinta de "disponible como plantilla". Discovery tiene filtro de plantillas; la IA puede buscar más (con tope de investigación).
- Copiar plantilla crea juego y consume una creación (P12§14).

## 8. Sesiones multijugador — B: flujos de sesión/experiencia, P06, P12§15, P27§1

- Crear sesión desde la pantalla del juego; requiere cuenta registrada adulta. Enlace compartible + código. Lobby con lista en tiempo real.
- **Anfitrión (P06§1):** juega o dirige sin jugar. Predeterminado: "También voy a jugar" en sesión normal, "Dirigir sin jugar" en actividad de clase. Cambiable en lobby; fijo al comenzar. Si juega ve solo su perspectiva; si dirige ve la de cualquier jugador. **Conserva controles (incl. expulsar) aunque juegue** (sustituye la base). Quien dirige no ocupa plaza (P27§1).
- Admisión (P06§2): nuevos solo antes de comenzar; el anfitrión puede cerrar/reabrir admisiones en lobby. Inicio habilitado al cumplir restricciones del juego (mínimo de jugadores).
- **Reconexión (P06§3):** 60 s conservando puesto; recargar o cerrar ventana ≠ salir. La partida no se pausa. Tras el margen, reingreso según el juego.
- Salir = inmediato, regreso según el juego. **Expulsión:** esa identidad no vuelve (ni se consulta al juego). La plataforma distingue corte, salida y expulsión.
- **Un solo control activo por jugador** (P06§5): otra pestaña no crea participante; "Continuar aquí" transfiere el control.
- Desconexión del anfitrión no cancela; sin transferencia automática de privilegios (P06§6).
- **Duración (P06§7):** lobby 30 min; inactividad 10 min con aviso ("Seguimos aquí"); sala 4 h. Se muestran al crear. Si todos salen o agotan margen, se cierra.
- Fallo de plataforma (P06§9): intentar recuperar la misma partida desde el último estado confiable; los 60 s no corren durante la caída; si no, cerrar como interrumpida. La interfaz no afirma cierres no confirmados.
- **Motivos de cierre (P06§10):** finalización normal, cancelación del anfitrión (con confirmación), vencimiento, abandono de todos, interrupción técnica. Una cerrada no se reabre.
- Repetir (P06§12): nuevo lobby con mismo juego, versión y configuración (y clase); no sobrescribe.
- Cada sesión fija su versión desde el lobby (P04§3).
- Pantalla final la define el juego; queda visible sin WebSocket. Juegos normales sin contrato de resultados; calificables sí (§13).
- Arquitectura de juego existente se conserva: comandos (request/reply), samples (continuo), update/ticks (mínimo 50 ms, ajustado por juego), servidor autoritativo, proyecciones por jugador, deltas (B).
- Consumo (P11§10, P12§15): el lobby **reserva** un uso; iniciar lo **consume**; cancelar/vencer antes lo libera; reconectar o recuperar no consume; fallo confirmado de Playhoot lo restituye.
- Sesión de clase: solo estudiantes vinculados; la validación es de Classroom vía orquestación (B: classroom); enlace/código no la evita.

## 9. Replays e historial — B, P02§9-10, P04§3, P06§11, P13§5

- Historial de sesiones jugadas y hosteadas (filtros por fecha y juego; vistas por sesión y por juego). Detalle: juego (o "ya no disponible"), anfitrión, participantes (solo display name), duración, reproductor tipo video (play, seek), botón reportar.
- Replay de baja precisión, best-effort; si faltan tramos lo indica. **Permisos de perspectiva = los de la partida** (jugador: la suya; anfitrión que dirigió: todas; anfitrión que jugó: solo la suya — P06§1 sustituye la base).
- Conservación: 12 meses desde la sesión. Conserva lo necesario de la versión original.
- **Borrado de cuentas no rompe replays:** identidad sustituida por referencia neutra distinguible dentro de la partida ("Cuenta eliminada"), también dentro del contenido reproducido. El diseño de grabación y de juegos debe permitirlo (P02§10).
- Excepción de seguridad/legalidad (P13§5): primero ocultar el contenido afectado; si no basta, restringir el replay completo explicando el motivo.
- Notas nunca se reconstruyen desde el replay (P06§11, P15§3).

## 10. Creación con IA — B: crear juego, P09, P10, P24, P36, P37, P15§1

- **Creación** = responsabilidad explícita (mínimo un workflow separado): brief, conversaciones, trabajos de IA, avances, correcciones, resultados de validación, autorizaciones de IA externa (P15§1).
- Flujo (B): crear juego → comprobar capacidad (tenencia / ventana) → pedir nombre → crear borrador (ocupa cupo) → elegir ruta: **IA propia (enlace)** o **chat integrado** (según suscripción/créditos). Entradas: barra principal, "mis juegos", juego-plantilla.
- Gestión directa mínima en pantalla: nombre, descripción, portada, visibilidad, opciones. Todo lo demás vía IA/enlaces.
- **Brief (P09§1):** descripción breve mantenida por la IA (objetivo, mecánica, jugadores, reglas, final, dispositivos, idioma, criterios de nota), consultable y corregible.
- **Listo (P09§2-3):** se ejecuta, permite completar la experiencia y cumple reglas esenciales; pruebas con resultados esperados (partida completa, cantidades de jugadores, salidas/reconexiones, temporizadores, información privada, notas esperadas). Aplica a las 3 rutas. Finalizar sigue siendo acción explícita del creador.
- Revisión visual sobre el juego real en dispositivos declarados; previsualización sin alumnos ni notas (P09§4). Por defecto escritorio + móvil; idioma del pedido; idiomas declarados (P09§5).
- Avance recuperable; la IA explica qué completó, comprobó y falta (P09§6).
- **IA externa (P10):** autorización por **borrador de una versión de un juego**. El **enlace es de consulta** (instrucciones, estado, recursos, resultados): por sí solo no escribe ni ejecuta. Para editar directo, el creador habilita desde Playhoot una **autorización de modificación** (cambios, subida de recursos, simulaciones, previsualizaciones) sin aprobación por operación; la IA no necesita cuenta. Finalizar y solicitar publicación: solo el creador. **Caduca a 7 días**; revocable y renovable (renovar invalida el anterior). Flujo manual copiar-pegar-avisar con enlaces específicos; el usuario nunca copia resultados de vuelta. Cambios concurrentes no se pisan; **historial recuperable** con origen; reenvíos idempotentes. No consume créditos de IA; sí límites de plataforma. Contenido externo no amplía permisos.
- Superficies para IA externa (B): MCP server + endpoints HTTP; documentación explorable e indexable (no leer todo); lectura dinámica del estado; escrituras: scripts (completo o parche), assets, simulaciones, capturas, reportes de error.
- **IA integrada — modelos (P24):** Anthropic + OpenAI por API directa. Haiku 5.5: extracción/clasificación/síntesis de materiales y actividades sobre plantilla sin cambiar mecánica. Sonnet 5.5: juegos originales, mecánicas, código, reparaciones, gráficos por código y su revisión. GPT-Image-2.6 Flare: raster. `omni-moderation-latest`: clasificación inicial. Continuidad de contexto (traspaso explícito Haiku→Sonnet; Flare recibe encargo compacto). Tras 2 correcciones automáticas del mismo recurso se reevalúa el enfoque. Gemini y DeepSeek no se integran.
- **Investigación web (P37):** herramientas de búsqueda/lectura de Anthropic, solo en preparación; fuentes identificadas; fallos y cobertura parcial comunicados; costo dentro del máximo del trabajo; sin datos de estudiantes ni materiales privados en consultas.
- **Sin modelos generativos en partida** (P36§2): ni oponentes, ni calificación, ni generación en vivo. Sí lógica programada y procedural.
- **Alcance 2D abierto (P36):** géneros no son lista cerrada; destacados iniciales mayoritariamente de juego continuo (movimiento, acción). Se elimina la cobertura obligatoria de 6 familias de P09§7,§10. Validación de juego continuo con participantes simultáneos y retrasos de red (P36§6).
- **SDK / herramientas reutilizables (P09§8, P36§5):** turnos, rondas, temporizadores, puntuaciones, equipos, cartas, tableros, información privada, movimiento y colisiones 2D, proyectiles, objetos interactivos, escenarios, cámaras, enemigos programados, objetivos, sistemas evolutivos, controles, animaciones, sonido. Componentes visuales y de movimiento reutilizables (P24§3). Pautas de diseño para mantener calidad.
- Controles de sonido, volumen, reducción de movimiento; avisos importantes también visuales (P09§12).
- Antes de abrir la creación integrada a usuarios reales: demostración con IA real (P09§11).
- Reportar error de creación: usuario o IA (directo o por enlace con texto a pegar), vinculado al juego (B).

## 11. Biblioteca de recursos — P25, P09§9-10, P36§5, P04§2

- Biblioteca propia administrada desde admin: SVG, Lottie, imágenes, sonidos; personajes, objetos, escenarios, interfaz, efectos. Estados: **disponible / pendiente / retirado**. Búsqueda por función y estilo; previsualización/escucha.
- **Registros iniciales por migración**, incluidos pendientes cuyo archivo aporta el operador. Cada pendiente: nombre, finalidad, formato, estilo, poses/animaciones, requisitos, relación con experiencias iniciales, si es necesario para abrir fase 1. El operador también crea pendientes y sube archivos desde admin.
- La IA conoce la disponibilidad real; nunca usa un pendiente como existente.
- Fuentes externas: Kenney (gráficos y sonido), Lucide (iconos), Google Fonts OFL alojadas por Playhoot. Sin LottieFiles.
- **Variantes:** la IA modifica recursos editables → recurso derivado con referencia a origen y versión; no altera el original; incorporarlo al catálogo común es decisión de admin.
- Actualizar un recurso = versión nueva para usos futuros; nunca cambia juegos, sesiones ni replays existentes. Retirar ≠ borrar.
- Procedencia, licencia y atribuciones conservadas. Creadores aportan archivos confirmando derechos (sin documentos por subida).
- Fotos: mascotas, objetos y adultos autorizados sí; **no avatares de estudiantes menores identificables**. Sin generación de música, voz ni video.
- Audio: librería descrita textualmente para que la IA elija; el usuario puede subir el suyo.

## 12. Classroom: clases, estudiantes, materiales, actividades — B: flujos profesor/classroom, P02, P03, P07, P15§3

- **Conceptos (P07§1):** Clase (grupo con contexto e historial) · Juego (contenido reutilizable) · **Actividad de clase** (uso preparado de un juego en una clase, con configuración e historial) · Sesión (sala concreta). La actividad puede crearse sola al iniciar la primera sesión. Cada actividad fija versión y configuración; cambios de contenido/evaluación tras usarla = otra actividad.
- Classroom es dueño de: clases, inscripción, datos del estudiante en la clase, materiales, contexto, actividades, biblioteca del profesor, notas. Referencia juegos y sesiones por identificador externo. Game/Play no conocen clases.
- Dashboard de profesor como pantalla principal del modo profesor: clases, crear, entrar.
- Clase: nombre, descripción; estudiantes; código de invitación; solicitudes pendientes; retirar estudiantes; historial de actividades; contexto.
- **Biblioteca del profesor (P07§3):** favorito = referencia (sin propiedad ni edición; avisa si el original no está); copia editable solo si es plantilla. Organización libre por carpetas/tags.
- **Materiales (P07§4-5):** privados por defecto; carpetas/etiquetas sin asignaturas obligatorias; reutilizables entre clases. Usar con IA ≠ compartir con estudiantes. Formatos: PDF (incl. escaneado legible), DOCX, PPTX, TXT; se informa lo no interpretado; la IA dice qué usó. Reemplazar afecta generaciones futuras. Límites: 50 MB por archivo; por trabajo de IA 100 páginas/diapositivas y 100 000 caracteres (P27§5).
- **Contexto e IA (P02§12-13):** contexto pedagógico (nivel, objetivos, refuerzos); sin diagnósticos, situaciones familiares ni historial disciplinario de alumnos identificables. Nombres de participantes se incorporan **al jugar**, no se envían a la IA generadora ni quedan incrustados. La IA no accede a notas por existir la clase.
- Sesión desde Discovery/biblioteca: elegir standalone o clase; desde la clase: elegir juego de la biblioteca. Estudiante entra desde su panel de clase, o por código/URL de sesión (se le lleva a modo estudiante; no se le pide código de clase).
- Discovery de profesor: solo juegos académicos (de profesores aprobados y de la plataforma).
- **Cerrar (P07§6, P02§11):** detiene inscripciones y partidas; consulta y exportación durante la retención. Clase vacía se elimina; clase usada también puede eliminarse a solicitud con advertencia y exportación previa. Retirar estudiante revoca acceso sin borrar resultados que deban conservarse.
- **Duplicar:** estructura, materiales autorizados y contexto pedagógico; nunca estudiantes, notas ni contexto personal.
- **Retención (P02§9):** clase abierta sin uso 12 meses → aviso y archivo; clase cerrada 24 meses desde el cierre (aviso, ampliable si es válido). Cancelar suscripción o fin de prueba no borra notas: queda consulta, exportación y eliminación.
- Borrado (P02§11): acceso retirado de inmediato; 30 días en sistemas activos; 90 días en respaldos; restaurar no reactiva lo eliminado.
- Archivar clase libera cupo activo; reactivar exige capacidad (P27§1). Estudiantes se cuentan por clase (P12§16).

## 13. Calificaciones — P08, P06§11, P15§3

- Académico ≠ soporta notas ≠ actividad calificada. **Calificar es opcional y por actividad**; requiere que la versión soporte entrega de resultados por participante. Nunca se convierten ganadores/puntos en notas (sustituye la base).
- Contrato: el juego entrega **nota por participante**; la lógica (incl. equipos) es interna al juego. Play conserva el resultado original; Classroom lo asocia al estudiante.
- Escala y criterios declarados antes de jugar, en lenguaje claro. Numéricas y categorías ordenadas (letras).
- Resultado fuera de escala, incompleto o de participante incorrecto → pendiente de revisión, sin ajuste silencioso.
- **Intentos:** se conservan; reconectar no crea intento. Por defecto cuenta la mejor nota final válida; configurable: primero, último, mejor, promedio (si numérica).
- **Estados:** pendiente, sin participación registrada, resultado parcial, resultado inválido, exento; cero solo si se asigna. Fallo de plataforma no genera cero ni intento fallido.
- **Publicación:** por defecto pendiente de revisión; publicar en lote; opción de publicación automática por actividad. Separada de la puntuación que muestra el juego.
- **Correcciones:** se conservan original, calculada y correcciones (quién, qué, cuándo); reversible; un intento posterior no pisa una corrección manual.
- **Nota final opcional:** el profesor elige actividades y escala de salida; **equivalencias explícitas** entre escalas (sustituye la exigencia de misma escala); pesos iguales por defecto o porcentajes que suman 100; provisional con cobertura de peso; exentos redistribuyen; precisión interna y redondeo final (2 decimales por defecto, configurable); nota publicada conserva sus insumos; cambios se previsualizan como borrador.
- **Exportar a XLSX:** nombre, alias, identificador interno; originales, escalas, equivalencias, pesos, estados, nota final; distingue provisional de publicado; exportar no publica.
- Estudiante ve solo notas publicadas.

## 14. Planes, suscripciones y pagos — P11, P23, P26, P27, P28, B: plan

- Familias **Personal** (= Normal) y **Profesor** (incluye Personal). Una suscripción por cuenta. Mensual con renovación automática informada. Límites de partida son del anfitrión; participantes gratis.
- **Catálogo (P26§1, P27§1, P28§3):**

| | Personal Esencial | Personal Plus | Profesor Esencial | Profesor Plus |
|---|---|---|---|---|
| Precio USD/mes (impuestos incl.) | 6 | 10 | 7 | 15 |
| Juegos guardados | 20 | 80 | 50 | 200 |
| Creaciones/período | 10 | 30 | 20 | 60 |
| Partidas iniciadas/período | 30 | 100 | 80 | 200 |
| Jugadores/partida | 20 | 50 | 50 | 100 |
| Salas simultáneas (con lobbies) | 1 | 2 | 1 | 2 |
| Almacenamiento | 500 MB | 2 GB | 1 GB | 5 GB |
| Clases activas | — | — | 5 | 20 |
| Estudiantes/clase | — | — | 50 | 100 |
| Créditos IA/período | 1 000 | 3 000 | 1 000 | 5 000 |

- **Gratis (cuenta registrada adulta, P27§2):** 3 juegos (con borradores), 2 creaciones/30 días móviles, 5 partidas/30 días móviles, 10 jugadores, 1 sala, 100 MB, IA dinámica según presupuesto, sin clases nuevas. Límites gratuitos configurables en admin con fecha efectiva, simulación e historial; bajar no crea deuda ni borra (P27§3).
- **Compras puntuales (P27§4, P28§3):** recargas IA USD 5/10/20 → 1 000/3 000/7 000 créditos (no caducan); paquete de 5 partidas hasta 50 jugadores (USD 5); 5 creaciones (USD 5); ampliación a 100 jugadores en 3 partidas (USD 5). No-IA: 90 días de vigencia. Sin suscripción también. Antes de vender se comprueba que el beneficio sea aprovechable.
- **Prueba de Profesor (P11§7, P28§1-2):** 7 días, una vez por cuenta, sin tarjeta ni contratación automática. 2 clases, 50 estudiantes, 5 juegos, 3 creaciones, 10 partidas, 50 jugadores, 1 sala, 500 MB, 500 créditos. Bolsas promocionales independientes que vencen al terminar. Exige presupuesto reservado. Con Personal vigente: se aplica la mayor capacidad, sin sumar. Avisos: activación, 24 h antes, fin (P31§4).
- Antes de pagar: funciones, capacidades, precio, moneda, total, período, próxima renovación. Agotar capacidad nunca cobra solo (P11§2).
- Cambios (P11§4): subida inmediata tras pagar prorrateo, conserva fecha; bajadas y cambios mixtos en la renovación. No reinicia consumo.
- Cancelar: simple; beneficios hasta fin de período; se puede deshacer (P11§5). Renovación fallida: 7 días de recuperación sin nuevas bolsas (P11§8).
- **Pago:** pendiente / confirmado / rechazado; activa solo con confirmación fiable del proveedor (no al volver del checkout); idempotente; pago confirmado con activación fallida se recupera solo (P11§6, P15§6).
- **Descuento primera suscripción (P11§11):** una vez; suma la parte **consumida** de compras pagadas no reembolsadas ni disputadas, sin impuestos; máximo 2 mensualidades; meses en cero conservan beneficios.
- **Reembolsos (P11§13-15):** 14 días para la primera mensualidad sin uso de beneficios pagados o parte no consumida de compras; duplicados se devuelven; "Mis compras" con solicitud y seguimiento; usos en disputa quedan reservados. Disputa suspende beneficios del pago, no banea ni borra (P11§16).
- **Proveedor (P23):** Lemon Squeezy como Merchant of Record único; USD; **precios con impuestos incluidos**; tarjetas, PayPal, Apple Pay, Google Pay. Comisiones de referencia: 5 % + 0,50; +0,5 % suscripción; +1,5 % internacional; +1,5 % PayPal; 1 % desembolso. Cambiar de proveedor es decisión del creador.
- **Precios (P26§4-7):** planes administrables desde admin (familia, nivel, precio, cupos, funciones, vigencia; borradores no públicos) con historial. **Aumentos solo a nuevas contrataciones**; suscripciones vigentes conservan su precio base (sustituye P11§3). Rebajas aplican al próximo cobro sin superar nunca la tarifa protegida. La protección no convierte promociones en tarifa permanente.
- Tres responsabilidades (P15§4): **Facturación** (compras, cobros, renovaciones, reembolsos, conciliación) · **Plan** (derechos, capacidades, saldos, créditos) · **Costos y presupuesto** (gasto real, reservas, cobertura). Pago confirmado, capacidad habilitada y gasto incurrido son hechos distintos conciliables. Cada dominio registra su uso real (Game creaciones, Play partidas, Creación trabajo de IA) sin dos balances contradictorios.
- Plan devuelve límites por usuario (por defecto gratuitos si no hay registro); el orquestador los pasa (B: plan).
- No presionar suscripción al tocar un límite: primero la compra puntual, luego planes (B). "Mis compras" en perfil.

## 15. Créditos de IA — P12§7-12, P28§3-5

- **1 crédito = USD 0,001 de costo interno**, estable. Consumo = uso facturable × tarifas registradas; fracciones admitidas; sin mínimo por llamada.
- **Máximo autorizado por trabajo (P12§8):** estimación + tope ajustable; trabajar dentro sin confirmar cada llamada; pausar antes de agotarlo; ampliar exige decisión del usuario; nunca compra automática. Desvíos por controles de Playhoot los asume Playhoot.
- Iteraciones normales cuentan; ciclos sin progreso se detienen; cancelar conserva avance y cuenta lo incurrido. **Fallo sin resultado aprovechable o trabajo perdido por Playhoot no se cobra** (se repone con vigencia original, mínimo 30 días si estaba por vencer).
- Vigencias: mensuales vencen al cierre del período, no acumulan; promocionales según anuncio; recargas no caducan. **Orden de consumo:** primero lo que antes vence; a igual vencimiento gratuito/promocional antes que pagado; recargas al final.
- Cambio de plan: solo incremento proporcional. Trabajo en curso se liquida contra su reserva original.
- Usuario ve: disponible, reservado, consumido, vencimientos, movimientos por solicitud. Internamente se separan costo real, créditos descontados y compensaciones. Idempotencia de descuentos.
- Simulaciones y capturas sin IA no gastan créditos (límites propios).
- IA gratuita: dinámica por presupuesto; techo individual = 30 % del cupo del plan pagado más barato (B); reparto por tramos del mes con previsión de demanda (P12§3). Bolsa inicial compartida gratis + pruebas: **USD 10/mes** (P30§5).

## 16. Presupuesto, reservas y control de costos — B: monetización, P12, P30, P32

- Aporte de arranque: hasta USD 120/mes cuando haga falta; no es techo ni déficit ilimitado (P30§3).
- **Fórmula vigente (P30, sustituye "el mayor entre" de base y P12§1):** primero operación y compromisos, luego excedente libre. Solo el **efectivo disponible** financia gasto (ventas ≠ liquidaciones ≠ efectivo).
- **Reservas prioritarias (P30§2):** beneficios comprometidos (créditos, compras, pruebas, promociones, retención); operación = 30 días de OPEX; incidencias = máx(USD 30, 5 % de ventas confirmadas de 90 días). Se forman progresivamente.
- **Excedente libre:** 70 % crecimiento / hasta 30 % retiro voluntario, una sola vez por excedente (P30§4). Parámetros configurables en admin con simulación, vigencia e historial.
- Cobertura antes de asumir (plan, prueba, promoción) y antes de ejecutar operaciones costosas; el trabajo concurrente ya ocupa presupuesto (P12§4).
- **Control de costos (P32):** todo consumo con costo es medible, limitable y suspendible (IA, imágenes, correo, archivos, simulaciones, exportaciones, colas, reintentos, tráfico, almacenamiento, CPU…). Topes monetarios horarios/diarios/mensuales, globales y por categoría, + velocidad, concurrencia y volumen. Admisión cuenta gasto conocido + estimado + reservado + margen. **Límite ausente, presupuesto cero o costo inválido = bloquear**, nunca ilimitado. Métricas críticas faltantes → restringir.
- **Escalera:** normal → restricción (gratuito/discrecional primero) → pausa selectiva por categoría → **apagón de emergencia automático** (puede interrumpir partidas pagadas y correo prioritario; prevalece sobre continuidad de P12/P27 y prioridad de P31). Alcanza colas, jobs, reintentos y llamadas externas. Bloquea ventas no entregables. No es baneo; restituye consumo; no inventa notas. El motivo se comunica como restricción del servicio, no como falta de saldo.
- Apagón persiste hasta reapertura manual explícita (ni reinicio, ni despliegue, ni cambio de mes lo levantan); reapertura gradual. Admin: corte inmediato, motivo, ajuste de límites con 2FA e historial.
- Ampliación automática por ingresos solo si el admin la autoriza (proporción y techo).
- El despliegue necesita controles propios independientes de la app (P32§8). Producción bloqueada sin topes numéricos y exposición residual aceptados por el creador (P32§9) y sin las demostraciones de P32§10.
- Panel admin (P12§6, P30§6, P32§4): presupuesto, gasto confirmado, estimaciones, reservas, disponibilidad, proyección, por categoría y tipo de cuenta; medido vs estimado; ventas, liquidaciones, efectivo, aportes, facturas, fondo de crecimiento, retirable.
- Inputs de costo editables (costo por minuto de sesión, por jugador…); límites calculados con posibilidad de sobreescritura (B).

## 17. Notificaciones y correo — B: concepto notificaciones, P14§4-6, P29, P31

- Dominio Notifications aislado: los demás lo consumen (no transaccional, vía txqueue propia de cada dominio). Entrada: token externo, token de idempotencia, dominio, tipo, `send_at`, métodos de entrega, usuario. El contenido lógico es del dominio dueño; Notifications recibe un esqueleto armable (título, párrafos…) y decide el render por canal.
- **Canales fase 1: in-app y correo.** Nada de push (P29).
- Una entrada lógica por acontecimiento; reintentos no duplican. **Enviar ≠ leer**: se marca leída al abrir el contenido, al consultar la actualización correspondiente o explícitamente; abrir la lista no marca todo (P14§4 sustituye la base).
- Composer une notificaciones no leídas con entidades (p. ej. resaltar casos con novedades) y construye la URL de destino (constructor de URLs de frontend vive en composer, no en dominios).
- Historial de notificaciones con filtros por dominio, tipo, fecha (valores traducidos).
- **Matriz de avisos: P31§4** (códigos, bienvenida, compras, cancelaciones, pago fallido, prueba, seguridad, autorizaciones, IA terminada, créditos, revisión Discovery, clase sin correo a estudiantes, promociones con consentimiento). Opcionales y marketing con preferencias independientes; necesarios siempre activos.
- Destinos (P14§6): el aviso lleva a su entidad; autenticación conserva destino; abrir enlace no ejecuta nada; contenido vencido se explica.
- Privacidad: correos con información mínima; sin notas, nombres de estudiantes, materiales ni secretos; sin rastreo de aperturas ni clics; idioma del usuario.
- **Correo saliente (P31):** Resend gratuito (100/día, 3 000/mes, sin sobreconsumo) + Amazon SES `us-east-1`. Modos admin: Automático / Solo Resend / Solo SES sin desplegar. Rechazo claro por cupo → SES; aceptado por uno no se reenvía por el otro; respuesta incierta no reenvía de inmediato. Bajas y rebotes respetados en ambos. Registros de entrega 30 días sin cuerpos ni códigos. Prioridad: acceso, seguridad, facturación. Pasar a SES exige cobertura (P32§2).
- **Correo entrante de soporte:** SES `us-east-1` (P33§2).

## 18. Reportes, soporte y moderación — B: flujos de reporte/report, P13, P33

- Reporte = entidad consciente de la operación: tipos con datos, relaciones y prioridad propios (juego, versión, sesión, conducta, creación, host, general). No una tabla genérica con id suelto.
- Entradas: juego seleccionado, sesión en curso, historial, perfil, creación (usuario o IA), host. Requiere cuenta al menos invitada, **más un formulario público sin cuenta** para contenido ilegal, privacidad, derechos de autor y problemas de acceso, con seguimiento seguro (P13§4, P33§3).
- **Ayuda y soporte (P33§1):** preguntas frecuentes + casos (pagos, técnicos, privacidad, contenido, apelaciones) con referencia, conversación y estado. Notas internas separadas. Sin mesa externa ni chatbot.
- Ciclo de vida de usuario (abierto, esperando respuesta, requiriendo input, cerrado/enviado) y de admin (nuevo, pendiente de información, bajo revisión, resuelto, apelado; ack ≠ resuelto) (B, P13§6, P33§5).
- "Mis reportes/casos": lista, resaltado de novedades vía notificaciones, detalle con historial e interacción.
- **Contenido (P13§1-2):** social, educativo, entretenimiento general; prohibido lo listado; se evalúa tratamiento y audiencia. Fichas ficticias sí; apuestas, premios o compra de fichas no.
- Verificaciones de juegos: sin acceso a información ajena, credenciales, cobros ni envío de datos a terceros. Sin chat general ni mensajería privada; texto libre de mecánica queda en la sesión y es reportable (P13§3).
- **Medidas graduadas (P13§5):** retirar de Discovery, impedir nuevas partidas, detener partida, restringir versión, suspender cuenta. Reportes aislados o masivos no sancionan solos; pueden priorizar o provocar restricción preventiva.
- Decisiones: motivo, alcance, duración, apelación; registradas; **sanción definitiva de cuenta exige revisión humana**; no se revela al reportante.
- Límites automáticos y actividad sospechosa: marcado, alerta a admin, ban preventivo con acknowledge (B: reglas de negocio).
- Objetivos de atención (P33§4): seguridad grave revisión diaria; cobro sin servicio / acceso bloqueado / pérdida de resultados 1 día hábil; ordinarios 2; apelaciones 3 (días hábiles de Colombia).
- Cola de Discovery saturada → pausar o comunicar espera; nunca aprobar automáticamente.
- Casos ordinarios se eliminan a 6 meses de cerrados (P33§6). Suspendidos conservan soporte y apelaciones.
- Suspensión que impide usar la suscripción detiene renovaciones (P13§6).
- Clasificación automática inicial con `omni-moderation-latest` (P24§1); conversaciones de soporte y datos de estudiantes no se envían a IA automáticamente.

## 19. Discovery, navegación, idiomas, accesibilidad — B: búsqueda, P14, P02§14

- **Entrada pública (P14§1):** Discovery + explicación breve + accesos visibles a unirse, crear y Profesor. Enlaces de invitación van directo a su actividad.
- Discovery: populares, categorías, recientes (con cuenta), búsqueda por texto, una categoría, varias etiquetas con "cualquiera/todas", filtro por idioma y por plantilla. Solo contenido aprobado.
- Barra superior fija: perfil/registro, notificaciones, plan, unirse, crear; switch de modo.
- Perfil accesible sin cuenta (con llamadas a la acción): detalles, planes, compras, reportes, historial, juegos.
- Interfaz en es/en/pt; el navegador sugiere, el usuario decide y se recuerda. Fechas, números y monedas inequívocos; zona horaria visible (P14§3).
- WCAG 2.2 AA en navegación y gestión.
- PWA: instalable, ventana independiente, validada en Android e iOS; oferta no intrusiva (P01§5).

## 20. Administración — B: flujos de admin, P16§3, P26§4, P27§3, P30§6, P31§2, P32§7, P33, P34

- Un solo usuario administrador en fase 1 (roles/permisos previstos), **con segundo factor**; acciones sensibles registradas con actor, motivo y resultado.
- Nada rutinario exige editar código ni tocar la BD.
- Capacidades: usuarios de todo tipo (buscar, detalle, historial, actividad, relaciones); juegos (buscar, estado, bloquear/suspender/eliminar); juegos de la plataforma; **cola de revisión de publicación** (aprobar, negar con nota, banear); reportes y casos; acciones automáticas del sistema con acknowledge; **DLQs** (reintentar/cancelar); categorías, tags, plantillas recomendadas; biblioteca de recursos y pendientes; planes y precios; límites gratuitos; presupuesto, reservas y control de costos; modos de correo y entregas; conciliación de compras y compensaciones; registro de proveedores; analítica.
- Analítica (B, P34): activación, retención, frecuencia, abandono de creadores, por Personal/Profesor y gratis/prueba/suscripción; uso, ingresos, costos, conversiones al tocar límites. Solo datos propios; sin seguimiento individual de estudiantes.

## 21. Dominios y responsabilidades — B: técnico/dominios, P15

Propuesta de la base (ajustable por el equipo conservando responsabilidades — P15§6):
`api` (entrada, auth de request, WebSocket, rate limiting; sin tablas) · `orchestrator` (workflows entre dominios, puede persistir sagas) · `composer` (solo lectura, backend-for-consumer, constructor de URLs) · `identity` · `game` · `play` (`versions`, `session`, `runtime`, sandbox) · `notifications` · `report` · `classroom` · `plan` — más las responsabilidades que P15 separa: **creación**, **facturación**, **costos y presupuesto**, y las que aparecen en parches: **biblioteca de recursos**, **moderación/soporte**, **autorizaciones y consentimientos**, **analítica**, **correo**.
El árbol definitivo es decisión técnica del agente: ver `DECISIONES.md` y la documentación del sistema.

## 22. Operación, validación y entrega — P16, P32§10, índice 00§6-7

- Aceptación por comportamientos observables, incluyendo interrupciones y reintentos; cada comprobación vinculada a su regla (P16§2).
- Respaldos protegidos + prueba de restauración; restaurar no reactiva accesos revocados ni datos eliminados (P16§4).
- Alertas accionables (P16§5): cobro sin capacidad, generaciones atascadas, consumo anormal, fallos de entrada/inicio/fin de partidas, resultados académicos sin registrar, privacidad, casos graves, presupuesto. Logs sin credenciales, materiales privados ni datos de estudiantes innecesarios.
- La entrega incluye inventario: funcionalidades, evidencia, instrucciones de operación, integraciones configurables, pendientes con responsable y condición de cierre; distingue simulado / validado con proveedor real / pendiente (P16§1,§6).

## 23. Diseño visual — B: UI/personalidad, P24§3-5, P36§4

- La identidad se define con el agente como diseñador UX/UI; referencias de la base (Kahoot, Quizizz, Roblox, Friv, Genially, Canva) son investigación, no molde. Estilos sugeridos (glass/clay/skeuo/neumorfismo) son ideas sueltas.
- Requisitos: no parecer generado por IA; profesional y confiable para pagar; vivo.
- Referencia visual aportada: `gatita_lottie.json` y `lottie.json` en la raíz del workspace (preferencia por personajes vectoriales animados; P24§4).
- Admin: funcional, sin exigencia de experiencia.

## 24. Pendientes del creador y condiciones previas a producción — índice 00§6, P17, P23§6, P32§9, P35§2,§6, P36§7

Operador (persona natural, Colombia; formalización al primer cobro real — P17): alta en Lemon Squeezy; avisos, acuerdo de tratamiento y autorizaciones por mercado; AAIP (Argentina), garantías de transferencias (Chile), representación (Perú); cuentas de Google, Anthropic, OpenAI, Resend, SES; importes de presupuesto y exposición residual; despliegue; archivos de recursos pendientes; nombre, dominio y redes.
Equipo: demostrar compras/reembolsos/prorrateos, costos medidos, controles de corte, restauración, IA real.
Seguimiento vivo en `PENDIENTES_CREADOR.md`.

## 25. Sustituciones expresas (lo que NO vale de capas inferiores)

| Regla anterior | Sustituida por |
|---|---|
| Base: app móvil obligatoria en fase 1 | P01§5: web + PWA; tiendas diferidas |
| Base y P14§4-5: push como canal | P29: sin push de ningún tipo |
| Base: notificación enviada = vista | P14§4: enviar ≠ leer |
| Base: contraseña opcional de estudiante | P03§2: credencial individual, privada y revocable |
| Base: solo se eliminan clases vacías | P02§11: también clases usadas, a solicitud |
| Base: cambiar assets libremente en una versión usada | P04§2: versión lista congela recursos |
| Base: expulsar solo si el host dirige sin jugar | P06§1: el host conserva controles aunque juegue |
| Base: host que jugó ve todas las perspectivas en el replay | P06§1: el replay conserva los permisos de la partida |
| Base: "crear actividad = crear juego"; favorito/fork ambiguo | P07§1,§3: actividad ≠ juego; favorito ≠ copia editable |
| Base: todo juego académico produce notas; misma escala para nota final | P08§1,§8: calificar opcional; equivalencias entre escalas |
| Base: el enlace de IA da acceso al borrador (lectura y escritura) | P10§2: enlace solo consulta; escribir exige autorización del creador |
| Base: prueba con método de pago registrado | P11§7: sin tarjeta, sin contratación automática |
| Base: Session = toda la persistencia de Play | P15§2: Session = ciclo de vida de una partida; versiones aparte |
| Base: plan comprobado al emitir token de profesor basta | P15§5: derechos vigentes en cada operación que los requiere |
| P11§12: Paddle candidato | P23: Lemon Squeezy |
| P09§6: el equipo elige modelos | P24: modelos y reparto seleccionados |
| P11§3 (aumentos a renovaciones con aviso) | P26§6: aumentos solo a nuevas contrataciones |
| Base y P12§1: presupuesto = mayor entre aporte y reinversión | P30: obligaciones y reservas primero, luego excedente 70/30 |
| P14§5 y P03§8: el equipo elige proveedor de correo | P31: Resend + SES |
| P12§5, P27§3 (continuidad de partidas) y P31§3 (prioridad de correo) en emergencia | P32: el apagón prevalece |
| P16§6: trámites del operador en Colombia antes del uso real | P17§3: al primer cobro real confirmado |
| P01§7: francés opcional | P18§3: francés pospuesto |
| P18§1: Perú se incorpora | P35§1-2: Perú desactivado hasta resolver representación |
| P09§7 y §10: cubrir seis familias de plantillas | P36: géneros abiertos; destacados mayormente continuos |
| Base: anuncios a cuentas gratuitas y su control en admin | P37§1: diferidos |
| Base: investigación en internet sin definir | P37§2: herramientas web de Anthropic |

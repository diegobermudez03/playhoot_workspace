# Creación 2D abierta y alcance del lanzamiento

Playhoot  |  post_36  |  Decisiones aprobadas al 15 de noviembre de 2026

Playhoot se orienta a crear y jugar experiencias 2D, con protagonismo del juego continuo. La fase 1 concentra la IA generativa en la preparación de juegos y conserva Playhoot como nombre de trabajo. Este parche complementa playhoot.docx y post_01 a post_35. Deja sin efecto la exigencia de cubrir las seis familias enumeradas en post_09, apartado 7, y la referencia a esa cobertura obligatoria del apartado 10. Mantiene sus requisitos de calidad y recursos disponibles. El repositorio define la implementación.

# 1 Creación abierta y protagonismo del juego continuo

La creación admite géneros 2D técnicamente viables dentro de las capacidades, recursos, límites y reglas de la plataforma. Las categorías orientan la creación, búsqueda y presentación; no forman una lista cerrada de juegos permitidos. Las mecánicas pueden combinarse e inventarse, sin quedar restringidas a las plantillas existentes.

La mayoría de los destacados iniciales y sus primeras posiciones muestran experiencias con movimiento, acción e interacción continua. Cartas, tableros, preguntas y otros juegos por turnos siguen siendo compatibles, pero no definen por sí solos la identidad ni la composición obligatoria de la vitrina de lanzamiento.

# 2 IA generativa durante la preparación del juego

La IA puede preparar contenido, reglas, código, personajes, animaciones y recursos. La ejecución de una partida no invoca modelos generativos, incluso si el juego se creó con una IA externa. Se posponen los personajes que conversan libremente con un modelo, oponentes que lo consultan para decidir y generación de preguntas, escenas o recursos mediante esas llamadas durante la partida.

Los personajes animados, oponentes programados, alternativas preparadas y generación procedural mediante código siguen admitidos. Pueden producir experiencias dinámicas sin consultar un modelo. Cuando el juego califica, utiliza los criterios y lógica preparados; no envía respuestas de estudiantes a un modelo para calificarlas durante la sesión.

Se conserva la moderación de seguridad aprobada. Una futura incorporación de IA a las mecánicas requiere decidir quién paga, qué información se transmite y cómo se responde a demoras, fallos o agotamiento de presupuesto. No se exige construir ahora esa integración futura.

# 3 Selección inicial y libertad de combinación

Los candidatos de referencia para una primera vitrina diversa incluyen carreras, plataformas cooperativas, acción de arena con proyectiles, deportes o interacción física, cooperación de tareas y defensa o estrategia en tiempo real. Son orientaciones de selección, no seis nuevas fronteras ni una obligación de desarrollar todos los géneros enumerados en este parche.

Los juegos destacados deben ser jugables y reutilizables, tener sus recursos necesarios disponibles y demostrar experiencias diferentes. El agente del repositorio concreta las variantes y el inventario inicial, conservando las migraciones, registros y archivos pendientes de post_25. Los ejemplos no eliminan el entretenimiento general ni las actividades académicas con y sin calificación.

# 4 Referencias abiertas de géneros y experiencias 2D

La siguiente relación ilustra la amplitud del alcance. Incluye géneros, subgéneros y formas de juego combinables. Los ejemplos son propuestas ilustrativas para Playhoot y no una lista de productos prometidos para el lanzamiento.

| Tipo de experiencia | Interacción y ejemplo posible |
|---|---|
| Carreras y conducción | Acelerar, girar y adelantar entre obstáculos y objetos especiales. |
| Plataformas y parkour | Correr, saltar y superar trampas para competir o colaborar. |
| Runners | Avanzar, esquivar y recoger objetos con dificultad creciente. |
| Shooters de arena | Moverse y apuntar libremente; combate de robots o equipos con proyectiles y objetivos. |
| Shoot em ups y bullet hell | Disparar y esquivar patrones de proyectiles; naves que superan oleadas juntas. |
| Run and gun | Combinar desplazamiento lateral, plataformas y disparos para atravesar un escenario. |
| Combate cuerpo a cuerpo | Golpear y esquivar, con alcance y habilidades; duelos o avance cooperativo contra enemigos. |
| Acción y aventura | Explorar, interactuar con personajes y objetos y completar misiones dentro de un mapa. |
| Sigilo y persecución | Evitar vigilancia, esconderse, perseguir o escapar en escenarios compartidos. |
| Supervivencia y roguelites de acción | Sobrevivir a encuentros variables, conseguir mejoras y elegir habilidades entre oleadas. |
| Deportes arcade | Mover jugadores y pelotas mediante colisiones; minifútbol, hockey o tenis simplificados. |
| Puzles físicos | Manipular objetos y mecanismos; empujar cajas, activar interruptores o conducir una pelota. |
| Cooperación de tareas | Repartir trabajo, transportar objetos y coordinarse para preparar pedidos o reparar una estación. |
| Defensa de torres | Colocar defensas mientras avanzan enemigos; proteger una base de forma cooperativa. |
| Estrategia en tiempo real | Ordenar unidades, administrar recursos y controlar posiciones con pequeños escuadrones. |
| Simulación y gestión | Mantener sistemas que evolucionan; una granja, fábrica o ecosistema durante una sesión. |
| Ritmo y precisión temporal | Actuar siguiendo música, señales o secuencias temporizadas, individualmente o por equipos. |
| Territorio y trazado | Ocupar zonas, dibujar recorridos y evitar trayectorias mientras los participantes se mueven. |

El género, la perspectiva y el modo de juego se combinan: vista superior o lateral, cooperación o competición, y mezcla de carreras, combate o puzles. El alcance 2D admite ilustraciones, vectores y personajes animados; no exige estética pixelada. La viabilidad de una familia no demuestra que el motor actual ya la soporte sin trabajo adicional.

# 5 Herramientas reutilizables y biblioteca propia

Las piezas de creación facilitan movimiento, colisiones, proyectiles, objetos interactivos, escenarios, cámaras, enemigos programados, objetivos y sistemas que evolucionan con el tiempo. Amplían las capacidades de post_09 sin fijar una biblioteca o motor concreto ni limitar la creación a lo ya existente.

La biblioteca propia contempla personajes que corren y saltan, vehículos, escenarios, obstáculos, proyectiles y efectos, además de interfaz y sonido. El agente concreta el inventario y registra los recursos pendientes que deba aportar el operador. La IA conoce la disponibilidad real y no utiliza un pendiente como archivo existente. Se mantienen licencias, procedencia y versionamiento de post_25.

# 6 Calidad del juego continuo y uso académico

La validación demuestra participantes moviéndose e interactuando simultáneamente, con acciones que afectan realmente al estado compartido. Comprueba respuesta de controles, colisiones, reconexión y funcionamiento en los dispositivos declarados. También comprueba la experiencia con retrasos de red; una demostración local aislada o movimientos decorativos no sustituyen una partida real funcional.

Se mantienen las reglas de privacidad, perspectivas, replays, resultados y protección económica. El juego declara las capacidades que realmente admite y respeta sus límites, sin prometer soporte universal de cualquier escala o configuración por ser 2D.

El uso académico puede integrarse en las mecánicas: clasificar transportando objetos, cooperar para construir una solución o explorar un sistema simulado. No tiene que adoptar el formato de preguntas y respuestas. La calificación sigue siendo opcional y su resultado procede del juego conforme a las reglas aprobadas.

# 7 Nombre de trabajo y dominio público

Se continúa el desarrollo con Playhoot como nombre de trabajo. La elección definitiva de marca, dominio y cuentas sociales queda para preparar la salida pública y corresponde al creador, no al agente del repositorio. Antes de promocionar se comprueba el nombre y se elige un dominio disponible. El nombre del repositorio no acredita disponibilidad de marca; una búsqueda inicial tampoco constituye una autorización jurídica completa.

El registro formal de marca no se convierte en requisito nuevo para comenzar el desarrollo. El agente no escoge ni compra un dominio por su cuenta. El producto permite adaptar nombre, logotipo y dominio conservando funcionalidades y datos.

# 8 Relación con la preparación de producción

Este cierre de alcance no aprueba el paso a producción. Siguen pendientes las comprobaciones reales previstas: configuración de proveedores, condiciones territoriales, presupuesto y límites numéricos, capacidad medida, despliegue e identidad pública. La revisión de coherencia del conjunto y esos pendientes se mantienen separados del plan de implementación que elaborará el equipo del repositorio.

Referencias de la investigación al 15 de noviembre de 2026: Géneros 2D de GameMaker · Ejemplos de Phaser · Ejemplos de GDevelop · Multijugador y latencia de Colyseus · Consulta de marca de VUE

Las referencias ilustran posibilidades y condiciones; no seleccionan nuevos motores, servicios ni suscripciones para Playhoot.

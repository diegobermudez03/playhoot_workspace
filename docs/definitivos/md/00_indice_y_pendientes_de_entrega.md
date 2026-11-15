# Índice y revisión de entrega de Playhoot

Documento base y 37 parches  |  Cierre del 15 de noviembre de 2026

Esta guía reúne playhoot.docx y post_01 a post_37 para su entrega al equipo del repositorio. La revisión identifica las sustituciones que deben aplicarse juntas y separa las decisiones aprobadas de la implementación y preparación del lanzamiento. post_37 cierra los dos asuntos adicionales detectados: anuncios dentro de Playhoot e investigación web de la IA.

El índice actualiza las guías anteriores. Facilita localizar decisiones y condiciones de cierre, sin constituir otro parche ni sustituir los documentos completos. Dentro del paquete, los enlaces conducen a los archivos DOCX incluidos; deben mantenerse juntos al extraerlo.

# 1 Autoridad y estado del conjunto

Los parches aprobados prevalecen en sus asuntos; después rige playhoot.docx y luego las demás fuentes compatibles. Se respetan las sustituciones expresas entre parches. El número o la fecha no resuelven por sí solos una contradicción no aclarada. El código existente acredita implementación, no aceptación de una diferencia con el producto aprobado. Fuente: post_01.

La fase 1 conserva las ofertas Personal y Profesor, la web para escritorio y móvil y la PWA instalable opcional. La creación es 2D abierta, con protagonismo de experiencias continuas. Las apps de tiendas, el push y la IA generativa durante partidas están diferidos expresamente. Se mantienen español, inglés y portugués; francés está pospuesto. Fuentes: post_01, post_17, post_18, post_29 y post_36.

# Responsabilidades para continuar

| Responsable | Decisiones y tareas |
|---|---|
| Creador | Aporta cuentas, autorizaciones del operador y recursos asignados. Cierra las decisiones estratégicas diferidas de lanzamiento, incluidos presupuesto real, exposición residual, despliegue e identidad pública. |
| Equipo del repositorio | Inspecciona el código actual y elabora su propio plan. Decide código, contratos concretos, organización interna, pruebas y orden de trabajo dentro de las reglas aprobadas. |
| Ambos | Contrastan integraciones, costos y capacidad reales. Una incompatibilidad material vuelve al creador con alternativas y consecuencias. |

La revisión realizada es documental. No verifica el estado actual del repositorio, altas de proveedores, cumplimiento efectivo por mercado ni capacidad en producción. Las comprobaciones exigidas siguen abiertas hasta contar con evidencia real.

# 2 Documentos del paquete del 01 al 18

Base: playhoot.docx

Cada prefijo identifica un único DOCX. Se debe utilizar su versión vigente y leerlo completo cuando corresponda a la funcionalidad que se implementa. Los enlaces permiten consultar las fuentes.

| Documento | Asunto |
|---|---|
| post_01 | Alcance de lanzamiento y autoridad documental |
| post_02 | Privacidad y participación de menores |
| post_03 | Identidad y acceso |
| post_04 | Versiones y publicación de juegos |
| post_05 | Plantillas y reutilización |
| post_06 | Sesiones multijugador |
| post_07 | Clases materiales y actividades |
| post_08 | Calificaciones |
| post_09 | Creación con IA y calidad |
| post_10 | IA externa y permisos |
| post_11 | Suscripciones y pagos |
| post_12 | Presupuesto costos y cupos |
| post_13 | Seguridad contenido y moderación |
| post_14 | Descubrimiento navegación y notificaciones |
| post_15 | Responsabilidades entre dominios |
| post_16 | Operación validación y entrega |
| post_17 | Operador compradores y formalización |
| post_18 | Mercados y funciones iniciales |

Los parches iniciales definen principalmente comportamiento, límites y separación de responsabilidades. Los posteriores concretan elecciones estratégicas. Un apartado que dejaba una decisión para después debe leerse junto con el parche que la cierra.

# 3 Documentos del paquete del 19 al 37

| Documento | Asunto |
|---|---|
| post_19 | Acceso adulto y condición docente |
| post_20 | Autorizaciones escolares existentes |
| post_21 | Nuevas autorizaciones y acceso por edad |
| post_22 | Responsabilidades sobre datos y condiciones |
| post_23 | Proveedor de cobro moneda y comisiones |
| post_24 | Proveedores de IA modelos y recursos visuales |
| post_25 | Biblioteca propia y gestión de recursos |
| post_26 | Planes precios y administración |
| post_27 | Cupos acceso gratuito y compras adicionales |
| post_28 | Prueba de Profesor y unidad de créditos |
| post_29 | Notificaciones sin push en fase 1 |
| post_30 | Reinversión reservas y fondos disponibles |
| post_31 | Correo Resend SES y canales de avisos |
| post_32 | Control de costos y suspensión de emergencia |
| post_33 | Soporte y operación de moderación |
| post_34 | Analítica interna de actividad y retención |
| post_35 | Activación territorial y controles de acceso |
| post_36 | Creación 2D abierta y alcance del lanzamiento |
| post_37 | Anuncios diferidos e investigación web de IA |

Los documentos conservan su identidad individual. Actualizar este índice no reemplaza ni reescribe los parches. El material de investigación citado dentro de ellos sirve de fundamento; no selecciona otros proveedores, motores o servicios sin una decisión expresa.

# 4 Sustituciones y conexiones que deben aplicarse

| Tema y fuente vigente | Cómo leer las reglas anteriores |
|---|---|
| Web y PWA post_01 y post_29 | La PWA continúa. Se retiran las exigencias de app nativa de la base y todo push, incluido navegador o PWA. Los avisos son internos y por correo. |
| Menores y mercados post_18 a post_22 y post_35 | La matriz y los mecanismos ya están decididos. Perú permanece desactivado. Menores solo en usos autorizados de los mercados admitidos; un enlace o alias no evita estas condiciones. |
| Credenciales de estudiantes post_03 | Una identidad es propia de su clase, con acceso privado y revocable. Nombre, alias o código del docente no son secretos; se sustituye la contraseña opcional de la base. |
| Versiones y recursos post_04 y post_25 | Actualizar archivos prepara versiones nuevas. No altera silenciosamente partidas o replays. Publicar para jugar no concede permiso para copiar como plantilla: post_05. |
| Actividad y notas post_07 post_08 y post_15 | Juego, actividad y sesión se distinguen. Calificar es opcional. El juego produce notas por participante; Classroom gestiona intentos, equivalencias, revisión y nota final. |
| Continuidad de historiales post_02 y post_13 | Borrar otra cuenta no rompe el replay legítimo dentro de su vigencia. Seguridad o legalidad pueden exigir ocultar contenido y, si no basta, restringir el replay completo. |
| Cobro y modelos post_23 y post_24 | Lemon Squeezy sustituye la candidatura de Paddle. Anthropic y OpenAI, sus modelos y reparto de tareas están seleccionados; el agente integra y valida sin elegir sustitutos estratégicos. |
| Precios y capacidades post_26 a post_28 | Hay cuatro planes y paquetes definidos. Los aumentos afectan nuevas suscripciones; se protege el precio base de las vigentes. La prueba no requiere tarjeta ni contratación automática. |
| Fondos y reservas post_30 | Se sustituye la fórmula del mayor entre aporte y reinversión de post_12 y la base. Primero se cubren obligaciones y reservas; después se reparte el excedente libre. |
| Emergencia financiera post_32 | El corte automático puede interrumpir partidas, incluso pagadas, y frenar correo prioritario. Esta excepción prevalece sobre continuidad ordinaria, manteniendo compensaciones y derechos. |
| Avisos soporte y analítica post_14 y post_29 a post_34 | Enviar no equivale a leer. Correo saliente Resend y SES; entrante SES. Soporte y analítica son propios. Los datos escolares no pasan a ser analítica comercial por guardarse internamente. |
| Vitrina y ejecución post_36 | Se elimina la cobertura obligatoria de las seis familias de post_09 apartados 7 y 10. Los géneros son abiertos; predominan destacados continuos. La IA generativa prepara el juego, no participa en su mecánica en vivo. |
| Anuncios e investigación web post_37 | Se difieren los anuncios y sus controles de activación. La investigación de creación utiliza Anthropic, con fuentes, privacidad y costos incluidos en el máximo autorizado del trabajo. |

La postergación de trámites tributarios y mercantiles del operador en Colombia corresponde a la decisión expresa de post_17; no aplaza privacidad, requisitos de proveedores ni gestiones para otros mercados. El índice no la presenta como una exención legal.

# 5 Decisiones finales aprobadas

post_37 incorpora las dos decisiones aprobadas tras la revisión de la base y post_01 a post_36. Ambas quedan definidas para el agente del repositorio. Se conserva la validación real antes de habilitar la integración o lanzar el producto.

# Anuncios dentro de Playhoot

post_37 difiere expresamente los anuncios de terceros y sus controles de distribución contemplados en la base. La fase 1 se financia con suscripciones y compras puntuales. No integra una red publicitaria ni seguimiento publicitario, y mantiene la presentación normal de sus planes y de Profesor.

Esta decisión es adicional a post_34: no comprar publicidad en redes y no mostrar publicidad de terceros dentro de Playhoot son elecciones distintas. Las dos quedan aprobadas para fase 1.

Una futura monetización mediante anuncios requiere otra decisión de producto sobre proveedor, audiencia, datos y viabilidad económica.

# Investigación web de la IA durante la creación

post_37 selecciona las herramientas de búsqueda y lectura web de Anthropic para concretar la investigación de la base. Se mantienen los modelos y el reparto de tareas de post_24.

La IA investiga cuando el pedido necesita información actual, fuentes externas o un enlace concreto. Aprovecha los materiales proporcionados y el catálogo propio cuando basten. Identifica fuentes y comunica fallos o cobertura parcial, conservando la continuidad del contexto.

La investigación permanece dentro del máximo autorizado del trabajo y de los topes globales, contando cargos por búsquedas y tokens. No se envían datos identificables de estudiantes ni materiales privados como consultas públicas; leer una página no autoriza descargar o reutilizar sus imágenes, música o código. El contenido externo tampoco amplía permisos del agente. No se incorpora búsqueda durante partidas.

Anthropic documenta búsqueda y lectura web. La búsqueda tiene una referencia de USD 10 por mil consultas, además de tokens. Se debe comprobar compatibilidad y condiciones reales al integrar. La referencia no equivale a una prueba de costo por juego aceptado.

Referencia de proveedor: Documentación de búsqueda web de Anthropic

El bloque estratégico revisado queda cerrado con post_37. La compatibilidad, configuración y validación de herramientas, los costos reales y las condiciones de producción permanecen pendientes en sus etapas correspondientes.

# 6 Pendientes antes de habilitar uso real

Las elecciones que siguen ya tienen reglas de producto. Falta aportar configuración, concretar condiciones operativas o demostrar resultados. Cada habilitación espera a las condiciones que le correspondan; un mercado o proveedor seleccionado no se presume activado.

| Pendiente y fuentes | Responsable y condición de cierre |
|---|---|
| Alta comercial post_17 post_23 y post_26 | El operador completa el alta y verificación de Lemon Squeezy y la aceptación real del producto. El equipo demuestra compras, promociones, reembolsos, prorrateos y precios protegidos, incluidas particularidades de los medios de pago. |
| Mercados y documentos post_20 a post_22 y post_35 | El operador prepara avisos, acuerdo de tratamiento, autorizaciones y atención de derechos. Completa las gestiones locales y garantías internacionales aplicables. El equipo aplica la matriz; los usos sin condiciones cumplidas permanecen cerrados. |
| Proveedores y datos post_22 post_24 y post_31 | Operador y equipo documentan datos tratados, países, retención y eliminación; configuran Google, IA y correo. Se comprueban contratos, permisos y salvaguardas reales antes de transmitir datos de usuarios. |
| Costos y capacidad post_12 post_26 y post_27 | El equipo mide creación y corrección aceptadas, archivos, sesiones continuas, concurrencia y replays. Contrasta el escenario económico aprobado con facturas, comisiones y costos reales. Una revisión material de precios o cupos vuelve al creador. |
| Presupuesto y despliegue post_30 y post_32 | El creador fija importes y exposición residual aceptable con el despliegue elegido. El equipo demuestra reservas, topes, restricciones, corte automático y reapertura manual, también ante caída o saturación de la aplicación. |
| Contenido de lanzamiento post_09 post_25 y post_36 | El equipo concreta juegos diversos e inventario, incorpora recursos disponibles y crea registros de pendientes. El operador aporta los archivos asignados. Los recursos necesarios para los juegos de lanzamiento están completos y autorizados. |
| Operación y recuperación post_16 post_32 y post_33 | El equipo demuestra permisos, privacidad, moderación, consultas y exportaciones, alertas, atención de casos y restauración. Documenta pérdida y tiempo de recuperación medidos, sin resucitar accesos ni datos eliminados. |
| Identidad pública post_36 | El creador elige nombre definitivo, dominio y cuentas sociales y comprueba su disponibilidad antes de promocionar. El agente no compra ni elige por su cuenta. |

La nube, las máquinas y la topología de despliegue se deciden en su etapa. El presupuesto de USD 120 no fija una factura ilimitada, y los excedentes por plan de post_26 son estimaciones previas a remuneración e impuesto sobre la renta del operador.

# 7 Entrega al equipo del repositorio

El paquete reúne treinta y nueve documentos: playhoot.docx, los treinta y siete parches aprobados y este índice actualizado. Los originales se mantienen separados y se extraen en una misma carpeta para conservar los enlaces. Este paquete reemplaza para la entrega el inventario antiguo de dieciséis parches.

Primera lectura. El equipo lee el conjunto y contrasta las reglas con el repositorio actual. Identifica diferencias a nivel de producto y dominios, sin tomar lo ya implementado como autorización para reducir alcance. Después prepara su propio plan de implementación.

Primera entrega local. Demuestra los flujos con datos ficticios e integraciones simuladas, según post_01 y post_16. Los espacios pendientes de configuración real se identifican; una simulación no acredita cobros ni calidad generativa real.

Entrega integrada. Conecta los proveedores aprobados y demuestra los comportamientos con ellos. El equipo registra qué funciona, qué evidencia lo demuestra y qué sigue pendiente. Los cambios comerciales o regulatorios incompatibles requieren una nueva decisión del creador.

Salida a producción. Además de la revisión final del creador, exige cerrar las condiciones de la sección 6. Los controles financieros deben limitar gasto de forma demostrable, no limitarse a enviar alertas. Una deuda, un apagón o un fallo no se ocultan como falta de saldo del usuario ni generan notas ficticias.

# Criterio para separar decisiones y detalles

El equipo resuelve libremente algoritmos, almacenamiento interno, librerías de implementación, contratos concretos y herramientas de prueba compatibles. Esto incluye elegir cómo calcular y mostrar una métrica ya definida y cómo ejecutar una regla de negocio aprobada.

Se consulta al creador cuando una elección cambie proveedor estratégico, precio, beneficio contratado, mercado, datos recogidos, permiso de reutilización, exposición financiera o alcance funcional. También se consulta una contradicción no resuelta y una limitación comprobada que impida entregar el producto. No se exige aprobación rutinaria para cada cambio de código.

Este inventario permite continuar con decisiones localizables y responsables claros. No sustituye el plan que escribirá el agente ni constituye por sí solo autorización para desplegar, abrir mercados o realizar cobros.

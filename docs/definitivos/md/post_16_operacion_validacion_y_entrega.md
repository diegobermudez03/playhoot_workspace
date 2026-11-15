# Operación validación y entrega

Playhoot  |  post_16  |  Decisiones aprobadas al 14 de noviembre de 2026

Este parche establece cómo demostrar los comportamientos del producto y preparar su operación y entrega. Mantiene separadas la validación local con simulaciones y la preparación del lanzamiento con proveedores reales. Complementa playhoot.docx y los parches post_01 a post_15, y prevalece sobre las fuentes anteriores en estos asuntos. El equipo del repositorio elabora y ejecuta su propio plan de implementación.

# 1 Entrega local y lanzamiento real

Se conservan las dos entregas aprobadas. La plataforma completa puede probarse localmente con integraciones simuladas y datos de ejemplo. Para lanzar se validan las integraciones reales y sus condiciones operativas y comerciales. La entrega identifica qué se comprobó con simulaciones, qué está validado con proveedores reales y qué sigue pendiente. Una simulación de IA no demuestra la calidad de generación y una compra simulada no demuestra la capacidad real de cobrar.

# 2 Aceptación por comportamientos observables

El equipo demuestra creación integrada y externa, corrección y recuperación de borradores; partidas, reconexión, información privada y replays; clases, calificaciones, publicación y exportación; compras, límites, vencimientos, cancelaciones y reembolsos; restricciones de acceso, moderación y eliminación de datos.

Se comprueban interrupciones y reintentos además del recorrido ideal. Cada comprobación queda vinculada con la regla correspondiente. Este parche no impone herramientas ni una estructura específica de pruebas.

# 3 Administración para una operación individual

Desde administración se pueden identificar operaciones pendientes, entender su contexto y ejecutar las acciones previstas: revisar publicaciones, atender reportes, restringir contenido, conciliar compras, gestionar compensaciones y reintentar tareas recuperables. Las acciones rutinarias no deben exigir editar código o modificar directamente la base de datos.

El acceso administrativo requiere autenticación reforzada con un segundo factor. Las acciones sensibles quedan registradas con actor, motivo y resultado. Consultar datos privados responde a una necesidad administrativa concreta.

# 4 Recuperación comprobada y cambios reversibles

Antes del lanzamiento existen respaldos protegidos y una prueba de restauración. El equipo documenta qué información puede recuperarse, la pérdida máxima prevista y el tiempo esperado, considerando el presupuesto. No se promete públicamente un nivel de disponibilidad o recuperación sin haberlo validado.

Restaurar no debe reactivar accesos revocados ni volver a exponer datos eliminados. Los cambios de plataforma contemplan recuperación ante fallos y respetan las versiones fijadas en partidas y replays. Se mantienen las reglas de retención y eliminación de los parches anteriores.

# 5 Resultados del producto y alertas accionables

Además de las métricas de red del documento base, se detectan cobros confirmados sin capacidad habilitada, generaciones atascadas o consumo anormal de IA, fallos al entrar, iniciar o terminar partidas, resultados académicos pendientes de registrar, riesgos de privacidad, casos graves y presupuesto comprometido.

Las alertas indican impacto, contexto y acción posible. Los registros de diagnóstico no acumulan credenciales, materiales privados ni datos de estudiantes innecesarios.

# 6 Inventario de entrega y pendientes de lanzamiento

La entrega incluye funcionalidades completadas, evidencia de validación, instrucciones de operación, integraciones configurables y pendientes concretos. Antes de habilitar el uso real correspondiente deben resolverse país y figura jurídica del vendedor, proveedor de cobro y aceptación del producto; matriz de mercados, funciones permitidas y requisitos regulatorios; proveedores de IA y tratamiento de datos; catálogo comercial, costos medidos y capacidad sostenible; recursos pendientes y condiciones operativas necesarias.

Cada pendiente tiene responsable y condición de cierre. Puede diferirse cuando no impida implementar correctamente, como permite el documento base. El equipo conserva autonomía para elaborar y ejecutar su plan. La prueba final del creador no sustituye la validación del equipo ni exige aprobar cada etapa.

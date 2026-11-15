# Responsabilidades y límites entre dominios

Playhoot  |  post_15  |  Decisiones aprobadas al 14 de noviembre de 2026

Este parche aclara quién es dueño de las decisiones y de la información sobre creación, juegos, versiones, sesiones, educación y capacidades comerciales. Creación se distingue, como mínimo, como un workflow separado. Complementa playhoot.docx y los parches post_01 a post_14, y prevalece sobre las fuentes anteriores en estos asuntos. El equipo del repositorio decide la implementación, los nombres y las agrupaciones respetando estas responsabilidades.

# 1 Creación juegos versiones y partidas

Game es dueño del juego lógico, su propietario, ficha, visibilidad y permisos de reutilización. Creación tiene una responsabilidad explícita sobre brief, conversaciones, trabajos de IA, avances, correcciones, resultados de validación y autorizaciones para IA externa. Se distingue al menos como un workflow separado del resto; no se exige convertirla en un dominio de primer nivel.

Dentro de Play, Versiones gestiona el contenido de cada versión, scripts, recursos asociados y condición de ejecutable. Sesiones y ejecución gestionan lobby, participantes, partida, reconexión, finalización, resultados originales y grabación para replay. Creación utiliza esas capacidades, pero la conversación de IA no sustituye la información autorizada sobre propiedad de juegos o resultados de partidas.

# 2 Sesión representa un ciclo de vida

Sesión no es el subpaquete de toda la persistencia de Play: representa una partida concreta y su ciclo de vida. El versionamiento es otra característica del juego ejecutable y puede organizarse en otro subpaquete. Esta aclaración sustituye la agrupación inicial del documento base por el solo hecho de persistir datos.

Se distinguen la versión en edición, la versión lista y elegida para nuevas partidas, la aprobada para Discovery y la fijada en una sesión existente. No se confunden en un único estado de versión activa. Game puede referenciar una versión para su publicación sin conocer sus scripts ni ejecutar el juego.

# 3 Identidad y significado académico

Identidad resuelve quién actúa y su acceso. Classroom conoce la inscripción en la clase, los datos del estudiante dentro de ella, las actividades, materiales y reglas académicas. Play conserva el resultado original producido por participante. Classroom lo relaciona con el estudiante y administra intentos, conversiones, revisiones, publicación y nota final.

Las notas oficiales no se reconstruyen desde los replays ni desaparecen cuando estos vencen. Mantienen su retención y trazabilidad propias. Las identidades de estudiantes siguen limitadas a cada clase y no introducen una cuenta global del menor.

# 4 Cobros capacidades y presupuesto

Se reconocen tres responsabilidades sin exigir tres servicios. Facturación gestiona compras, cobros, renovaciones, reembolsos y conciliación con el proveedor. Plan gestiona derechos contratados, capacidades, compras utilizables y saldos comerciales, incluidos créditos. Costos y presupuesto gestiona gasto real, previsiones, reservas y cobertura de los compromisos de Playhoot.

Cada capacidad registra el uso que realmente ocurre bajo su responsabilidad: Game conoce creaciones, Play conoce partidas y Creación conoce el trabajo de IA realizado. Ese consumo alimenta los saldos correspondientes sin mantener dos balances comerciales contradictorios. Pago confirmado, capacidad habilitada y gasto incurrido son hechos distintos que deben poder conciliarse.

# 5 Condiciones vigentes para autorizar operaciones

Una operación puede requerir identidad, propiedad del recurso, pertenencia a una clase, capacidad comercial vigente, autorización externa y ausencia de restricciones regulatorias o de moderación. Cada responsable decide lo suyo y la coordinación reúne esas decisiones. Los valores enviados por el navegador o una IA no conceden permisos ni cupos por sí mismos.

Haber obtenido acceso como profesor cuando existía una suscripción no mantiene indefinidamente funciones de pago después de vencerla. Las operaciones que las requieren respetan los derechos vigentes, conservando consulta, exportación y partidas en curso según lo aprobado. Esta regla precisa la propuesta del documento base de comprobar el plan al emitir el acceso de profesor.

# 6 Coordinación y operaciones incompletas

Se mantienen la coordinación entre dominios y la composición de consultas del documento base. Las reglas de notas, pagos, sesiones o moderación permanecen con sus responsables. Discovery presenta el catálogo autorizado, Notificaciones informa de acontecimientos y Reportes gestiona casos; ninguno sustituye por sí solo el estado real del juego, pago o partida.

Si una operación entre varias capacidades queda incompleta, se identifica como pendiente y puede recuperarse o corregirse sin duplicar efectos. Un pago cobrado con activación pendiente no se presenta como compra rechazada ni exige pagar de nuevo. El equipo puede ajustar nombres y agrupaciones conservando responsabilidades y contratos. Este parche no fija paquetes, tablas, protocolos ni nuevos despliegues obligatorios.

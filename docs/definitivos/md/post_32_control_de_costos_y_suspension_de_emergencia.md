# Control de costos y suspensión de emergencia

Playhoot  |  post_32  |  Requisito de producto aprobado al 15 de noviembre de 2026

La plataforma debe limitar automáticamente su exposición económica ante picos de uso, abuso o fallos. Alertar al administrador no basta: se autorizan restricciones, pausas y apagón total hasta revisión. Este parche complementa playhoot.docx y post_01 a post_31. En una emergencia financiera prevalece sobre la continuidad de partidas de post_12 y post_27 y sobre la prioridad de correo de post_31, conservando saldos, derechos y compensaciones.

# 1 Cobertura de todas las fuentes de gasto

Todo consumo con costo debe ser medible, limitable y suspendible: IA, generación de imágenes, correos, procesamiento de archivos, simulaciones, exportaciones, tareas periódicas, colas, reintentos y demás integraciones. Se incluyen las operaciones que inducen infraestructura: solicitudes, tráfico entrante y saliente, escrituras y crecimiento de bases de datos, archivos, respaldos, registros, CPU, memoria, conexiones y sesiones persistentes.

Los cupos de cada plan no sustituyen límites globales. Una cuenta con saldo o sesiones disponibles puede quedar temporalmente impedida de iniciar trabajo por protección operativa. El motivo se explica como restricción del servicio, sin presentarlo falsamente como agotamiento de su saldo.

# 2 Límites antes de admitir trabajo

Administración configura topes monetarios mensuales, diarios y horarios, globales y por servicio o categoría, junto con límites de velocidad, concurrencia y volumen. Cada trabajo tiene un máximo de costo o recursos antes de empezar, con todas sus iteraciones y reintentos. La admisión cuenta gasto conocido, consumo estimado aún no facturado, trabajo simultáneo reservado y margen para ejecutar el corte.

Las reservas deben impedir que muchas solicitudes concurrentes gasten el mismo presupuesto. Se reconcilian estimaciones y cargos reales sin duplicarlos. Un límite ausente, presupuesto cero o información de costos inválida no equivalen a capacidad ilimitada: se bloquea nuevo consumo afectado hasta disponer de control fiable. No se espera a la factura mensual para actuar.

Pasar de Resend gratuito a SES exige cobertura y respeta los límites de correo y globales. Ningún cambio de proveedor, clave o instancia crea otra bolsa de gasto. Los avisos administrativos también tienen cupo controlado para evitar tormentas de alertas.

# 3 Crecimiento respaldado por ingresos

Se comparan gasto, velocidad de consumo, ingresos confirmados, cobros pendientes, efectivo disponible y obligaciones reservadas. Un pico con ingresos y cobertura suficiente puede continuar dentro de los límites autorizados; tráfico o altas de cuentas por sí solos no justifican más gasto. Las ventas pendientes de liquidación solo pueden respaldar trabajo si existe liquidez o reserva utilizable para adelantarlo, conforme a post_30.

El administrador decide si nuevos fondos amplían automáticamente presupuestos, en qué proporción y hasta qué techo absoluto. Sin esa autorización no se elevan topes. Se mantienen las reservas y la separación entre operación y crecimiento. Los USD 120 de aporte propio no autorizan un déficit personal ilimitado.

# 4 Métricas y detección temprana

El panel muestra gasto real y estimado, pendientes de facturación, presupuesto comprometido y restante, ritmo de gasto, tiempo proyectado hasta agotar fondos e ingresos asociados. Distingue cuentas gratuitas, pruebas, compras y suscripciones, servicios y causas de costo, sin incorporar datos de estudiantes innecesarios.

Se vigilan solicitudes, correos por destinatario, tokens y costos de IA, tareas simultáneas, sesiones, participantes, tráfico, escrituras, almacenamiento, CPU y memoria. Los picos y bucles de reintentos disparan controles antes de alcanzar el tope monetario. Si las métricas críticas faltan o dejan de ser fiables, se restringe automáticamente la admisión afectada.

# 5 Restricción progresiva y apagón

Operación normal: se admite trabajo dentro de cupos, presupuesto y capacidad. Se conserva un margen explícito para consumo en curso y retrasos de medición.

Restricción: se reduce primero el trabajo discrecional o gratuito, las nuevas pruebas y la concurrencia; se limita la admisión de nuevas sesiones y tareas. Puede pedirse esperar, incluso a usuarios pagos, con estado y opciones comprensibles. No se promete una hora de recuperación que no pueda sostenerse.

Pausa selectiva: se detiene la categoría que amenaza el presupuesto, como IA, correo, cargas, escrituras o nuevas partidas. Las demás continúan solo si permanecen controladas y respaldadas.

Apagón de emergencia: si persiste el riesgo o falla el control global, se suspende la operación general automáticamente, sin esperar respuesta a una alerta. Puede interrumpir partidas o trabajos en curso. Se intenta conservar avance recuperable dentro de un tiempo y presupuesto acotados, sin posponer indefinidamente el corte.

# 6 Alcance real del corte y efectos comerciales

El corte alcanza tareas en segundo plano, trabajos programados, colas, reintentos y llamadas externas; ocultar la interfaz no basta. Se bloquean nuevas ventas cuando no puede entregarse lo ofrecido y se contempla el efecto de las renovaciones externas para evitar cobros silenciosos de servicios que no se pueden prestar. Se aplican ajustes, restituciones y reembolsos conforme a los derechos y reglas aprobados.

La pausa no es un baneo ni borra cuentas, notas o saldos. No se consumen partidas que no comenzaron ni se inventan resultados académicos. Se restituye el consumo afectado cuando corresponde. Se procura mantener un medio de bajo costo para consultar el estado, cancelar y ejercer derechos; su acceso alternativo se define para el despliegue elegido.

# 7 Control y recuperación administrativa

El administrador puede imponer un corte inmediato, consultar el motivo y ajustar límites con autenticación reforzada e historial. El apagón queda vigente hasta revisión y reapertura explícita: un reinicio, despliegue, cambio de mes, ingreso nuevo o renovación de cuota de un proveedor no lo desactiva por sí solo. La reapertura es gradual y no libera toda la cola acumulada de golpe.

# 8 Protección del despliegue independiente de la aplicación

La elección de nube, máquinas y arquitectura de despliegue queda para su etapa correspondiente. La plataforma limita los usos que generan infraestructura; el entorno de despliegue debe tener además controles propios que funcionen aunque la aplicación esté caída, saturada o no registre métricas. Se deben cubrir gastos por tráfico que ni siquiera llega al servicio.

Antes de lanzar se identifican límites disponibles, acciones automáticas de corte, latencia de facturación y exposición máxima residual. Una alerta de presupuesto no se considera por sí sola un límite de cobro. La solución debe demostrar cómo restringe o detiene gasto y cómo evita que otros mecanismos vuelvan a levantar lo detenido.

Apagar una máquina no implica necesariamente costo cero: pueden persistir almacenamiento, respaldos, direcciones, transferencias u otros cargos. Se documentan esos costos, su duración y el margen reservado. Solo se admite una solución cuya exposición residual esté acotada y aceptada por el creador; un riesgo de gasto sin límite verificable bloquea el lanzamiento.

# 9 Configuración obligatoria antes de producción

No se puede aprobar producción sin topes numéricos globales y por servicio, umbrales de actuación, ventanas de tiempo, límites de concurrencia y volumen, reserva para trabajo en curso y exposición residual, y política de ampliación por ingresos. Los importes monetarios y la tolerancia residual se fijan con el creador al cerrar el presupuesto y despliegue reales, no quedan a libre elección estratégica del agente.

Cada integración debe identificar qué cuesta, cuánto puede acumularse antes de detectarlo y qué acción lo detiene. El mismo inventario cubre infraestructura, monitoreo y registros. Los topes del proveedor se utilizan como defensa adicional cuando existan, sin sustituir el control de la plataforma ni presumir que todos son cortes duros e instantáneos.

# 10 Comprobaciones exigidas para el lanzamiento

Se demuestra el comportamiento con un pico gratuito sin ingresos, crecimiento con ingresos y liquidez suficiente, solicitudes simultáneas cerca del límite, agotamiento de Resend y paso controlado a SES, y un bucle de trabajos o reintentos. Se comprueba que las restricciones entren en vigor sin esperar intervención humana.

También se demuestra pérdida o retraso de métricas, facturación tardía, apagón con colas y partidas activas, reinicio posterior y recuperación manual. El despliegue prueba su propio corte, el bloqueo de reinicios automáticos y los cargos residuales. Se registran tiempos de reacción y exposición económica máxima observada y prevista.

El equipo entrega evidencia, configuración final, procedimiento de corte y recuperación y riesgos residuales. Si los controles no permiten demostrar gasto acotado, la plataforma no pasa a producción. Este requisito se añade a la validación operativa de post_16 y no se resuelve solo con documentación o alertas sin efecto comprobado.

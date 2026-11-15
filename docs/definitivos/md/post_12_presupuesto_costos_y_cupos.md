# Presupuesto costos y cupos

Playhoot  |  post_12  |  Decisiones aprobadas al 14 de noviembre de 2026

Este parche define el presupuesto de arranque, su relación con los ingresos disponibles, las reservas para compromisos y el control de nuevos gastos. Incluye los créditos de IA, los cupos de juegos, sesiones y materiales, y el efecto de reducir un plan. Complementa playhoot.docx y los parches post_01 a post_11, y prevalece sobre las fuentes anteriores en estos asuntos. El equipo del repositorio define la implementación interna.

# 1 Presupuesto de arranque y reinversión

Se mantienen USD 120 mensuales como presupuesto de arranque. Se contempla la operación completa: infraestructura, almacenamiento, red, correo, IA y demás servicios necesarios. Los gastos anuales o iniciales aparecen con su importe y fecha de pago.

Se conserva el criterio del documento base de calcular el presupuesto como el mayor entre el aporte base y la reinversión calculada del período anterior. La reinversión se basa en ingresos netos y fondos disponibles, respetando las reservas ya comprometidas.

# 2 Ventas ingresos netos y fondos disponibles

Un cobro al comprador no significa que todo ese dinero pertenezca a Playhoot ni que ya pueda gastarse. Se distinguen impuestos, comisiones, devoluciones, reservas y liquidaciones pendientes, sin contar dos veces los mismos importes. El modelo contempla el desfase entre la venta y la disponibilidad de sus fondos para pagar servicios.

# 3 Asignación según la finalidad del presupuesto

Se distinguen la operación mínima, los compromisos con usuarios, el acceso gratuito discrecional y las contingencias. Los cupos vendidos, las pruebas activadas y las promociones prometidas tienen respaldo reservado. El acceso gratuito general utiliza la parte asignada a ese fin.

La asignación gratuita se reparte por tramos del mes, con topes por cuenta y previsión de demanda. Se mantiene el límite individual relativo al plan pagado más barato establecido en el documento base.

# 4 Cobertura antes de asumir y ejecutar compromisos

Antes de ofrecer un plan, una prueba o una promoción, se comprueba que pueda sostenerse bajo estimaciones conservadoras. Antes de iniciar una operación costosa, se comprueba su cobertura.

El cálculo considera el trabajo en curso. Si varias generaciones se ejecutan simultáneamente, su consumo previsto ya ocupa presupuesto. Después se contrasta lo reservado con el consumo real y se ajustan las estimaciones. El dinero reservado para una finalidad no se asigna simultáneamente a otra.

# 5 Detención de nuevas obligaciones y continuidad

Al acercarse al límite se frenan nuevas asignaciones gratuitas, promociones y ventas que no puedan respaldarse. Las operaciones costosas se admiten según la cobertura que les corresponda.

Se preservan las partidas en curso, los compromisos respaldados y las funciones necesarias de consulta, exportación, cancelación y ejercicio de derechos. Esta regla precisa la detención prevista en el documento base al agotarse el presupuesto. Se mantiene un margen para diferencias de facturación y trabajo en curso, considerando las limitaciones de los controles externos de gasto.

# 6 Información y controles de administración

El panel distingue presupuesto, gasto confirmado, estimaciones, reservas, disponibilidad y proyección hasta fin de mes. Permite identificar costos por IA, partidas, almacenamiento, promociones y demás categorías relevantes.

Los valores indican si son medidos o estimados. Desde administración se actualizan supuestos, se simulan escenarios y se ajustan las reglas, conservando historial y respetando lo ya contratado.

# 7 Créditos de IA y equivalencia de consumo

Los créditos representan presupuesto de consumo de IA, con una equivalencia interna estable. El consumo se calcula con uso facturable verificable y tarifas registradas, permitiendo combinar servicios distintos. La equivalencia de los créditos ya otorgados se conserva. El precio de venta y la cantidad de créditos incluidos se definen aparte.

Las simulaciones y capturas que no utilizan IA siguen sus propios límites de uso y no descuentan créditos de IA.

# 8 Máximo autorizado por solicitud de trabajo

Cada solicitud muestra una estimación y un tope ajustable. Enviarla autoriza trabajar dentro de ese máximo, sin pedir confirmación para cada llamada o corrección interna. Antes de agotarlo, la IA pausa y presenta opciones para continuar. Aumentarlo requiere una decisión del usuario y no se compra saldo automáticamente.

El usuario no paga más del máximo autorizado. Una desviación causada por los controles de Playhoot la asume la plataforma.

# 9 Iteraciones cancelaciones y fallos técnicos

Los créditos pagan el trabajo de IA realizado. Puede quedar un borrador incompleto al agotarse el tope. Las iteraciones normales de diseño y corrección cuentan dentro de ese límite; los ciclos repetidos sin progreso se detienen. Si el usuario cancela, se detiene lo que pueda cancelarse, se conserva el avance y cuenta el consumo ya incurrido.

Una llamada fallida sin resultado aprovechable, o trabajo perdido por un fallo técnico de Playhoot, no se carga al usuario. Si ya se descontó, se repone. El costo que haya cobrado el proveedor lo asume Playhoot. La reposición conserva su vigencia original y, si el saldo estaba vencido o próximo a vencer, ofrece al menos treinta días para utilizarlo.

# 10 Saldos mensuales recargas y promociones

Los créditos incluidos en una suscripción vencen al terminar su período y no se acumulan. Los promocionales tienen la vigencia anunciada al otorgarlos. Las recargas compradas no caducan por tiempo ni por cancelar la suscripción y pueden seguir utilizándose para las funciones permitidas sin plan.

Se consume primero el saldo que antes vence. Ante igual vencimiento, el gratuito o promocional se consume antes del pagado. Las recargas sin vencimiento quedan al final.

# 11 Cambios de plan y reservas entre períodos

Cambiar de plan no reinicia el consumo. En un aumento se añade únicamente el incremento proporcional al tiempo restante del período, conservando el consumo previo y las recargas independientes. Las reducciones se aplican al siguiente período conforme a post_11.

El trabajo efectivamente en curso puede liquidarse contra su reserva original aunque cambie el período. Las reservas se liberan al pausarse o cerrarse el trabajo y no prolongan indefinidamente la vigencia del saldo sin utilizar.

# 12 Visibilidad y movimientos de créditos

El usuario ve saldo disponible, reservado y consumido, vencimientos y movimientos por solicitud. Cada trabajo muestra su consumo final y el avance conservado. Internamente se distinguen el costo real para Playhoot, los créditos descontados y las compensaciones: reponer créditos no oculta un gasto que realmente ocurrió.

Reintentar una operación o recibir dos veces su resultado no duplica el descuento.

# 13 Capacidades que se contabilizan por separado

Se distinguen los juegos conservados por la cuenta, las creaciones dentro de una ventana de tiempo y el consumo de IA. También se separan las sesiones iniciadas durante un período, las sesiones abiertas simultáneamente incluidos sus lobbies, los jugadores admitidos por sesión y la capacidad de materiales y almacenamiento. Estas distinciones no obligan a vender cada capacidad por separado; permiten explicar qué amplía cada plan o compra.

# 14 Cupos de juegos borradores y versiones

Un borrador ocupa un cupo desde su creación. Las versiones siguen siendo el mismo juego. Copiar una plantilla crea otro juego y consume una creación; guardar un favorito no ocupa un cupo de juego propio. Eliminar un juego libera capacidad para conservar otro, pero no devuelve la creación consumida ni los créditos utilizados.

Editar un juego no cuenta como una nueva creación, aunque puede consumir IA y recursos de prueba. Las tres modalidades de creación tienen las mismas reglas de cupos. Usar IA externa evita únicamente el consumo de la IA de Playhoot.

# 15 Consumo de sesiones y capacidad de jugadores

La reserva de uso al crear el lobby y su consumo al iniciar la partida se aplican tanto a las compras individuales como a las sesiones incluidas en una suscripción. Cancelar o vencer antes de iniciar libera la reserva. Reconectar o recuperar una partida no consume otra sesión; comenzar una partida nueva sí. Se mantienen las reposiciones por fallos técnicos aprobadas en post_11.

El máximo de jugadores respeta tanto la capacidad contratada como las reglas del juego. No se ofrece una ampliación que ese juego no pueda aprovechar.

# 16 Capacidad de materiales y clases

La cantidad de archivos no es la única medida: se consideran el volumen almacenado y los límites relevantes de procesamiento. Antes de subir o procesar un archivo se muestran las restricciones aplicables, como su tamaño y extensión procesable. Un rechazo previo al procesamiento no consume IA.

Reutilizar el mismo material propio en varias clases no multiplica artificialmente su consumo. Cuando el usuario elimina contenido, se libera su cupo. Las copias mínimas que deban conservarse para cumplir la retención de partidas se contemplan en los costos de Playhoot. Si un plan limita estudiantes, se cuentan las inscripciones de cada clase, sin identificar globalmente a una misma persona entre profesores.

# 17 Reducciones de plan y cuentas sobre su capacidad

Bajar de plan no elimina contenido automáticamente. Se conserva la consulta y exportación durante la retención aplicable. Si la cuenta queda por encima de su nueva capacidad, se impiden nuevas creaciones o ampliaciones de la categoría excedida hasta liberar espacio o adquirir capacidad.

No se reinician consumos ni desaparecen compras independientes. Las partidas en curso mantienen sus condiciones y las nuevas utilizan las capacidades vigentes. Cada bloqueo explica su causa y las opciones que realmente lo resuelven: eliminar un juego no resuelve haber agotado las creaciones del período.

# 18 Validación de la oferta comercial inicial

Las cantidades y precios iniciales se contrastan con costos de juegos representativos, incluidos quiz para clases, juegos por turnos con información privada y movimiento en tiempo real. Antes de vender debe existir una propuesta concreta de precios, cupos y margen que contemple operación, comisiones, promociones y contingencias. Los USD 120 son el presupuesto de arranque; su suficiencia para sostener la oferta debe comprobarse. Este parche no fija todavía valores numéricos para el catálogo comercial.

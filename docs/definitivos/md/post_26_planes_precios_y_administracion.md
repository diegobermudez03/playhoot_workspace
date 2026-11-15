# Planes precios y administración del catálogo

Playhoot  |  post_26  |  Decisiones aprobadas al 15 de noviembre de 2026

Este parche fija los cuatro planes iniciales y su administración. Complementa playhoot.docx y post_01 a post_25. Sustituye expresamente post_11, sección 3, en materia de aumentos: solo afectan nuevas contrataciones, sin trasladarse a renovaciones de suscripciones vigentes.

# 1 Catálogo inicial mensual

| Plan | Precio USD | Cupo IA USD | Excedente USD |
|---|---|---|---|
| Personal Esencial | 6 | 1 | 1,34 |
| Profesor Esencial | 7 | 1 | 2,04 |
| Personal Plus | 10 | 3 | 2,16 |
| Profesor Plus | 15 | 5 | 3,69 |

Los precios mensuales totales incluyen los impuestos indirectos aplicables. Personal corresponde a la familia Normal. Cada cuenta mantiene una sola suscripción; Profesor incluye Personal. Los participantes juegan gratis. La facturación anual y un tercer nivel quedan para después.

# 2 Funciones y cupos

Esencial ofrece las funciones aprobadas para uso moderado; Profesor añade las académicas, con calificaciones opcionales. Plus amplía IA, juegos, sesiones, almacenamiento y capacidad académica. Ambos niveles utilizan los modelos y posibilidades visuales seleccionados, incluidos personajes y animaciones. Los límites distintos de IA y los paquetes adicionales siguen pendientes.

El cupo de IA expresa costo interno equivalente, no dinero retirable ni un número garantizado de juegos. Se convertirá a créditos con la equivalencia estable de post_12. El saldo mensual no se acumula. Las recargas y la IA externa conservan sus reglas; una menor cantidad de suscriptores no reduce el cupo ya vendido.

# 3 Supuestos económicos y validación

Los excedentes estimados suponen 100 suscriptores de pago, consumo completo de IA, impuesto indirecto hipotético del 20 %, comisiones de 7 % más USD 0,50 y 1 % del desembolso, y reserva del 5 % de la venta. Se reparten igualmente USD 80 mensuales de OPEX fijo, USD 0,50 variable por suscriptor y USD 10 de IA gratuita y pruebas. Son supuestos, no costos medidos ni impuestos universales.

Los márgenes son anteriores a remuneración del operador e impuesto sobre la renta. Los objetivos de USD 1 por Personal y USD 2 por Profesor se evalúan bajo ese escenario, no se garantizan a cualquier volumen. Se mantiene el presupuesto inicial de USD 120 y la validación de cobertura antes de vender. Los precios y la oferta completa se contrastan con costos reales de operaciones representativas.

# 4 Gestión desde administración

Administración permite agregar planes, definir familia, nivel, precio, cupos, funciones soportadas y fecha de vigencia, y gestionar sus precios sin editar código para cada cambio comercial. Los planes incompletos pueden prepararse sin ofrecerse al público. Antes de activar una oferta se comprueban su cobertura y correspondencia con el proveedor de cobro.

Cada operación conserva historial, responsable, fecha efectiva y valores anteriores y nuevos. Antes de confirmarla se muestra qué cambia para nuevas compras y qué suscripciones existentes resultan afectadas. El usuario puede consultar su precio recurrente y el próximo cobro previsto.

# 5 Reducciones de precio

Una rebaja se aplica desde su fecha efectiva a nuevas contrataciones y al próximo cobro de las suscripciones actuales del mismo plan. No reabre períodos ya pagados ni genera por sí sola devoluciones retroactivas o cambios de fecha de renovación. Tampoco modifica automáticamente los beneficios contratados.

La rebaja nunca aumenta una tarifa antigua protegida: se conserva el menor precio recurrente base entre el vigente para esa suscripción y el nuevo precio reducido del catálogo. Por ejemplo, si una cuenta conserva USD 6, el catálogo sube a USD 8 y después baja a USD 7, esa cuenta sigue en USD 6. Quien pagaba USD 8 pasa a USD 7 en su siguiente cobro.

# 6 Aumentos y protección del precio anterior

Un aumento se aplica únicamente a nuevas contrataciones desde su fecha efectiva. Las suscripciones existentes conservan su precio recurrente base en las renovaciones mientras continúen en ese plan. No basta con avisar de un aumento para trasladarlo a estos usuarios. Agregar otro plan no los migra ni los encarece automáticamente.

Deshacer una cancelación antes de terminar el período y recuperar un pago dentro del plazo de siete días acordado mantienen la continuidad. Tras extinguirse la suscripción, una nueva contratación utiliza la oferta vigente. Un cambio voluntario de plan muestra previamente el precio de destino y el efecto sobre la tarifa anterior, con las reglas de prorrateo y activación de post_11 y post_12.

# 7 Promociones y coherencia del cobro

La protección corresponde al precio recurrente base, no convierte una prueba o descuento temporal en una tarifa permanente. Se mantienen las promociones y condiciones adquiridas conforme a post_11. Una modificación administrativa no duplica créditos, reinicia consumos ni compra beneficios sin autorización del usuario.

Una rebaja debe reflejarse en el cobro real, no solo en la ficha del catálogo. La integración debe conservar las tarifas protegidas y comprobar el efecto efectivo de cada cambio, incluidas las particularidades de PayPal. Si el proveedor exige condiciones incompatibles con estas reglas, se resuelve con el creador antes de habilitar esa operación; no se cambia silenciosamente la política aprobada. La implementación concreta corresponde al agente del repositorio.

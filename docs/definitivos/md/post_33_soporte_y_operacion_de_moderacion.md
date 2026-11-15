# Soporte y operación de moderación

Playhoot  |  post_33  |  Decisiones aprobadas al 15 de noviembre de 2026

Playhoot atiende soporte, reportes y apelaciones desde su propia administración, con operación humana individual y correo integrado. Este parche complementa playhoot.docx y post_01 a post_32; concreta la operación prevista en post_13 y post_16 y la recepción pendiente de post_31. Sus decisiones prevalecen en estos asuntos. Se mantienen los controles económicos de post_32. El equipo del repositorio decide la implementación.

# 1 Ayuda y gestión de casos en Playhoot

Ayuda y soporte ofrece preguntas frecuentes y permite abrir casos de pagos, problemas técnicos, privacidad, contenido y apelaciones. Cada caso tiene referencia, conversación y estado consultable. Administración permite responder, priorizar, registrar decisiones y ejecutar las acciones autorizadas. Las notas internas están separadas de las respuestas visibles al usuario.

La fase 1 no contrata una mesa de ayuda externa ni incorpora un chatbot de IA. Se utilizan preguntas frecuentes y respuestas predefinidas para consultas repetidas. Esta decisión no elimina los controles de moderación ya aprobados.

# 2 Correo entrante y saliente

Amazon SES recibe el correo de soporte y las respuestas en us-east-1. Playhoot incorpora los mensajes a los casos y muestra las conversaciones en administración; SES no sustituye esa interfaz. Las respuestas y avisos salientes conservan Resend y SES conforme a post_31. Se usa una dirección del dominio oficial, que se concretará al elegir el dominio.

La recepción utiliza SES por uso, sin alternancia entre proveedores. La referencia consultada al 15 de noviembre de 2026 es USD 0,10 por mil mensajes recibidos, más bloques de datos entrantes y recursos auxiliares. No representa el costo total del soporte. Se verifican tarifas y condiciones al configurar el servicio y se incorpora este tratamiento al registro de proveedores de post_22.

La recepción, el procesamiento, el almacenamiento y las respuestas están sujetos a límites y cortes de post_32. No se permite que una entrada masiva dispare trabajo, reintentos o respuestas sin control. Los avisos por correo contienen información mínima; los detalles sensibles se consultan mediante acceso protegido, conforme a post_31.

# 3 Acceso al soporte y comprobación de autoridad

Las cuentas registradas vinculan los casos a su cuenta. Invitados y estudiantes pueden reportar y seguir sus casos dentro de Playhoot sin aportar correo. Un formulario público permite avisos de privacidad, contenido ilegal, derechos de autor y problemas de acceso, con seguimiento seguro sin obligar a crear una cuenta. Las cuentas suspendidas conservan soporte, apelaciones y las gestiones comerciales pertinentes.

La dirección remitente y el número de caso no bastan para autorizar cambios sensibles. Recuperar una cuenta, revelar datos o modificar una compra exige comprobar la autoridad correspondiente. No se expone por defecto la identidad del reportante a la persona denunciada. Se mantiene el acceso alternativo previsto para un apagón en post_32.

# 4 Objetivos iniciales de atención

Los siguientes objetivos distinguen primera atención de resolución. Los días hábiles son de lunes a viernes, excluyendo festivos de Colombia, con referencia a la hora de Colombia. La cola de seguridad se revisa diariamente, incluidos fines de semana. No se ofrece atención humana permanente ni resolución inmediata.

| Tipo de caso | Objetivo operativo |
|---|---|
| Seguridad grave o exposición de datos | Contención automática cuando corresponda y revisión humana prioritaria. Revisión diaria de la cola. |
| Cobro confirmado sin servicio, acceso bloqueado o pérdida de resultados | Primera respuesta dentro de un día hábil. |
| Consultas y problemas ordinarios | Primera respuesta dentro de dos días hábiles. |
| Apelaciones | Primera revisión dentro de tres días hábiles. |

Los plazos obligatorios de cada mercado prevalecen. Su activación requiere poder cumplirlos; estos objetivos no sustituyen las obligaciones de privacidad, seguridad o avisos a autoridades ya previstas.

# 5 Revisión humana y capacidad de moderación

Se mantienen controles automáticos y contención preventiva proporcionada. Las sanciones definitivas de cuenta requieren revisión humana. Administración distingue casos nuevos, pendientes de información, bajo revisión, resueltos y apelados. Marcar como leído no resuelve el caso: debe existir una decisión o acción pendiente identificable.

Si se acumulan solicitudes para Discovery, se pausan nuevas aprobaciones o se comunica la espera. La falta de capacidad no produce aprobaciones automáticas. Pagar un plan superior no concede una revisión más favorable. Se mantienen las reglas de motivación, alcance, apelación y efectos comerciales de post_13.

# 6 Privacidad y conservación de los casos

Los casos ordinarios se eliminan a los seis meses de cerrados. Mientras exista una restricción activa se conserva la justificación mínima necesaria, sin retener todos los adjuntos por defecto. Comprobantes comerciales, solicitudes de privacidad y evidencias sujetas a obligaciones específicas siguen sus propias reglas. Se respetan los derechos de eliminación y las reglas de purga y respaldo ya aprobadas.

Las conversaciones, documentos y datos de estudiantes no se envían automáticamente a una IA. El acceso administrativo a información privada responde a una necesidad concreta y queda sujeto a los controles de post_16. Los registros técnicos de entrega de correo conservan su retención de treinta días de post_31; no se confunden con el expediente de soporte.

Referencias de proveedor: aws.amazon.com/ses/pricing/ y docs.aws.amazon.com/ses/latest/dg/receiving-email.html. Consultadas el 15 de noviembre de 2026.

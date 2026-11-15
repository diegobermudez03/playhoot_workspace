# Correo Resend SES y canales de avisos

Playhoot  |  post_31  |  Decisiones aprobadas al 15 de noviembre de 2026

Se seleccionan Resend gratuito y Amazon SES por uso para el correo saliente de fase 1, con cambio automático administrable. Este parche complementa playhoot.docx y post_01 a post_30; concreta la elección pendiente de correo y los canales de post_14. Sustituye la delegación anterior de esa elección al equipo del repositorio. Se mantiene la exclusión de todo push de post_29.

# 1 Proveedores y condiciones iniciales

Resend se mantiene en su plan gratuito, con sobreconsumo pagado desactivado. Sus límites de referencia son cien correos diarios y tres mil mensuales, respetando ambos. Amazon SES utiliza la modalidad por uso à la carte, con región primaria Norte de Virginia, Estados Unidos, us-east-1, y tarifa de referencia de USD 0,10 por mil correos salientes. Son referencias consultadas al 15 de noviembre de 2026; datos enviados, servicios auxiliares e impuestos se contabilizan aparte en el OPEX.

Ambos remitentes deben quedar autenticados y SES autorizado para producción antes del lanzamiento. Los límites y condiciones vigentes se comprueban al configurar las cuentas. La recepción y gestión de conversaciones de soporte se decidirán en su bloque correspondiente; esta selección cubre el correo saliente.

# 2 Cambio automático y modos de administración

El modo predeterminado utiliza Resend mientras exista cupo gratuito diario y mensual. Al agotarse cualquiera, los envíos siguientes pasan a SES. Cuando se renueva el cupo correspondiente, vuelve a utilizarse Resend. La elección se realiza durante la operación y no exige despliegue.

Administración permite seleccionar Automático, Solo Resend o Solo SES sin desplegar, y consultar consumo, proveedor utilizado, fallos y costo estimado. Solo Resend utiliza únicamente su capacidad disponible. Los límites se controlan considerando el consumo conjunto de la cuenta del proveedor, sin multiplicarlos por dominio, instancia o clave.

# 3 Fallos y pérdidas puntuales aceptables

Un rechazo claro por falta de cupo permite enviar por SES. Si el primer proveedor ya aceptó el mensaje, no se envía también por el segundo. Ante una respuesta incierta se evita el reenvío inmediato por otro proveedor. Se aceptan pérdidas puntuales y un tratamiento sencillo; cuando corresponda, el usuario puede solicitar un nuevo código.

Las bajas, quejas y rechazos permanentes se respetan en ambos proveedores. Cambiar de proveedor no evita estas restricciones ni amplía cuotas del otro. La notificación interna permanece conservada y un correo fallido no figura como entregado o leído. Los avisos de acceso, seguridad y facturación tienen prioridad sobre los opcionales.

# 4 Distribución de avisos

| Acontecimiento | Dentro de Playhoot | Correo |
|---|---|---|
| Código de acceso o verificación | Estado en pantalla | Necesario |
| Bienvenida al crear cuenta | Sí | Sí, con correo habilitado |
| Compra o renovación confirmada | Sí | Sí |
| Cancelación, cambio de plan, rebaja o reembolso | Sí | Sí |
| Pago fallido y fin de recuperación | Sí | Sí |
| Prueba: activación, aviso 24 horas antes de terminar y finalización | Sí | Sí |
| Cambios relevantes de seguridad, privacidad o restricciones de cuenta | Sí | Sí |
| Autorización del representante y constancia | Según flujo y permisos | Según flujo autorizado |
| Trabajo de IA terminado o pausado | Sí | Opcional, desactivado por defecto |
| Créditos o capacidades próximos a agotarse o agotados | Sí | Opcional, desactivado por defecto |
| Resultado de revisión para Discovery | Sí | Opcional; necesario si comunica restricción relevante |
| Ingreso, actividades y calificaciones de clase | En contexto autorizado | Sin correo a estudiantes |
| Promociones comerciales | Según consentimiento | Solo con aceptación específica |

Correos opcionales y marketing tienen preferencias independientes; los avisos necesarios de acceso, seguridad y facturación permanecen habilitados. El recibo de Lemon Squeezy cubre el correo de compra; Playhoot registra la activación y envía otro mensaje si existe información operativa distinta.

# 5 Privacidad seguimiento y control

Los correos usan el idioma elegido entre español, inglés y portugués. Contienen información mínima y enlaces al contenido protegido, sin notas, nombres de estudiantes, materiales privados ni secretos del juego. No se rastrean aperturas ni clics.

Los registros propios de entrega duran treinta días, sin cuerpos ni códigos de acceso. Compras y autorizaciones conservan sus retenciones. Ambos proveedores y sus tratamientos internacionales se documentan conforme a post_22. La región de envío no garantiza residencia exclusiva del recorrido.

Administración distingue pendientes, entregados, rechazados y fallidos. Los reintentos conservan el acontecimiento y se controla el abuso. Enviar correo no marca lectura interna. El repositorio define la implementación.

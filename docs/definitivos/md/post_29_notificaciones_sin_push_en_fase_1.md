# Notificaciones sin push en fase 1

Playhoot  |  post_29  |  Decisión aprobada al 15 de noviembre de 2026

La fase 1 de Playhoot no incorpora notificaciones push de ningún tipo. Este parche complementa playhoot.docx y post_01 a post_28 y sustituye expresamente las referencias a push como canal de fase 1, incluidas las de post_14, secciones 4 y 5, y los flujos de notificación del documento base.

# 1 Canales disponibles

Los canales son las notificaciones dentro de Playhoot y el correo electrónico, según importancia, disponibilidad y preferencias ya acordadas. Bienvenida, compras y cambios importantes de cuenta o facturación utilizan notificación interna y correo cuando existe un correo habilitado. Los demás eventos mantienen las reglas de importancia y preferencias de post_14, suprimiendo el canal push.

Se conserva una entrada lógica por acontecimiento. Enviar un correo no marca como leída su notificación interna; abrir la lista tampoco marca automáticamente todas como leídas. Los reintentos no duplican entradas ni contadores.

# 2 Exclusión de web push y continuidad de la PWA

La exclusión abarca web push, notificaciones del navegador o del sistema operativo y push mediante la PWA, incluso si el usuario la instala. No se solicitan permisos ni se muestran opciones para activarlos. No se selecciona un proveedor de push para fase 1.

La web móvil y la PWA instalable siguen dentro del alcance de post_01. La instalación es opcional y conserva su utilidad para abrir Playhoot en una ventana independiente. Las actualizaciones y avisos visibles dentro de la interfaz mientras se utiliza Playhoot continúan permitidos.

# 3 Privacidad y fases posteriores

Se mantienen la información mínima en correos, la separación entre avisos necesarios y marketing, el consentimiento comercial y las restricciones sobre datos y promociones de estudiantes. Esta decisión no introduce correos obligatorios para menores ni otros datos nuevos.

Las aplicaciones móviles nativas continúan diferidas. Incorporar cualquier forma de push requerirá una decisión posterior explícita de producto; no se añade como consecuencia automática de ofrecer una PWA.

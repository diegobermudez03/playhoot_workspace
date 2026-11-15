# Descubrimiento navegación y notificaciones

Playhoot  |  post_14  |  Decisiones aprobadas al 14 de noviembre de 2026

Este parche define la entrada a Playhoot, la información del catálogo y las reglas de navegación, localización y accesibilidad. Precisa la diferencia entre enviar y leer una notificación, sus canales y el acceso a su destino. Complementa playhoot.docx y los parches post_01 a post_13, y prevalece sobre las fuentes anteriores en estos asuntos. El equipo del repositorio define el diseño y la implementación interna.

# 1 Entrada pública y continuidad de los recorridos

La entrada pública combina Discovery con una explicación breve del producto y accesos visibles para unirse a una sesión, crear un juego y usar Playhoot como profesor. Un enlace de invitación lleva directamente a su actividad. Si requiere autenticación, conserva el destino y los datos ya introducidos. No obliga a pasar por Discovery, instalar la aplicación o completar información de perfil innecesaria.

Dentro de la cuenta se encuentran fácilmente juegos propios, favoritos, historial y clases. La identidad de estudiante mantiene su navegación limitada a la clase, conforme a los parches anteriores.

# 2 Contenido y búsqueda en Discovery

Discovery muestra contenido aprobado. Ofrece búsqueda por texto, una categoría principal, múltiples etiquetas y filtro por idioma. Para combinar etiquetas se presentan opciones comprensibles, como cualquiera de estas y todas estas.

La ficha muestra, cuando corresponda, idiomas, jugadores admitidos, dispositivos o controles especiales, carácter académico, soporte de calificaciones y permiso para usarlo como plantilla. Las capturas representan la versión ofrecida y no contienen datos privados. Las estadísticas comunitarias son reales, con definición y período coherentes; pueden omitirse cuando aporten poco. No se inventa actividad para aparentar una comunidad mayor.

# 3 Idiomas formatos y accesibilidad

La interfaz funciona en español, inglés y portugués. El navegador puede sugerir el idioma inicial, pero el usuario puede cambiarlo y conservar esa preferencia. El idioma no determina el país regulatorio ni traduce automáticamente los juegos. Fechas, números y monedas resultan inequívocos; los horarios relevantes muestran su zona horaria.

WCAG 2.2 nivel AA es el objetivo verificable para navegación y gestión, incluyendo teclado, foco visible, contraste, formularios comprensibles y controles utilizables en móvil. Cada juego evalúa sus controles y limitaciones según su mecánica, sin anunciar accesibilidad que no se haya comprobado.

# 4 Envío y lectura de notificaciones

Enviar un correo o un push no marca como leída la notificación dentro de Playhoot. Los canales externos tienen su estado de envío y la notificación in-app conserva su estado de lectura. Se marca como leída al abrir su contenido, consultar la actualización correspondiente o marcarla explícitamente. Abrir la lista no marca automáticamente todo como leído. Esta regla reemplaza la equivalencia entre envío y vista del documento base.

Un mismo acontecimiento genera una entrada lógica aunque utilice varios canales. Los reintentos no crean nuevas entradas ni aumentan artificialmente el contador.

# 5 Canales importancia y preferencias

No se exige enviar cada aviso por los tres canales. Bienvenida, compras y cambios importantes de cuenta o facturación utilizan in-app y correo cuando existe un correo habilitado; el push se utiliza si está autorizado para ese tipo de aviso.

Publicación, avances de casos y trabajo de IA terminado o que requiere atención utilizan in-app; correo y push dependen de importancia y preferencias. No se envían avisos externos por cada paso interno. Promociones y reactivación comercial requieren aceptación específica y una opción sencilla de desactivarlas. No hay promociones dirigidas a estudiantes.

Los avisos necesarios de seguridad, servicio y facturación se distinguen del marketing. El permiso de push se solicita después de que la persona elija recibir esos avisos y rechazarlo no bloquea el uso de Playhoot.

# 6 Destinos acceso y privacidad de los avisos

Un aviso lleva al juego, caso, compra o actividad correspondiente. Si exige autenticación, después regresa al destino. Abrir el enlace no concede permisos ni ejecuta compras, publicaciones o eliminaciones. Si el contenido venció, fue retirado o ya no es accesible, se explica y se ofrece una salida útil.

Correos y push muestran información mínima: no incluyen calificaciones, nombres de estudiantes, materiales privados ni secretos del juego. Los avisos de estudiantes permanecen dentro del contexto autorizado de su clase.

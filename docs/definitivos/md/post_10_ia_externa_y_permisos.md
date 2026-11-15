# IA externa y permisos de acceso

Playhoot  |  post_10  |  Decisiones aprobadas al 14 de noviembre de 2026

Este parche define qué puede consultar o modificar una IA externa, cómo se autorizan esas operaciones y cómo se conserva el flujo de copiar, pegar y avisar. Incluye la caducidad y revocación de accesos, los cambios concurrentes y los límites del contexto compartido. Complementa playhoot.docx y los parches post_01 a post_09, y prevalece sobre las fuentes anteriores en estos asuntos. El equipo del repositorio define la implementación interna.

# 1 Autorización sobre un borrador concreto

Cada autorización corresponde al borrador de una versión de un juego. Permite trabajar sobre ese borrador y no se extiende a otros juegos, al perfil, las clases, las notas ni los pagos del creador.

# 2 Permisos de consulta y modificación

El enlace permite consultar las instrucciones, el estado del borrador, sus recursos autorizados y los resultados de las operaciones. La URL de consulta, por sí sola, no autoriza escrituras. Esta regla precisa el alcance del enlace descrito en el documento base.

Para editar directamente, el creador habilita una autorización desde Playhoot que cubre las modificaciones del borrador, la subida de recursos y las simulaciones y previsualizaciones. Playhoot permite esas operaciones ordinarias sin pedir aprobación para cada una. La IA no necesita una cuenta propia de Playhoot ni las credenciales del creador. Finalizar la versión y solicitar su publicación siguen siendo acciones explícitas del creador.

# 3 Flujo manual de copiar pegar y avisar

Si la IA solo puede leer, prepara el contenido y proporciona el enlace específico. El usuario abre Playhoot con su sesión, pega o sube el contenido y lo envía. La pantalla explica en lenguaje claro qué operación realizará, sin exigir entender el código.

Después basta con avisar a la IA que ya se hizo. La IA consulta el resultado actualizado y continúa, sin exigir al usuario copiarlo de vuelta. Abrir un enlace de consulta no ejecuta modificaciones ni inicia simulaciones. Si una IA externa carece de las capacidades necesarias para seguir el flujo, se indica esa limitación.

# 4 Caducidad renovación y revocación

Los accesos caducan a los siete días desde su creación y muestran la fecha de vencimiento. El creador puede revocarlos antes o renovarlos desde el borrador. Renovar genera un acceso nuevo e invalida el anterior, conservando el trabajo.

La revocación impide nuevas consultas y modificaciones mediante ese acceso. No promete borrar información que el servicio externo ya haya recibido.

# 5 Cambios concurrentes e historial recuperable

Si el creador u otra IA modifica el borrador mientras una IA prepara un cambio, ese cambio no sobrescribe silenciosamente el trabajo reciente. La IA consulta el estado nuevo y adapta su propuesta, o se muestra el conflicto para resolverlo.

Se conserva un historial recuperable de cambios, indicando cuáles procedieron de una autorización externa. Reenviar accidentalmente una operación ya completada se reconoce como tal y muestra su resultado.

# 6 Contexto compartido recursos y permisos efectivos

La IA recibe el contenido necesario del borrador y los materiales que el creador haya seleccionado expresamente y esté autorizado a compartir. No obtiene automáticamente conversaciones completas, otros archivos, listas de estudiantes ni calificaciones. Se mantienen las reglas de privacidad aprobadas en post_02.

Usar una IA externa no consume créditos de IA de Playhoot. El almacenamiento, las simulaciones y las demás operaciones de la plataforma siguen sujetos a sus límites de uso.

Los textos encontrados en archivos, plantillas o respuestas externas no pueden ampliar los permisos concedidos. La plataforma hace cumplir esos permisos.

# Sesiones multijugador

Playhoot  |  post_06  |  Decisiones aprobadas al 14 de noviembre de 2026

Este parche define la participación, administración y cierre de sesiones multijugador. El anfitrión conserva sus controles aunque juegue. Se fijan 60 segundos para recuperar una conexión y límites iniciales de duración, junto con las reglas de recuperación, resultados y reintentos. Complementa playhoot.docx y los parches post_01 a post_05, y prevalece sobre las fuentes anteriores en estos asuntos. Las decisiones fijan el comportamiento del producto; el equipo del repositorio define su implementación.

# 1 Anfitrión que juega o dirige

El anfitrión puede participar como jugador o dirigir sin jugar. En una sesión normal se propone También voy a jugar como opción predeterminada; en una actividad de clase, Dirigir sin jugar. La elección puede cambiarse en el lobby y queda fijada cuando comienza la partida.

Si juega, el anfitrión ve únicamente su propia perspectiva. Si dirige, puede consultar las perspectivas de los jugadores previstas en el documento base. Los replays conservan esos mismos permisos de perspectiva; cambiar el modo posteriormente no amplía el acceso a información de la partida ya jugada.

El anfitrión conserva los controles de administración de la sesión aunque participe como jugador, incluida la expulsión de otros participantes. Esto sustituye la restricción del documento base que reservaba esa acción a quien dirigiera sin jugar. Estos controles no le conceden acceso a la información privada de sus rivales. El inicio mantiene las condiciones del juego y las demás operaciones siguen sus permisos correspondientes.

# 2 Admisión y cierre del lobby

En la fase 1, la entrada de participantes nuevos se cierra cuando comienza la partida. Antes de comenzar, el anfitrión puede cerrar y reabrir las admisiones del lobby. Se distingue admitir a alguien nuevo de recuperar el acceso de un participante existente que sigue autorizado.

En una actividad de clase, conocer el enlace o código de la sesión no sustituye la vinculación ni la autenticación del estudiante. Se mantienen los accesos individuales y las identidades independientes por clase aprobados en post_03.

# 3 Recuperación de una conexión

El margen inicial de fase 1 para recuperar la conexión de un jugador es de 60 segundos. Durante ese periodo conserva su puesto y puede volver como el mismo jugador mientras la sesión siga activa y mantenga sus permisos. Una recarga o el cierre accidental de una ventana no equivalen por sí solos a pulsar Salir de la partida.

La desconexión no pausa automáticamente toda la partida. Los turnos, tiempos y consecuencias continúan según las reglas del juego. El margen protege la recuperación del acceso y no elimina las consecuencias que esas reglas produzcan durante la ausencia. Después del margen, el reingreso queda sujeto a lo que permita el juego para ese participante.

# 4 Salida voluntaria y expulsión

Pulsar Salir de la partida comunica una salida inmediata, sin utilizar el margen de desconexión. Regresar después depende de las reglas del juego. La plataforma distingue esta salida de un corte de conexión y de una expulsión, sin imponer aquí la forma interna de representar esos casos.

La expulsión impide que la identidad expulsada regrese a esa sesión, aunque el juego permita normalmente reingresos. Con invitados, la prohibición se aplica a esa identidad: no se promete reconocer infaliblemente a una persona que cree otra. El cierre de admisiones y la prohibición de participantes nuevos tras el inicio ayudan a controlar ese caso.

# 5 Un solo control activo por jugador

Una identidad de jugador conserva un solo control activo de cada partida. Recargar o abrir otra pestaña no crea otro participante. Si el usuario puede autenticarse desde otro dispositivo, una acción como Continuar aquí transfiere el control y el dispositivo anterior deja de enviar acciones válidas. Se conservan su puesto y progreso conforme a las reglas de la sesión.

El enlace compartido no permite por sí solo recuperar la identidad de otra persona. El cambio de dispositivo debe respetar el mecanismo de acceso de la identidad utilizada. Esta regla no convierte una cuenta de invitado vinculada al dispositivo en una cuenta general recuperable mediante el código de la partida.

# 6 Desconexión del anfitrión

Perder la conexión del anfitrión no cancela automáticamente toda la partida. Si el juego puede continuar sin su intervención, continúa. Si requiere una acción suya, espera conforme a sus reglas y a los límites de duración aplicables. En fase 1 no se transfieren automáticamente sus privilegios a otro jugador.

Si el anfitrión también estaba jugando, su participación y reingreso siguen las mismas reglas de desconexión que las de los demás jugadores. Sus facultades como anfitrión permanecen separadas de su estado como participante del juego.

# 7 Límites de duración

Se aplican los siguientes límites iniciales de producto y se muestran al crear la sala. Corresponden a una sala en vivo y no al tiempo durante el que permanece guardado un juego ni a la vigencia de una actividad de clase.

| Situación | Límite inicial |
|---|---|
| Lobby sin comenzar | 30 minutos desde su creación |
| Partida sin interacción de jugadores ni anfitrión | 10 minutos con aviso previo |
| Duración total de la sala | 4 horas desde su creación |

# 8 Avisos y cierre por ausencia

Se avisa antes de cerrar por tiempo o inactividad. El aviso de inactividad permite confirmar Seguimos aquí sin realizar una jugada ni responder una pregunta. Mantener una conexión abierta o reproducir animaciones no basta para conservar indefinidamente la sala.

Si todos los jugadores salen o agotan su margen de reconexión, la partida se cierra sin esperar las cuatro horas. La duración máxima tampoco convierte una sala vacía en una partida que deba mantenerse disponible.

# 9 Recuperación ante fallos de plataforma

Ante un fallo recuperable, se intenta recuperar la misma partida antes de obligar a repetirla. Se restaura el último estado confiable y se informa si se perdió progreso reciente. Cuando vuelve a estar disponible, los jugadores disponen de los 60 segundos acordados para reconectar; ese margen no se consume mientras la plataforma está inaccesible.

Si no puede recuperarse de forma fiable, se cierra como interrumpida. Una pérdida de conexión de un dispositivo no permite asumir que toda la partida terminó. Mientras no se conozca su estado, la interfaz comunica esa incertidumbre y no presenta un cierre como confirmado.

# 10 Motivos de cierre

El historial distingue finalización normal, cancelación del anfitrión, vencimiento, abandono de todos e interrupción técnica. Cancelar requiere confirmación. Una partida cerrada no vuelve a ponerse en marcha como si nunca hubiera terminado. Se conserva el carácter temporal de las salas, sin impedir recuperar una sesión que continúa activa tras un fallo.

# 11 Resultados académicos y replays

Un fallo de la plataforma no genera automáticamente un cero, una ausencia ni un intento académico fallido. Los resultados ya confirmados se conservan. Los resultados parciales se identifican como tales y no se presentan como notas finales.

Las notas no se reconstruyen a partir del replay. La conservación de resultados académicos es independiente de la calidad de esa grabación. El replay puede tener menor precisión; si faltan tramos, debe indicarlo sin inventar acciones. Se mantiene la continuidad funcional exigida en post_02 cuando se elimina otra cuenta: ese borrado no justifica perder o romper el replay compartido.

# 12 Repetir una partida cerrada

Tras un cierre confirmado, el anfitrión puede crear otra partida con el mismo juego, versión y configuración, conservando la relación con la clase cuando corresponda. Se abre un lobby nuevo y el intento anterior mantiene su estado e historial. La repetición no sobrescribe lo ocurrido.

Recuperar la misma partida no cuenta como crear otra sesión. Las compensaciones de consumo por fallos se concretarán en las decisiones de monetización; este parche no las da por resueltas.

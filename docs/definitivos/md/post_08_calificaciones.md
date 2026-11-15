# Calificaciones

Playhoot  |  post_08  |  Decisiones aprobadas al 14 de noviembre de 2026

Este parche define las calificaciones de cada actividad, sus escalas, intentos, publicación y correcciones, así como la nota final de la clase y su exportación. Calificar es opcional y exige soporte específico del juego. La lógica que produce las notas pertenece al juego; la plataforma recibe los resultados por participante y los asocia con los estudiantes correspondientes. Complementa playhoot.docx y los parches post_01 a post_07, y prevalece sobre las fuentes anteriores en estos asuntos. El equipo del repositorio define la implementación interna.

# 1 Actividades académicas y calificables

Un juego puede ser académico sin admitir calificaciones. La clasificación académica, el soporte para entregar notas y la decisión de calificar una actividad son características distintas. Utilizar un juego dentro de una clase tampoco obliga por sí solo a producir notas.

Calificar se decide por actividad. Para activar la calificación automática, la versión del juego debe soportar la entrega de resultados académicos por participante. La plataforma no convierte automáticamente ganadores, rankings ni puntos del juego en notas. Esta regla sustituye la afirmación del documento base que exigía notas para todos los juegos académicos y conserva la posibilidad de actividades no calificables.

# 2 Escalas y criterios declarados

La escala y los criterios de calificación se conocen antes de jugar. Se admiten escalas numéricas y categorías ordenadas, como letras. El profesor puede entender en lenguaje claro de qué depende la nota, sin leer el código del juego.

Un resultado fuera de escala, incompleto o asociado a un participante incorrecto queda pendiente de revisión. No se ajusta silenciosamente para hacerlo parecer válido. Los cambios de contenido o evaluación posteriores al uso de una actividad mantienen las reglas de post_07 sobre preparación de otra actividad y conservación del contexto anterior.

# 3 Intentos y nota que cuenta

Se conservan los intentos de cada estudiante. Reconectar a una misma partida no crea otro intento. Si se repite una actividad, la mejor nota final válida cuenta por defecto. El profesor puede escoger primer intento, último, mejor o promedio numérico cuando la escala lo permita. El orden de la escala determina cuál es la mejor nota.

La repetición no convierte resultados parciales en finales. Los resultados finales ya confirmados se conservan. Se mantienen las reglas de post_06 que distinguen recuperación, repetición e interrupción y evitan generar automáticamente un intento académico fallido por un fallo de la plataforma.

# 4 Falta de resultado y estado de evaluación

La falta de resultado se distingue de una nota igual a cero. Deben diferenciarse los estados pendiente, sin participación registrada, resultado parcial, resultado inválido y exento. Un cero se registra cuando la escala lo admite y las reglas o el profesor lo asignan.

La ausencia de una nota no basta para inferir una ausencia del estudiante ni un fallo académico. Se mantienen las reglas de post_06 para resultados confirmados, resultados parciales y fallos de plataforma.

# 5 Cálculo interno de cada juego

La forma de calcular la nota, incluida cualquier evaluación por equipos, es lógica interna de cada juego. Un juego puede producir el mismo resultado para varios participantes o aplicar sus propias reglas de evaluación individual.

Para la plataforma, la entrada son las notas resultantes por participante, que se asocian con los estudiantes de la clase. La plataforma no calcula la nota grupal ni reparte un resultado de equipo entre sus integrantes. Tampoco necesita interpretar cómo se organizaron los equipos para recibir esas notas. No se extiende un resultado automáticamente a todos los estudiantes inscritos en la clase.

# 6 Publicación y correcciones del profesor

Por defecto, la nota académica queda pendiente de revisión y el profesor puede publicar notas en lote. Puede activar la publicación automática para una actividad que ya revisó. La publicación de la nota académica se controla aparte de la puntuación que muestra el juego.

Se conservan el resultado original, la nota calculada según la regla de intentos y las correcciones del profesor, con quién cambió qué y cuándo. El profesor puede retirar una corrección y volver al cálculo, manteniendo el rastro del cambio. Un intento posterior no sobrescribe silenciosamente una corrección manual.

Estas decisiones mantienen la separación entre las reglas internas de evaluación del juego y la gestión académica de sus resultados. La corrección manual de una nota no reescribe las reglas con las que se jugó ni elimina los resultados originales.

# 7 Nota final opcional

La clase puede tener una nota final, si el profesor decide utilizarla. El profesor selecciona las actividades que cuentan y la escala de salida. Una actividad puede tener calificación y quedar fuera de la nota final, por ejemplo si es una práctica.

# 8 Equivalencias entre escalas

Las actividades pueden utilizar escalas diferentes. Para combinarlas, el profesor aprueba explícitamente las equivalencias hacia una escala común. Se conserva la nota original con su escala. Esta regla sustituye la exigencia del documento base de que todas las actividades tengan la misma escala.

La conversión no se deduce silenciosamente del máximo de la escala: una nota de 3 en una escala de 1 a 5 podría equivaler al 50 % o al 60 %, según la regla elegida. Las categorías, como letras, requieren equivalencias numéricas para promediarlas. Sin una equivalencia definida, siguen disponibles las notas individuales y su exportación, pero no se inventa un resultado agregado.

# 9 Pesos de las actividades

Por defecto, todas las actividades incluidas tienen el mismo peso. El profesor puede asignar porcentajes cuya suma sea 100 %. Primero se convierte cada nota a la escala común y después se aplica el peso de la actividad. Tener más preguntas o más puntos de juego no aumenta automáticamente su peso en la nota final.

# 10 Resultados provisionales y exenciones

Mientras existan resultados pendientes, puede mostrarse un promedio provisional de las actividades evaluadas, junto con la proporción del peso aplicable que ya está cubierta. No se presenta como nota final hasta resolver los pendientes; su ausencia no se convierte automáticamente en cero.

Las actividades de las que un estudiante está exento se excluyen de su cálculo. Los pesos restantes se redistribuyen proporcionalmente para ese estudiante. Si no tiene ninguna actividad aplicable, se muestra «sin resultado».

# 11 Precisión y publicación de la nota final

El cálculo conserva la precisión de los valores intermedios y redondea el resultado final. Se utilizan dos decimales por defecto, con una configuración visible. La pantalla y la exportación muestran la misma nota oficial.

Una nota final publicada conserva los resultados, equivalencias y pesos con los que se obtuvo. Antes de aplicar cambios que la afecten, el profesor puede revisar su efecto y confirmar la nueva publicación. Se conserva el rastro de las revisiones. El estudiante consulta las notas publicadas; las modificaciones pendientes que previsualiza el profesor se distinguen claramente como borrador.

# 12 Exportación a XLSX

El profesor puede exportar las calificaciones a XLSX. El archivo identifica a cada estudiante con los datos ya autorizados de la clase: nombre, alias e identificador interno opcional del profesor, según estén disponibles. Incluye las notas originales, escalas, equivalencias, pesos, estados y nota final cuando corresponda.

La exportación distingue los resultados provisionales o pendientes de los publicados. Exportar no publica ni modifica las notas y no exige recoger nuevos datos de identificación del estudiante.

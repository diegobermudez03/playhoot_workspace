# Creación con IA y calidad de los juegos

Playhoot  |  post_09  |  Decisiones aprobadas al 14 de noviembre de 2026

Este parche define cómo se concreta el pedido de creación y qué se comprueba antes de considerar un juego listo para usarse. Incluye la revisión funcional y visual, los dispositivos e idiomas, la conservación del avance y las herramientas, plantillas y recursos iniciales. Aplica a las tres rutas de creación previstas en playhoot.docx. Complementa ese documento y los parches post_01 a post_08, y prevalece sobre las fuentes anteriores en estos asuntos. El equipo del repositorio define la implementación interna.

# 1 Descripción del juego que se está construyendo

La IA mantiene una descripción breve y comprensible del objetivo, mecánica principal, jugadores, reglas esenciales, finalización, dispositivos e idioma del juego. Incluye los criterios de evaluación cuando se utilizan calificaciones. El creador puede consultar y corregir esa descripción.

La descripción se construye durante la conversación, sin exigir un formulario largo. La IA resuelve los detalles rutinarios con valores razonables y pregunta cuando una ambigüedad pueda cambiar sustancialmente el juego.

# 2 Condiciones para considerar un juego listo

El juego debe ejecutarse, permitir completar su experiencia principal y cumplir las reglas esenciales acordadas. Se comprueba el resultado observable frente al pedido. Los errores que impidan jugar, produzcan resultados incorrectos o revelen información que debía permanecer oculta impiden marcarlo como listo. Las mejoras menores pueden quedar como recomendaciones.

Estos mínimos aplican a las tres rutas de creación. La IA integrada ejecuta las comprobaciones y corrige los fallos detectados. Se mantiene la acción explícita del creador para finalizar una versión, así como la separación entre versión lista y publicación en Discovery acordada en post_04.

# 3 Pruebas según las características del juego

Las pruebas comprueban resultados esperados concretos. Cubren una partida normal hasta el final y, cuando corresponda, las cantidades de jugadores admitidas, salidas y reconexiones, temporizadores e información privada para las distintas perspectivas.

Cuando el juego califica, se incluyen ejemplos con notas esperadas. La evaluación sigue siendo lógica interna del juego, conforme a post_08; se comprueba que funciona como se describió. Para contenido académico, el profesor puede revisar preguntas, respuestas y criterios sin leer código. Las contradicciones o dudas detectadas en los materiales se muestran para resolverlas.

# 4 Revisión visual y previsualización

La revisión visual utiliza el juego real y comprueba legibilidad, controles, recursos y estados representativos en los dispositivos declarados. El creador puede probar una previsualización sin alumnos reales ni registro de calificaciones.

Se conserva la exigencia del documento base de que la IA integrada prepare al menos tres capturas reales para presentar el juego. Para una IA externa se mantiene la alternativa prevista de utilizar el render inicial como imagen principal y omitir las imágenes de descripción cuando no haya una simulación adecuada. Esta alternativa no elimina las comprobaciones esenciales de funcionamiento.

Las comprobaciones corresponden a la revisión concreta del juego. Después de modificarlo, se repiten las que puedan haber quedado afectadas.

# 5 Dispositivos e idiomas declarados

Por defecto, la IA intenta crear una experiencia para escritorio y móvil. Si la mecánica requiere teclado, ratón u otra condición particular, lo indica. Las limitaciones de compatibilidad se conocen antes de organizar o intentar jugar una partida.

El juego se crea por defecto en el idioma del pedido. Los idiomas de la interfaz de Playhoot no implican que cada juego esté traducido automáticamente. Los idiomas compatibles del juego se declaran y, si se solicitan varios, se comprueban sus textos y presentación.

# 6 Avance recuperable y comunicación de límites

El creador puede detener y retomar el trabajo conservando un borrador recuperable. La IA intenta reparar los problemas dentro de los límites disponibles y explica en lenguaje comprensible qué completó, qué comprobó y qué sigue pendiente.

Si falta una capacidad, un recurso o presupuesto, presenta opciones concretas. Un cambio sustancial de lo pedido se acuerda con el creador. La elección de modelos y la organización técnica de esta experiencia corresponden al equipo del repositorio.

# 7 Catálogo inicial de plantillas recomendadas

El catálogo inicial cubre preguntas y respuestas, palabras y acertijos, tableros por turnos, cartas, deducción con roles o información privada y movimiento 2D en tiempo real. Una plantilla puede cubrir varias familias. El conjunto incluye ejemplos individuales y por equipos, así como actividades académicas con y sin calificación.

Cada plantilla recomendada es jugable, está comprobada y tiene una presentación cuidada. Estas familias orientan el contenido inicial y sus comprobaciones; la creación conserva la libertad de combinar mecánicas e inventar otras.

# 8 Herramientas reutilizables de creación

El mínimo facilita turnos, rondas, temporizadores, puntuaciones, equipos, cartas, tableros, información privada, movimiento y colisiones 2D, junto con controles, animaciones y sonido. La documentación permite encontrar capacidades y ejemplos relevantes sin leerla completa. Las plantillas recomendadas demuestran cómo aprovecharlas. El equipo del repositorio decide las herramientas concretas y su organización.

# 9 Biblioteca inicial de recursos

La biblioteca permite terminar juegos sin aportar archivos propios. Incluye elementos de interfaz, cartas, dados, fichas, objetos, personajes con animaciones básicas, fondos, efectos visuales, música y efectos de sonido. Se priorizan conjuntos visualmente coherentes que permitan construir una experiencia completa.

Los recursos se encuentran por función y estilo y pueden escucharse o previsualizarse cuando corresponda. Pueden incorporarse recursos propios y colecciones con permisos compatibles. Se conserva la información de licencia y se mantienen las condiciones de reutilización de post_05.

# 10 Disponibilidad y pendientes del catálogo

Se distinguen los recursos disponibles, pendientes y retirados. Desde administración se pueden registrar pendientes, indicando qué archivo falta y qué se espera conseguir. La IA conoce esa disponibilidad: puede proponer un pendiente como opción que falta completar, pero no utilizarlo como si ya existiera.

Antes de abrir el producto a usuarios reales, las plantillas que cubren las familias iniciales funcionan con recursos disponibles. Pueden quedar pendientes recursos adicionales. La conservación de recursos para versiones existentes mantiene las reglas de post_04.

# 11 Comprobación con IA real

Antes de habilitar la creación integrada para usuarios reales, se demuestra con IA real que puede aprovechar las herramientas y el catálogo para crear y modificar juegos representativos. La comprobación incluye crear desde un pedido, adaptar una plantilla, combinar mecánicas y corregir un juego después de recibir comentarios. Se mantiene la primera entrega local con proveedores simulados; esta comprobación corresponde a la integración real.

# 12 Controles de sonido y efectos decorativos

Se ofrecen silencio, control de volumen y reducción de animaciones no esenciales, respetando las preferencias del usuario. Se conservan los movimientos esenciales para la mecánica. Los avisos importantes tienen una indicación visual además del sonido, salvo cuando escuchar sea parte explícita del juego. El inicio contempla las restricciones de reproducción automática del navegador.

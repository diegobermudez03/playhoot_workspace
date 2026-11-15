# Proveedores de IA, modelos y recursos visuales

Playhoot  |  post_24  |  Decisiones aprobadas al 14 de noviembre de 2026

Este parche concreta la selección de proveedores, modelos y reparto de tareas para fase 1. Complementa playhoot.docx y post_01 a post_23, especialmente las reglas de creación, privacidad, moderación y presupuesto. Sustituye expresamente la delegación de la elección de modelos al equipo del repositorio en post_09. La integración y su validación siguen correspondiendo a ese equipo.

# 1 Proveedores y modelos seleccionados

Se utilizan las API comerciales directas de Anthropic y OpenAI, con esta distribución:

- Claude Haiku 5.5 (claude-haiku-5-5): extracción, clasificación, organización y síntesis de materiales; información estructurada y creación de actividades sobre plantillas existentes sin modificar su mecánica.

- Claude Sonnet 5.5 (claude-sonnet-5-5): juegos originales, nuevas mecánicas, cambios de código, reparaciones complejas y recursos gráficos por código. También revisa las composiciones y animaciones renderizadas y dirige sus correcciones.

- GPT-Image-2.6 Flare (gpt-image-2.6-flare): generación y edición de imágenes rasterizadas cuando su resultado o costo total sea más conveniente.

- omni-moderation-latest: clasificación inicial de texto e imágenes. Sus señales complementan las decisiones y excepciones de post_13; no sustituyen toda la moderación ni la revisión humana prevista.

# 2 Continuidad del contexto

Una actividad basada en una plantilla utiliza Haiku con los materiales e instrucciones pertinentes. Si necesita cambiar la mecánica, se transfiere a Sonnet un estado explícito de lo ya acordado y el ciclo continúa allí. Un juego original mantiene en Sonnet el diálogo creativo, la programación, los recursos por código y su revisión; no se encadena habitualmente un modelo para diseñar, otro para programar y otro para reconstruir el contexto al reparar.

Flare recibe un encargo compacto por recurso: estilo, función, dimensiones y referencias necesarias, sin toda la historia ni el código del juego. Las tareas auxiliares de Haiku reciben únicamente el fragmento pertinente. Se conserva una descripción común del juego y su dirección artística. Se aprovecha la caché cuando convenga, sin asumir que compartir proveedor hace gratuito el contexto o permite compartir caché entre modelos.

# 3 Personajes y animaciones como recursos centrales

Los gráficos generados por código son recursos de primera clase para personajes principales, escenarios y partes centrales de la identidad visual del juego. No se limitan a logotipos, iconos ni figuras de relleno. La representación se elige según el resultado buscado:

- SVG: personajes, escenas, tableros, cartas, objetos y diagramas; animación por código para expresiones, movimiento de partes, transformaciones y reacciones.

- Lottie: personajes con movimientos preparados, celebraciones, efectos y secuencias animadas.

- Canvas y gráficos procedurales: partículas, fondos, trazos y efectos dinámicos.

- Imágenes rasterizadas: ilustraciones o detalles que convenga producir como imagen; también pueden animarse por capas, desplazamientos o rotaciones sin generar cada fotograma con IA.

Se desarrollan componentes gráficos y de movimiento reutilizables: cabezas, parpadeos, colas, rebotes, expresiones, partículas y transiciones. Se adaptan a la dirección artística del juego para reducir reconstrucciones, errores y consumo. No se impone una estética única a todos los juegos.

# 4 Elección por costo total y calidad

No existe una preferencia absoluta por código o por imagen. Se considera el costo previsto hasta obtener un recurso aceptable: entradas, salidas, razonamiento facturable, revisiones, correcciones, reutilización, movimiento requerido y rendimiento móvil. Un dibujo por código no es necesariamente más barato: 6.000 tokens de salida de Sonnet representan USD 0,06 solo de salida con la tarifa de referencia, antes de cualquier otro consumo.

La simplificación gráfica puede ser deliberada y adecuada para un juego, conservando la identidad acordada. No autoriza a sustituir silenciosamente el estilo solicitado por una aproximación deficiente. Los ejemplos aportados de la gata ilustran esta viabilidad y preferencia visual, pero no constituyen una comparación medida entre API de pago.

# 5 Aceptación visual y límites de reparación

Se comprueban identidad, estilo, paleta, partes móviles y estados acordados sobre el resultado renderizado. Las animaciones se revisan en distintos momentos, junto con su funcionamiento móvil y la reducción de movimiento prevista. Un SVG válido o un JSON de Lottie válido no bastan para declarar calidad visual ni funcional.

Tras dos correcciones automáticas del mismo recurso se reevalúa el enfoque: reutilizar otro componente, simplificar de forma compatible con el encargo o cambiar de representación dentro del presupuesto autorizado. Se mantienen las reglas de estimación, tope, cancelación y restitución de créditos de post_12; no se encadenan intentos ilimitados.

# 6 Referencias económicas y validación

Tarifas de referencia consultadas al 14 de noviembre de 2026, en USD por millón de tokens: Haiku 5.5, entrada 0,10 y salida 0,50 para solicitudes de hasta 100.000 tokens de entrada; por encima de ese umbral, entrada 0,50 y salida 2,50. Sonnet 5.5, entrada 2 y salida 10; lectura de caché 0,10, con cargos de escritura aplicables. Las imágenes se presupuestan según su consumo y parámetros, sin prometer un precio universal por imagen. El endpoint de moderación se ofrece gratuitamente en la referencia consultada.

La selección es la configuración inicial aprobada para implementar y validar, no una afirmación de superioridad universal ni el resultado de una prueba comparativa pagada que ya se hubiera ejecutado. Se mide costo por resultado aceptado en los casos representativos de post_09. Los precios y condiciones vigentes deben contrastarse al activar las cuentas. Si cambian sustancialmente o la validación exige una decisión comercial distinta, se vuelve al creador, sin sustitución estratégica silenciosa por el agente de repositorio.

# 7 Proveedores no seleccionados y privacidad

Gemini no se integra inicialmente: las condiciones estándar consultadas de Gemini API y Google Cloud contienen restricciones de uso en sitios o aplicaciones dirigidos a menores de 18 años o probablemente accesibles por ellos. Pagar o cambiar a Vertex no demuestra por sí solo que desaparezcan. Esto no invalida los ejemplos del usuario ni equivale a prohibir todo uso independiente de Google; una futura integración necesitaría condiciones apropiadas que resuelvan su encaje.

DeepSeek mediante su API directa no se selecciona mientras no estén suficientemente aclaradas las garantías aplicables a materiales privados, entrenamiento y retención. No se afirma que sea ilegal ni que todo alojamiento de sus modelos tenga las mismas condiciones. Otros proveedores u hospedajes no quedan incorporados por este parche.

Las API comerciales se distinguen de las cuentas gratuitas de chat. Se mantiene la prohibición de utilizar materiales privados o datos de estudiantes para entrenamiento y la minimización de contexto. Elegir estos modelos no autoriza a enviar nombres, listas de alumnos, notas ni otros datos personales de menores. Se deben cumplir las condiciones de cada proveedor, sus salvaguardas para menores y los mecanismos internacionales aplicables antes de transmitir datos reales.

# 8 Alcance y pendientes

Este parche decide la generación y revisión durante la creación y la ruta inicial de moderación. No introduce una decisión adicional sobre llamadas a IA durante partidas en vivo. La selección de bibliotecas, las licencias de recursos y las reglas para fotografías y archivos aportados por usuarios se resuelven en el bloque siguiente. Los precios comerciales y cupos numéricos se mantienen pendientes de su bloque propio.

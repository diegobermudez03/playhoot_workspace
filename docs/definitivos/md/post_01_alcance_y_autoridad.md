# Alcance de lanzamiento
y autoridad documental

Playhoot  |  post_01  |  Decisiones aprobadas al 14 de noviembre de 2026

Este parche complementa y modifica playhoot.docx. Establece la prioridad de las fuentes del proyecto, el alcance de la fase 1, sus entregas, la orientación internacional, los idiomas y la condición de las aplicaciones móviles. Sus reglas prevalecen sobre cualquier fuente anterior del proyecto en los asuntos que regula.

# 1 Prioridad de las fuentes

| Prioridad | Fuente | Aplicación |
|---|---|---|
| 1 | Parches aprobados post_# | Prevalecen en los asuntos que regulan. |
| 2 | Documento base playhoot.docx | Prevalece sobre todas las demás fuentes del proyecto. |
| 3 | Resto de fuentes del proyecto | Se conservan cuando son compatibles con los niveles superiores. |

La tercera categoría incluye documentos de arquitectura, decisiones anteriores, planes, especificaciones de trabajo, procesos e instrucciones del repositorio. Una exclusión o una regla anterior no puede sustituir lo aprobado en el documento base o en sus parches.

El código permite comprobar qué está implementado. Si contradice lo aprobado a nivel de producto, arquitectura o dominios, el agente debe explicar la diferencia y proponer su reconciliación al creador; la existencia del código no convierte esa diferencia en una decisión aceptada.

Cada parche debe identificar su alcance y las reglas que aclara o sustituye. Si reemplaza una decisión de otro parche, debe indicarlo expresamente. Una contradicción entre parches sin sustitución explícita se consulta al creador; su número o fecha no bastan para resolver una ambigüedad.

# 2 Autonomía y decisiones del creador

El agente del repositorio elaborará su propio plan de implementación, escogerá el orden de trabajo y resolverá los detalles de código dentro de lo aprobado. El creador participa en decisiones materiales al nivel de abstracción del documento base, hasta la separación y coordinación entre dominios.

Las consultas se reservan para contradicciones, decisiones realmente faltantes o propuestas que cambien materialmente lo aprobado. Los procedimientos anteriores del repositorio se deben alinear con esta autonomía y no exigir aprobación rutinaria del creador para cada unidad de trabajo o detalle de implementación.

# 3 Alcance de la fase 1

Se mantiene el alcance funcional del documento base: plataforma general de juegos, creación y edición asistidas por IA, sesiones multijugador, descubrimiento y reutilización de juegos, experiencia de profesor y estudiante, clases y calificaciones, planes y pagos, reportes, notificaciones y administración, según lo definido en la base y sus parches.

La existencia de capacidades que aún no estén implementadas no las retira del alcance. Las exclusiones antiguas del repositorio, como posponer los pagos hasta después del lanzamiento, deben reconciliarse con este alcance. Una reducción posterior requiere una decisión explícita del creador.

La fase 1 se lanzará con la experiencia web completa para escritorio y móvil, junto con la posibilidad de instalarla como aplicación web. Las aplicaciones distribuidas en tiendas quedan diferidas, según la sección 5.

# 4 Entregas y alcance de la validación

Primera entrega local. Todos los flujos y reglas de negocio deben poder ejecutarse con infraestructura local y proveedores simulados. Esto incluye comprobar permisos, límites, compras simuladas y comportamiento ante fallos. Los puntos de integración y su separación del negocio deben quedar preparados para conectar los proveedores reales.

Para la IA se pueden emplear respuestas preparadas que permitan verificar la coordinación del proceso. Esa simulación no demuestra que un modelo real produzca juegos correctos o de calidad. La generación real y sus resultados se validarán al integrar el proveedor correspondiente.

Segunda entrega integrada. Se conectan y verifican los proveedores reales necesarios, incluyendo autenticación, generación con IA, cobros y los canales de comunicación que finalmente se acuerden. Esta entrega comprueba los flujos completos con esas integraciones, después de la iteración prevista sobre la primera entrega.

La entrega local es un hito previo de validación. El objetivo de lanzamiento de fase 1 requiere completar la entrega integrada y las condiciones de preparación que se acuerden en los siguientes parches.

# 5 Web y aplicación web instalable

La fase 1 ofrecerá una web completa para escritorio y celular, más una aplicación web instalable o PWA. Ofrecer la PWA es parte del alcance; instalarla es opcional para el usuario y no condiciona el acceso ni las funcionalidades.

La PWA permitirá añadir Playhoot a la pantalla de inicio y abrirlo en una ventana independiente para aprovechar más pantalla. Se validará en Android e iOS, respetando las capacidades del navegador y del sistema.

La entrada principal seguirá siendo la web. La instalación se ofrecerá como mejora voluntaria para usuarios recurrentes, sin interrumpir su actividad ni exigirla para continuar.

Las apps de App Store y Google Play quedan diferidas a una fase posterior; cuando se aborden, se contemplarán Android e iOS. Esto sustituye la obligatoriedad de una app móvil en la sección Frontend de la base. Sus flujos específicos se reconciliarán con el alcance web y PWA.

# 6 Orientación internacional y difusión

El objetivo es alcanzar los mercados de habla española, inglesa y portuguesa, con el menor número posible de restricciones territoriales. No se adopta un lanzamiento limitado por principio a Colombia o Latinoamérica.

El marketing será enteramente mediante redes sociales, principalmente TikTok, YouTube e Instagram. Español e inglés tendrán el mayor foco promocional. El alcance potencial de una campaña puede incluir varios países que compartan idioma.

Las restricciones territoriales se justificarán por complejidad legal, regulatoria, de integraciones u otras condiciones materiales de operación. Los casos se analizarán y se propondrán al creador antes de fijar la cobertura comercial del lanzamiento. La intención internacional no equivale a una validación de cumplimiento de todos los países.

# 7 Idiomas del lanzamiento

| Idioma | Condición aprobada |
|---|---|
| Español | Idioma principal de fase 1 y uno de los dos focos mayores de promoción. |
| Inglés | Idioma principal de fase 1 y uno de los dos focos mayores de promoción. |
| Portugués | Incluido entre los tres idiomas principales de fase 1. |
| Francés | Opcional, sujeto al valor comercial y a la viabilidad de atender los mercados correspondientes. |

El francés no se convierte en un requisito de lanzamiento por mencionarse como oportunidad. Su inclusión dependerá de evaluar si podemos atender esos mercados de forma razonable, especialmente Francia y las regiones francófonas de Canadá.

Estas decisiones establecen los idiomas de la plataforma. Las variantes regionales, las reglas de selección del idioma y el tratamiento del idioma de los juegos y materiales se concretarán en las decisiones de experiencia y creación correspondientes.

# 8 Decisiones que permanecen abiertas

Se mantienen pendientes la cobertura territorial concreta y sus excepciones, las condiciones de privacidad y atención a menores por mercado y la inclusión de francés. Sus recomendaciones futuras necesitan aceptación para convertirse en reglas del proyecto. La web instalable está aprobada para fase 1 y la distribución mediante tiendas queda diferida.

Este parche no selecciona proveedores, no fija precios o límites, no redefine dominios y no constituye el plan de implementación. Esas decisiones se resolverán en los bloques correspondientes, conservando el alcance y la autonomía establecidos aquí.

El resto del documento base permanece vigente en cuanto sea compatible con estas reglas y con los parches que se aprueben después.

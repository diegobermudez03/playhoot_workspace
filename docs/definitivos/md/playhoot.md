# Índice

a continuación se lista el índice del documento

# Propósito Documento

El propósito de este documento es definir la arquitectura del proyecto denominado temporalmente como “playhoot”.

Playhoot busca ser una plataforma de creación de juegos multijugador online a traves de IA, la experiencia principal busca ser algo como:

- Cualquier usuario ingresa y por medio de un chat conversacional genera el juego que tiene en mente, inmediatamente tiene disponible el juego para crear una sesion(room)

- No se debe limitar a juegos creados por uno mismo, la propia plataforma tendra sus propios juegos, y otros usuarios pueden publicar los suyos como publicos, lo cual permite que cualquier usuario pueda crear sesiones a partir de ellos

- EL usuario al crear la sesion obtiene un codigo y un link compartible (como en kahoot/quizzis), el cual solo debe compartirlo con sus amigos, y puede iniciar la partida.

Las plataformas de ejemplo base son:

- Kahoot: Enfocada en quizes, tiene la facilidad de crear una actividad dinámica tan solo por el uso de la página web, un link compartible donde todos pueden ingresar, ideal para clases, profesores, estudiantes.

- Quizzes: Similar a la de encima

- Genially: Más enfocada a presentaciones, pero presentaciones tipo juego donde se pueden tener actividades más dinámicas que un quiz, sin embargo creo que no tienen lo de multijugador online, es solo la pantalla donde se este presentando todo

- Canva: Por el enfoque en usar esas actividades como medio de presentación de un tema, en el caso de los profesores

- Roblox: Por la cualidad de que es una plataforma donde los propios usuarios generan los juegos, los publican, y luego la comunidad puede jugarlos

- Friv: Por la sensacion de “es la plataforma en la que entro y encuentro cualquier juego”

- Gartic Io: Esta esta listada aca solo porque es una de los tantos juegos que siguen la misma dinamica de “crea un cuarto, comparte el link, y ya tienes una actividad para compartir”.

- Y cualquier otra plataforma que se puede considerar como parte de la categoría, las listadas anteriormente son solo las que yo, el creador tiene en mente

Muchas si no es que todas las plataformas listadas anteriormente ya tienen algun tipo de integracion con IA, permitiendo a los usuarios generar esas dinamicas/actividades/presentaciones/juegos de forma facil sin mucho conocimiento previo.

En ese orden de ideas, lo que busca ser playhoot es una mezcla de las anteriores, en donde la propuesta de valor es:

- No se requiere cuenta previa para acceder a  la actividad (contrario a Roblox)

- No se requiere aplicacion ni nada avanzado instalado, es solamente web, a traves de un link o codigo de acceso, la app es opcional (como kahoot, quizzis, contrario a Roblox)

- Se puede crear cualquier tipo de juego, no se esta limitado a quizes (contrario a Kahoot, quizzis, canva, genially, mas como Roblox)

  - La idea es que se puedan crear:

    - Juegos, solo para pasar el tiempo, incluso como among us, juegos de mesa, juegos de cartas, juegos con movimiento espacial 2D como fireboy and watergirl, etc.

    - Presentaciones de clase dinamicas, de alguna forma que los profes puedan crear pseudojuegos que realmente son sus presentaciones de clase pero tienen algun tipo de interaccion de los estudiantes.

    - Juegos especificos, como yo querer crear un juego de algo muy especifico mio y de mi novia, solo los 2 lo jugaremos

    - Juegos para evaluacion por parte de profesores.

    - juegos para solo pasar el tiempo

  - En resumen, la idea es que el limitante, por ahora, sea solo que se puede hacer desde presentaciones, hasta juegos con movimiento 2D, asi sean shooters, etc

- El componente monetizable sera enfocado en profesores, por lo que la idea es proveer funcionalidades de manejo de clases, estudiantes, notas, a traves de la plataforma, generacion de actividades a partir de material de la clase, etc.

Lo anterior es solo un resumen de lo que el producto busca ser, sin embargo, este documento no busca especificar todos los detalles del producto, segmentos objetivos, metodo de marketing, etc. Para eso se tienen otros documentos.

Pero lo que este documento SI busca ser, es la definicion de la arquitectura a nivel general, la idea en principio es que yo, el creador, escribo este documento contemplando todo lo que planeo incluir en la plataforma para la fase 1 de lanzamiento, es decir que todo lo contemplado aca debe incluirse en la primer etapa.

Lo que describo aca es a nivel general como espero/veo que debe estar el sistema, los componentes, responsabilidades, flujos, etc.

No es una especificacion a detalle, pero si busca abarcar al menos al nivel de especificar como se integran y comunican los distintos componentes, los contratos entre ellos (no a nivel especifico de datos pero si general), todas esas decisiones importantes, el codigo especifico de una operacion no nos interesa aca.

Es importante aclarar que, este documento no debe seguirse al 100%, precisamente porque esta limitado por el entendimiento y capacidad tecnica de quien escribe el documento, entonces lo que se propone o la idea general de algo puede no ser la mejor, o de lleno no funcionar como yo creo que lo hara.

Asi que este documento se debe tomar como una propuesta, que especifica la vision del creador, y en la medida que haga sentido seguirla, pero si se tienen otras ideas, si se considera que hay algo que se puede debatir, discutir, cambiar el approach, mejorar, se tiene apertura, sin embargo, eso se debe discutir siempre con el creador, y no se debe inferir aceptación.

Pero las discusiones con el creador deben hacerse desde el mismo nivel de abstracción y mismo nivel de dialecto manejado aca, pues es la forma y el nivel de abstracción que me interesa, no me interesa discutir mas granular.

A lo que voy es que la idea mia, como creador de este documento, es que una vez escrito, la implementacion de toda la plataforma sea a piloto automatico, donde el piloto automatico es la IA, no quiero entrar a ver lineas de codigo especificas, me interesa solo este nivel general de abstraccion, y se acepta discutir y debatir desde este mismo nivel, yo puedo considerar hacer una operacion asincrona con polling, tu puedes considera que mejor una transactional queue, me propones, me enseñas si yo no se de eso que me estas propiniendo, y luego decido, mas no me interesa el nivel mas detallado.

Pero eso es importante, entender que yo no se todo, asi que puedes proponer, o explicar cosas que les hacen falta decision, que tambien puede pasar, que yo escribo algo, que creo que ya es suficiente, pero no, en ese caso, no asumas que decision tomaria, preguntame, enseñame, explicame que me hace falta, explicame alternativas, me interesa aprender, asi que no te limites.

Finalmente, hay un ultimo punto importante a tener en cuenta, para el momento que se comienza a trabajar con base a este documento ya hay una gran parte de la plataforma implementada, y es probable que algo de lo escrito aca no coincida completamente con lo implementado o de golpe lo contradiga con otro approach, nuevamente, solo preocuapte desde el nivel abstraido que tiene este documento, es decir, por ejemplo:

- SI el documento dice, que para el flujo de creacion de una sesion, la operacion llega al dominio de game, y el dominio de game llama a sesion

- Pero la implementacion de hecho usa el dominio de orchestrator, y no hay esa llamada de game a sesion

Entonces en el ejemplo anterior es una contradiccion a nivel de arquitectura que DEBES alertar, pedirme que reconcilie, y el outcome puede ser que yo acepte que no sabia como estaba funcionando, pero que acepto la implementacion actual, o puede que te diga que la implementacion actual debe ser cambiada para alinearse a este documento.

Puede que hayan muchas de esas inconsistencias en el flujo de sesion y de creacion de juego a traves de IA, debes reconocerlas y pedir reconciliacion de todas.

Eso seria todo, recuerda, punto muy importante, ser proactivo, entender que este es mi lineamiento, y que mis propositos de este documento son:

- Definir toda la plataforma hasta la fase 1, de lo que quiero lanzar, una vez pasado este documento, todo deberia ser piloto automatico con base al documento, con interacciones conmigo unicamente para:

  - Reconciliacion de decisiones

  - Recomendacion de un mejor approach a nivel tecnico (Explicarme nuevos temas en el proceso, talvez no se me habia ocurrido porque no conocia de eso, enseñame)

  - Deteccion de huecos, falta de decisiones, o de golpe decisiones que en realidad no sirven y es un error de mi lado considerarlas correctas.

  - Ultima (que no he mencionado anteriormente), puedes considerar enfoques o recomendaciones de producto, indirectamente a traves de este documento estare describiendo todo el producto, como funciona, como debe funcionar para el usuario, lo que ofrece, etc. Tienes total libertad de cuestionar y proponer, corregir, todo discutido conmigo, pero puedes adquirir ese role de Product Owner, Technical Product manager, y Software architect, y tech lead

Solo hazlo cuando sea necesario, no exageres en preguntar por cualquier cosa solo para sentir que cumples con los requerimientos, tampoco te limites, solo hazlo en la medida real necesaria, cada una de esas pausas de decidir, corregir, escuchar una recomendacion, es tiempo perdido, tiempo en que la implementacion en piloto automatico se pausa, asi que, no debes temerle, es totalmente aceptable, pero no lo hagas sin un motivo justo, si llegamos a pausar 100 veces en 1 dia, esta bien, siempre y cuando esas 100 veces sean justificadas y necesarias.

EL piloto automatico tambien implica que el orden de implementacion sera totalmnte up to la IA, la implementacion puede ir completa hasta el final de la fase 1, haciendo pausas solo para los momentos mencionados anteriormente, de resto la decision de en que orden implementar hace parte del piloto automatico, y no se deben esperar testeos de usuario hechos por mi para considerar cada estapa como completada, el testeo lo hare yo al final de la fase 1, completo, y ahi comenzare a iterar sobre lo que me parece que debe cambiar, corregirse, etc.

Habiendo dicho eso, hay que aclarar cual es ese entregable de la fase 1, realmente lo divido en 2 partes:

- El primer entregable es cuando la fase 1 ya esta completada, esta etapa tiene una condicion, y es que debe funcionar localmente sin ninguna integracion externa real, es decir, debe tener su propia BD en docker, su propio storage, su propio authentication integration, etc. Es decir, todo el codigo de las integraciones debe existir al menos hasta el puerto, me explico.

  - Digamos, la integracion con la autenticacion de google, para esta primer entrega no existtira dicha integracion, pero el codigo si debe existir, solo que simulado, el codigo debe manejar correcto diseño de puertos, donde se abstrae las llamadas a ese proveedor externo por medio de una interface, el codigo que luego se tendra que implementar debe ser minimo, y sera solo para integrar con el proveeddor externo. Para este entregable se pueden tener implementaciones mockeadas de esas interfaces, usar storage local, etc.

  - Lo anterior es algo complejo para la integracion con IA, en ese caso se puede igualmente hacer eso, y dejarlo asi asi este totalmente no testeado, porque no creo que haya forma de simular como funcionara el flujo de creacion con IA propia si no hay integracion con IA, no veo como se puede simular esa IA localmente, a menos que se corra un modelo pequeño, lo cual no quiero hacer por ahora, asi que ese tipo de funcionalidades de IA son las unicas que ni siquiera con implementacion mock van a funcionar en este entregable, sin embargo el codigo debe existir.

- Luego de ese primer entregable, el 99% de la plataforma debe poder correrse localmente, lo cual permite tambien que por ejemplo, suba una maquina virtual en la nube, pequeña, donde corro todo lo necesario para correr la plataforma localmente en un docker de la VM, y con eso puedo probar desde distintos dispositivos, puedo incluso probar el funcionamiento del flujo de creacion con IA NO integrada, pues ya con tener una URL publica ya el MCP y APi de IA deberia funcionar, por ende con el primer entregable puedo testear el 99% de todo.

- Es ahi que testeare todo, probare todo, iteramos donde sea necesario.

- Y luego, el segundo entregable,  es al final de esa iteracion, que pasare a hacer las integraciones, con tu ayuda, saber donde registrar, que KEY’s tokens necesitas, implementaras el codigo faltante integration specific, etc. Y luego de eso ahora si deberia estar toda la plataforma desplegable y funcionable al 100% (incluyendo pagos, etc)

- Y luego de eso pasaremos a lanzar, y quiero hablar un poco de ese lanzamiento en la siguiente sección.

# Sobre lanzamiento, integraciones e IA

Sobre el lanzamiento y las integraciones hay muchas cosas a tener en cuenta, de las cuales yo no se nada:

- Proveedores, de que servicios? que necesitamos?

  - Por ejemplo, para el manejo de suscripciones, ese pago, y todo eso, no se como hacerlo, porque se que es mucho mas que solo integrarnos con stripe, hay cosas legales de por medio, creo que ahi toca escoger algo como un merchant of record, algo asi, que basicamente se encarga de todo lo legal, o no se si hay forma de hacerlo a traves de google subscriptions, o algo asi.

  - A lo que voy es que hay cosas que yo no se, y ahi tu tienes que ser proactivo, entender, y explicarme, proponerme, y decidir, no tengo ningun conocimiento previo sobre todo el tema de integracioens mas alla de lo de infraestructura.

- Legalidad, compliance:

  - Debes tambien actuar como alguien de compliance, si notas cosas del producto que hacen complejo lanzamiento, o que requieren algo de nosotros a nivel de compliance, de legal, de impuestos, de lo que sea, debes detectar, ser proactivo, explicar, y decidiremos que hacer, por ejemplo, se que cosas como el manejo de datos privados, de menores, de derechos de autor, del contenido de los juegos que pueda ser sensible, etc.

- Costos:

  - La idea es reducir costos lo maximo posible, y aca es donde entra lo de IA, la integracion con la IA para la generacion de videojuegos, no puedes simplemente escoger la mas cara, ya hay un documento creado con una propuesta para eso, pero esto es por ejemplo algo que toca ambos producto y tecnico, ahi toca analizar, proponer opciones, como por ejemplo, puede ser escoger una sola IA que ofreezca todo con genercion de assets, escoger distintas, escoger una como deepseek o una china para la generacion de juegos, para los assets otra, etc. Y entender lo que eso puede implicar a nivel de compliance, etc. Por ejemplo, todo el diseño de flujo de creacion con templates y todo es para optimizar eso, la idea es que el pago de la suscripcion cubra todos esos gastos esperados

Mi punto es que, no debes limitarte solo a implementar lo que te pido aca, tambien eres compliance, legal, contable, etc. Y debes entender que aca se esta planteando implementar una plataforma que se planea lanzar, monetizar, etc. Y debes hacerte cargo de que no omita nada importante para eso:

- Las decisiones que sean al final las puedes diferir, de legal, etc. (pero deben estar claras que se deben resolver antes de lanzar)

- las decisiones que no se puedan diferir, tales como aquellas que afectan activamente el producto o el como se implementara, deben ser tomadas a discusion y decision conmigo.

# Sobre el modo de trabajo

Como ya dije, la idea es que sea autopiloto, pero aca debo aclarar cosas:

- Puede que se generen muchos mas documentos complementarios, que puede que sobreescriban y contradigan o complementen cosas de este documento, eso es esperable, seguramente este documento sera pasado una o varias veces por varias IA’s conversacionales, que haran investigacion, ayudaran a decidir, a diseñar cosas, etc. Todo eso quedara registrado en documentos como los que ya existen (pero los que ya existen son en pasado, los nuevos que se generen a partir de este documento tendran el prefijo `post_#`), esos documentos generados despues de este documento se vuelven la fuente de verdad para lo que sea que decidan o definan.

El trabajo sera en autopiloto pero el agente de IA del repositorio tiene la responsabilidad de definir claramente cuando su sesion debe ser terminada, generar algun handshake document e indicarme a mi que debo crear una nueva sesion y pasarle ese handshake document, esa sesion despues de llegar a ese punto no debe aceptar mas tareas, debe denegar todo, la idea de esto es evitar que una sola sesion se encargue de todo, generando alucinaciones, contexto gigantesco, y mas consumo innecesario de tokens por el tamaño del contexto.

Otra cosa que quiero es que, como instruccion para el agente del repositorio, siempre al inicio de una sesion y tambien siempre al inicio de iniciar con un trabajo entre mensajes, revise el usage actual con el comando /usage, luego al final del trabajo debe ser revisado de nuevo, si hubo un fuerte consumo, como por ejemplo:

- En ventana de 5 horas se incremento mas del 20%

- En ventana semanal se incremento mas del 2%

Entonces que detenga y genere la alerta indicandome a mi revisar, y yo revisare y dire que procede, si seguir o detenernos.

# Sobre las reglas de negocio no definidas claramente

En el documento seguro se mencionen y diseñen cosas como por ejemplo el concepto de la suscripcion, el concepto de los creditos de uso para juegos, el concepto de que un usuario no puede crear numero ilimitado de juegos, etc. Yo intentare definir reglas de negocio claras, pero en lugares donde idenitfiques que no defini, pero que se necesitan, puedes proponer y preguntarme, ejemplo:

- La suscripcion tendra periodo de prueba:

- Pero no defino de cuanto es ese periodo

Ejemplo 2 (reglas necesarias para control de gastos):

- Te digo “cualquier cuenta gratis tiene acceso a crear 2 juegos gratis al mes”

- Pero y si tengo 100000 cuentas gratis? eso me mataria costos, toca definir como se manejara eso, o talvez sea un cupo dinamico definido por la propia plataforma, y yo definire un presupuesto mensual global de cuanto dar para cuentas gratis-cuentas de periodo de prueba, y que sea eso lo que defina todo.

Esos 2 ejemplos creo que reflejan lo que quiero decir, toca ser muy cuidadoso con esas cosas.

# Principios no-debatibles técnicos

## Backend

- Se debe tener data trailing de todo, no debe haber un cambio en una fila de la base de datos que no se pueda debuggear para saber “cual era el valor anterior?”, “cuando cambio?”, “porque cambio?”. Esto solo aplica para la parte del sistema que funciona en BD relacional, para todo lo demas, como datos de streaming, big data, data de interaccion durante la sesion de juego, esa data si puede ser perdida, por ejemplo, para la recreacion de la sesion se hace best-effort y con baja accuracy.

- Balance entre normalizacion y optimizacion:

  - Queremos un diseño de base de datos normalizado, pero sin arriesgar optimizacion, lo cual indica que se puede duplicar data, tener 2 entidades en una misma tabla, etc, cuando hay una razon valida, un query que seria muy complejo si se divide en tablas etc.

- Todo query debe estar scoped:

  - No puede haber un full table scan, todo query debe estar scoped de alguna forma, y se deben declarar indices requeridos para ese scoping.

- Cada top domain se considera una unidad independiente, al inicio solo habrá 1 unidad desplegable, por lo que las llamadas entre dominios pueden ser llamadas de metodo directas, pero estan sujetas a las siguientes reglas:

  - Cada top domain tiene sus propias tablas definidas que actuan como su base de datos independiente, solo ese dominio tiene permitido escribir o leer de esas tablas

  - No se puede mantener una transaccion de base de datos abierta mientras se hace una llamada externa afuera del dominio (por ende no hay transaccionalidad de base de datos entre top domains)

  - No deben haber llamadas de metodos directas entre top domains, todos deben ir a traves de orchestrator o composer

  - El top domain puede internamente definir subdomains, ahi el dominio puede definir que reglas quiere aplicar, aca se tiene mas flexibilidad:

    - Por ejemplo, un dominio podria definir subdominios, imponiendo las mismas reglas, donde cada subdominio tiene su propia base de datos, toda cross call debe ser orquestrada por capa superior, etc.

    - O por ejemplo, podria definirse que los subdomains al hacer parte del mismo top domain pueden acoplarse entre ellos, interactuar con la misma base de datos, llamarse entre ellos, etc.

    - Asi mismo, el top domain define cual sera la forma de despliegue (o diseño) interno, un top domain puede tener varios subdomains que requieren ser desplegados en la misma unidad, mientras que otro top domain podria tener subdomains donde uno de esos subdomains tiene que ser un despliegue separado

    - Entonces, en resumen, la regla es, los top domains se asume que deben poder funcionar como componentes separados, unidades de despliegue separadas, mientras que al interior de cada dominio el diseño se define por el propio dominio

- Por ahora, evitar complejidad de infraestructura cuando no es necesario para el despliegue de la fase 1, por ejemplo:

  - Se asume que todo sera un solo contenedor, se escribe codigo con interfaces que abstraen la interaccion, pero la implementacion actual puede asumir un solo contenedor, por ejemplo:

    - Si se tiene memoria cache para algo, se implementa interface, y por ahora la unica implementacion seria un mapa en la memoria del proceso

    - En el futuro, se implementaria cache distribuido

    - Pero lo importante es que el diseño a traves de la interface ya debe asumir y manejar todo lo que el caller debe manejar de esa decision, por ejemplo, en el caso del cache, seria la invalidacion de la data.

  - Se pueden usar tablas para cosas que eventualmente serian cache, pero por ahora, puede ser tablas, por ejemplo:

    - Tenemos una operacion donde queremos cache, pero no queremos guardar en memoria ni siquiera para la fase 1, es para el resultado de un query

    - Podemos por ahora evitar introducir el cache separado, y por el contrario crear una tabla que guardara esos resultados.

    - Eso implica, esa tabla, no cuenta como tabla de dominio, sino es como tabla de objetivo de infra, por lo que no opera bajo las reglas de relational BD, esa tabla si puede no tener data trailing, esa tabla si podria tener records hard deleted, etc.

  - Otro ejemplo, digamos que necesitamos una cola para async processing, en lugar de introducir una cola real, o un sistema como rabbitmq, o kafka, o sqs, podemos implementar una transactional queue con la base de datos, nuevamente, por medio de una interface, de esa forma la cola esta en nuestra propia BD.

  - Los anteriores son solo ejemplos especificos que tenia en mente, pero el punto es ese, evitar sobrecomplicar en infraestructura y dependencias, abstraer, para que el cambio eventualmente sea facil, pero no introducir esa complejidad desde ya de entrada.

- Monitorio y observabilidad:

  - Ya hay bases creadas para eso en el repo, el patron de los logs de observabilidad fueron diseñados personalmente por mi, porque para mi es fundamental poder ver un log y entender como paso atraves de distintos dominios, recrear el path a punta del log, entender todas las decisiones, tener full visibilidad de esa operacion, eventualmente si se separan los despliegues se deben usar los traces IDs y todo para poder facilmente debuggear una llamada a traves de servicios

  - Poder Observar claramente la dependencia entre servicios, quiero poder observar todas las operaciones en el sistema, que servicios tocan (asi ahorita esten en el mismo despliegue, se consideran como servicios separados), de forma que puedo entender “si se cae esto, que operaciones afecta”, lo que llaman

  - Quiero monitoreo a traves de metricas, nuevamente, el repo ya tiene bases exigidas a detalle por mi, porque quiero:

    - Poder tener monitoreo por defecto para todo endpoint, ver cual fue el resultado, cuanto tardo. COn eso ver rate, conteo de requests, etc.

    - Pero no limitarnos a eso, cada operacion de servicio, cuando sea necesario, puede definir su propia metrica para llevar control, monitorear

    - Por ejemplo, en las operaciones infra sensible, es fundamental tener muy buen monitoreo de tiempos, latencia, para entrar a debuggear

    - Es fundamental el monitoreo para ver errores, si 90% de las sesiones estan terminando inexplicadamente, debo poder verlo, si hay muchos reportes de fallos, etc.

  - Y por otro lado, monitoreo en propia BD, lo que ya seria analisis mas a largo plazo:

    - Para poder analizar y entender cosas como retencion, rate de sesiones, porcentaje de sesiones terminadas, porcentaje de sesiones creadas y jamas iniciadas, porcentaje de sesiones donde uno o mas jugadores se fueron, etc

    - Esos son solo ejemplos, no es que solo quiera para sesion, solo hacia el ejemplo con eso, pero debe ser para todo el sistema, poder ver y entender como una operacion esta siendo usada, analizar comportamiento del usuario, etc. SE pueden tener tablas adicionales para puro analisis de datos. En ese caso preferiria no mezclar la escritura a esas tablas con la logica de negocio, preferiria un patron outbox o algo para desacoplar.

- Division de responsabilidades, este es fundamental, y creo que el mejor ejemplo seria:

  - En la implementacion actual del repo, ya hay operaciones que separan la metrica del http endpoint y que aun asi el service method tiene su propia metrica. Originalmente, la IA agentica implemento una sola metrica en el http endpoint, que tenia los valores de los posible outcomes de una sesion, que puede ser creada, denegada, error, rate_limit, etc. Y esa era la unica metrica, luego yo le explique a la IA que esta mal, porque:

    - El http endpoint puede tener su metrica, pero su metrica solo se encarga de la responsabilidad de su dominio, que es, el http request, por ende la metrica es “cual fue el resultado http de la request del metodo X en el endpoint Y”, seria incorrecto asumir que esa metrica es la metrica de success de creacion de sesion, es solo la metrica del endpoint

    - Luego, el metodo de servicio es el que define su metrica separada, que si es session_outcome, que tiene valores logicos como “created”, “internal_error”, “invalid_game”, “user_session_limit”, etc. porque esa es la logica de negocio que ese dominio es owner, y es ese dominio el cual realmente puede decir cual fue el resultado logico.

    - Porque entonces, asumir que la metrica http es la fuente de verdad es falso, con la divison de responsabilidades, el http endpoint es solo un consumidor del behavior de creacion de sesion, mañana podria haber otro consumidor que llama a ese servicio, en cuyo caso, ahora son 2 callers, la metrica de http no contempla la del otro caller (seguramente para ese punto se haria algun hacky stuff como hacer que el caller 2 convierta su llamada en una llamada interna al endpoint, lo cual es incorrecto), entonces la fuente de verdad de los outcomes de creacion de sesion son realmente los de ese dominio

- Sobre el diseño de codigo, ya estan las bases:

  - Un dominio tiene workflows y usecases:

    - workflows: este pkg tendra un pkg por cada workflow que se quiera definir, un workflow es una secuencia de operaciones dependientes entre ellas, como un life cycle, donde se puede dividir en distintos pasos (pueden haber pasos condicionales, distintos paths, pero al final sigue siendo un workflow con multiples caminos)

    - usecases: se define un subpkg por cada caso de uso, un caso de uso es una operacion independiente, es una llamada que realiza una unica operacion, ya sea escritura o lectura.

    - Estas reglas aplican a los dominios tradicionales, los otros componentes especiales como los gateways, composers, etc. no tienen que ajustarse a esas reglas.

- Sobre testing, ya estan las bases en el repo, basicamente en resumen:

  - Unit tests con case table, que es un map[string]func(...)test{}

  - mockear llamadas con el paquete de Go, assert de parametros

  - Para los metodos de repo, testear directamente con una base de datos efimera

  - etc, simplemente seguir las reglas ya creadas para testing del repo

## Frontend

De frontend solo se de flutter, y mi enfoque no es FE, asi que no se casi nada, pero mis reglas de diseño son:

- separacion entre capas:

  - UI: Es codigo puramente de render, recibe el estado a mostrar, define callbacks que solo toman data de UI y las mandan a la siguiente capa, solo mantiene el estado de UI, pero no el estado logico.

  - Estado-Servicio: Es la capa logica, es la que maneja el estado, expone los metodos que se llaman de los callbacks de UI, es una unica capa, porque realmente es solo la logica de que hacer con cierta operacion y como mantener el estado, el FE para comenzar deberia no tener logica, toda deberia estar en el backend. (Se permite tener en el BE un BE para FE, es decir, endpoints que literalmente si estan acoplados con pantallas de FE, con data necesaria para mostrar, en cuyo caso se exponen desde el paquete composer, los dominios no deberian acoplarse con FE; pro el composer si puede definir un endpoint para FE que obtiene la data de 1 o mas dominios)

  - Llamadas externas: la capa que la capa de servicio llama para las llamadas externas.

- La app debería ser adaptativa y responsive:

  - Adaptativa: La capa de UI tendrá siempre 2 implementaciones, una horizontal y otra vertical, prefiero eso a tener 1 sola implementación con codigo para adaptarse, es mejor 2 implementaciones, para tener flexibilidad total, se abstraen los componentes y widgets a codigo separado para que ambas implementaciones puedan usarlas

  - Reactive: Luego, dentro de cada una de esas 2 implementaciones, se implementan de forma reactive, para que se ajusten a las dimensiones específicas, una cosa es una implementación horizontal, que seria una de las 2 implementaciones adaptativas, y luego otra cosa es que esa implementación sea reactiva a las dimensiones específicas

Muy importante, para la fase 1 se planea tener listos la app web, que debe ser ejecutable en desktop, mobile, etc. Y la móvil, que debe ser una aplicación móvil, con todas las mismas funcionalidades.

La app web debe ser implementada con navegación por path, es decir:

- una path define exactamente en qué pantalla estar

- la path contiene el input content, es decir que copiar y pegar la path resulta en la misma pantalla con el mismo input (claramente si el user tiene los permisos)

En movil también, de forma que, por ejemplo, si es posible, al compartir el enlace de union, si se detecta que el user tiene la app descargada (creo que eso se puede) se le ofrezca ir a la app, y al ir a la app llegue directamente a la misma pantalla.

Otra cosa, para la webapp, se debe tener el SEO en cuenta, optimizar para SEO, no enfocandose en el nombre (osea si, claramente, pero el nombre aun no esta definido, playhoot es provisional y ademas al principio la gente no va a buscar el nombre, debemos intentar aparecer en busquedas relacionadas, juegos, actividades, dinamicas clases, presentaciones, happy hours, teaching class, grades, etc, etc)

Te listo solo como ejemplo algunas skills y MCP servers relacionadas con SEO, no para que las uses necesariamente, sino para entender, puedes usarlas como referencia, entenderlas, o pedirme que las instale, o investigar por tu cuenta y pedirme otras cosas, otros skills, otros MCPs, etc.

- https://github-com.translate.goog/AgricIDaniel/claude-seo?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es&_x_tr_pto=tc

- https://github.com/zubair-trabzada/geo-seo-claude

- https://github.com/ChromeDevTools/chrome-devtools-mcp

- https://mcpsearchconsole.com/

# UI/Frontend design/personalidad

No se absolutamente nada de diseño ni UX, asi que no definire nada de como se vera la plataforma, pero si quiero dar como ciertos lineamientos, brainstorming, y quiero que la definicion de la personalidad la hagamos con la IA actuando como UX UI designer.

Lo que si quiero dejar claro es, quiero que esto no se vea como AI slop, la implementacion actual de lo que se lleva se ve 100% como AI slop, cumple con mucho de lo que hace que algo se vea como AI slop, y eso me disgusta demasiado, por lo que, listare a continuacion algunos enlaces a unas skills, y otras plataformas, MCP y cosas, no para que se usen necesariamente, pero se pueden investigar, entender que es lo que hacen, cuales son sus trucos, y replicarlos, o usarlos, para asi evitar que nuestra plataforma se vea como AI slop.

- https://github.com/aplaceforallmystuff/the-antislop

- https://github.com/dmmulroy/anti-slop

- https://github.com/miqdadbadjuber/anti-slop

- https://github.com/dbohdan/unslop/blob/master/style-guide/unslop-style-guide.md

- https://github.com/cursor/plugins/blob/main/pstack/skills/unslop/SKILL.md

- https://github.com/heydamir/unslop

- https://github.com/theclaymethod/unslop

- https://impeccable.style/

- https://posts.design/

- https://www.deck.gallery/

- https://pricingpages.design/

- https://supahero.io/

- https://land-book.com/

- https://mcp.slidedevai.com/

- https://mian.ro/

Si defines que quieres algunas de las cosas listadas anteriormente instaladas (o alguna otra que encuentres y quieras que instale para el uso durante la implementacion) indicamelo.

Debes entender que es lo que hace que un sitio se vea como AI slop, y evitarlo.

Habiendo dicho eso, listare cosas de puro brainstorming que me gustaria tener en cuenta para esa definicion de personalidad y estilo visual:

- Podemos usar iconos, assets, o cosas, si se pueden hacer a punta de codigo como svg u otro tipo esta bien, si no tambien, si se requieren assets generados, sprites, lotties, etc. Puedes requerirlos, si hacen sentido, en cuyo caso crearas una lista de “pending_assets”, donde se definen todos los assets que el codigo usa (y que implementaras como placeholders al inicio) y que luego yo debo entender que tipo de assset es, buscarlo/generarlo, y ubicarlo donde me indiques, de forma que reemplace el placeholder que tenias.

- Debemos entender el enfoque de la app, el publico objetivo, etc, para asi definir un estilo que haga sentido, para eso puedes visitar sitios similares, usarlos como referencia, usa por ejemplo los listados al inicio del documento (canva, kahoot, quizzis, roblox, friv, genially), pero OJO, no digo que nos copiemos o nos basemos, solo que los uses como parte de la investigacion, pero puede que la conclusion sea “tengamos identidad completamente propia y distinta”

- Me gusta que sea agradable de usar, cosas como animaciones sencillas, como las animaciones de retroalimentacion, y asi, cosas que hagan que se sienta viva, fluida, y no solo como un formulario estatico con botones.

- y esta ultima es, que podriamos definir usar algun estilo nuevo distinto que nos de personalidad totalmente, por ejemplo, el otro dia me salió un tiktok que mencionaba estilos como:

  - glassmorphism

  - caymorphism

  - skeuomorphism

  - neumorphism

- Pero esos son solo ejemplos que me salieron en tiktok y es una idea suelta, no tenemos que seguirla, puede que no tenga sentido apegarnos a una de esas cosas, puede que sea too much

- Lo principal es, que el diseño y la personalidad tenga sentido, que NO SE VEA como AI SLOP, y que se vea profesional, algo que haga sentir a alguien seguro para pagar por eso.

# Viaje del usuario (todos los flujos)

Esta es basicamente la seccion mas de producto que describe todas las pantallas y los flujos (operaciones) que tiene la plataforma, los flujos son literalmente los lfujos de operaciones que puede realizar el usuario y la navegacion entre “pantallas” de ellos.

Aca es importante aclarar algo, yo denominare como pantallas cosas que no necesariamente son pantallas distintas en el frontend, como dije anteriormente, no se nada de FE ni de UI UX, asi que lo que yo denomino pantallas no son mas que componentes logicos que yo considero logicamente separados, pero puede que sean solo parte de una pantalla de UI real, como tambien puede pasar lo contrario, que lo que yo considero 1 sola pantalla realmente en la UI sean varias, asi que deben tomarse mis “pantallas” como solo componentes logicos.

Y como aca se describe ese flujo/experiencia de usuario, aca tambien se aceptan propuestas, analisis, debates, si se considera que algo estipulado aca podria ser distinto, mejor, o tambien puede pasar que haya omitido flujos/operaciones que son necesarias, por ejemplo:

- Por compliance sabemos (creo) que se debe tener la funcionalidad de reportar contenido o errores, si tu sabes eso por compliance, y yo no mencione ese flujo, debes decirmelo.

- Otro ejemplo, digamos que hablo de todo, pero no menciono como es el flujo de creacion de perfil, pero tdo lo demas asume la entidad perfil, ahi entonces me hizo falta ese flujo/operacion

## Todas las pantallas:

Vas a inferir y entender cuales son las pantallas a partir de los flujos, los flujos mencionan pantallas de entrada, asi como navegacion y todo eso, eso te indica indirectamente las pantallas, asi como la nevagcion entre ellas y la funcionalidad expuesta por cada una.

Puede que una misma pantalla apaerzca en multiples flujos con nombres distintos, si logicamente entiendes que es la misma tomala como la misma, todo esto es escrito a mano y no hay como un glosario fijo, pueden haber variaciones

## FLUJOS

A continuacion se listan todos los flujos y operaciones disponibles, son incrementales, es decir, todos tienen acceso a los flujos de general (sin cuenta), los de cuenta normal tienen acceso a sus flujos + los de sin cuenta, los de suscripcion tienen a sus flujos + los de cuenta normal + sin cuenta, etc. La unica excepcion en donde no es incremental es para los perfiles marcados como estudiantes, pues ellos al contrario se especifica las diferencias, limites y cosas especiales que tienen por el hecho de ser considerados como menores (depende de como los haya marcado el profesor).

No he decidido cual deberia ser la pantalla inicial, la landing page, la pantalla de entrada, pensaria que podria ser la de discovery, asi que asumiremos que ese es el punto de entrada, pero puede cambiar.

A partir de ahi, cada flujo especifica desde que pantalla o pantallas comienza el flujo, y por ende el propio flujo indica todo el camino de pantallas por el cual pasa, por lo que al analizar todos los flujos en conjunto se entiende el grafo de pantallas y conexiones que deben tener.

### Flujos generales (todos los tipos de usuarios, sin cuenta necesaria)

Esto lo escribo luego de ya haber escrito algunos flujos de aca, notaras que en casi todas las operaciones se requiere almenos una cuenta guest, podria uno pensar “entonces obliguemos a al menos tener cuenta guest para usar la plataforma”, la idea es que, aunque eso eventualmente sera asi, no se sienta asi para el user:

- Que el usuario pueda navegar lo maximo posible sin crear nisiquiera guest account

- solo se le pide crear cuenta cuando oprime algo que lo requiere:

  - Si guest account se permite para esa operacion, entonces se muestra algo que priorice esa opcion, en donde inciar sesion / registarse sea opcion secundaria, de forma que sea mas facil que el usuario lo haga, porque guest es solo escribir el nombre

#### Búsqueda de juegos

Pantalla de entrada: Discovery juegos.

- PANTALLA: Discovery juegos.

- El usuario entra a la discovery page

- La discovery page muestran distintos juegos por defecto, tales como:

  - Juegos populares en el momento

  - Luego se pueden mostrar distintas categorias y un numero de juegos de cada una.

  - El listado de categorías, para que el user pueda oprimir una categoría específica

  - Una sección de “jugados recientemente”, aplica si el usuario tiene cuenta, asi sea guest

- El user puede oprimir en una categoria en especifico, en cuyo caso solo se listan juegos de esa categoria por popularidad.

- El user tiene una barra de busqueda, en esa barra de busqueda puede buscar juegos (aunque no se que tipo de algoritmo deberiamos usar, puede ser uno basico, puede ser uno por tags), al buscar se muestran juegos que se encuentran con esa busqueda.

- habra un concepto de “tags” de un juego, al crear un juego el juego se puede marcar con tags, la diferencia entre tags y categoria es que, un juego solo pertenece a una categoria, pero puede tener varios tags que son descriptivos, en la barra de busqueda aparece como helper la lista de tags mas populares, y el usuario puede oprimir para ver mas, y seleccionar el grupo de tags. La idea es, para evitar un algoritmo de busqueda complejo, incentivar la busqueda por tags, y ahi de alguna forma que el usuario pueda indicar si quiere exclusivo o inclusivo (juegos que tengan 1 o mas tags vs juegos que tengan todos los tags especificados).

- De cualquier forma que sea que el usuario busque, el usuario puede oprimir en un juego. Cada juego muestra la foto principal (miniatura), y el nombre.

- Al oprimir en un juego se pasa a la pantalla de juego.

- PANTALLA: Juego seleccionado

- la pantalla muestra el juego, imagen principal, imagenes extra (si el juego tiene) (aca se me ocurrio una idea, las imagenes pueden ser literalmente generadas por el propio motor de generacion de juegos, y subidas automaticamente por la plataforma, de forma que la única imagen que tiene que ser escogida por el usuario es la principal, y si el usuario no escoge entonces se genera dinamicamente tambien.

- Se muestra el titulo, la descripcion, internamente el BE analizara que tal estan los datos de ese juego, si el juego tiene buenos datos, como un alto numero de sesiones en los ultimos 30 dias, o datos asi, entonces se muestran, si no, entonces simplemente no se muestra nada, la idea es mostrar datos de comunidad cuando ellos dan la percepcion de gran comunidad.

- Adicionalmente se muestran 2 botones, uno que es el principal que seria el de “Inicia una sesion/cuarto de este juego”, y otro que es opcional, si el juego en el BE esta marcado como disponible para ser usado como plantilla, entonces aparece el boton “crear juego basado en esto” (btw, todos los nombres y textos definidos aca son solo de ejemplo, no tienen que decir eso exactamente)

- Un boton adicional de “reportar juego”.

- El boton de iniciar sesion lleva al flujo de “creacion de sesion” del flujo de cuenta normal.

- El boton de usar juego como plantilla lleva al flujo de “creacion de juego” del flujo de cuenta normal con el identificador del juego como input de template

- El boton de reportar juego lleva al flujo de “reportar juego” de flujos generales.

#### Reportar juego

Pantallas de entrada: Juego seleccionado | sesion en curso | historial de sesion

- En juego seleccionado esta el boton de reportar

- En sesion en curso esta el boton en alguna parte de “salirme y reportar el juego”

- En historial de sesion esta el boton de “reportar el juego jugado”

Notificaciones:

- In-app: De confirmacion de envio del reporte

- PANTALLA: Reportar juego (es la pantalla a la que lleva el boton que permite acceder a traves de las pantallas de entrada). Muestra el juego seleccionado para reportar, si es relacionado a una sesion en particular (reportado durante una sesion en curso o historial de sesion) muestra la informacion de la sesion, muestra campos necesarios del reporte, causa, motivo, descripcion, etc.

- El usuario ingresa todo el input que quiera, categorias (tags) del reporte (como contenido sexual, juego malicioso, error tecnico, etc)

- El usuario una vez todo esta lleno oprime el boton de reportar

- Una vez se oprime el boton.

  - Si el usuario no tenia una cuenta (se necesita cuenta, asi sea guest para reportar), se lleva al usuario a la pantalla de inicio de sesion / registro / invitado

  - PANTALLA: Inicio de sesión / registro

  - El usuario puede iniciar sesión, registrarse (crear una nueva cuenta) o continuar como invitado y crear un display name

  - Se lleva al flujo de autenticación para completar eso

  - Una vez completado y teniendo una cuenta asociada (asi sea invitado), se continua con el flujo de reporte

- Una vez submitteado el reporte, se redirige el usuario a la pantalla de mis reportes / mis casos

- PANTALLA: Mis reportes / mis casos

La idea es que en el sistema el reporte quede vinculado con el juego y el usuario, y opcionalmente con la sesion, para todo lo de review

#### Reportar caso / solicitud

Pantalla de entrada: Perfil

Notificaciones:

- In-app y correo (si es cuenta con correo): De confirmación de envío del reporte

- PANTALLA: Perfil

- En la pantalla de perfil, aparece entre todas las opciones algún lugar de “reportar, solicitar, etc” general

- Si el usuario no tiene ni cuenta de invitado, aun asi tendra acceso a la pantalla de perfil, solo que solo mostrara esa info como de que no tiene cuenta, y listará algunas acciones pero que si el usuario oprime se le indica que necesita cuenta y se le lleva a ese flujo

- El usuario oprime el boton de reportar/solicitar/caso, etc

  - Si el usuario no tiene cuenta, se le indica que debe tener una y se le lleva a la pantalla de autenticacion

  - PANTALLA: Inicio de sesión / registro

  - El usuario puede iniciar sesion, registrarse (crear una nueva cuenta) o continuar como invitado y crear un display name

  - Se lleva al flujo de autenticacion para completar eso

  - Una vez completado, se sigue con el flujo principal, se redirige

- Se lleva a la pantalla de crear reporte/caso/solicitud

- en la pantalla el usuario puede seleccionar entre categorias pre existentes (reportar un problema con un juego, reportar un problema tecnico, experiencia de uso, etc, otros), de acuerdo a la categoria se pueden requerir fields especificos o generales

- El user ingresa todos los fields

- EL usuario submittea

- Se muestra el resultado de la operacion, identificador del reporte/case (para consulta posterior).

- Luego se redirige a la pantalla de mis reportes / mis casos, donde ya aparece ese reporte.

ANOTACION GENERAL QUE ME DI CUENTA ACA: Muchos flujos hacen lo mismo de condicionalmente requerir cuenta, es decir, se le permite al usuario oprimir pero luego se le pedira que tenga alguna cuenta, así sea invitado, en todos esos casos se manda al flujo de autenticación, pero la idea en código es que esa pantalla o UI de autenticación no sea la misma siempre, osea si, pero que reciba input del caller, de forma que pueda indicar como “necesitas registrarte para continuar con unirte a la sesión” o “necesitamos saber quien eres para tu reporte” etc, asi como por ejemplo se necesita para saber si esa autenticación debe requerir cuenta real o invitado también se puede.

#### Ver mis reportes / mis casos

Pantalla de entrada: Perfil.

- PANTALLA: Perfil

- En la pantalla perfil, entre las cosas que se muestran esta la opcion de ver mis reportes/casos, si el user no tiene una cuenta (asi sea invitado) se indica que necesita cuenta y si oprime se lleva al flujo de registro como los flujos anteriores.

- ya con una cuenta asociada, se lleva a la pantalla de reportes / casos

- PANTALLA: mis reportes / casos

- Se listan los reportes / casos del mas reciente al mas antiguo

- Se higlightean los que tienen updates que no se han visto (ver seccion siguiente de notificaciones para entender como funciona eso)

- EL usuario puede oprimir en cualquiera de los reportes/casos, eso lleva a la pantalla de ver reporte details

- PANTALLA: ver reporte details

- En la pantalla de ver reporte details se muestran todo el historial del caso

- El reporte puede tener iteraciones, es decir, después de creado, puede recibir una respuesta, y permanecer abierto, si está abierto y la última interacción fue del sistema (de nosotros), entonces el user puede interactuar con el caso, enviar un mensaje, etc.

Aca se introduce un concepto de negocio, y es el ciclo de vida de un reporte, creo que hay 2 ciclos de vida, el de user y el del admin:

- El de user es el estado para lo que implica el user, creo que la máquina de estados seria como:

  - Abierto: estado inicial

  - Esperando respuesta: una vez abierto, si el tipo de reporte de usuario requiere alguna respuesta de la plataforma, entonces tiene este estado

  - Requiriendo input: Si el admin requirio mas input del usuario, entonces este es el estado y el user puede enviar mas cosas

  - Cerrado: Puede pasar aca de abierto o de esperando respuesta, es decir, el admin puede cerrar el caso como respuesta directa, o puede que por el tipo de caso el caso haya pasado de abierto a cerrado ahi mismo, es decir, un caso donde el usuario solo queria enviar algo que no requiere accion, para ese tipo de reportes el caso jamas permanece abierto.

- Mientras que para el admin los estados son mas como:

  - new: estado inicial

  - requiriendo_respuesta:

  - esperando respuesta

  - acked

  - closed:

- No entrare en detalle en cada uno, la diferencia principal es el concepto de acked, paa los tipos de reporte que no requieren respuesta de la plataforma para el usuario pasarian a closed (o algo como sent, para que el usuario no sienta que lo ignoramos) ahi mismo, mientras que del lado de admin si queremos diferenciar entre ese reporte enviado y ya visto, el admin tendria que verlo, y al verlo lo marca explicitamente como acked, de forma que ya se considera visto por el admin, no aparecera en bandeja de entrada ni nada.

#### Concepto notificaciones

Esto no es un flujo, sino es un concepto mitad producto mitad tecnico que queria especificar porque me di cuenta que se necesita.

necesitamos una forma de enviar notificaciones a los usuarios, pero notificaciones simplemente significa mensajes que queremos diferenciar entre enviados o no, entonces, en principio estaba pensando que habrian 2 capas logicas de lo que es una notificacion:

- Notificacion logica: Este es el concepto de “queremos mostrar algo al user”, “paso algo”, eso es todo

- Delivery notification: Es la forma en la que eso se hace saber, aca entrarian los distintos tipos de delivery, que por ahora creo que serian 3:

  - in-app: Cuando se abre la plataforma/app movil, aparecera el boton de notificaciones.

  - push mobile notifications: Al celular del user

  - Correo:

Entonces, creo que, una notificacion logica puede notificarse por uno o mas metodos.

Tambien creo que, no puede ser una tabla standalone, a nivel tecnico creo que podria ser algo como:

- Un dominio/tabla/esquema aislado que es notification focused, no se encarga de nada mas, no sabe de nada mas

- Los dominios que usan notificaciones, se acoplan a ese general service, y referencian sus notificaciones.

Considero que, la arquitectura que veo para el dominio de notificaciones y su acople con los otros dominios, seria algo como:

- Consumer domain:

  - Es el encargado de hacer push al dominio de notificaciones, pedir una notificacion.

  - Esa request es no transaccional, pues notifications sera su propio dominio separado, que eventualmente podria ser un servicio separado.

  - Notifications domain expone una interface clara de lo que recibe, que puede ser como:

    - external_token

    - idempotency_token

    - notification_domain (esto conecta con el dominio, solo es el buscador de dominio, no de la razon especifica de la notificacion)

    - notification_type

    - send_at

    - delivery_methods (expuestos por el dominio de notificaciones, y el consumer es encargado de usarlos, define que medios de delivery quiere usar, puede  pasar X fijos, o X con fallback a Y, o los disponibles de X,Y,Z)

    - user_uuid (external user identifier): Identificador de usuario usado por el dominio de notificaciones para resolver los metodos de delivery disponibles, etc.

  - El contenido logico del evento lo tiene el dominio owner, notifications solo recibe el payload de la notificacion

  - Dado que la llamada es no transaccional, los callers son responsables de implementar sus patrones transaccionales, por ahora quiero que usemos el patron txqueue en lugar del outbox+queue:

    - Una queue transaccional que realmente es una tabla de BD, con consumidor en la misma BD, es decir, el codigo del caller en la misma transaccion que hace sus operaciones logicas al final escribe la tarea de envio de notificacion en la txqueue, que por detras solo escribe una fila en la tabla de la txquue

    - Hay un worker, que es un background job que lee de esa tabla haciendo polling, y procesa la operacion.

    - Por ende, las tareas deben ser idempotentes, at least once

    - Cada dominio tendra 1 o mas tablas de txqueue, porque nuevamente, cada dominio actua como servicio desacoplado en BD, por ende, la txqueue y el background worker es propio para dominio, pero claro, un dominio podria elegir tener mas de 1 si es necesario.

    - Quiero que implementemos un pkg general de esa implementacion de txqueue, y que los dominios lo importen y usen, pero la implementacion de la txqueue y el consumer es compartida, lo generico es el tipo especifico de la task, configuracion de intervalo de polling, workers, etc.

    - Nuevamente, toda la escritura a la txqueue debe ser por medio de interface e incluso internamente los dominios deben desacoplar:

      - Codigo de servicio

      - Codigo especifico de la txqueue

      - Codigo del procesador de tarea

    - De forma que eventualmente se pueda reemplazar la txqueue por outbox+queue real fuera de DB

    - Ese paquete de txqueue debe incluir dead letter queue cuando una tarea llega al limite de retries, en la herramienta de admin se debe poder visualizar todas las dead lettter queue que se tienen en el sistema, y como todas usan la misma implementacion, independientemente del dominio o de donde sean deben exponer la operacion de retry o de cancelar, de forma que yo como admin pueda:

      - Corregir manualmente la data corrupta o la causa, y reintentar manualmente la tarea

      - Decidir que esta bien no reintentar mas y dejar asi

BTW quiero usar este patron de txqueue + dead letter queue para todo lo asincrono en el sistema para la fase 1, pero siguiendo esa division clara de codigo para poder migrar facilmente a outbx+queue real.

- Notifications domain:

  - Expone una interface clara que recibe todo lo requerido por el dominio y el payload de envio, sin acoplarse a los callers

  - Es quien maneja el delivery de notificaciones a los tipos especificos, por ejemplo, las push notifications, las in-app, y las correo

    - Es quien tiene integracion con el delivery de correo

  - Es quien sabe el estado real del delivery de la notificacion, si ya fue vista por el usuario o no.

  - Su conexion con el evento del dominio de la notificacion es solo el external token, el no hace ningun join, para el solo es metadata, son los callers los que hacen llamadas filtrando por sus tokens, porque son ellos los que saben que significa cada uno.

  - La idea es que en lo que el dominio expone, exponga algun tipo de builder o plantilla, de forma que por ejemplo, me imagino, hay una plantilla, como una struct con fields:

    - Titulo

    - Lista de elementos de contenido:

      - Puede ser parrafo

      - imagen

      - etc

  - Osea, es solo un ejemplo, pero basicamente es para que los callers puedan ellos mismos construir como es la notificacion que quieren enviar, pero sin acoplarse al UI de la notificación, eso pertenece al dominio de notificaciones

  - lo que notifications hace es definir uno o varios tipos de esqueletos armables, y que por medio el input del caller se construya como se va a ver esa notificacion.

  - Igualmente la idea es no complicar mucho eso, solo sera titulo, parrafos, etc.

  - Y entonces con base al esqueleto seleccionado notifications sabe que mostrar en cada parte, por ejemplo:

    - Que mostrar en el push notification

    - Que mostrar en la lista resumida de in-app notifications

      - SOlo mostrar todo el contenido cuando se abre la notificacion

    - COmo construir el correo

  - El dominio de notificaciones se acopla (puede llamar directamente no transaccionalmente) al dominio de usuarios/profile/identity (para el momento que escribo esto no he definido cual sera el dominio o dominios que contienen la data necesaria) para obtener datos de delivery, por eso recibe el user uuid:

    - Por ejemplo, si se solicito notificacion por correo, entonces se debe obtener el correo electronico

    - Si se solicitu push notifications, el hacer eso y saber si el user tiene la app instalada (no se como funcionan las mobile push notifications)

  - Otra opcion, seria no acoplar, y al contrario, como parte del flujo de creacion de perfil que eso sea un SAGA que crea la cuenta en profile/identity/user y notifications, el problema es que cualquier update requeriria SAGA para actualizar en ambos lados, como cambio de correo electronico, nombre (para el display name de la notificacion), si ya no hay app instalada, etc.

Ahora, hay otra cosa muy importante sobre las notificaciones que quiero dejar claro, y es 2 cosas:

- Una notificacion como vista

- conectar con el evento de dominio que la causó

Comenzando con el primero, quiero poder diferenciar entre una notificación que ya fue vista por el usuario y una que no, esto no tiene que ser 100% accurate, pues como veremos a continuacion implica 2 llamadas no transaccionales, asi que no es atomico, pero me gusta la idea de intentarlo, porque sucede que en la plataforma como en todas las plataformas abra el boton de notificaciones.

- Aprovecho para explicar como veo esto, deberia haber una sticky top bar que tiene botones fijos, como el de perfil/iniciar sesion, el de notificaciones

Ese boton de notificaciones como cualquier app muestra la lista de notificaciones pendientes no leidas. Es ahi donde entra la cuestión, que se considera una notificacion no leida?

Entonces pensaba que el dominio de notificaciones supiera si una notificacion logica (que puede tener varios metodos de delivery) fue o no fue vista aun.

- Si la notificacion es de correo y/o push, justo después del envío (llamada externa al proveedor) se marca como vista en la BD, se asume que si fue enviada directamente entonces fue vista. Pero nuevamente, esto es una operación at much once, puede no ser accurate, en cuyo caso se marca como vista en el siguiente paso.

- Para in-apps notifications, son las que aparecen SOLAMENTE en la lista de notificaciones adentro de la plataforma, por ende ahí se muestran las que aun no estan marcadas como vistas, una vez se consideran mostradas (aca podemos debatir, lo hacemos cuando el user las abra o simplemente cuando se reciba el request de GET notifications no ivstas? o algo intermedio, como que el FE envie un mensaje indicando “estas notificaciones ya fueron vistas” luego de que el FE sabe que si las renderizo y que el usuario vio por al menos 2 segundos).

Abra tambien la opcion de ver historial de notificaciones, creo que podria ser:

- En el mismo boton de notificacions, algo como “ver ya vistas” o “ver pasadas”

- En la pantalla de mi perfil, algun boton como “todas las notificaciones” y que esa pantalla por medio del query de backend obtenga todos los dominios y tipos de notificaciones enviadas, muestre eso como opciones en el FE para que el user pueda filtrar por:

  - Dominio

  - Tipo

  - Fechas

- Para dominio y tipo claramente no se mostrara el raw value, sino que se mapearan los posibles valores a valores logicos, en lugar de “game_creation”, se mostraria “Creacion de juego” en I18n

Las notificaciones requieren una cuenta, asi sea guest, pero se requiere cuenta, si no hay cuenta no hay forma de enviarlas, pues al menos un guest se pueden mostrar como in-app, si no es guest no hay forma.

Otro area donde el concepto de “notificacion vista” es usada, es que se puede conectar y mostrar notificaciones en otros lados, me explico:

- Por ejemplo, para la pantalla de “mis reportes / casos”, se muestra la lista de casos, lo que se puede hacer es highlightear los que tienen “notificaciones” pendientes, por ejemplo, cuando hay cambio en un reporte (una actualizacion, respuesta), se envia una notificacion, si esa notificacion es solo in-app, entonces se muestra en el boton de notificaciones, Y/O si el usuario entra a mis reportes, entonces el reporte que tuvo esa notificacion se muestra highlighteado y mencionando que hay actividad nueva ahi.

- Luego si el usuario oprime y abre ese reporte, eso cuenta como marcar la notificacion como vista, pues ya el usuario vio el update de la notificacion.

Como lograr eso? estaba pensando y es ahi donde entra el segundo punto “conectar con el evento de dominio que la causó”.

La idea es que, por ejemplo, el endpoint de GET reportes, sera una llamada que pasa por el composer domain:

- Llama al dominio respectivo de reportes, obtiene la data de reportes, este dominio no le interesa saber el estado de sus notificaciones.

- Luego, el composer, es un BE para FE, por ende a el si le interesa la logica de mostrar, y la logica de mostrar require  notificaciones, entonces ese composer toma los tokens de los reportes, y llama al dominio de notificaciones filtrando por los tokens

- Composer obtiene las notificaciones no vistas para los tokens que se van a devolver al FE

- Entonces despues Composer construye la response de forma que por cada reporte, se incluya la data de notificacion. La notificación logica del dominio de notifications tambien tiene su exposed identifier, por ende ese tambien se retorna.

- Luego el FE, sabe que ese item tenia una notificacion, y siguiendo la logica de FE, cuando considera que ya fue vista, llama a un endpoint con el identificador de la notificacion para marcarla como vista

Finalmente, hay un ultimo punto que no se bien como resolver, y es el poder linkear una notificacion con la pantalla de la entidad relacionada, por ejemplo, incluso sin pensar en las push notifciations ni las de correo, pensando solo en las in-app, quiero que:

- Si la notificacion es de reporte, al oprimir algo como “ver mas” redirige a la pantalla de ver reporte con ese reporte abierto

- Lo mismo en correo, que haya un link que al abrir diriga a ese path directamente.

Pero no se como, se me ocurre que tendria que haber algo como un constructor de URL:

- Un endpoint que recibe el token, el dominio, y el tipo de notificacion

- Luego ese builder esta acoplado al dominio que genera la notificacion, NO al dominio de notificaciones.

- EL builder sabe como armar el path que lleva a la pantalla asociada con ese elemento/entidad de ese dominio.

- Pero la cosa es, no deberia ser un metodo del dominio, o podria serlo, pero si si, entonces ese metodo de dominio solo resuelve un path logico, no asociado a FE, debería ser entonces el composer, porque recordemos, los dominios por si solos son FE agnostic, es el composer el que puede actuar como BE for FE, por ende ese builder no deberia estar en el dominio en cuestión, porque eso seria logica de UI, deberia estar en composer, y deberia incluso estar acoplado a FE specific impleemntation, pues puede construir URL’s

  - Entonces aca, creo que para mas operaciones, como la propia de generar el enlace para compartir unirse a una sesion, se puede requerir algo como un “cosntructor de FE URL’s” y no digo que este mal, es aceptable, esta bien, por ende, podemos introducir algo asi, lo importante es entender los boundaries, esa no es logica del dominio logico, es una capa separada y distinta.

#### Ver planes / suscripción

En esta sección no voy a especificar el flujo por pasos, porque todavía no se ha determinado exactamente el formato o modelo con el que se van a manejar los planes y suscripciones. No hay una definición clara de si serán planes fijos, si será algo incremental ni exactamente cómo se llega allá.

Ya hay una sección que explica más a detalle cómo esperamos o queremos que funcione el tema de planes y suscripciones. Esa sección es una especie de divagación sobre la idea que se tiene en mente, así que acá quiero dejar bastante libertad sobre cómo se concreta ese flujo.

De cualquier forma, vamos a necesitar una especie de landing page de suscripción. No sé exactamente cómo se llegará allá, pero la idea es que sea fácilmente accesible y que haya botones fijos para llegar a esa pantalla:

- Puede ser un botón de “plan” o “tu plan” en la barra superior fija, junto con notificaciones y perfil. Ese botón lleva a la pantalla del plan y suscripción, incluyendo los detalles de lo que el usuario tiene actualmente.

- También se llega desde la pantalla de perfil, donde habrá una sección de planes, suscripción o algo así. Desde ahí se lleva a una pantalla que muestre el plan actual y, si el usuario no tiene uno, los planes disponibles para que se una.

Además de esos accesos, están todas las operaciones en las que el usuario puede llegar a un límite. Cuando llegue al límite, se le propone algo como: “Llegaste al límite, no tienes más acceso, pero puedes hacer una microtransacción para realizar esta operación o acceder a un plan completo”.

Y no tiene que ser solamente cuando se llegue al límite. También podemos mostrarlo como una opción B durante el uso normal de la plataforma, por ejemplo:

- Cuando el usuario crea una sesión, se le muestra que ya está creada, que puede compartirla y que se pueden unir hasta tantos jugadores.

- Abajo puede aparecer un mensajito o algo no invasivo que diga como: “Únete a un plan para tener más jugadores concurrentes en una sesión y más sesiones disponibles”.

#### Ver mi perfil detalles

- El usuario oprime el botón de perfil, que está siempre en la barra superior como un botón fijo para acceder al perfil.

- PANTALLA: Perfil.

- Esta es la pantalla principal del perfil de la cuenta, una especie de menú general donde se muestra el nombre del usuario, el tipo de cuenta y, debajo, distintos botones como:

  - Ver mis detalles de cuenta.

  - Ver mis planes, como ya se explicó anteriormente.

  - Ver mis reportes.

  - Ver historial de sesiones.

  - Ver juegos.

  - Etc.

- Ese menú sirve para las acciones de una cuenta existente. Si el usuario no tiene ni siquiera una cuenta de invitado, como se mencionó en otras partes del documento, igual verá botones, pero se muestra claramente que no hay ninguna cuenta asociada. No hace falta tener cuenta para llegar a esta pantalla, pero aparece una llamada a la acción como “crea una cuenta, así sea como invitado, para poder realizar estas acciones”.

- Cuando hay una cuenta, así sea de invitado, se muestra la cuenta y el detalle de su tipo: invitado, cuenta real, cuenta con plan, etc.

- El usuario puede oprimir el botón de ver detalles de cuenta.

- PANTALLA: Detalles de cuenta.

- En esta pantalla el usuario ve sus detalles y puede actualizarlos.

  - Para una cuenta de invitado, el único dato sería el display name, que se puede actualizar.

  - Para una cuenta real aparecen más opciones, como el correo electrónico con el cual está registrada.

BTW, para los cambios de display name tenemos que manejar algún tipo de límite: cuántos cambios se pueden hacer, en qué rango de tiempo, etc. Estos son límites de negocio impuestos por el dominio específico. No es el rate limiting de cuántas HTTP requests recibimos, sino límites propios de las reglas de negocio. Voy a hablar más de eso en la sección de reglas de negocio.

Sobre el correo de una cuenta real, no sé si la integración con Google que planeamos hacer permite cambiar la cuenta asociada, es decir, que la misma cuenta en nuestro sistema Playhoot cambie el correo asociado. Si lo permite, entonces aparece la opción para hacerlo.

Básicamente sería eso, no creo que manejemos más datos. La idea es recolectar la mínima información de usuario posible para el funcionamiento de la plataforma, porque entre más datos recolectemos o pidamos, más requisitos de compliance y posibles infracciones o cosas así tenemos que considerar.

#### Actualizar detalles perfil

No hace falta definir otro flujo acá, porque ya está cubierto en la sección anterior. El usuario puede ir al perfil, entrar a los detalles de la cuenta y actualizar los campos que estén disponibles para edición.

No puedo definir exactamente todos los campos todavía, porque depende de lo que se termine decidiendo, pero por ahora serían:

- Display name: aplica para todos los tipos de cuenta y se puede actualizar respetando un límite de cantidad de cambios en cierto rango de tiempo.

- Correo electrónico: si se permite que una cuenta existente cambie el correo de Google asociado, entonces también se podrá actualizar. Como mencioné anteriormente, esto depende de lo que se defina.

Sobre los campos que vamos a permitir, la idea sigue siendo que la cuenta tenga la menor cantidad posible de datos del usuario. No queremos recolectar ni guardar información innecesaria que pueda implicar más requisitos de compliance y posibles problemas relacionados con el manejo de esos datos.

#### Autenticacion (upgrade guest a cuenta real)

Este upgrade es distinto al upgrade a un plan. Acá hablamos de cuando el usuario ya tiene una cuenta de invitado y quiere convertirla en una cuenta real.

Pantallas de entrada: Perfil / detalles de cuenta | Operaciones que requieren cuenta real.

- En la pantalla de perfil, en la parte de detalles de la cuenta de invitado, siempre aparece un botón como “hacer upgrade”, “cambiar a cuenta real” o “regístrate para tener más acceso”.

- También se llega desde las operaciones que el usuario puede ver, pero que requieren una cuenta real. Por ejemplo, si intenta crear un juego o crear una sesión, se le indica que necesita una cuenta real y se muestra un botón que lleva a hacer upgrade.

La entrada principal es desde el perfil, pero esas otras operaciones también llevan al mismo flujo. Mientras tenga la sesión iniciada como invitado, el usuario puede ir en cualquier momento a hacer upgrade.

Notificaciones:

- Correo: Se envía una notificación al correo registrado, dándole la bienvenida y confirmando que hizo upgrade de su cuenta y ahora tiene acceso a más funcionalidades.

- El usuario oprime el botón de hacer upgrade desde cualquiera de los puntos de entrada.

- PANTALLA: Upgrade / autenticación.

- Se explica en qué consiste el upgrade: si se registra con una cuenta nueva, esa cuenta queda vinculada con todo el historial que tenía como invitado. No pierde sus datos, todo sigue ahí, solo que a partir de ese momento tiene una cuenta real.

- Se invita al usuario a registrarse.

- El usuario completa el registro de una cuenta nueva.

- El sistema vincula esa nueva cuenta con la cuenta de invitado anterior, de forma que el usuario conserva todos sus datos.

- Se envía la notificación de bienvenida y confirmación del upgrade al correo registrado.

BTW, esa pantalla de autenticación también tiene la opción de iniciar sesión. Entonces puede pasar que el usuario esté usando una cuenta de invitado, pero ya tenga una cuenta real existente y quiera iniciar sesión con ella en lugar de registrarse.

En ese caso no se vinculan las cuentas. El upgrade solo aplica cuando se crea una cuenta real nueva a partir de la cuenta de invitado.

Si por cualquier razón el usuario tiene una cuenta de invitado y, aparte, una cuenta real existente, son cuentas separadas y no hay forma de unirlas ni de vincular el historial de una con la otra. No necesariamente tenemos que mostrarle un aviso específico por tener una cuenta existente, pero debe quedar claro qué hace el upgrade y cuándo aplica.

La cuenta de invitado solo puede convertirse en una cuenta real nueva mediante este flujo.

#### Autenticacion (registro/inicio sesion)

Este flujo ya está explicado implícitamente en los demás, pero acá se explica nuevamente.

Si el usuario entra a la plataforma sin ninguna cuenta, ni siquiera de invitado, puede acceder y navegar por la mayor cantidad de lugares posible. Cuando intenta realizar una operación que requiere cuenta, se le indica que necesita una y se le lleva al subflujo de autenticación. Al finalizar, vuelve a la operación que quería realizar.

- El usuario intenta realizar una operación que requiere una cuenta y no tiene el tipo de cuenta necesario.

- Se le indica que necesita una cuenta para continuar.

- PANTALLA: Autenticación.

- La pantalla prioriza el tipo de cuenta más sencillo y con menos permisos que permita realizar esa operación.

  - Si la operación es unirse a una sesión, se prioriza continuar como invitado. Solo se le pide escribir su display name y continuar.

  - La idea es que ni siquiera se sienta como iniciar sesión o crear una cuenta, sino simplemente como escribir el nombre que quiere mostrar en el juego.

  - Como opciones secundarias aparecen iniciar sesión o registrarse. Si el usuario oprime alguna de ellas, continúa con el flujo correspondiente; si no, sigue como invitado.

  - Si la operación requiere una cuenta real, se prioriza el registro o inicio de sesión y no se muestra la opción de continuar como invitado. Se le indica que esa operación requiere una cuenta real.

- El usuario completa la opción de autenticación que escogió.

- Al finalizar, se le devuelve a la operación que quería realizar.

También se puede acceder directamente desde la barra superior fija, donde está el botón de perfil:

- Si no hay ninguna cuenta, ni siquiera de invitado, aparece un llamado a la acción como “regístrate”.

- Si el usuario oprime ese botón, como no viene redirigido desde una operación específica, se muestran todas las opciones por igual: continuar como invitado, iniciar sesión o registrarse.

- Si ya tiene una cuenta de invitado, arriba aparece su display name. Puede oprimirlo y acceder a esa especie de pseudocuenta, pero, como se explicó en el flujo anterior, para ciertas operaciones necesita hacer upgrade y siempre tendrá el llamado a la acción para hacerlo.

- Si tiene una cuenta real, también aparece arriba el display name que haya escogido, pero tiene acceso a más funcionalidades, a la parte de planes y todo eso.

En principio, el flujo de registro e inicio de sesión es sencillo y no creo que tenga mayor complejidad.

Lo que falta decidir es qué métodos de registro e inicio de sesión vamos a permitir. Inicialmente había pensado en usar solo la integración con Google, pero también podríamos incluir cuentas propias, con correo y contraseña.

BTW, esto corresponde más a la parte técnica: esos métodos serían distintos proveedores de autenticación, y uno de los proveedores podría ser el propio de nosotros, encargado de las cuentas con correo y contraseña.

Me gusta priorizar el registro e inicio de sesión con Google o integraciones similares porque facilita el proceso para el usuario, aunque también podemos incluir cuentas propias.

Si hay otras integraciones gratuitas o que no sean caras, como Facebook, Apple o alguna otra, podemos pensar en agregarlas. Por ahora, con Google estaría bien.

#### Unirme a sesion

Pantallas de entrada: Botón de unirse a una sesión en la plataforma | Link compartido de la sesión.

BTW, todavía no he decidido cuál va a ser la entry page de la plataforma. Creo que ya lo había mencionado, pero es importante aclararlo. En principio, todo este documento lo estoy pensando como si la página a la que se llega al buscar la plataforma, por ejemplo en Google, fuera la discovery page. Pero eso queda abierto y puede cambiar.

Independientemente de cuál sea esa entry page, ahí debe existir un botón de “unirse a una sesión” que sea claramente visible y fácil de acceder. También estaba pensando que podría estar en el menú de la barra superior, donde está el perfil y todo eso.

La idea es que, si alguien busca la plataforma porque le dijeron “entra ahí para unirte a la sesión”, encuentre fácilmente cómo hacerlo. El botón puede estar también en otros lugares; no tengo definido exactamente cuáles, pero el punto es que ese acceso sea visible y fácil de encontrar.

- El usuario oprime el botón de unirse a una sesión.

- PANTALLA: Código de ingreso.

- El usuario ingresa el código de acceso de la sesión.

- Se verifica que la partida exista y sea válida.

- Si el usuario no tiene ninguna cuenta, se le lleva al subflujo de autenticación para poder completar la unión a la sesión.

  - Puede continuar como invitado escribiendo su display name.

  - También puede iniciar sesión con una cuenta o registrarse, siguiendo lo definido en el flujo de autenticación.

  - Al completar ese subflujo, continúa con la unión a la sesión.

- Si el usuario ya tiene una cuenta autenticada, se omite ese subflujo y continúa directamente.

- Se completa la unión a la sesión.

- PANTALLA: Lobby.

- El usuario queda en espera y puede ver información como:

  - Nombre del juego que se va a jugar.

  - Tal vez una breve descripción.

  - Logo o imagen del juego, si tiene.

  - Quién es el administrador o creador de la sesión.

  - Lista de jugadores que están en la sesión.

  - Los demás detalles que sean necesarios, sin sobrecargar la pantalla de información.

- La lista de jugadores se actualiza en tiempo real, mostrando quiénes se van uniendo y el display name de cada uno.

- El usuario tiene un botón para salirse y cancelar su unión a la sesión. Si se arrepiente o simplemente quiere salir, puede hacerlo en cualquier momento.

El otro punto de entrada es el link compartido directamente por quien crea la sesión, que sería la forma ideal de acceder.

Ese link simplemente lleva en el frontend a la pantalla de unión, pero ya incluye el código de acceso como input. El usuario no tiene que escribirlo: al llegar, el código se aplica automáticamente.

Entonces se sigue el mismo flujo, omitiendo el ingreso manual del código. Después de validar la sesión, si el usuario no está autenticado, se le lleva al subflujo de autenticación; si ese dispositivo ya tiene una cuenta autenticada, pasa directamente al lobby.

#### Ver mis sesiones jugadas

Pantalla de entrada: Principalmente perfil, aunque también puede haber acceso desde otras pantallas donde tenga sentido mostrarlo.

Este flujo está disponible siempre que el usuario tenga una cuenta, así sea de invitado.

- PANTALLA: Perfil.

- Aparece una opción como “historial de juegos” o “historial de sesiones jugadas”.

- El usuario oprime esa opción.

- PANTALLA: Historial de sesiones jugadas.

- Se muestra la lista de sesiones jugadas, ordenadas de la más reciente a la más antigua.

- El usuario puede filtrar por fecha.

También me parecería interesante poder filtrar o consultar el historial por juego, porque juegos jugados y sesiones jugadas son cosas distintas: un usuario puede haber jugado muchas sesiones del mismo juego.

Podría haber dos vistas entre las que el usuario pueda cambiar:

- Una vista de sesiones, con todo el historial ordenado de la más reciente a la más antigua.

- Una vista de juegos jugados, donde pueda abrir un juego y ver las sesiones que ha jugado de ese juego.

No tengo totalmente claro cómo se mostraría, si sería una agrupación, dos secciones o dos vistas, pero la idea es que pueda consultar tanto el historial general de sesiones como el historial a nivel de juego y, desde ahí, las sesiones correspondientes.

BTW, también podría ser interesante que en la pantalla de un juego aparezca algo como “ya has jugado este juego antes”, con un botón que lleve directamente a la vista de las sesiones agrupadas por ese juego. No sé si valga la pena, pero es una posibilidad.

En esencia, este flujo consiste en llegar al historial de sesiones jugadas, listarlas, filtrarlas y poder agruparlas por juego.

Cuando el usuario oprime una sesión, se le lleva a la pantalla completa de ver sesión. Esa parte la voy a describir como un flujo separado porque creo que tiene suficientes cosas como para darle su propia descripción. Aunque sea una continuación de este mismo flujo, acá solo queda la parte de consultar el historial.

#### Abrir detalles sesion jugada

Pantalla de entrada: Historial de sesiones jugadas, como se explicó en el flujo anterior.

- El usuario oprime una sesión del historial.

- PANTALLA: Ver sesión jugada.

- Se muestran los detalles generales de la sesión:

  - El juego que se jugó, con una referencia que permite ir a ese juego. Si fue eliminado o ya no es público, se indica que el juego ya no está disponible.

  - Quién fue el host de la sesión.

  - El listado de participantes.

  - Tal vez la duración de la sesión.

- Para el host y los participantes solo se muestra el display name. Todavía no tenemos un concepto de perfiles públicos, así que no hay links a perfiles ni más información de esos usuarios.

- Ahí mismo se muestra el reproductor que permite hacer replay de la sesión. No hay que entrar a otra pantalla ni hacer nada adicional para encontrarlo.

- El usuario puede reproducir la sesión usando el feature de replay. Es un replay de baja precisión, pero la experiencia es como si estuviera viendo un video de la sesión:

  - Puede darle play.

  - Puede ver la reproducción en tiempo real.

  - Puede adelantar y moverse entre distintos momentos de la sesión.

- También aparece un botón para reportar esa sesión si pasó algo. Ese botón conecta con el flujo de reporte ya descrito.

#### Salir de cuenta invitado

Pantalla de entrada: Perfil.

Si el usuario tiene una cuenta de invitado, no tiene una cuenta real con la que pueda volver a iniciar sesión. Esa cuenta está asociada al dispositivo.

- PANTALLA: Perfil.

- Se muestran los detalles de la cuenta, indicando que es de invitado y que puede hacer upgrade, como se explicó anteriormente.

- También se ofrece de forma fácilmente accesible una opción como “eliminar cuenta de invitado”, “desvincular” o algo así. No tengo definido exactamente dónde aparece ni si será un botón separado, pero se accede desde la pantalla de perfil.

- Se le advierte al usuario que, una vez salga de la cuenta de invitado, toda su información quedará eliminada e inaccesible, porque no tiene una cuenta real con la que pueda volver a entrar.

- En esa misma advertencia se le propone considerar hacer upgrade primero:

  - Puede convertir la cuenta de invitado en una cuenta real y conservar sus datos.

  - Después puede cerrar la sesión de esa cuenta real y volver a iniciar sesión en cualquier momento.

  - Si sale directamente de la cuenta de invitado, pierde totalmente el acceso y esos datos, incluido el historial de juegos jugados, dejan de existir.

- Si el usuario decide continuar y salir de la cuenta de invitado, se realiza esa eliminación y pierde el acceso a la información.

En sí, no sería algo tan grave porque estamos hablando principalmente del historial de juegos jugados, no de datos que considere especialmente importantes. Pero igualmente se le advierte para que sepa qué va a pasar y tenga la opción de conservarlos haciendo upgrade.

#### Experiencia de juego

Esta sección no es un flujo como tal, sino una explicación de cómo es toda la experiencia de una sesión para los jugadores y el administrador.

Lobby

La experiencia comienza cuando se crea una sesión, como se explicó en el flujo de creación de sesión. Se crea el lobby y los jugadores se van uniendo.

En esa pantalla pueden aparecer los detalles del juego seleccionado, el número de jugadores actuales y la lista de jugadores. Tanto el administrador como los demás jugadores pueden ver cómo se van uniendo y quiénes están activos.

Lo único distinto para el administrador en ese momento es que tiene los botones de cancelar e iniciar la sesión. Los demás jugadores ven la lista y un mensaje como “esperando a que el administrador inicie la partida”.

Podríamos tener un timeout o un tiempo límite desde que se crea la sesión para iniciar la partida, pero no sé si sea necesario.

Sesión en curso

Cuando el administrador inicia la partida, todos pasan a la pantalla de sesión en curso.

Como se explicó en el flujo de iniciar sesión, el administrador puede tener dos experiencias: participar como jugador o quedarse solamente como administrador con acceso a las perspectivas de todos los jugadores.

Lo que ven los jugadores es el juego renderizado con su relación de aspecto, incrustado como una pantalla dentro de la pantalla de la plataforma.

Todos deben tener acceso a la lista de jugadores. Esa lista muestra a todos los participantes, incluyendo quiénes siguen activos y quiénes ya se fueron.

El juego mismo define la lógica para determinar cuándo termina. Eso incluye tanto llegar al final normal del juego como decidir que ya no se puede continuar. Por ejemplo, si se fueron más jugadores de los que el juego permite para seguir jugando, el propio juego debe tener la lógica para terminar.

Además, el administrador puede cancelar la sesión abruptamente en cualquier momento. En ese caso, a todos se les muestra una pantalla de cancelación indicando que el administrador canceló la sesión.

Todos los jugadores también tienen acceso a un botón de “irme de la partida”. Si lo oprimen, salen de la partida y ya, no hay más lógica detrás de esa acción. Tal vez se les lleva a una pantalla que indique que salieron, con un botón para volver al inicio o algo así.

Desconexión y reingreso

Los jugadores pueden desconectarse temporalmente por error. Esto entra más en la arquitectura del juego, y gran parte ya está construido y decidido en el código, pero es importante dejar explícita la regla: se le da al usuario un período de gracia para reconectarse.

Si pierde brevemente la conexión, por un problema de red o porque cerró la ventana por error, puede volver dentro de ese período de gracia y continuar como si nada.

Si pasa suficiente tiempo y ya se considera que dejó el juego, entonces depende de las reglas del juego si puede volver a ingresar.

El jugador puede intentar entrar otra vez usando el mismo link o código, aunque la sesión ya esté en curso. Para alguien que ya había ingresado a esa sesión, el link y el código siguen siendo válidos:

- Se busca la sesión activa.

- Se consulta al juego si permite el reingreso de ese jugador.

- Si lo permite, vuelve a ingresar.

- Si no lo permite, se le indica al usuario.

Esto aplica para los jugadores que ya eran parte de la sesión y se salieron después de que comenzó. Para los demás, debe aparecer un mensaje como “no puedes unirte porque esta sesión ya no existe o ya empezó”.

Entonces hay una diferencia entre reconectarse dentro del período de gracia y volver después de que ya se considera que el jugador abandonó. En el segundo caso, la posibilidad de reingreso depende del juego.

Final de la sesión

Los jugadores pueden salir en cualquier momento, el administrador puede cancelar la sesión en cualquier momento y el juego puede terminarla de acuerdo con sus propias reglas.

Cuando el juego determina que terminó, puede mostrar una pantalla final. Esa pantalla la implementa el propio juego y puede incluir resultados, quién ganó, quién perdió o lo que corresponda.

La pantalla final permanece visible y aparece un botón para volver al inicio. El usuario puede quedarse ahí todo el tiempo que quiera; no se le saca automáticamente.

En ese punto ya no hay conexión de WebSocket. Simplemente queda el último renderizado, correspondiente a la pantalla final, hasta que el usuario decida salir o volver a la pantalla inicial.

Resultados y persistencia

Los juegos normales no tienen persistencia ni un contrato lógico con la plataforma sobre sus resultados. Cada juego define sus propios conceptos y qué quiere mostrar.

Por eso la pantalla final y la puntuación dependen del juego. Si tiene ganadores y perdedores, el propio juego define cómo mostrarlos. Lo que quiera mostrar al final es lo que se muestra.

Hay una excepción que voy a especificar en la sección académica: los juegos del plan académico sí tendrán una especie de contrato para que la plataforma reciba las notas o resultados.

La idea es que los juegos académicos sí o sí produzcan notas, y esas notas deben seguir un contrato que permita a la plataforma leerlas. Para los juegos normales no existe ese requisito.

La sesión tampoco tiene persistencia: cuando termina, hasta ahí llegó. El sistema guarda un historial de baja precisión para el replay, pero eso es historial, no persistencia del juego.

Funcionamiento del juego y arquitectura existente

La arquitectura de los juegos ya está definida y funciona mediante comandos y/o samples:

- Comandos: Son operaciones de tipo request/reply, ideales para eventos discretos, como seleccionar una carta o mover una ficha en un juego de mesa.

- Samples: Son para movimientos o eventos continuos. Se envía un mensaje cada cierto tiempo con el estado actual de lo que el usuario está presionando.

El frontend solo envía instrucciones sobre lo que está haciendo el usuario. El estado que envía es el de su actividad, por ejemplo, qué tecla está oprimiendo. El backend, el servidor, es el autoritativo: toma esos datos y determina el estado del jugador.

Los juegos también tienen el concepto de update, que permite implementar procesamiento continuo sin necesidad de estar recibiendo input.

La mayoría de esta parte ya existe en el código y creo que se puede conservar tal como está. No queremos cambiar la arquitectura básica de los mensajes, las proyecciones de las vistas y el funcionamiento del juego, salvo tal vez lo que se necesite para la parte académica.

Lo que sí queremos terminar de definir, corregir o completar es la parte de los SDK, las herramientas que ofrecemos para desarrollar juegos y el flujo de creación de juegos.

En esta sección quería dejar clara la experiencia y también que las capacidades y el funcionamiento del juego ya están mayoritariamente bien en el código. Lo que puede necesitar más trabajo es cómo se crean los juegos, los SDK y todo ese flujo de creación.

### Flujos con cuenta normal

#### Crear sesion

Pantalla de entrada: Ver juego.

Se puede llegar a esa pantalla desde Discovery o desde “mis juegos”, cuando es un juego propio de la cuenta. Lo importante es que la sesión se crea desde la pantalla del juego que se quiere jugar.

Para crear una sesión se requiere una cuenta existente y aplica todo el tema de límites ya explicado.

- PANTALLA: Ver juego.

- Aparece un botón como “crear sesión”, “iniciar sesión” o “crear un cuarto”.

- El usuario oprime ese botón y se crea la sesión.

- PANTALLA: Lobby.

- Al creador de la sesión se le muestra:

  - El link que puede compartir, con una indicación de que debe enviarlo a las personas que quiere que se unan.

  - El código de acceso por separado, por si prefiere compartir solamente el código.

  - La lista de jugadores conectados, que se va actualizando a medida que se unen.

El link y el código sirven para lo mismo: permitir que otras personas se unan a la sesión.

Acá hay algo importante: el creador puede escoger entre unirse como jugador o quedarse solamente como administrador.

- Solo administrador: No juega, pero puede ver la partida desde la perspectiva de cada jugador, es decir, ver lo que cada uno está viendo.

- Jugador: Participa como un jugador normal, con su propia vista y sin poder cambiar a la perspectiva de otros jugadores. La diferencia es que, como creador, conserva la posibilidad de cancelar la sesión.

- En el lobby, el creador tiene las opciones de iniciar la sesión o cancelarla.

- El botón de iniciar solo se habilita cuando se cumplen las condiciones necesarias para empezar.

  - Cada juego especifica sus constraints o restricciones sobre el número de jugadores necesarios.

  - Cuando se alcanza el mínimo de jugadores requerido y se cumplen las condiciones, se habilita el botón.

- El botón de cancelar se puede oprimir en cualquier momento.

- Si el creador cancela:

  - Se muestra que la sesión fue cancelada, ya sea en la misma pantalla o en una pantalla aparte.

  - Aparece un botón para volver a la pantalla de inicio o algo así.

  - A los jugadores que ya se habían conectado se les informa que el creador canceló la sesión. Se les deja en la pantalla de lobby con ese mensaje y un botón para volver.

- Si el creador oprime iniciar cuando el botón está habilitado, se pasa a la pantalla de juego. Esa parte la voy a describir en un flujo separado de iniciar sesión.

BTW, todavía no he decidido cómo se escoge si el creador participa como jugador o se queda solo como administrador, ni cuál debería ser la opción por defecto. Eso lo podemos decidir juntos, pero tiene que ser muy fácil e intuitivo entender qué significa cada opción y cuál quiere escoger.

Una alternativa es pedir esa elección antes de crear el cuarto. En ese caso, en lugar de crearlo inmediatamente al oprimir “crear sesión”, se muestra una pequeña pantalla con las dos opciones:

- Crear la sesión como administrador: podrá ver la partida, pero no jugar.

- Crear la sesión como jugador: podrá participar en el juego.

El usuario tendría que escoger una y continuar; solo entonces se crea la sesión y se le lleva al lobby.

Esta alternativa incluso me parece que podría tener más sentido, pero todavía no está decidida.

#### Iniciar sesion

Pantalla de entrada: Lobby de una sesión creada.

- Cuando se alcanza el mínimo de jugadores requerido por las restricciones del juego, se habilita el botón de iniciar sesión.

- El creador oprime el botón.

- PANTALLA: Juego en curso.

- Se muestra el juego, renderizado con la relación de aspecto correspondiente.

- Los jugadores ven su propia perspectiva del juego y tienen acceso a la lista de jugadores actuales, con información de quiénes están activos, quiénes se fueron, etc.

Para el creador, lo que aparece depende de si decidió participar como jugador o quedarse solamente como administrador:

- Si se unió como jugador: Tiene la misma vista que cualquier otro jugador, correspondiente a su propio jugador, y la misma lista de participantes y sus estados. El único botón adicional que tiene es el de cancelar la sesión, que está disponible en todo momento.

- Si se quedó como administrador: También ve la pantalla del juego y tiene el botón de cancelar, pero además cuenta con una lista administrativa de jugadores fuera de la pantalla del juego. Esta es distinta de la lista de jugadores a la que todos tienen acceso y sirve para escoger qué perspectiva está viendo.

En esa lista administrativa hay un jugador seleccionado por defecto, cuya vista se muestra inicialmente. El administrador puede oprimir a otro jugador y la pantalla pasa a mostrar la perspectiva del jugador seleccionado.

Cancelar la sesión significa terminar abruptamente.

#### Cancelar session (host)

Este flujo ya se explicó indirectamente en las secciones anteriores.

Pantallas de entrada: Lobby | Sesión en curso.

El creador puede cancelar la sesión en cualquier momento, tanto si se quedó solamente como administrador como si decidió participar como jugador.

- El creador oprime el botón de cancelar sesión.

- Tal vez se le pide confirmación para evitar que la cancele por error.

- Si confirma, se cancela la sesión.

- Todos reciben en sus pantallas el mensaje de que la sesión fue cancelada por el administrador.

#### Echar a jugador de sesión (host)

Pantalla de entrada: Vista de administrador de la sesión.

Esta funcionalidad no la había contemplado antes, pero me parece importante. El creador puede echar jugadores solamente si decidió quedarse como administrador. Si se unió como jugador, no tiene acceso a esta opción.

La idea es que, si el administrador ve que alguien está haciendo trampa o algo que considere motivo para sacarlo, pueda hacerlo desde la lista dinámica de jugadores.

- En la lista de jugadores de la vista administrativa aparece un botón o un menú de opciones para echar a un jugador.

- El administrador selecciona esa opción sobre el jugador que quiere sacar. Puede hacerlo en cualquier momento y sobre cualquier jugador.

- Se comunica la expulsión al backend.

- Al juego se le envía el evento de salida del jugador para que procese la lógica correspondiente.

- El jugador expulsado recibe en su pantalla un mensaje como “el administrador de la sesión te sacó de la sesión”.

La salida puede implicar que el juego ya no pueda continuar. Eso lo procesa el propio juego de acuerdo con sus reglas, y es algo que el administrador tiene que considerar al echar a alguien.

BTW, se me ocurre que tal vez podríamos simular en el backend qué pasaría antes de sacar al jugador. La idea sería ejecutar una simulación para saber si la sesión seguiría en curso o si el resultado del script sería terminarla o cancelarla.

Si se pudiera hacer, podríamos indicarle al administrador algo como “si sacas a este jugador, ya no habrá suficientes jugadores y la sesión terminará”, para que decida con esa información.

Pero no sé qué tan fácil sea con la arquitectura actual. El sandbox que ejecuta el script del backend tiene su propio estado, así que no creo que podamos simularlo directamente. La única opción que se me ocurre sería que el script recibiera una indicación de si la ejecución es simulada o no, y que en una simulación no actualizara su estado. Eso me parece riesgoso y no sé si valga la pena.

Esa parte es solo una idea y no es necesaria. Podemos simplemente considerar que el administrador debe saber qué está haciendo y que sacar a un jugador puede terminar la partida.

También es importante que el backend distinga entre un jugador que salió voluntariamente y uno que fue expulsado.

Si un jugador expulsado intenta volver usando el mismo link o código, la plataforma no le permite ingresar. Ni siquiera se consulta al script del juego para evaluar el reingreso: se rechaza directamente porque fue echado de esa sesión.

Esa es la diferencia respecto a una salida normal, donde el reingreso puede depender de las reglas del juego.

#### Crear juego

Este probablemente es el flujo más complejo de toda la plataforma. Aunque ya hay una versión implementada en el código, me parece importante analizarla con base en todo lo que se describe acá y revisar si cumple con lo que esperamos.

Pantallas de entrada y juegos como plantillas

Un juego publicado puede estar marcado como disponible para usarse como plantilla. Si tiene esa opción habilitada, en su pantalla aparece un botón como “crear un juego usando esto como plantilla”.

En Discovery también debe existir un filtro para encontrar juegos que estén disponibles como plantillas. Así, el usuario puede buscar uno, abrirlo y desde su pantalla empezar a crear un juego basado en él.

Otro punto de entrada es la pantalla principal de la plataforma. Ahí debe estar muy visible el botón de crear un juego, tal vez en la barra superior. En la aplicación podría ser algo parecido al botón de añadir que tienen Instagram o TikTok en el centro de la parte inferior: un botón que intuitivamente se entiende como crear o subir contenido, que en nuestro caso sería crear un juego.

También se puede entrar desde perfil, en “mis juegos”, donde aparece la lista de juegos de la cuenta y la opción de crear uno nuevo cuando haya capacidad.

Es importante que “crear juego” y “mis juegos” sean fáciles de encontrar. Al principio, probablemente muchos usuarios crearán juegos privados que no aparecerán en Discovery. Lo que van a querer es entrar a sus juegos, iniciar una sesión y compartirla.

Podríamos tener al menos el botón de crear en la barra superior y, tal vez, también “mis juegos”. O “mis juegos” puede quedar dentro del perfil. Esa navegación todavía la podemos pensar mejor.

Límites de creación y consumo de IA

Acá hay que diferenciar los límites de los juegos de los créditos para usar nuestra IA. No son lo mismo.

Por un lado, están las reglas sobre los juegos que puede tener o crear una cuenta:

- Cuántos juegos puede tener al mismo tiempo.

- Cuántos pueden ser públicos o estar disponibles para jugar.

- Cuántos juegos puede crear dentro de una ventana de tiempo.

Por otro lado, está la cantidad de créditos que tiene para usar el flujo de IA de la plataforma.

Por ejemplo, puede que una cuenta gratuita tenga muy pocos créditos de IA por el cálculo del presupuesto, pero que tenga permitido mantener tres juegos y crear un juego al mes. Son límites distintos.

Además, tener un máximo de juegos simultáneos no reemplaza el límite de creación por ventana. Si permitimos tener tres juegos, eso no significa que el usuario pueda eliminar uno y crear otro todos los días sin límite.

Los borradores también ocupan cupo. Desde que se crea un borrador, ya cuenta como un juego que eventualmente se va a terminar.

Si el usuario llega al máximo de juegos que puede tener, se le indica que puede eliminar uno, pagar una microtransacción o acceder a una suscripción que amplíe su capacidad. Si el límite que alcanzó es el de creación dentro de una ventana de tiempo, eliminar un juego no resuelve eso; las opciones de pago serían una microtransacción o una suscripción.

Formas de crear un juego

Vamos a soportar tres formas de creación, todas mediante IA:

- Usar una IA externa que pueda realizar directamente las operaciones de escritura.

- Usar una IA externa que solo pueda leer y conversar, mientras el usuario realiza las escrituras copiando y pegando lo que ella le indique.

- Usar la IA integrada de la plataforma, que es la opción ideal, pero tiene costos y limitaciones de consumo.

Las dos primeras permiten crear sin consumir la IA de la plataforma, por ejemplo para las cuentas gratuitas. Pero no necesariamente deben mostrarse como dos opciones distintas. Pueden ser un mismo mecanismo de “usa tu propia IA”, donde se genera un enlace y la IA externa identifica sus capacidades y guía al usuario según lo que pueda hacer.

Enlace para trabajar con una IA externa

Vamos a exponer un MCP server y también endpoints que una IA pueda usar directamente mediante llamadas HTTP.

La idea es darle al usuario un enlace y decirle algo como “pásale este enlace a tu IA y ella se encarga de guiarte”.

Cuando la IA abre el enlace mediante un GET, encuentra el contexto, las instrucciones, las herramientas disponibles y cómo utilizarlas. La propia página le explica cómo consultar información y realizar operaciones, incluyendo las URLs y los parámetros necesarios.

También se le indica que debe identificar si tiene capacidad de escritura: si puede realizar las llamadas HTTP necesarias o usar las herramientas disponibles.

- Si puede escribir, se encarga directamente del proceso.

- Si no puede, le explica al usuario que ella preparará los textos y comandos, pero que él tendrá que ejecutar las operaciones de escritura.

A partir de ahí, la IA se adueña del proceso y empieza a conversar con el usuario: qué juego tiene en mente, cómo quiere que funcione, si quiere partir de una plantilla, etc.

Incluso si el usuario no empezó desde el botón de usar una plantilla, puede pasarle a la IA el enlace de un juego de la plataforma. Esa URL contiene el identificador del juego, así que la IA puede identificar cuál quiere usar como plantilla. También puede decidir con el usuario que van a crear desde cero.

La IA debe entender el proceso de creación y saber qué preguntas hacer para guiarlo.

Acceso limitado al borrador

El enlace generado contiene un identificador único del borrador. Ese identificador permite acceder a las operaciones sobre ese borrador, pero no a información del usuario ni a operaciones por fuera de ese juego.

Esto es importante porque sé que es delicado que solo con ese identificador se obtengan permisos. La idea es que el acceso quede limitado al borrador.

Una posibilidad es que el enlace tenga caducidad. Cuando expire, la IA le indica al usuario que debe volver a la plataforma, oprimir un botón de reanudar y compartirle un nuevo enlace. No está definido todavía si será caducable o no, pero ese identificador es el que da acceso.

La documentación del propio enlace debe explicar cómo construir las URLs. Así, si caduca, la IA puede decirle exactamente a qué pantalla ir para reanudar, en lugar de obligarlo a buscarla.

Lo mismo aplica a las operaciones manuales: la IA sabe que una URL se forma con el dominio, cierto path y el identificador del borrador o del recurso. Entonces construye el enlace y se lo entrega al usuario.

Cuando la IA no puede escribir

No quiero que el usuario tenga que entender una interfaz compleja ni aprender dónde se sube cada cosa. La IA debe decirle algo como:

“Ve a este enlace y pega este texto”.

El usuario abre la pantalla, copia, pega y envía. Después le dice a la IA que ya lo hizo.

No debería tener que copiarle de vuelta los resultados. No quiero una dinámica de “ya pegué el script, acá está el resultado que me mostró la plataforma”. Basta con “ya lo pegué”, porque la IA puede volver a leer el estado del borrador y consultar lo que ocurrió.

La herramienta debe permitir leer:

- El estado actual del proyecto.

- Las operaciones realizadas.

- Los scripts actuales.

- Los resultados de las operaciones.

- Los resultados de las simulaciones.

- La demás información necesaria para continuar.

No es solamente una página de documentación estática. Es una herramienta de lectura con datos dinámicos del borrador sobre el que se está trabajando.

Así, aunque la IA solo pueda leer, puede verificar que el usuario pegó lo correcto, revisar el resultado y decidir el siguiente paso. El usuario solo sirve como intermediario para ejecutar las escrituras.

Operaciones de escritura

Las escrituras que tengo en mente son principalmente:

- Script de frontend.

- Script de backend.

- Script compartido, que creo que existe.

- Assets.

- Simulaciones, porque requieren enviar un input y ejecutar algo.

Los scripts y assets serían los dos grandes grupos de contenido. Aparte de esas operaciones y la ejecución de simulaciones, lo demás sería lectura.

Para los scripts, la IA puede proporcionar el archivo completo o un comando para modificar una parte específica. Me gustaría que no siempre tuviera que reemplazarse todo el script.

Cuando la IA está integrada directamente, editar por partes es más sencillo. Para hacerlo a través del usuario, podemos tener un formato de texto que represente el cambio: qué líneas o qué parte se modifica, etc. El usuario lo copia y pega sin tener que editar código manualmente.

Incluso pensaba que ese texto no necesita ser legible para el usuario. Podría estar en algún formato codificado, hexadecimal, bytes o algo así. No tengo definido cuál, pero la idea es que el usuario ni siquiera se preocupe por entenderlo. Solo sabe que tiene que copiarlo, pegarlo y enviarlo.

Después la IA consulta el resultado por lectura y verifica si ocurrió lo esperado.

Simulaciones y pruebas

La IA debe poder preparar simulaciones con inputs a lo largo del tiempo: un jugador hizo esta acción, otro envió este input, se enviaron estos samples, etc.

Con eso puede revisar:

- A qué estado llegó el juego.

- Si el estado global resultante es el esperado.

- Si el escenario se ejecutó correctamente.

- Si todo fluyó como debía.

Si la IA puede escribir, envía directamente el plan de prueba. Si no puede, le pasa al usuario un enlace y el texto que debe pegar para ejecutarlo.

El usuario no tiene que entender ese plan. Puede ser código o cualquier formato que definamos; solo lo copia, lo pega, lo ejecuta y le dice a la IA que ya lo hizo.

La IA vuelve a consultar los resultados de simulación, verifica que se ejecutó y analiza el resultado. El usuario no tiene que transmitirle nada de eso.

Renders y revisión visual

También queremos que la IA pueda generar renders de cómo está quedando el juego y mostrárselos al usuario para que opine sobre el diseño.

Esto puede funcionar como una simulación que llega a cierto punto y toma un screenshot. La razón para hacerlo mediante simulación es poder ver distintos escenarios y las perspectivas de distintos jugadores.

La plataforma renderiza el frontend en ese estado, toma la imagen y la sube temporalmente a una URL.

- Si la IA puede escribir, manda el comando, recibe la URL y se la comparte al usuario para que vea el render y diga qué quiere cambiar.

- Si no puede escribir, le pasa el enlace y el texto para ejecutar la simulación. En esa misma pantalla podemos mostrar el render resultante, para que el usuario lo vea sin pasos adicionales y luego vuelva al chat a comentar qué opina.

SDK, documentación y consumo de tokens

El SDK y las herramientas de creación son fundamentales. Desde el enlace, la IA debe poder explorar tanto la documentación como las operaciones disponibles y el estado del juego que está editando.

La idea es que crear un juego requiera la menor cantidad posible de tokens, manteniendo una buena calidad, creatividad y dinamismo. No se trata de ahorrar tokens simplemente limitando lo que puede ser el juego.

También queremos reducir las iteraciones, simulaciones y pruebas necesarias. Para eso necesitamos un SDK potente y operaciones claras.

La documentación tiene que ser explorativa e indexable. No queremos que la IA lea todo de golpe, porque el SDK puede terminar siendo grande y complejo. Debe empezar con una introducción o índice que le permita entender qué existe y luego consultar solamente lo que necesita.

La IA tiene que saber cómo navegar hacia la información relevante, sin gastar todo el contexto en aprender funciones que no va a usar.

En cuanto a lógica, podemos ofrecer funcionalidades que abstraigan cosas compartidas por muchos juegos:

- Movimiento espacial.

- Lanzamiento de objetos.

- Colisiones.

- Cartas.

- Movimiento de fichas.

- Tableros.

- Otras operaciones que permitan construir distintos tipos de juego.

Por ejemplo, la IA podría combinar movimiento espacial y colisiones, añadir unas reglas propias y crear un juego de carreras. Después podría conectar la funcionalidad de lanzamiento con el movimiento de un objeto y convertirlo en un juego de carros con disparos.

La idea es que pueda armar mucho a partir del SDK y escribir la menor cantidad posible de código propio. Eso debería hacer el proceso más rápido y fiable, porque las partes del SDK ya sabemos que funcionan y es más probable que el juego salga bien.

Si la IA determina que el SDK no le sirve y necesita implementar algo desde cero, también puede hacerlo. No queremos limitar los juegos a lo que nuestra librería tenga disponible, pero sí incentivar que use lo existente antes de implementarlo por su cuenta.

Frontend, animaciones y calidad visual

Le estoy diciendo SDK, pero pueden ser varias librerías o herramientas distintas. Una parte cubre la lógica del juego y otra tiene que cubrir mucho del frontend.

La interfaz es probablemente de lo más importante porque es lo que el usuario ve. Un juego atractivo tiene que verse atractivo.

Por ejemplo, para un juego de cartas, la IA no debería tener que diseñar cada carta desde cero. Podemos ofrecer componentes que pueda combinar y adaptar, y eso también nos da cierto control sobre la calidad visual.

No son solamente vistas, sino también animaciones y efectos:

- Movimiento y transiciones.

- Cartas que se voltean, se doblan o se lanzan.

- Explosiones.

- Colisiones.

- Otros efectos visuales.

También queremos sonido, aunque eso lo desarrollo en la parte de assets.

El juego debe sentirse fluido, dinámico y de calidad. No basta con que el sistema del juego funcione: todo entra por los ojos, y aunque esté hecho con IA tiene que sentirse bien construido.

El problema es que una IA externa puede ser barata o tener poca capacidad. Aunque le demos documentación y herramientas, puede que no sepa aprovecharlas bien. Lo que esperamos es que esas IAs puedan apoyarse más en el SDK y aun así obtener buenos resultados.

Si una IA tiene capacidad para hacerlo por su cuenta, perfecto. Pero la herramienta o el MCP server también debería darle orientación de diseño, de enfoque y de identidad visual. No necesariamente reglas obligatorias, sino pautas para que los juegos mantengan una apariencia profesional.

IA integrada de la plataforma

La otra opción es usar nuestro propio chat, integrado con una IA.

Como mencioné en otra parte del documento, no sé exactamente cómo conviene construir esa integración. Puede ser una IA conversacional que analiza lo que quiere el usuario y usa otra IA de código por detrás, o alguna otra organización. Esa decisión queda por definir.

Lo que ofrecemos al usuario es básicamente la misma experiencia que tendría con una IA externa capaz de escribir: conversa, responde preguntas, afina lo que quiere y la IA hace las operaciones por detrás.

Al ser nuestra integración, tenemos el beneficio de controlar el proceso para que siga lo que esperamos. También tenemos que medir el consumo y aplicar los límites correspondientes.

Esta IA integrada forma parte de la fase 1.

Catálogo de plantillas e investigación de la IA

Además de que un juego pueda estar disponible como plantilla, quiero que la plataforma tenga un catálogo de plantillas recomendadas por nosotros.

Como administrador, puedo subir juegos genéricos pensados principalmente como plantillas, que sean públicos y aparezcan en Discovery. Además de marcarlos como reutilizables, puedo marcarlos internamente como ideales para usar como plantilla, para que tengan prioridad sobre los demás.

Por ejemplo, juegos genéricos de carreras, disparos, cartas, etc.

La IA puede consultar esas plantillas incluso si el usuario no le pidió explícitamente partir de una. Puede revisar si alguna le sirve antes de crear todo desde cero.

Usar una plantilla significa tener acceso al código y modificarlo. No tiene que limitarse a una sola: puede tomar partes de varios juegos y combinarlas en su propio juego.

Este catálogo no es información quemada. Son juegos que subimos y marcamos desde la plataforma, y quiero poder administrar esa selección desde la herramienta de admin.

Tampoco quiero terminar con mil juegos marcados como ideales, porque esos son los que siempre se van a presentar como referencia inicial y sería demasiado contexto para la IA. Quiero poder controlar esa selección y organizar las plantillas por categorías.

Después de revisar las plantillas recomendadas, la IA también puede explorar las demás plantillas de la plataforma mediante una herramienta de Discovery.

Debe tener acceso a un filtrado similar al que ofrecemos al usuario:

- Buscar por palabras.

- Buscar por tags.

- Consultar listados de juegos.

- Abrir sus descripciones.

- Ver sus imágenes o screenshots publicados.

- Consultar el código de los juegos disponibles como plantilla.

Así puede investigar y decidir qué reutilizar.

Pero tenemos que limitar cuánto se dedica a investigar, sobre todo con nuestra IA integrada. La idea es optimizar también la experiencia de las IAs externas para que el proceso sea rápido y no gasten horas buscando contexto, aunque ese consumo dependa del usuario.

Para nuestra IA, idealmente revisaría las plantillas de la plataforma y, si ninguna sirve, tal vez haría una búsqueda adicional. Si tampoco encuentra algo útil, continúa con la creación. No queremos que pruebe mil tags y combinaciones y gaste demasiado tiempo y tokens investigando.

Imágenes del juego para publicación

Cuando el juego está listo para publicarse, además de los scripts compilables y el juego funcionando, necesita nombre e imágenes para mostrarse en la búsqueda.

La imagen principal o logo puede subirla el usuario. Si no lo hace, la propia plataforma la obtiene mediante un render del juego.

Las imágenes de descripción, que sirven como ejemplos de cómo se ve el juego, siempre se obtienen mediante renders. La única imagen que el usuario puede subir libremente para esa presentación es la principal.

La IA puede definir momentos de simulación que quiera usar para tomar screenshots. La plataforma ejecuta la simulación, toma la imagen en el punto indicado y la recorta para usarla donde corresponda.

Con nuestra IA integrada esto será obligatorio: debe preparar simulaciones que permitan obtener al menos tres screenshots del juego para la parte de imágenes de descripción.

Con una IA externa no tenemos el mismo control. Puede solicitar esos screenshots, pero no podemos garantizar que prepare correctamente todo el proceso.

En el peor caso, la plataforma puede intentar ejecutar un flujo y obtener imágenes. Si no se puede hacer una simulación adecuada, usamos el render inicial de la interfaz como imagen principal y no añadimos imágenes de descripción.

Entonces la idea final sería:

- Si el usuario sube una imagen principal, usamos esa.

- Si no la sube y la IA define un momento para obtenerla, tomamos el screenshot de ese momento.

- Si no hay una selección preparada por la IA, usamos el render inicial como imagen principal.

- Las imágenes de descripción se generan a partir de simulaciones preparadas para eso. Con nuestra IA integrada se requieren al menos tres; con una externa pueden no estar disponibles.

Assets y contenido privado

Los assets son muy importantes, porque por más que el frontend tenga código y componentes bonitos, sin ellos se puede perder mucho de lo que queremos lograr.

Como los usuarios pueden subir sus propias imágenes, debemos preguntarles obligatoriamente si el juego contiene imágenes o información privada. Si indican que sí, ese juego no puede publicarse como público.

Puede seguir usándose para crear sesiones y jugar, pero no estará disponible en Discovery.

En cuanto a tipos de assets, tengo en mente audio e imágenes, incluyendo animaciones. Para lo visual, quiero priorizar lo que se pueda generar mediante código:

- SVG.

- Lottie files, que creo que son animaciones vectoriales mediante JSON.

- Si eso no sirve para lo que se necesita, imágenes como PNG y sprites.

Estos son los tipos que conozco; puede haber otros que también nos sirvan.

Audio y efectos de sonido

Para audio no estoy pensando en generación, sino en ofrecer una librería de música de fondo y efectos de sonido.

Cada música tendría una descripción del estilo y de cómo se siente, para que la IA pueda escoger. Creo que la IA no puede escuchar directamente, así que seleccionaría con base en esas descripciones.

El usuario puede decir que no le gusta y pedir otro tipo de música. También puede subir su propia música o sus efectos de sonido.

Lo mismo aplica a los efectos: correr, chocar, disparar y otras acciones. Queremos una librería amplia para que la IA pueda usar lo disponible sin necesitar que el usuario aporte archivos.

Si el usuario quiere usar algo propio, la IA lo guía para subirlo.

Definición y subida de assets

La idea que tengo es que los assets se definan a través del código del juego. La plataforma toma esas definiciones y crea los registros de assets que luego se subirán a GCP o al storage que decidamos.

Me parece que deberían estar definidos implícitamente por el código: si el código usa un asset, ese asset existe como parte del juego; si no lo usa, no existe. La forma exacta de definirlos todavía la tenemos que decidir.

Para subir el contenido:

- Si la IA tiene capacidad de escritura y puede subir el archivo, lo hace directamente.

- Si no puede, construye un enlace específico para ese asset y se lo pasa al usuario.

Ese enlace contiene el identificador o token del asset. El usuario llega a una pantalla sencilla que ya sabe qué archivo espera, lo sube y listo.

Después le dice a la IA que ya lo hizo, y ella consulta el estado para verificar que el asset quedó subido correctamente.

Para SVG o Lottie, aunque el contenido sea código, se siguen tratando como assets. La IA puede decirle “pega este texto en este enlace”. Para una imagen, le dice “sube esta imagen en este enlace”.

El tipo de archivo esperado podría estar indicado en la URL, pero me parece mejor que ya esté definido en el backend a partir de lo que declaró la IA. Así no dependemos de que el usuario conserve un parámetro en el enlace, porque podría cambiarlo y terminar subiendo un tipo distinto al que se esperaba.

Generación y reutilización de assets visuales

Idealmente, el usuario no debería tener que subir assets para poder crear un juego. La idea es facilitarle el proceso y que subir archivos propios sea una elección o algo necesario para su caso particular.

Por ejemplo, un profesor puede querer subir un diagrama, o alguien puede querer crear un juego para su familia con fotos de sus integrantes. Eso está perfecto, incluso nos sirve, pero no queremos que aportar archivos sea una obligación para todos.

Para la parte generativa, quiero priorizar SVG, Lottie y lo que pueda hacerse mediante código. Si no alcanza, pasamos a imágenes.

También me parece que las imágenes generadas, incluyendo sprites, pueden verse más fácilmente como hechas por IA. Los gráficos vectoriales y las animaciones de Lottie pueden ayudar a mantener una mejor calidad visual.

Podemos tener librerías de:

- Animaciones en Lottie.

- Logos y otros elementos SVG.

- Imágenes de objetos comunes.

- Sprites típicos, como personajes caminando, armas y otros recursos.

La IA puede tomar esos assets, usarlos y, si es posible, modificarlos. No sé qué tan fácil sea modificar algunos de esos formatos, pero es una posibilidad.

También podríamos investigar si la IA puede buscar y descargar recursos de algún sitio externo de Lottie files. Si no se puede o nos complica demasiado, armamos nuestra propia librería y generamos lo que no esté disponible.

Cuando haya que generar, la IA lo hará mediante código o mediante generación de imágenes, según corresponda. Para nuestra integración no sé si convenga tener un agente distinto según el tipo de asset; eso dependerá de cómo organicemos la integración.

La subida sigue el mismo mecanismo: la IA sube directamente si puede, o le da al usuario el enlace y el contenido que debe pegar o cargar. No sé si todas las IAs podrán subir imágenes directamente, pero si no pueden, el usuario hace esa parte.

Capacidades de la IA y costos de los assets

En nuestra IA integrada tenemos que encontrar un buen balance de gastos. Los assets y toda la parte visual pueden terminar siendo de lo que más consumo genere, y por eso las librerías son tan importantes.

Pero tampoco queremos limitar los juegos a contenedores bonitos y transiciones sencillas. Queremos personajes, movimiento y animaciones fluidas, ya sea con SVG, Lottie, imágenes generadas o imágenes del usuario.

Incluso puede haber edición de imágenes proporcionadas por el usuario. Por ejemplo, en un juego familiar donde los personajes se mueven por una casa buscando algo, el usuario sube fotos de los integrantes y la IA les quita el fondo o genera avatares y sprites basados en esas fotos.

Las posibilidades son grandes. Queremos permitirlas, pero con nuestra IA tenemos que manejar bien los costos, los créditos y la capacidad de uso.

Con una IA externa, las capacidades dependen de lo que tenga disponible el usuario. Puede escribir, pero no generar imágenes; o puede generar imágenes, pero no subirlas.

Nuestra herramienta debe explicarle qué se puede hacer y pedirle que guíe al usuario según sus capacidades. Si no puede generar un asset, tiene que decirlo y plantear las opciones: prescindir de ese recurso, dejar el juego sin esas imágenes, pedirle al usuario que lo genere con otra IA o que consiga y suba el archivo.

En ese caso, la IA puede consultar si el asset ya fue subido y si funciona, aunque no pueda generarlo.

Nuestra IA integrada sí debe contemplar generación, pero siempre dentro de los límites de consumo.

Flujo general de creación

Después de toda esta explicación, el flujo que ve el usuario debería ser sencillo:

- El usuario oprime crear juego desde alguno de los puntos de entrada: la pantalla principal, “mis juegos” o un juego disponible como plantilla.

- Se revisa la capacidad para crear el borrador.

  - Si alcanzó el máximo de juegos simultáneos, se le indican las opciones de eliminar un juego, pagar una microtransacción o acceder a una suscripción.

  - Si alcanzó el límite de creación por ventana de tiempo, se le ofrecen las opciones de microtransacción o suscripción.

- Se le pide un nombre para el juego. Ese es el único requisito para crear el borrador.

- El nombre puede ser provisional y cambiarse después. Lo necesitamos como identificador lógico para que el usuario reconozca el juego.

- Se crea el borrador y desde ese momento ocupa un cupo del límite de juegos.

- Se muestra la pantalla para escoger cómo continuar:

  - Usar su propia IA, compartiéndole el enlace generado.

  - Usar el chat integrado de la plataforma.

- La disponibilidad del chat depende de la suscripción y los créditos.

  - Si el usuario tiene suscripción, el chat aparece disponible.

  - Si no tiene suscripción, pero nuestro sistema le asignó créditos, también puede usarlo, indicándole que tiene un cupo limitado. La idea es que se entienda como una prueba o un abrebocas, no como acceso gratuito ilimitado.

- A partir de ahí, la IA guía la creación, hace las preguntas y se encarga de las operaciones, directamente o con la ayuda del usuario para copiar, pegar y subir archivos.

No quiero una pantalla de creación compleja donde el usuario tenga que descubrir dónde subir cada script o asset. Para esas operaciones, la IA le proporciona el enlace específico.

Desde la pantalla normal de gestión del juego sí quiero permitir unas pocas acciones directas:

- Cambiar el nombre.

- Cambiar la descripción.

- Subir o cambiar la imagen principal.

- Cambiar la visibilidad.

- Marcar las otras opciones que sean necesarias.

El resto de las operaciones de creación se hace mediante los enlaces que proporciona la IA.

Pasar de borrador a listo para jugar

El juego comienza como borrador. Solo puede pasar a listo para jugar, es decir, permitir que se creen sesiones, cuando supera los checks correspondientes: scripts compilables y todo lo necesario para ejecutarse.

Además, tiene que marcarse explícitamente como terminado. No basta con que compile; debe haber una acción de “ya quiero considerarlo listo”.

En ese momento se hacen las preguntas necesarias, como si contiene información o imágenes privadas. Solo si no contiene ese tipo de contenido se permite ponerlo público.

Si tiene contenido privado, queda listo para jugar, pero privado. El usuario puede iniciar sesiones y compartirlas, aunque los demás no puedan encontrar el juego en Discovery.

Por ahora no creo que eso represente un problema importante para los usuarios. Tal vez en el futuro crezcamos la parte de perfiles, descubrimiento y popularidad, y haya más incentivo para que los juegos sean públicos y conocidos. Pero por ahora no tenemos ese incentivo tan desarrollado.

Edición y versiones

El usuario puede actualizar el nombre, la descripción y la imagen principal en cualquier momento.

Creo que también debería poder cambiar assets en cualquier momento, porque el juego seguiría siendo el mismo y simplemente se vería o usaría un recurso distinto.

Pero si quiere modificar el juego de una forma que requiere cambios de código, ahí se crea una nueva versión.

No tengo definida la navegación exacta para esa operación. La idea es que el usuario entienda que puede editar, pero que está preparando una nueva versión que solo se lanza cuando esté lista.

No sería cambiar una cosa y hacerla pública inmediatamente. Se prepara el conjunto de cambios y luego se hace un lanzamiento, una vez la nueva versión cumple los checks de compilación, ejecución y lo demás.

Mientras trabaja en esa nueva versión, el usuario puede elegir:

- Dejar el juego no disponible.

- Mantener la versión actual disponible y jugable mientras desarrolla y prueba la siguiente.

Cuando decide lanzar la nueva versión, la anterior deja de ser la versión disponible.

Tal vez también podemos ofrecer un historial de versiones para escoger cuál quiere tener publicada. Así podría tener activa una versión anterior, aunque exista una versión estable y exitosa más reciente.

En general, esto es lo que espero del proceso de creación: que la plataforma ofrezca la mayor cantidad posible de herramientas para facilitarlo y ayudar a conseguir juegos de calidad, estables y visualmente buenos, sin que el usuario tenga que entender toda la complejidad que hay detrás.

BTW, todo lo que mencioné como librerías dinámicas tiene que poder administrarse desde la plataforma de admin.

El SDK de código sí forma parte de la implementación. Pero los catálogos de assets, imágenes, SVG, Lottie files, música, efectos de sonido, categorías y la configuración de juegos como plantillas no deben estar quemados en el código. Todo eso debe poder gestionarse desde admin.

Para esta primera fase quiero que quede preparada tanto la estructura de base de datos como la interfaz administrativa para manejar esas librerías. También quiero que quede definido qué categorías y qué assets esperamos ofrecer en la fase 1.

Este documento se le va a pasar a distintas IAs, y entiendo que la IA que implemente la plataforma probablemente no tenga capacidad para generar todos los recursos. Puede que pueda crear assets mediante código, como SVG, pero no todas las imágenes o animaciones que necesitamos.

Eso no significa que esos recursos deban quedar por fuera. La idea es que la IA decida qué assets necesita la librería para ser suficientemente robusta y deje registrados los que no pueda generar como pendientes de subir por mi parte.

Al terminar la primera fase y entrar a admin, quiero encontrar:

- Los assets que ya se pudieron crear o incorporar.

- Las categorías definidas para la librería.

- Los assets que se consideran necesarios para la fase 1, pero que todavía están pendientes de subir.

Por ejemplo, si se considera necesario tener una animación Lottie de una persona o un gato caminando, se deja creado ese registro, aunque todavía no tenga el archivo. Desde admin debo poder ver que falta y entender qué tengo que conseguir o generar.

Cada registro debe tener nombre, descripción y la información necesaria para saber qué tipo de asset se espera. No basta con mostrar que falta un archivo; tiene que quedar claro qué recurso debo subir ahí.

También quiero poder crear yo mismo esos pendientes. Por ejemplo, entrar a admin, agregar un asset, ponerle nombre y descripción y dejarlo pendiente sin subir todavía el archivo. La próxima vez que entre, debe seguir apareciendo entre los recursos que me faltan por completar.

Entonces el asset puede existir como registro dentro de la librería, pero tener pendiente su contenido. Desde la misma plataforma puedo después subirlo y completar ese recurso.

La idea es que la IA que implemente esto también defina la propuesta de assets para la fase 1, genere o incorpore los que pueda y me deje explícitamente pendientes los demás. De cierta forma, que me obligue a ver qué falta y qué tengo que aportar para completar la librería, en lugar de dejar esa necesidad por fuera del sistema.

BTW, hay una parte adicional del proceso de creación y publicación: un juego no puede volverse público inmediatamente solo porque el usuario lo solicite.

Para aparecer en Discovery tiene que pasar una revisión de contenido. Hay que verificar que no incluya información privada, aunque el usuario ya haya declarado que no la contiene, y revisar contenido sensible, para mayores de 18 años y cosas así.

- El usuario solicita que su juego sea público.

- Se genera una solicitud de publicación.

- Esa solicitud llega al dashboard de administrador como una tarea pendiente de revisión.

- Desde admin reviso el juego y decido qué hacer:

  - Aprobarlo como público.

  - Negar la solicitud con una nota.

  - Si corresponde, banear el juego completamente.

- Si lo apruebo, el juego pasa a ser público y puede encontrarse en Discovery.

- Al usuario le llega una notificación in-app indicando que su juego fue aprobado y ya está disponible públicamente. No creo que sea necesario enviar un correo por esto.

Como administrador no necesito recibir notificaciones de todos los juegos creados. Solo necesito que me llegue la solicitud cuando alguien quiera hacer público su juego. Si crea un juego privado, no tiene por qué generarme una notificación ni una tarea de revisión.

Eso no significa que los juegos privados queden fuera de las herramientas de administración. Desde admin debo poder buscar y gestionar todos los juegos de la plataforma, navegar por los usuarios y entrar a un usuario para ver la lista de sus juegos.

También debo poder subir juegos cuyo owner sea la propia plataforma, como se mencionó anteriormente.

Sobre cualquier usuario o juego debo tener disponibles las operaciones administrativas correspondientes, incluyendo banear o bloquear usuarios, y banear, bloquear o eliminar juegos.

Acá no me interesa definir en detalle la interfaz de esas herramientas. La idea es poder navegar, ver qué hay en la plataforma y actuar sobre los usuarios y los juegos. Pero la notificación y la tarea pendiente de aprobación se generan específicamente por una solicitud de publicación en Discovery.

#### ver mis juegos

Pantalla de entrada: Perfil, con la opción de tener también otro acceso más visible que lleve directamente a “mis juegos”.

Todos pueden ver el botón desde el perfil, pero si el usuario no tiene una cuenta, se le indica que necesita una para tener juegos publicados.

Sería útil tener otro acceso directo porque probablemente muchos usuarios tendrán sus propios juegos y querrán entrar a iniciar sesiones sobre ellos.

- El usuario oprime “ver mis juegos”.

- PANTALLA: Mis juegos.

- Se muestra la lista de juegos que tiene actualmente el usuario.

- Puede buscar por nombre y filtrar por fecha, y tal vez también por tags y categoría. Algunas cuentas podrían tener 100 juegos o más, así que es importante poder encontrarlos fácilmente.

- El usuario oprime uno de sus juegos.

- PANTALLA: Ver juego.

- Se muestran los detalles del juego y la opción de iniciar una sesión. Como el usuario es el creador, también tiene acceso al historial de versiones y a las opciones de edición.

No tengo definido si habrá un botón de “editar juego” que active un modo de edición o si, por ser el dueño, podrá modificar directamente el nombre, la imagen principal y los demás campos desde esa misma pantalla. Para crear una nueva versión, sí tendría que ir a la parte de gestión de versiones del juego.

BTW, esto también aplica si el juego es público y el usuario llega a él desde Discovery. Al detectar que es el owner, se le muestran las opciones correspondientes: historial de versiones, edición y demás información de gestión.

No es una pantalla distinta según si llegó desde Discovery o desde “mis juegos”. Es la misma pantalla de ver juego, con permisos y opciones distintos porque el usuario es su dueño.

#### Editar juego

Pantalla de entrada: Ver juego, cuando el usuario es el owner.

Este flujo ya se mencionó anteriormente. Desde la pantalla del juego, el dueño puede editar directamente la imagen principal, el nombre y la descripción.

Para modificar el juego como tal, se trabaja mediante versiones:

- El usuario accede a la gestión de versiones y escoge crear una nueva versión.

- Se le indica que va a trabajar sobre una nueva versión de su juego, sin afectar la versión actualmente publicada.

- Se vuelve a la parte de construcción del juego.

- Se le proporciona el enlace para trabajar con su propia IA o acceso al chat integrado, dependiendo de su plan.

- El usuario continúa el proceso de construcción con la IA, haciendo los cambios sobre esa nueva versión.

- Los cambios no reemplazan inmediatamente la versión publicada. Para hacerlo, tiene que cambiar explícitamente cuál versión queda publicada.

Desde la gestión de versiones puede navegar entre ellas en cualquier momento. Así, editar el juego implica preparar una nueva versión y después decidir cuándo pasar a usarla.

#### Ver mis sesiones hosteadas

Pantalla de entrada: Perfil.

Podemos tener dos botones separados, “historial de sesiones jugadas” e “historial de sesiones hosteadas”, o un solo botón de “historial de sesiones” que lleve a una pantalla donde se pueda cambiar entre las que el usuario hosteó y aquellas en las que participó solamente como jugador.

- El usuario entra al historial y selecciona las sesiones que hosteó.

- Se muestra la lista de esas sesiones.

- Puede filtrar por fecha, por juego y por los demás filtros que correspondan, además de agrupar por juego, como en el historial de sesiones jugadas.

- El usuario abre una sesión.

- PANTALLA: Ver sesión hosteada.

- Desde ahí puede reproducir el replay de baja precisión y ver cómo se desarrolló el juego.

- También puede reportar que hubo un problema, como ya se explicó en el flujo de ver una sesión jugada.

BTW, acá quiero aclarar los permisos para ver las perspectivas en el replay. No recuerdo exactamente cómo quedó definido antes, así que esto puede implicar ajustar esa parte:

- Si participaste solamente como jugador, puedes reproducir únicamente tu propia vista del juego.

- Si fuiste el creador o administrador de la sesión, puedes reproducir la vista de cualquier jugador, incluso si decidiste participar como jugador.

Es decir, si el creador se unió como jugador, durante la partida no puede acceder a las perspectivas de los demás, pero una vez está consultando el historial sí puede hacerlo.

#### Reportar error de sesion host

Pantallas de entrada: Durante la sesión como host | Historial de sesiones hosteadas.

El host puede reportar un error en cualquier momento del flujo de su sesión, tanto durante esta como después, desde el historial. Por ejemplo, si el enlace no permite que otras personas se unan o si cualquier otra cosa está fallando.

- El host oprime la opción de reportar un error.

- Se continúa con el flujo de reporte correspondiente.

- El reporte queda identificado como un error reportado desde el rol de host y vinculado con la sesión desde la cual se inició.

#### Reportar error creacion de juego

Pantalla de entrada: Creación de juego, ya sea desde la plataforma o mediante las herramientas que usa la IA.

El reporte lo puede hacer el usuario o la IA que lo está ayudando a crear el juego.

Por ejemplo, el usuario puede reportar que el chat integrado está fallando o que el enlace generado por la plataforma no le funciona a su IA.

- El usuario encuentra un error durante la creación y accede a la opción de reportarlo.

- Se continúa con el flujo de reporte correspondiente.

- El reporte queda vinculado con el juego que está creando, que ya existe en la base de datos aunque todavía sea un borrador.

La IA también debe tener acceso a las operaciones de reporte:

- Si puede realizar escrituras, genera el reporte directamente.

- Si no puede escribir, le indica al usuario que vaya a un enlace y pegue el texto que le proporciona, como en las demás operaciones de creación. Eso genera el reporte del error que la IA está encontrando.

BTW, sobre el concepto de reporte

Quiero aprovechar esta sección para resaltar algo: los reportes deben ser operational aware, es decir, deben conocer el contexto de la operación a la que corresponden.

No todos pueden tratarse como reportes generales. Sí existen reportes generales de la plataforma que no están vinculados a ninguna entidad específica, pero ese es solamente un tipo de reporte.

El dominio de reportes tiene más complejidad. Dependiendo del tipo, el reporte tiene su propia entidad, atributos, valores requeridos y relaciones. Por ejemplo:

- Un reporte de creación de juego debe estar vinculado sí o sí con el juego que se está creando.

- Un reporte de sesión se relaciona con la sesión correspondiente.

- Un reporte de contenido inapropiado tiene sus propios datos y relaciones con el contenido reportado.

- Otros reportes pueden estar asociados con operaciones o eventos específicos.

No estoy pensando simplemente en una tabla genérica de reportes que tenga un campo con el identificador de cualquier entidad. Desde el sistema, el reporte debe representar el tipo de problema y su relación con un dominio o una operación concreta.

Más adelante hablaremos de esto en la arquitectura. Los dominios siguen separados, pero los reportes mantienen referencias a las entidades lógicas correspondientes mediante sus identificadores exportables.

Siempre que sea posible, el tipo de reporte debe vincularse con la entidad sobre la que trata. Las categorías concretas y sus diferencias lógicas quedan por definir.

Visibilidad y atención desde admin

Desde la plataforma de administrador necesito mucha visibilidad sobre los reportes, especialmente sobre los que requieren atención prioritaria.

La herramienta debe permitir consultar y filtrar por tipo de reporte, ver con qué entidad está relacionado y navegar a esa información. Si recibo un reporte sobre un juego, una sesión o una operación, debo poder conectar el problema con su contexto desde admin.

Los reportes tendrán distintas prioridades según su tipo y lo que se haya reportado.

Por ejemplo, un reporte de contenido inapropiado debería revisarse inmediatamente. Podríamos considerar suspender temporalmente el juego hasta que yo decida qué hacer, pero eso también es delicado porque alguien podría hacer una acusación falsa. No está decidido cómo manejarlo.

Si no vamos a tomar medidas automáticas antes de la revisión del administrador, por lo menos las notificaciones deben llegarme claramente para que pueda actuar.

Cuando un reporte se categoriza como grave, debo recibir una notificación y debe seguir apareciendo como algo que requiere atención hasta que haga algo, aunque sea un acknowledge.

Acá el acknowledge significa algo como “ya vi esto, no me lo sigas recordando”. El reporte puede seguir abierto y permanecer en mi listado o historial de reportes abiertos, pero ya no necesita seguir generando recordatorios de atención pendiente.

Visibilidad para el usuario

El usuario también debe poder ver ese contexto desde la pantalla de reportes que ya se describió.

Si tiene varios reportes, aparecen en su lista y, al abrir uno, se muestra la información correspondiente a su tipo: con qué está relacionado, qué ocurrió y los detalles que correspondan.

El reporte no es simplemente un mensaje cualquiera. Tiene atributos, relaciones, prioridad y un contexto que tanto el usuario como el administrador deben poder consultar.

#### Cerrar sesion (sesion de cuenta, no de juego)

a

#### Suscribirse a un plan

Pantallas de entrada: Barra superior fija | Perfil.

Notificaciones:

- Push, in-app y correo: Como el usuario debe tener una cuenta real para realizar esta operación, se envía una notificación por los tres medios, dándole la bienvenida y confirmando el registro de la suscripción, con los detalles del plan.

- Al abrir la notificación, se lleva al usuario a la pantalla de “mi plan” o “gestionar mi plan”.

Como se mencionó en otra parte del documento, en la barra superior fija, la sticky bar donde están los botones de perfil y notificaciones, habrá un botón como “plan” o “plan actual” que le indica al usuario su plan actual.

Ese botón lleva directamente a la misma pantalla a la que se llega entrando al perfil y oprimiendo la opción de planes: la pantalla de configuración del plan de la cuenta.

- PANTALLA: Configuración del plan de la cuenta.

- Se muestran los detalles del plan actual y las opciones de otros planes a los que el usuario puede cambiar, además de la opción de cancelar el plan actual.

  - Se debe poder cancelar el plan en cualquier momento, sin restricciones ni dificultar el proceso.

  - Si el usuario no tiene ningún plan, se muestran los planes disponibles a los que puede unirse.

- El usuario puede acceder a esta pantalla y ver los planes aunque no tenga una cuenta, pero se le indica que para acceder a un plan necesita una cuenta real, con autenticación.

  - Para este requisito, tener una cuenta de invitado o no tener ninguna cuenta se considera lo mismo: ninguna de las dos permite acceder a un plan.

  - Puede ver que actualmente no tiene plan y consultar los planes disponibles.

- Si el usuario no tiene una cuenta real, aparece un botón o una indicación como “tienes que registrarte o iniciar sesión primero”.

- Ese botón lleva al flujo de autenticación.

  - PANTALLA: Autenticación.

  - El usuario se registra o inicia sesión.

  - Al finalizar ese flujo, se le redirige nuevamente a la pantalla de planes.

- PANTALLA: Configuración del plan de la cuenta.

- Ahora el usuario ve la pantalla desde la perspectiva de su cuenta autenticada y puede unirse a un plan.

Acá no voy a especificar exactamente cómo se hace la selección o el upgrade, porque, como se menciona en el documento, todavía no está definido cómo serán los planes. Puede que sean planes fijos o puede que sean solamente dos tipos, normal y profesor, y que lo que se escoja dinámicamente sea la capacidad que el usuario quiere tener.

Como eso no está definido, tampoco se decide acá exactamente cómo se verá esa parte.

- El usuario escoge el plan que quiere, ya sea un plan fijo, uno con capacidad dinámica o lo que se termine definiendo.

- Una vez escogido, se le redirige al flujo de confirmación de la compra o suscripción.

- Ese flujo es relativamente externo y depende de la integración que tengamos para hacer el pago y manejar la suscripción. Puede ser un merchant of record, un gestor de suscripciones o alguna otra integración externa que se encargue de la transacción y todo eso.

- Una vez confirmado el registro de la suscripción, se envía la notificación de bienvenida y confirmación del plan por push, in-app y correo, con los detalles del plan. Al abrirla, el usuario llega a la pantalla de gestionar su plan.

BTW, hay algo importante a tener en cuenta: sí o sí habrá por lo menos dos tipos de cuenta con plan, aunque eventualmente puedan ser más:

- Cuenta normal con plan.

- Cuenta tipo profesor.

Para una cuenta normal, después del upgrade la experiencia sigue siendo básicamente la misma. El usuario mantiene el mismo acceso a la cuenta, pero con los límites incrementados.

Para una cuenta de profesor sí necesitamos algún tipo de flujo que le muestre las nuevas secciones a las que obtuvo acceso, porque ese tipo de cuenta habilita toda la parte de gestión de clases y demás funcionalidades de profesor. Creo que ahondaré más en eso dentro del área de flujos de profesor.

En principio, para una cuenta que no sea de profesor, el usuario simplemente vuelve a la pantalla de perfil o donde corresponda, pero ya tiene el nuevo plan y los límites incrementados.

Además, desde la pantalla de “mi plan” ahora tiene visibilidad del estado de su plan: los créditos consumidos, o el término que usemos para representar la capacidad de uso consumida durante el período, la disponibilidad restante y todo eso.

### Flujos con cuenta con suscripción normal

Los mismos incrementales de las opciones anteriores pero con los limites incrementados de las reglas de negocio.

### Flujos con cuenta con suscripción de profesor

#### Prueba gratuida

Con el plan de profesor sí cambia bastante la experiencia de la plataforma. Aparecen funcionalidades específicas, como gestionar estudiantes, clases y material de estudio, que no existen en la experiencia normal.

Para una cuenta normal, la prueba de lo que ofrecemos ya está representada en los créditos que asignamos a los usuarios gratuitos para usar el chat. Al pagar, principalmente aumentan los límites.

Para un profesor es diferente, porque necesita conocer una experiencia nueva. Por eso debe existir una prueba gratuita.

Visibilidad de la experiencia profesor

Debe ser fácil darse cuenta de que existe una versión de la plataforma para profesores. Cualquier persona que entre debería poder encontrar esa opción, ver qué ofrece y acceder a un llamado a la acción como “inicia tu prueba gratuita”.

Desde la parte de planes o la presentación del modo profesor podemos mostrar un video o imágenes de cómo funciona, incluyendo:

- Los nuevos paneles para gestionar clases y estudiantes.

- La subida de material de estudio.

- La creación de actividades a partir de ese material.

- Las actividades que generan una nota para cada estudiante.

En los siguientes flujos voy a explicar con más detalle esas funcionalidades. Acá lo importante es que el usuario pueda descubrirlas, entender qué obtiene con el plan de profesor y probarlas fácilmente.

Duración, capacidad y costo de la prueba

La prueba podría durar una semana o algo así. Durante ese tiempo, el usuario tiene acceso temporal a la experiencia de profesor.

Pero tenemos que analizar cómo ofrecerla sin perder demasiado dinero. Esto requiere decisiones de producto y presupuesto: cuánto acceso damos, cuántos tokens se pueden consumir, cuánto material de estudio se puede subir y analizar, etc.

Lo que más me preocupa es el consumo de tokens. Dar acceso a las funcionalidades no es lo que representa el costo adicional principal; lo costoso es el uso de IA para preparar clases, procesar material de estudio y generar actividades.

Podríamos asignar parte de los créditos que ya damos a los usuarios gratuitos, tal vez con un poco más de capacidad para quienes estén probando el modo profesor. Una posibilidad es reservar una parte del presupuesto gratuito específicamente para esas pruebas y repartirla entre quienes las activen.

No está definido todavía cuánto se asigna ni cómo se calcula, pero debe mantenerse dentro del presupuesto que podemos sostener.

Activación y paso a la suscripción

- El usuario encuentra la presentación de la experiencia profesor y consulta lo que ofrece.

- Oprime el botón de iniciar la prueba gratuita.

- Idealmente, para activarla ya registra un método de pago.

- Se le explica claramente cuánto dura la prueba y que, si no cancela, después se realizará el cobro de la suscripción.

- Se activa temporalmente la experiencia profesor, con los límites definidos para la prueba.

- El usuario puede cancelar en cualquier momento, sin dificultades ni trabas.

- Si decide continuar y no cancela, se cobra la suscripción y mantiene el acceso como suscriptor del plan de profesor.

Todo esto tiene que ser transparente. No queremos cobros ocultos ni que el usuario termine suscrito sin haber entendido qué estaba aceptando.

Por ejemplo, una vez pagué un dólar para ver los resultados de un quiz de personalidad y una semana después me llegó el cobro de una suscripción. Resulta que ese pago también autorizaba la suscripción, pero no era lo que yo entendía que estaba comprando. No queremos nada de eso en nuestra plataforma.

La idea es tener un método de pago registrado para facilitar la continuidad, pero dejando claro desde el principio cómo funciona y permitiendo cancelar fácilmente.

Escalas del plan de profesor

La suscripción de profesor tendrá una escala de capacidad.

La idea es que alguien pueda pagar lo mínimo posible y aun así acceder a todas las funcionalidades de profesor, pero con límites más restringidos de tokens y capacidad. Conforme pague más, tendrá más capacidad disponible.

Un profesor que maneje más clases, más material de estudio y necesite generar más actividades dinámicas tendrá que escoger un nivel de suscripción que cubra ese uso.

#### Crear clase

Una clase es la entidad que le permite al profesor organizar estudiantes, actividades, notas y material de estudio.

El profesor puede asociar estudiantes a la clase, compartir las actividades con ellos y permitirles acceder al historial de actividades. Esa relación también permite vincular las notas con los estudiantes de la clase. Además, la clase puede tener material de estudio asociado.

BTW, me parece importante que una cuenta con plan de profesor también sirva como una cuenta normal. Creo que debería existir una especie de switch para cambiar entre la experiencia normal y la de profesor, usando la misma cuenta.

Al pasar al modo profesor, la pantalla principal ya no sería Discovery, sino el panel de control de sus clases. No tengo definido exactamente cómo será ese dashboard ni su navegación, pero desde ahí debe poder acceder a sus clases y crear nuevas.

Pantalla de entrada: Dashboard de profesor.

- El profesor entra a su dashboard.

- Desde ahí puede ver sus clases y acceder a la opción de crear una nueva.

- El profesor crea la clase, respetando los límites de cantidad de clases que correspondan a su suscripción.

- La clase queda disponible para gestionarla y asociarlo estudiantes posteriormente.

Por ahora dejamos este flujo hasta la creación de esa entidad. La asociación de estudiantes y la creación o asociación de material de estudio se explicarán en los siguientes flujos.

BTW, no sé si sea necesario, pero tal vez al crear la clase el profesor deba indicar si está dirigida a menores de edad.

Los estudiantes asociados tendrán su propia cuenta de acceso, y puede que necesitemos tratar esas cuentas de forma distinta según sean de menores o mayores de edad. Si ese es el caso, podríamos dejarle al profesor la responsabilidad de marcarlo para saber qué tratamiento aplicar a los estudiantes de esa clase.

Esto queda como una posibilidad, solo si se determina que la experiencia o el tratamiento de las cuentas de estudiantes debe variar según sean menores o mayores de edad.

#### Gestionar material de estudio

El profesor debe poder subir su material de estudio o de clase y gestionarlo: agregarlo, quitarlo, editarlo y organizarlo.

Puede subir PDFs, presentaciones y otros formatos que la IA pueda leer.

Acá es importante diferenciar una clase de una asignatura:

- Una clase es la entidad que agrupa a un conjunto de estudiantes.

- Una asignatura agrupa temas y contenidos de estudio.

No creo que necesitemos introducir una entidad compleja de asignatura. Podemos pensar esa organización como carpetas: el profesor tiene una carpeta con el material de ciencias naturales, otra con el de matemáticas, etc.

Además, no tiene que agrupar necesariamente por asignatura. Puede hacerlo por tema o como le resulte útil. Él decide cómo organizar su material.

No quiero establecer una relación obligatoria entre una clase y una asignatura que haga que esa clase siempre use el mismo material. Prefiero dejar esa flexibilidad al profesor.

Por ejemplo, en un colegio un mismo profesor puede enseñar varias materias al mismo grupo de estudiantes y querer manejar todas esas actividades dentro de una sola clase de la plataforma. La clase solo agrupa estudiantes; el profesor decide cómo usarla.

Cuando cree una actividad, puede indicar algo como “quiero hacerla con el contenido de matemáticas” o señalar qué grupo de materiales quiere utilizar.

Incluso no debería ser necesario que siempre lo indique explícitamente. La IA debería revisar primero el material que tiene disponible y confirmar con el profesor si quiere usar alguno de esos recursos.

BTW, subir material de estudio no es obligatorio para crear actividades. La IA puede usar su propio conocimiento o investigar en internet. El material propio es una posibilidad que ofrecemos para construir las actividades alrededor de lo que el profesor usa en sus clases.

Para esta experiencia del plan de profesor sí o sí se utiliza la IA integrada de la plataforma, así que tenemos control sobre cómo revisa el material, investiga y realiza el análisis.

Este flujo corresponde principalmente a la gestión de esos recursos: subirlos, quitarlos, editarlos y agruparlos para poder utilizarlos después en la creación de actividades.

#### Manejar contexto de clase

Además del material de estudio, el profesor puede agregar contexto específico a una clase.

Ese contexto puede estar compuesto por archivos que suba directamente a la clase o por información que le comunique a la IA. La idea es que pueda decirle cosas particulares de esa clase y que queden disponibles para las actividades que se creen después.

Cuando la IA vaya a crear una actividad para esa clase, tendrá ese contexto disponible y lo usará como parte de la información para trabajar.

Esto es opcional. El profesor solo agrega contexto si quiere darle a la IA información específica sobre esa clase.

Por ejemplo, podría incluir contexto sobre los estudiantes, aunque ahí tenemos que tener cuidado con la información sensible o privada. Es solo un ejemplo del tipo de contexto que podría aportar.

#### Discovery de juegos para profesor

La experiencia de profesor también tiene una sección de Discovery, pero no muestra todos los juegos de la plataforma normal. Solo muestra juegos académicos:

- Juegos creados por otros profesores que decidieron hacerlos públicos y cuya publicación aprobamos.

- Juegos académicos creados por la propia plataforma, como actividades para temas típicos de colegio y otras clases.

Los juegos publicados por profesores también tienen que pasar por mi revisión como administrador. Debo verificar que no incluyan datos de estudiantes ni información privada, por ejemplo si originalmente eran actividades muy personalizadas. Una vez aprobados para publicación, también quedan marcados como académicos.

Estos juegos pueden aparecer en la plataforma normal dentro de una categoría académica. La diferencia es que, en el Discovery de profesores, solamente se muestran esos juegos académicos.

Se mantienen las mismas posibilidades del Discovery general: el profesor puede iniciar una sesión a partir de un juego o usarlo como plantilla si está habilitado para eso.

Iniciar una sesión desde un juego académico

- El profesor busca y abre un juego.

- Oprime la opción de iniciar una sesión.

- Se le muestra una pantalla para escoger cómo quiere ejecutarla:

  - Como sesión standalone, sin vincularla con una clase.

  - Asociada con una de sus clases.

- Si la asocia con una clase:

  - Solo pueden acceder los estudiantes vinculados con esa clase.

  - La sesión queda registrada dentro de esa clase.

  - La forma de vincular estudiantes se explicará en otro flujo.

- Si la inicia como standalone:

  - No queda vinculada con ninguna clase.

  - Comparte el link como cualquier otro usuario de la plataforma.

  - Puede unirse cualquier persona, sin necesidad de estar asociada como estudiante.

Lo ideal y probablemente lo más habitual será usar sesiones asociadas con una clase, pero no queremos restringir el uso normal de la plataforma. Tal vez el profesor está entrando por primera vez y quiere probar una actividad sin tener que crear una clase ni registrar estudiantes antes.

#### Asociar estudiante (credenciales y eso)

Este flujo me parece complejo y todavía no tengo completamente claro cómo hacerlo. Lo siguiente es la propuesta que tengo en mente, pero se puede ajustar. Hay varias decisiones pendientes, especialmente sobre el manejo de datos y la forma de mantener el acceso de los estudiantes.

La idea es que un estudiante no necesite tener una cuenta preexistente ni registrarse con un correo para acceder a una clase. Pero sí debe existir una vinculación con esa clase, porque las actividades asociadas a ella solo pueden ser utilizadas por sus estudiantes. Las sesiones standalone son un caso distinto.

Identidad del estudiante dentro de una clase

No quiero que exista una cuenta central del estudiante que esté asociada a distintas clases. Lo que existe es un estudiante dentro de una clase específica.

Ese estudiante se identifica con un nombre o identificador que haya escogido para esa clase. Puede ser su nombre, un apodo o cualquier identificador que quiera usar. Opcionalmente, puede tener una contraseña.

Si participa en otra clase, tiene otra identidad dentro de esa otra clase. No estamos relacionando ambas como una misma persona dentro de la plataforma.

Esto también es distinto de una cuenta de invitado. La idea es que el registro del estudiante exista vinculado a la clase y pueda volver a acceder usando el mismo identificador, sin depender solamente del token o del acceso que tenga en ese dispositivo.

Enlace o código de vinculación

- El profesor crea una clase.

- Comparte con los estudiantes un enlace o código de vinculación a esa clase.

- El estudiante abre el enlace.

- La plataforma se abre en modo estudiante, directamente sobre esa clase.

- Se le ofrecen las opciones de registrarse o iniciar sesión, aunque no se trata del registro normal de la plataforma:

  - Si ya se había vinculado a esa clase, ingresa el mismo identificador que usó anteriormente.

  - Si es la primera vez, escoge un identificador y se crea un nuevo registro de estudiante dentro de esa clase.

- Si corresponde, también ingresa una contraseña.

- Una vez completada la vinculación y la aprobación, si se requiere, obtiene acceso a la clase.

El código es el identificador único de la clase. No es el código de una actividad o de una sesión de juego.

Sobre la contraseña, podemos hacer que sea opcional para el estudiante o que el profesor configure si la exige para su clase. Eso ayudaría a evitar que un estudiante entre usando el identificador de otro, porque, sin contraseña, la única credencial sería ese identificador.

Modo estudiante

Así como existe el modo profesor, debe existir un modo estudiante. Este modo es gratuito y está limitado al acceso a una clase.

También se puede entrar a él directamente desde la plataforma, sin haber recibido un enlace:

- El usuario cambia al modo estudiante.

- Se le pide el código de la clase a la que quiere acceder.

- Ingresa el código.

- Se le pide el identificador que usa en esa clase y la contraseña, si corresponde.

- Accede como ese estudiante dentro de esa clase.

Si quiere cambiar de clase, oprime una opción como “cambiar de clase”, ingresa el código de la otra clase y después el identificador que tenga en ella.

No hay una cuenta con una lista de clases asociadas. Hay un acceso a una clase mediante su código y la identidad del estudiante dentro de ella.

Si en ese dispositivo ya había una cuenta normal iniciada, esa cuenta sigue existiendo en el dispositivo, pero al cambiar al modo estudiante se ignora. No se usa para identificar al estudiante ni para vincularlo con la clase.

En modo estudiante no se tiene acceso a Discovery ni a las demás funcionalidades de una cuenta normal. Tampoco se usa esa identidad para entrar a sesiones ajenas a la clase. Solo se tiene acceso a la clase correspondiente.

Por ejemplo, alguien puede tener una cuenta normal para participar en una actividad compartida como cualquier otro usuario y, aparte, entrar al modo estudiante para participar en una actividad de su clase. Son experiencias separadas.

Aprobación por parte del profesor

Podemos hacer que el profesor tenga que aprobar las solicitudes de vinculación.

Así evitamos que alguien abra el mismo enlace, escriba diez nombres distintos y automáticamente cree diez estudiantes con acceso a la clase.

El profesor ve desde su dashboard las solicitudes, con el display name o identificador de cada una, y decide cuáles acepta y cuáles no. Sería parecido a aceptar participantes en una videollamada.

Una vez aprobado, el estudiante queda vinculado a esa clase y vuelve a acceder con su identificador y, si aplica, su contraseña.

La idea es que unirse sea sencillo, que recolectemos la menor cantidad posible de información y que la gestión de los estudiantes quede completamente en manos del profesor.

Información adicional y recuperación del identificador

No quiero pedir datos personales ni obligar al estudiante a crear una cuenta normal, especialmente porque probablemente muchos serán menores de edad.

Para la plataforma, lo que tenemos es un identificador dentro de una clase. El profesor es quien sabe a qué estudiante corresponde.

Tal vez el profesor pueda complementar ese registro con información adicional. Por ejemplo, si alguien se unió con un apodo, el profesor podría querer añadir el identificador que ese estudiante tiene en la institución. También podríamos permitir que el profesor le pida al estudiante completar esa información.

No sé todavía hasta qué punto queremos permitirlo. Me preocupa cómo facilitar que el profesor reconozca al estudiante real sin que nuestra plataforma dependa de datos privados.

La idea que tengo es ofrecer campos de texto que el profesor pueda utilizar según lo que necesite, pero esa parte y el tratamiento de lo que se escriba ahí quedan por definir.

Si un estudiante olvida el nombre o apodo con el que se vinculó, tendría que acudir al profesor. El profesor busca en la lista de estudiantes de esa clase y le indica cuál es su identificador.

Acceso a sesiones asociadas con una clase

Esto corresponde también al flujo de unirse a una sesión, pero lo menciono acá porque depende de la vinculación.

Cuando una sesión está asociada con una clase, solo pueden entrar los estudiantes vinculados a esa clase. No funciona como una sesión standalone abierta a cualquier persona.

Hay tres formas de llegar:

- Desde la clase: El estudiante entra con el código de clase y su identificador. Dentro de la clase ve que hay una sesión iniciada y una opción para unirse.

- Con el código de la sesión: Ingresa directamente el código de acceso a la actividad.

- Con la URL de la sesión: Abre el enlace compartido por el profesor.

En los dos últimos casos, si todavía no está identificado como estudiante de esa clase, se le pide que indique quién es e ingrese con su identificador, siguiendo el mecanismo de acceso o vinculación descrito antes. Llegar mediante el link o el código de la sesión no elimina el requisito de estar vinculado a la clase.

Si ya había accedido previamente como estudiante de esa clase, puede que no sea necesario pedirle otra vez esos datos, dependiendo de cómo decidamos conservar ese acceso.

Sesiones de estudiante en el dispositivo

Todavía no sé si queremos guardar las sesiones de estudiante en el dispositivo para que no tengan que volver a ingresar el código de clase y su identificador cada vez.

Como probablemente sea un acceso recurrente, podría ser útil que el estudiante cierre la pestaña y, al volver, siga dentro de esa clase como el mismo estudiante. En ese caso también tiene que ser fácil cambiar a otra clase.

Pero no quiero convertir eso en una cuenta central que diga “estas son tus clases”.

Técnicamente podríamos tener varias sesiones independientes de estudiante guardadas en un mismo dispositivo, cada una correspondiente a una clase, sin una cuenta central por detrás. No sé todavía si queremos permitir que vivan en paralelo.

Puede mejorar la experiencia, pero me preocupa que terminemos vinculando indirectamente esas identidades como si fueran una misma cuenta con acceso a varias clases. No tengo claro qué implicaciones tendría eso para el manejo de datos.

Entonces esta parte queda abierta. El concepto general es facilitar el acceso, mantener la identidad limitada a cada clase, pedir la menor información posible y dejar la administración en manos del profesor. La forma final depende de cómo resolvamos esas dudas de acceso y manejo de datos.

#### Crear actividades (opcionalmente con uso del material)

Crear una actividad es crear un juego. El profesor puede crear sus propias actividades, pero también quiero que pueda guardar juegos que encuentra en la plataforma y que quiere usar, como una lista de favoritos.

Puede que no necesite crear nada porque las actividades académicas disponibles ya le sirven. Aun así, debe poder tenerlas a la mano y organizarlas junto con las suyas.

Organización de las actividades

Un juego no está necesariamente vinculado con una clase. Puede estar más relacionado con una asignatura, pero también puede ser una actividad personalizada para una clase específica.

Por ejemplo, un profesor puede tener tres cursos de matemáticas, cada uno con sus propios estudiantes. En la plataforma serían tres clases. Una actividad sobre un tema de matemáticas podría servir para las tres y estar más relacionada con la asignatura que con un grupo particular.

Pero también puede crear una actividad personalizada con nombres de los estudiantes, experiencias propias o información privada. En ese caso sí estaría pensada para esa clase.

No quiero complejizar esto obligando al profesor a vincular cada actividad con una asignatura o una clase. Prefiero que tenga una sección de actividades o juegos y pueda organizarlos mediante agrupaciones, tags o algo parecido.

La idea es que pueda buscar y filtrar fácilmente. Si enseña matemáticas, ciencias naturales y español, y además tiene varias actividades para distintos temas de cada materia, debe poder encontrar la que necesita sin dificultad.

También puede tener actividades que no correspondan a una asignatura ni a un tema específico. Simplemente son actividades y deben poder estar ahí. Lo importante es que gestionarlas sea fácil.

Para las actividades encontradas en la plataforma, me imagino algo parecido a GitHub: ves tus repositorios y los que has forkeado. El profesor podría incorporar un juego a su espacio de gestión y organizarlo junto con los suyos.

No tengo definido si esto será exactamente un favorito, un fork o cómo lo llamaremos. La idea es que pueda decir “estas son mis actividades para este tema” y que ahí tenga tanto actividades propias como otras que encontró en la plataforma.

Creación con la IA

La creación es casi igual a la de una cuenta normal, usando el chat integrado:

- El profesor entra al chat para crear una actividad.

- Le explica a la IA qué quiere hacer.

- Puede indicar qué material de estudio quiere usar y, si corresponde, para qué clase está preparando la actividad.

- La IA toma el contexto relevante: el material, el contexto de la clase, ambos o los conocimientos que necesite, dependiendo de lo que el profesor esté buscando.

- Se continúa con la creación e iteración del juego, usando el SDK, las librerías, las plantillas y las herramientas ya descritas.

La IA debe ser proactiva y guiar el proceso para que crear la actividad sea lo más fácil y rápido posible. El profesor expresa lo que quiere y la IA determina qué contexto necesita y qué preguntas hacer.

Las plantillas serán principalmente académicas, pero no quiero limitar a la IA solamente a esas.

Por ejemplo, si el profesor quiere una actividad académica con un juego de carreras, nuestra IA puede encontrar un juego de carreras disponible como plantilla, aunque no esté marcado como académico, y aprovechar su mecánica.

Como es nuestra IA integrada, tenemos control para indicarle que debe adaptar el juego al propósito académico del profesor y quitar lo que no corresponda a esa actividad.

Eso tampoco significa que el profesor esté obligado a crear siempre algo académico. Si quiere una actividad puramente dinámica o un juego solo para divertirse, también está permitido.

Actividades calificables

La diferencia importante respecto a la creación normal es que el profesor puede seleccionar si quiere que la actividad sea calificable.

En un juego normal, la lógica está encapsulada en sus scripts y a la plataforma no le interesa interpretar el resultado. Puede mostrar un ganador, un ranking, una calificación interna o cualquier otra cosa. Nosotros simplemente mostramos la pantalla final.

En una actividad calificable sí queremos permitir que se exporten resultados. Esto es opcional: el profesor decide si marca la actividad como calificable y si quiere que entregue esos resultados a la plataforma.

En ese caso tiene que indicar qué resultados espera y cómo quiere que se califique.

El juego, en principio, no conoce la clase ni a sus estudiantes como entidades académicas. Trabaja con los usuarios que participan en él. Puede tener contenido personalizado si el profesor lo pidió, pero no tiene que estar vinculado a estudiantes específicos para poder generar notas.

El resultado que necesitamos es una calificación por participante, que luego quede asociada con el estudiante correspondiente.

La plataforma debe permitir la escala que quiera usar el profesor, por ejemplo:

- De 1 a 10.

- De 1 a 5.

- De 1 a 4.

- De 0 a 100.

- Una escala de letras.

Esas calificaciones deben ser exportables. La idea es que, al ejecutar la actividad en una sesión, quede el registro de la nota de cada estudiante. Después el profesor podrá decidir qué porcentaje darle a cada actividad, exportar las notas o hacer lo que necesite con ellas.

Por eso debe existir un contrato que permita al juego entregar notas por participante cuando esté configurado para hacerlo.

Lógica de calificación dentro del juego

La forma de calcular las notas sigue encapsulada en el juego. La plataforma recibe los resultados, pero no necesita entender la lógica que los produjo.

Por ejemplo, una actividad puede dividir a los estudiantes en grupos y asignar una nota grupal. El juego maneja internamente los grupos, calcula la nota de cada uno y entrega esa misma nota para cada participante que perteneció al grupo.

A la plataforma no le interesa que la calificación se haya calculado por grupos. Lo que necesita recibir es la lista de participantes, cada uno asociado con su nota.

Esa posibilidad de entregar calificaciones mediante un contrato es la extensión principal del flujo de creación de actividades respecto al de los juegos normales.

#### Iniciar sesion de juego

Hay tres formas de crear una sesión:

- Desde la pantalla de un juego encontrado en Discovery académico.

- Desde la gestión de juegos del profesor, que incluye sus juegos propios y los que incorporó como forks.

- Desde la pantalla de una clase.

- El profesor oprime la opción de iniciar una sesión.

- Dependiendo del punto de entrada:

  - Si viene desde Discovery o desde su gestión de juegos, se le pregunta si quiere una sesión standalone o asociada con una clase. Si escoge una clase, debe seleccionarla.

  - Si viene directamente desde una clase, esa asociación ya está definida y no se vuelve a preguntar. Se le pide escoger un juego de su librería, que también incluye los forks.

- Se crea la sesión y se entra al lobby.

- El profesor ve el código y el enlace de unión, que puede compartir.

- El acceso depende de cómo creó la sesión:

  - Si es standalone, puede unirse cualquier persona.

  - Si está asociada con una clase, solo pueden unirse los estudiantes vinculados con esa clase.

Acceso de los estudiantes

Si el estudiante ya está dentro del dashboard de esa clase, ve que hay una sesión en curso y puede oprimir la opción de unirse. No necesita ingresar un código ni abrir un enlace.

También puede entrar mediante el código de la sesión o su URL:

- El estudiante abre el enlace o ingresa el código.

- La plataforma identifica que la sesión está asociada con una clase y lo lleva al modo estudiante.

- Si tenía una cuenta normal iniciada, no se le hace logout, pero esa cuenta se ignora para este acceso.

- Se le pide el identificador que usa como estudiante de esa clase, siguiendo el mecanismo de acceso ya descrito.

- No tiene que ingresar el código de la clase, porque la sesión ya permite identificar a cuál corresponde.

- Una vez identificado y validada su vinculación, entra al lobby.

- La actividad continúa normalmente y sus resultados quedan asociados con su registro de estudiante dentro de esa clase.

Lo que provoca este cambio al modo estudiante no es que el juego sea académico, sino que la sesión esté vinculada con una clase. Un juego académico ejecutado como standalone sigue permitiendo el acceso normal.

No tengo completamente definido cuánto contexto mostrar antes de que el estudiante se identifique. Podríamos preguntar “¿cuál es tu identificador para esta clase?” y mostrar el nombre de la clase, pero me preocupa exponer información del profesor. Aunque también está el hecho de que el enlace o código fue compartido para entrar. Tal vez basta con pedir el identificador, porque el estudiante ya debería saber a qué clase está entrando. Esa parte queda por decidir.

Después de participar, el usuario queda en modo estudiante.

BTW, cambio entre los modos de la plataforma

Debe ser muy fácil y visible cambiar entre los tres modos mediante un mismo switch:

- Normal.

- Profesor.

- Estudiante.

Cualquier persona puede cambiar entre ellos. Por defecto se entra a la experiencia normal.

El modo profesor sí debe promocionarse bastante. Queremos que las personas descubran que existe, entiendan lo que ofrece y quieran probarlo o contratarlo.

El modo estudiante debe estar disponible en el mismo selector, pero no necesita esa promoción. No tiene mucha utilidad entrar ahí sin pertenecer a una clase. Normalmente alguien lo usará porque su profesor le compartió un enlace o le indicó que entrara a la plataforma en modo estudiante.

Los modos normal y profesor usan la misma cuenta. Si alguien hace upgrade al plan de profesor, puede entrar a esa experiencia y después volver al modo normal para usar la plataforma como cualquier otro usuario.

Si cambia al modo estudiante, esa cuenta deja de intervenir. Ahí se usa la identidad del estudiante dentro de la clase, no una cuenta general por detrás.

Si una persona cambia al modo profesor sin tener ese plan, verá un dashboard que le presenta la experiencia y le invita a hacer upgrade para acceder a sus funcionalidades.

#### Ver mis clases

Pantalla de entrada: Dashboard o panel de control de profesor.

No quiero definir todavía exactamente cómo serán las pantallas, porque no lo tengo completamente claro. Lo importante es que desde ese panel el profesor pueda ver las clases que ha creado, crear nuevas y entrar a cada una.

- El profesor entra a su panel de control.

- Ve sus clases y la opción de crear una nueva.

- Selecciona una clase.

- Dentro de esa clase puede consultar y gestionar:

  - Los estudiantes registrados.

  - El código de invitación a la clase.

  - Las notificaciones o solicitudes de estudiantes pendientes de aceptar.

  - Las opciones para sacar estudiantes, por ejemplo si se unió alguien que no correspondía.

  - Los datos de cada estudiante que se permita modificar.

  - El historial de actividades de la clase.

Actividades y calificaciones

No todas las actividades realizadas en una clase tienen que ser calificables. El profesor puede hacer juegos y actividades que no exporten ninguna nota, y otras que sí.

Desde el historial puede identificar las actividades calificables, consultar sus notas y acceder a un resumen de calificaciones.

Ese resumen sería una especie de tabla con los resultados de todas las actividades calificables por estudiante. Desde ahí, el profesor puede modificar manualmente una nota y sobreescribir el valor actual.

Obviamente, eso requiere mantener la trazabilidad de esos cambios y permitir que el profesor revierta la modificación.

También puede asignar porcentajes a las calificaciones. Con esos porcentajes, la plataforma puede ofrecer una nota final por estudiante.

Pero para calcular esa nota final, todas las actividades calificables deben usar el mismo formato, estructura y rango de calificación.

Si una actividad califica de 1 a 10, otra de 1 a 100 y otra usa letras, no podemos ofrecer una nota final conjunta. Sí podemos mostrar la tabla con la nota de cada actividad, conservando el formato correspondiente a cada una.

#### Abrir clase

Este flujo ya quedó explicado implícitamente en los anteriores.

- El profesor selecciona una clase desde su listado de clases.

- PANTALLA: Detalles de la clase.

- Desde ahí puede ver los detalles de la clase, consultar sus estudiantes, agregar contexto e iniciar una sesión asociada con esa clase.

Las demás opciones y su funcionamiento ya se describieron en los flujos correspondientes.

#### Editar clase

Este flujo también quedó explicado indirectamente en los anteriores. Desde la clase, el profesor puede:

- Editar el nombre.

- Agregar o modificar una descripción, si quiere tenerla.

- Gestionar los estudiantes y editar los datos que se permita modificar de cada uno.

- Gestionar el contexto de la clase.

En esencia, son las operaciones de edición y gestión ya descritas en los otros flujos.

#### Cerrar clase.

El profesor puede cerrar una clase en cualquier momento. Hay dos posibilidades según si llegó a utilizarse:

- Eliminar: Si la clase nunca tuvo actividades, contexto, estudiantes ni ninguna otra información asociada, se puede eliminar sin conservar el registro. Es el caso de una clase que solo se creó, pero con la que nunca se hizo nada.

- Cerrar: Si tuvo actividades, contexto, estudiantes o cualquier otra información asociada, se cierra y se conserva en el historial.

- El profesor accede a la clase y selecciona la operación correspondiente.

- Si se elimina, no queda el registro.

- Si se cierra, deja de aparecer entre las clases activas y pasa al historial de clases cerradas.

- El profesor puede seguir entrando a esa clase para consultar todo lo que ocurrió, su información y su historial.

La idea es algo parecido a las clases anteriores en Teams: la clase ya terminó, pero sigue disponible para consulta. Cerrar no significa perder lo que pasó en ella.

#### Crear clase a partir de clase cerrada.

El profesor puede crear una clase a partir de otra, tanto si está abierta como si está cerrada.

La idea es reutilizar el material y el contexto que estaban asociados específicamente con esa clase, en lugar de estar organizados de forma general en lo que llamamos asignaturas. Así conserva el trabajo que ya tenía adelantado.

- El profesor selecciona una clase existente y escoge crear una nueva a partir de ella.

- Se crea una clase nueva que conserva el material y el contexto de la clase original.

- La nueva clase tendrá sus propios estudiantes; no se trasladan los de la clase anterior.

El contexto se mantiene, pero se trata de una clase independiente para trabajar con otro grupo.

#### Exportar notas

Pantalla de entrada: Tabla o resumen de notas de una clase.

- El profesor accede al listado de calificaciones por estudiante.

- Selecciona la opción de exportar a Excel.

- Obtiene el archivo para cruzar esas notas con el sistema o documento donde lleve sus calificaciones.

BTW, este es el último flujo de profesor que tengo en mente, pero no significa que sean todos los necesarios. Al entender la plataforma completa pueden aparecer otros flujos implícitos o incluso operaciones necesarias que no mencioné ni indirectamente.

La implementación no debe limitarse únicamente a los flujos que describí. También hay que identificar lo que haga falta para completar la experiencia y cubrir las operaciones que pude haber olvidado.

### ESPECIAL, flujos para perfil asociado con estudiante de profesor

Como se explicó en los flujos anteriores, el estudiante tiene una identidad especial que existe únicamente dentro de una clase. No tiene una cuenta general de la plataforma por detrás, y su forma de ingresar corresponde específicamente a esa clase.

Solo tiene acceso a los datos de la clase en la que está vinculado, al historial de sus actividades y a sus notas. No puede navegar por el resto de la plataforma ni acceder a otras funcionalidades con esa identidad.

No existe una cuenta central del estudiante a la que se le asocien datos por fuera de esa clase.

Los detalles del acceso, la vinculación y el funcionamiento del modo estudiante ya se describieron en los otros flujos. Esta sección debe entenderse junto con lo definido ahí.

### Flujos de ADMIN

Se necesita tener un dashboard web para el admin, con credenciales de solo 1 usuario, para mi, al inicio no necesitamos nada complejo de poder crear cuentas con distintos permisos ni nada de eso, se puede implementar contemplando eso, con el concepto de roles y permisos pero para la fase 1 solo habra 1 solo user mio con todos los permisos.

Para esta plataforma de admin no me interesa para nada el flujo de usuario ni experiencia, solo que sea straigjhtforward, pues es para mi, asi que me enfocare en funcionalidad, no en navegabilidad, tu tienes libertad de diseñar como quieras.

En esta sección no voy a separar cada operación en un flujo, sino explicar en general qué debe permitir la plataforma de administrador.

Por ahora no necesitamos un sistema complejo de cuentas administrativas, roles o permisos por cuenta. Podemos desarrollarlo de forma que sea fácil agregar eso en el futuro, pero en la fase 1 seré solamente yo: una cuenta con acceso a todas las funcionalidades de administración.

Muchas de estas operaciones ya se mencionaron en los otros flujos. También puede haber otras necesarias que no haya identificado, y deben tenerse en cuenta al entender el funcionamiento completo de la plataforma.

Usuarios y actividad

Debo poder buscar y consultar todos los tipos de cuenta o identidades que existen en el sistema:

- Invitados.

- Cuentas normales.

- Profesores.

- Estudiantes.

Necesito poder navegar entre ellos con los filtros básicos y los que sean necesarios, abrir una cuenta y ver sus detalles, su historial y su actividad reciente.

La idea es tener trazabilidad desde la propia plataforma: poder consultar qué ha hecho últimamente un usuario y navegar por sus relaciones principales.

No necesariamente tenemos que mostrar absolutamente todo, pero sí cosas como:

- Los juegos que tiene creados o subidos.

- Las actividades y sesiones en las que ha participado.

- Las sesiones que ha creado.

- Sus reportes.

Búsqueda y gestión de juegos

Además de acceder a los juegos desde su dueño, debo poder buscarlos directamente, usando categorías y los demás filtros que correspondan.

Al abrir un juego, debo poder ver su información, quién lo creó, quién es su dueño, su estado y los demás detalles necesarios para gestionarlo.

Desde admin debo poder realizar operaciones sobre juegos y usuarios: cancelar cuentas, bloquear usuarios, bloquear juegos, suspenderlos y las demás acciones que se necesiten.

Cuando bloqueo una cuenta, al usuario le llega una notificación.

Si ese usuario está pagando una suscripción, puede haber más cosas que resolver, como una devolución de dinero o el manejo de la suscripción. Esa parte queda pendiente de definir.

Reportes y tareas pendientes

Debo tener acceso a toda la gestión de reportes que se describió en los demás flujos.

Hay distintos tipos de reportes, con sus propios datos y relaciones, y necesito poder ver cuándo fueron enviados, con qué están asociados, si requieren una acción de mi parte y cuál es su estado.

La plataforma debe permitirme gestionarlos y atender los que lo requieran, siguiendo lo ya definido sobre prioridades, notificaciones y acknowledge.

Contenido y recursos de la plataforma

Desde admin también debo poder crear, generar y subir juegos cuyo dueño sea la propia plataforma.

Además, debo poder gestionar:

- Las categorías de juegos: crear nuevas, eliminarlas y administrarlas.

- Los tags permitidos y cuáles se pueden usar para búsquedas y filtros.

- Los juegos disponibles como plantillas.

- La selección de plantillas principales o recomendadas que la IA ve siempre como referencia inicial.

- Las librerías y los assets disponibles para la creación de juegos.

Hay que conservar la distinción entre un juego marcado como disponible para usarse como plantilla y las plantillas principales que nosotros seleccionamos para presentar por defecto a la IA.

Toda la gestión de librerías, assets y recursos del flujo de creación debe estar disponible desde admin, como se explicó anteriormente.

Dashboards y analítica de negocio

Además de las operaciones administrativas, necesito vistas y dashboards de datos que permitan filtrar, agrupar y consultar gráficas para tomar decisiones.

Quiero analizar el presupuesto, el uso de la plataforma, los ingresos y los costos. Por ejemplo, entender cuánto gasto o pérdida estamos generando por cada peso que entra y cómo se relaciona eso con el comportamiento de los usuarios.

También necesito datos de experiencia y actividad, como:

- Cuántas sesiones se crean en un período y cómo se distribuyen según distintos criterios.

- Cuántos usuarios intentan seguir usando una función después de quedarse sin créditos y encontrarse con la opción de pagar.

- Cuántos hacen upgrade.

- Cuántos crean juegos y cómo están usando las opciones de creación.

- Cuántas sesiones crean con sus propios juegos.

- Con cuántas personas se están realizando las sesiones.

- Las distribuciones y percentiles que ayuden a entender ese uso.

Estos son ejemplos del tipo de información que necesito, no una lista cerrada.

Esto es monitoreo de la plataforma y de su funcionamiento lógico: analítica de producto y de negocio para tomar decisiones. Es distinto del monitoreo técnico del software, del código o de la infraestructura.

# Reglas de negocio

- Limitar numero de sesiones a crear con cuenta normal sin suscripcion (limite tipo ventana)

  - Aumentar limite con cuenta pagada

- Limitar numero maximo de personas conectadas a una misma sesion con cuenta normal sin suscripcion (limite fijo, maximo X jugadores por sesion total)

  - Aumentar limite con cuenta pagada

- Limitar numero de juegos que se pueden crear y/o tener al mismo tiempo con cuenta normal (limite tipo ventana)

  - Aumentar limite con cuenta pagada

- Ofrecer budget mensual global para la plataforma para uso de creacion de juegos con la IA de la plataforma gratuitamente

  - Es decir, setear algo como, limite de consumo de IA gratis de X usd al mes, entonces la plataforma divide el budget en dia o semanas, y lo distribuye en los usuarios, los usuarios con cuentas no pagadas tienen acceso limitado a la funcionalidad, conforme se acaba el budget se limita

  - La distribucion de budget entre usuarios gratuitos jamas puede ser de mas del 30% del budget que tiene el plan de pago mas barato, es decir, que incluso iniciando, si mi budget es de 1000usd al mes, y solo hay 10 users, esos 10 users NO pueden usar lo equivalente a 100usd solo porque es el budget, el limite es que incluso si hay budget de sobra se debe limitar

- Estaba pensando en mostrar anuncios no invasivos para cuentas no pagas y no estudiantes:

  - Pero poder implementar de forma controlada, que la plataforma admin pueda switch on y off los anuncios, pueda distribuir en porcentajes de usuarios, y asi ver los efectos de los anuncios en la actividad de los usuarios.

SIn embargo,  y esto afecta directmanete como funciona el producto, la idea es NO pushear por suscripcion cuando detectamos que el usuario intento hacer una operacion que tenia limite:

- SI el usuario ya llego a sus limites, aun asi debe poder oprimir o navegar al sitio que tiene limitacion, pero cuando lo intente usar se le indica que llego al limite.

En ese caso, se muestra las opciones:

- La que mas se prioriza en este caso es pagar por el uso especifico, es decir, digamos el limite de numero de sesiones, se le indica que puede crear una nueva por Xusd, no una suscripcion, un solo pago pequeñisimo,

- La opcion B son los posibles planes de suscripcion

Entonces, el user puede hacer esos micro pagos para operaciones especificas:

- En la pantalla de perfil, se debe tener boton como “ver mis compras” y mostrar todo el historial, asociarlo con la accion en cuestion (creacion de juego, sesion, aumentar limite sesion, etc).

La suma de todo lo pagado por el usuario como micro transacciones se le ofrece como descuento si se pasa a suscripción, y cubre  hasta 2 meses de suscripcion, es decir:

- Si la suscripción es de por ejemplo 10usd, y el user ha gastado 15usd en microtransacciones, entonces le ofrecemos la suscripcion sin pagar nada el primer mes y pagando 5usd el segundo.

- Si el user ha pagado 30usd, entonces solo se ofrece los 2 primeros meses gratis.

las tarifas por microtransacciones deben ser fijas, lo mas bajas posibles pero que dejen ganancia, pero lo mas baja posible teniendo en cuenta el proveedor de pagos, y las comisiones, por ejemplo, se me ocurre:

- 1usd por sesion despues del limite

- 1usd por sesion con mas jugadores del limite

- 1usd por juego adicional creado

Pero toca hacer el analisis, si al analizar el proveedor de transacciones se determina que una transaccion tan bajita resulta en un margen muy bajo de ganancia, entonces podemos hacer cosas como:

- 2usd por limite de sesion, pero decir que incluye esa y otra sesion mas

- lo mismo con los otros.

Todo este tema de transacciones, limites, lo que hace el usuario cuando llega a un limite, los que pagan, etc. Todo eso debe estar claramente monitoreado en DB para poder analizar y ajustar a medida.

Eso era sobre las operaciones fijas, pero las que son mas complejas son las de uso y consumo de la IA, aca el tema se complica mas.

Las suscripciones ofreceran un limite ampliado fijo en:

- numero de juegos a tener

- numero de sesiones

- limite de usuarios por sesion

Pero, en cuanto al consumo de IA, que es el flujo de creacion de IA, lo que se ofrece es como tokens, que la idea es renombrarlos en algo que no sea “tokens de IA”, pero en escencia si es algo parecido, de forma que, internamente, se maneja todo el tema de integracion con IA, optimizando lo maximo posible los costos, internamente se debe poder llevar trackeo  de algo como “consumo” en dinero del usuario, y la cuenta del usuario tiene un budget, es decir, me explico.

Digamos que, la decision es que la mejor forma de optimizar el gasto de IA ofreciendo la mejor experiencia posible (osea, priorizando precio pero tambien que sirva bien) sea tener:

- Una IA que es puramente de discusion y diseño, que seria la que lee el material de estudio, organiza, diseña el juego  a nivel logico

- Una IA que es la de codigo, que es la que recibe ese input y genera el codigo, realiza iteraciones de prueba, etc (El proceso puede ser iterativo entre ambas IA’s, en donde el usuario discute con la de arriba, la de discusion, y esa se encarga de interactuar con esta de desarrollo)

- Una IA de diseño de svg/lotties: para la parte mas visual, para poder ofrecer enfoque y buen diseño especifico, la IA de codigo general no tendria que saber de diseño, esta es la IA que genera todo el codigo svg

- Una IA generativa de assets: Cuando no se puede con svg,lotties,etc. Y se necesita un png real, una imagen real, o un sprite a partir de png’s, entonces esta seria la IA que genera esos assets, tambien cuando son imagenes a partir de input del usuario.

Lo anterior es un ejemplo, yo no planeo decidir exactamente la arquitectura de ese modelo de generación pues no se mucho, pero es un ejemplo de lo que podria ser una decision, el punto es que con ese ejemplo, tendriamos 4 distintas integraciones de IA, cada una debe ofrecer la forma de trackeo de consumo por request o algo, como tokens, dinero, etc. Nuestro sistema debe normalizarlo a dinero, de forma que sepamos, para dado usuario, en dado chat para dada creacion de dado juego, se ha gastado:

- Equivalente a 0.4usd en IA de discusion

- Equivalente a 0.7usd en IA de diseño de codigo

- Equivalente a 1usd en IA de diseño svg

- Equivalente a 2usd en IA assets

Entonces, el “budget” o “cupo” disponible del user no es mas que una traduccion de cuanto dinero a gastar tiene disponible, digamos que para una suscripcion de 10usd decidimos que 4usd sean en consumo de IA, entonces el user tiene un budget de 4usd, y lo trackeamos por ese medio.

La idea tambien es monitorear todo ese consumo, para poder hacer analisis de como se esta consumiendo, distribucion, etc.

Cuando el usuario llega al tope de sus suscripcion, la idea es que pueda:

- Incrementar suscripcion

- O pagar por aumento de cupo especifico, microtransaccion

Estaba pensando que, en lugar de tener el concepto perse de suscripciones con planes fijos, solo serian 2 planes en general:

- User normal

- Profesor

Pero dentro de cada uno, se escoge el nivel que se quiere, y los limites aumentan con base a eso, ofreciendo como escalas, y se le indica al user que en cualquier momento puede cambiar entre ellas.

limites:

Es importante aclarar que casi toda operación de escritura tiene que tener límites lógicos de negocio, distintos al rate limiting, que es un límite técnico a nivel de red para evitar ataques y controlar cuántas llamadas son aceptables en un rango de tiempo.

Obviamente vamos a tener rate limiting, y eso también aplica a las operaciones de lectura: cuántas veces permitimos que un usuario llame a un endpoint de lectura. Pero acá me refiero a los límites lógicos de las operaciones de escritura.

Hemos hablado mucho de límites como cuántas sesiones puede tener un usuario, cuántos juegos puede crear o cuántos reportes puede enviar, pero esto aplica en general a las operaciones de escritura:

- Cuántas veces puedes actualizar tu nombre.

- Cuántas veces puedes iniciar sesión.

- Cuántas veces puedes enviar un reporte.

- Si eventualmente agregamos comentarios, cuántas veces puedes poner un comentario.

- Etc.

Son límites lógicos y a nivel de usuario.

Límites recibidos de acuerdo al plan

A nivel técnico va a haber un paquete o dominio de planes. El middleware, a nivel de identidad, se encarga de llamar siempre a ese paquete para obtener los límites correspondientes al plan del usuario.

Ese dominio se encarga de ver qué plan tiene el usuario y qué límites le corresponden. Si no tiene ningún plan, devuelve los valores por defecto, que son los calculados de acuerdo a todo el sistema.

Esos valores luego se pasan a la operación respectiva. Entonces casi todas las operaciones de los dominios van a aceptar en su interface algún tipo de límites para saber qué límites quiere imponer el caller.

Por ejemplo, para crear una sesión, el método del dominio de sesión recibe un input definido por ese mismo dominio, porque él no depende de los demás.

BTW, creo que no mencioné esta regla en la parte técnica: todo lo que un dominio exporta a nivel de interface solo puede depender de su propio dominio. La firma del método, sus inputs y sus outputs son tipos propios, sin dependencias internas ni externas a otros componentes, de forma que no se generen dependencias circulares.

Cada dominio expone métodos que esperan un DTO definido por él mismo, y en ese DTO recibe los límites que el caller quiere imponer.

El dominio de sesión no sabe de planes ni de qué plan tiene el usuario. Simplemente recibe los valores y confía en ellos. Si el caller le dice que el límite de ese usuario son tantas sesiones al mes, el dominio acepta ese valor.

Pero la lógica de saber cuántas sesiones tiene el usuario en ese mes sí le pertenece al dominio de sesión. Él tiene esa información en su base de datos y aplica el límite recibido. Lo mismo pasa con los juegos y las demás operaciones en sus respectivos dominios: el caller pasa los valores, pero cada dominio conoce el uso real y se encarga de aplicar esos límites.

Límites propios del dominio

Sin embargo, cada dominio también puede imponer sus propios límites, independientemente de lo que reciba del caller.

Por ejemplo, si el caller le dice al dominio de sesión que el usuario puede tener 10 mil sesiones al mes, el propio dominio puede tener una regla que diga que no permite más de mil sesiones al mes, sin importar el valor que le hayan pasado.

En esos casos tiene que haber monitoreo cuando un límite recibido exceda el límite propio del dominio, porque eso significa una de dos cosas:

- Estamos recibiendo data corrupta.

- La parte de planes está ofreciendo algo que no queremos permitir en ese dominio.

Nuevamente, es importante pensar estos dominios como servicios totalmente separados, así estén en el mismo código y en la misma unidad de despliegue.

Es como si estuviéramos consumiendo servicios separados. Al servicio de sesiones no le interesa cuál es el plan ofrecido ni cuáles son las promesas de ese plan. Ni siquiera sabe que existe un dominio de planes. La orquestación de los servicios sí obtiene esa información del dominio de planes y la pasa a la operación correspondiente, pero el dominio de sesión por sí solo no sabe de dónde viene ni le interesa.

Entonces el dominio tiene sus propios límites y acepta limitarse a los valores que le pase el caller, siempre y cuando no entren en conflicto con sus propios límites.

Esto aplica a las operaciones donde el plan sí impone valores específicos, que serían principalmente operaciones importantes del producto, como:

- Número de sesiones a tener.

- Número de juegos a tener.

- Créditos de IA a usar.

Con los créditos de IA pasa lo mismo: el plan impone el límite, pero quien conoce el consumo real es el dominio encargado de crear el juego, porque él tiene el registro de los chats, cuánto consumió cada interacción con la integración externa de IA, etc.

Límites que no dependen del plan

Hay otros límites que no le interesan al dominio de planes. Por ejemplo, cuántos reportes puede crear un usuario. El plan que le ofrecimos no cambia ese límite, porque es una regla de negocio propia de la plataforma.

Podría ser un límite por ventana: en los últimos tantos días no queremos que el usuario haya enviado más de tantos reportes. También podemos combinar distintas ventanas:

- En una ventana larga, permitir hasta cierta cantidad.

- En una ventana corta, permitir hasta otra cantidad.

Esos límites se pueden manejar dinámicamente de acuerdo a lo que más se ajuste a la experiencia.

Entonces cada dominio puede imponer sus límites, y casi toda operación de escritura tiene que tener sus propios límites:

- Cuántas veces puedes cambiar el nombre: lo impone el dominio de identidad.

- Cuántos reportes puedes crear: lo impone el dominio de reportes.

- Y así con las demás operaciones.

Aunque los dominios estén desacoplados entre sí, todos están asociados y sí tienen un acople al usuario: realizan sus operaciones respecto a un usuario externo. Con base en ese usuario externo pueden calcular el uso e imponer sus propios límites.

Es importante que toda operación de escritura sea consciente de aplicar esos límites desde su propio dominio, sean o no parte del plan.

Por ejemplo, no queremos permitir que un usuario nos bombardee con reportes solo porque es una operación disponible que no hace parte del producto como tal, sino de la plataforma. Alguien malicioso podría crear 10 reportes por segundo si no hay rate limiting, o crear tantos reportes como le permita el rate limiter.

Incluso si el rate limiter es estricto y permite una request por segundo, el usuario podría crear 60 reportes por minuto y seguir haciéndolo quién sabe por cuánto tiempo. Claramente eso no lo queremos permitir, por eso hace falta el límite lógico además del técnico.

Actividad sospechosa y conexión con admin

También podemos marcar usuarios con actividad sospechosa, usuarios que hayan llegado a los límites, etc. Todo eso tiene que poder verse desde la plataforma de admin.

En algunos casos, cuando la actividad sea muy sospechosa o fraudulenta, la propia plataforma puede banear automáticamente al usuario. En ese caso se genera una notificación para el administrador, que puede revisar lo sucedido y decidir si desbanea al usuario o mantiene el ban y confirma la operación.

En la plataforma de admin deben aparecer las acciones que tomó el sistema, por ejemplo: “Por este motivo se baneó a este usuario”. El admin tiene que hacer acknowledge después de analizarlo, ya sea para aceptar la acción o para quitar el ban.

Para otras alertas que no sean lo suficientemente graves como para que el sistema aplique un baneo automático, simplemente se genera una notificación al administrador. Él tiene que revisarla y decidir qué hacer.

Acá queda definida también esa conexión entre los límites de las operaciones y la parte de administración.

# Sobre monetización y financiación

Me di cuenta que la sección anterior la estaba lentamente dirigiendo mucho a esto, asi que decidí darle su propia sección.

La idea principal de la plataforma es que, no hay financiación fuerte por detrás, así que el modelo debe ser claro sobre cómo financiar, como monetizar, y cuándo parar.

Hay que tener en cuenta los gastos que se tendrán, entre capex y opex, los capex son probablemente los que menos conozco, de capex solo se:

- Play store

- Registro de dominio

De Opex por otro lado creo que son:

- Computo (servicio backend)

- base de datos

- Storage externo

- Consumo de red

- DNS

- creo que el dominio tiene pago recurrente, pero no estoy seguro

- Ios store

- Integración IA para usuarios de no paga

- proveedor para envío de emails

Y luego están los que son por comisión/consumo, que serían:

- Integración IA para usuarios de paga

- merchant of record (o como sea que queramos intermediar las transacciones y pagos)

esos son solo los gastos que tengo en mente, igualmente tu debes leer esto y entender la idea principal y añadir al análisis y explicarme todos los demás gastos legales, de impuestos, de producto, de integración y técnicos, ya sean capex o opex que se deben tener en cuenta.

Pero bueno, la idea general de lo que quiero decir aca se mantiene sin importar los gastos específicos.

La idea consiste en que la plataforma en un estado ideal deberia ser autosostenible y dejar gananciar, y es con base a eso en mente que se definen las capacidades y los limites.

Sin embargo, al inicio, obviamente no habran ingresos, por lo que el budget operativo es de 120usd mensuales, ese budget debe sostener en su totalidad la plataforma, incluyendo infraestructura, y entonces las cosas como acceso a IA gratuita y todo eso tomaran parte restante de ese budget, y lo distribuyen, por ejemplo:

- 80usd en infra y demas cosas

- 40usd sobrantes para IA: se asigna un budget maximo por usuario, pero si el consumo total llega a los 40usd antes, entonces se limita ahi, sin importar el budget por usuario.

Ahora, claramente la plataforma no sabe de los gastos de infra, asi que desde la plataforma de adin deberia poderse tener una herramienta donde yo:

- actualice el budget mensual de IA gratuita

- seteo de limites generales (sesiones por usuario gratuito, etc)

Pero entonces ahi toca hacer un analisis financiero.

Todo el analisis que hare es un ejemplo, no es real, puede ser totalmente distinto en la practica, ninguna de las decisiones del siguiente ejemplo son finales, pero solo es un ejemplo que creo que refleja el pensamiento que tengo, la idea detras de como manejar el budget, infra, etc.

Nuevamente antes de comenzar, la idea es optimizar, asi que las decisiones finales de infra, costos, pueden cambiar totalmente con base a analisis e investigacion realizada.

Lo que tenia en mente, es que inicialmente desplegaria en una VM de GCP, en esa misma VM desplegaria ambos el servicio y la base de datos, pensaba en una maquina de general purpose con:

- 2 cores

- 4gb de ram

- 10gb de disco (o mas para tener espacio para un gran tamaño de BD eventualmente, pero pues igual esta VM seria solo hasta cuando la plataforma no sea suficientemente grande para requerir infra distinta)

El costo estimado de esa maquina + 1 IP publica es como de 67usd al mes.

Dado que la base de datos estaría en la VM, toca hacer algo como un persistent disk o algo, no se mucho de sistemas de bases de datos, migraciones entre sistemas, etc (En general no se mucho de infra), pero debe estar de alguna forma en la que se pueda eventualmente sacar la BD de la VM y pasarla a un servicio específico de BD.

Lo otro seria el storage service, donde se guardan imagenes, replay histories, etc. El costo es incremental, pero asumiendo inicialmente un promedio maximo de 10gb, y 10gb de transfers, seria como 1 usd al mes.

Otra cosa es la comunicación de red, y aca si afecta mucho un tema, y es cuando consume o cuanto consideramos que cuesta ejecutar una sesion, al igual que el limite de usuarios por sesion, porque resulta que si se cobra la transmision de red externa en GCP, una estimacion es 0.1usd por cada GB de transferencia.

Una sesion de un juego que haga uso de movimientos continuos y/o updates, tendra comunicaciones de red cuanto menos saliente 20 veces por segundo por usuario (con ticks cada 50ms).

La idea es entonces tambien optimizar eso, ajustar el intervalo de tick segun como sea requerido por el juego, eso seria un requerimiento de creacion de juego, que la IA sepa que debe ajustar y manejar eso de acuerdo a como sea realmente necesario, pero claro, imponeindo la propia plataforma maximos y minimos, donde inciialmente no se permitiran ticks mas recurrentes de 50ms.

Pero volviendo al tema, entonces, un juego cuya sesion dure en promedio 10 minutos, suponiendo 4 jugadores, con ticks cada 50ms, que implica, mensajes salientes cada 50ms a cada jugador (por eso tambien tcoa optimizar el tamaño de esos updates, usando deltas en lugar de la proyeccion completa), seria:

- 60 segundos * 10 minutos * 20 updates por segundo * 4 jugadores = 48000 mensajes de red promedio por juego de 10 minutos con esas condiciones.

Suponiendo que cada mensaje de red sea de 2.7kb, eso seria un total de 2.7kb*48000 = 129600kb por sesion, o 0.1296GB por sesion.

Siendo que el costo por GB es de 0.1usd, entonces el costo solo en consumo de red por sesion de 4 jugadores y 10 minutos en promedio seria 0.01296usd.

Eso es solo una estimacion, pero es para tener en cuenta, se debe tener monitoreo de todo eso, para poder hacer analisis de promedio de consumo de red por sesion, etc.

Con base a eso se definen los limites, y la idea es que se haga a traves de la plataforma de admin con valores por defecto, pero que yo pueda modificarlos.

Y por eso el limite de numero de jugadores por sesion no es solo por decision de producto, sino una necesidad de costos e infraestructura.

Nuevamente, todo eso debe ser monitoreable para ser ajustado.

Lo que tenia en mente es que lo que yo agrego en la plataforma de admin (o que la propia plataforma puede calcularlo, en cuyo caso mejor) es:

- costo promedio por minuto de sesion

- costo promedio por jugador por sesion (para definir limites)

- otras necesarias

En escencia, la idea no es introducir directamente los limites, sino los valores que permiten que la propia plataforma con base a esos valores y al budget ajuste los limites. PERO, desde admin si se debe poder sobreescribir los limites calculados automaticamente.

Pero volviendo, entonces creo que es claro la idea de que:

- hay un budget mensual

- La plataforma y con todos los datos se calculan costos por operaciones

- con base a eso, la plataforma define los limites de acuerdo a esos costos por operaciones y ajustados al budget mensual

- Si por alguna razon se detecta que se paso el budget mensual, se detiene ahi mismo

- Al inicio, cuando no hayan datos para ese calculo, simplemente seran datos por defecto iniciales, costos iniciales estimados, limites iniciales.

- el admin debe poder sobreescribir, detener.

- Entiendo y se que la plataforma por si misma no tiene un calculo preciso de costos, es aproximacion, pues la plataforma no tiene acceso al billing de integraciones ni nada.

Luego aca entra el segundo punto, ese budget global mensual, como se define?

Al inicio es el mio, yo defino mi budget, digamos 120usd

- configuro los servicios de infra u otros necesarios con tasas fijas, entonces yo se que el budget restante es 120usd-tasas fijas ya obtenidas

- Ese restante, digamos que sea 60usd, pasa a ser usado para los costos variables, y es ahi donde hay límites y cálculo dinamico por parte de la plataforma. Puede requerir inputs, como por ejemplo:

  - Precio promedio de jugador por sesion por minuto

  - etc

- Esos deben ser ingresados por mi, o valores por defecto, eventualmente los ingresare conforme el resultado de los analisis de datos, al inicio seran estimaciones

Entonces aca hay un tema importante que tambien afecta el costo, y es que hay otras operaciones que son costos variables, cada GET de discovery, cada llamada de red es costo variable, pero es imposible y no seria correcto ponerle limites a eso, pues en si no es producto, es solo navegabilidad.

- Tendremos limites logicos siempre que se requiera, por ejemplo, los reportes, y aca no entra nada de planes de suscripcion, ni de nada de eso, es un limite logico para evitar explotacion de la plataforma, no puedes abrir mas de X reportes al mes, y ya, y aplica para todos, cosas asi.

- Las demas operaciones, entraran como en un colchon de costos de infra dinamicos, que se monitoreara, pero se espera que sea no significativo, comparado con las llamnadas de red durante una sesion, comparado con la data guardada en esos casos, comparado con los gastos de IA, comparado con todo eso la parte basica de la plataforma tal como navegabilidad, registro, busqueda, reportes, notificaciones, etc debe ser despreciable (logicamente)

Habiendo dejado claro eso, hay otra cosa, y es que, el budget inicialmente es definido por mi, pero la idea es que despues sea dinamico conforma a las ganancias de la propia plataforma, me explico:

EL budget a usar para un periodo de tiempo es el mayor entre el budget ingrresado por mi y el calculo propio con base a ingresos del periodo inmediatamente anterior, con opcion para admin de sobreescribir y forzar a usar el ingresado.

Entonces, digamos que el mes anterior el total de ingresos de la plataforma entre suscripciones, microtransacciones, y anuncios (si se decide incluir), fue de 10000usd.

Entonces se deberia repartir en (es un ejemplo, no digo que asi deba ser la reparticion):

- 20% ganancias netas despues de todas las deducciones posibles

- 40% el costo en si del servicio para esa suscripcion/transaccioon

- 40% restante, costos globales de la plataforma, entre lo cual se define el budget para la plataforma gratuita:

  - Entonces digamos que de ese 40%:

    - 10% legal

    - 10% integraciones

    - 10% infra basica

    - entonces el restante 10% pasa a ser el restante que sera el budget global de la plataforma para el siguiente period, en este caso 1000usd

De forma tal que sea una forma en que los que pagan subsidian los que no:

- pero ojo, si resulta que el budget calculado es 1 millon de usd, y son 100usuarios, no se dejara que usen 10kusd cada uno, ahi aplica la regla de que el cupo gratuito por usuario no puede ser mayor al 30% del minimo plan de pago (numero puede ser ajustable)

Entonces eso es en general la idea del funcionamiento de todo, pero la cosa es, con eso se definen budgets globales, pero como sabemos cuanto es por user? porque al inicio no sabemos cuantos users gratuitos hay, y ademas si lo supieramos, no podemos predecir cuandos nuevos abran, etc. Y no puede ser como un budget global que el primero que llega lo usa todo, deberia ser dividido equitativamente entre los usuarios gratuitos

Ahi es donde toca tener algun tipo de numero de prediccion, que al inicio sera puramente predictivo, y despues podra ser mas certero con analisis de numero actual de activos + crecimiento esperado.

Pero igualmente, si el budget es 1000usd, y se calculan 10 users, eso daria budget por usuario de 100usd, pero resulta que hubo 100 users para ese periodo, a ellos se les trata al inicio con el budget de 100usd, pero no significa que dejaremos llegar a 10000usd, cuando se llegue al limite del budget global se acaba para todos.

Entonces, los usuarios gratuitos, no tienen concepto de limite fijo visible, capacidad, tasas fijas, ellos solo usan, y se les advierte sobre posibles limites, para limites fijos si los ven como “no puedes tener mas de 4 usuarios por actividad en plan gratuito”, pero para los dinamicos, como numero de sesiones, creacion de juego con IA o con IA propia, para esos es mas dinamico, simplemente no se garantiza nada y de la nada se les puede mostrar que ya no tienen mas capacidad y que deben esperar al siguiente periodo  o pagar.

Pero para los planes de pago si hay visibilidad de consumo y capacidad, pues para ellos si es fija y calculada con base la tarifa del plan.

Finalmente, sobre este tema, esta la parte de anuncios, vale la pena mostrarlos? creo que por compliance no podria ser a niños, y por calidad de la plataforma tendrian que ser no invasivos y que no den la percepcion de pobreza:

- Por ejemplo, se me ocurria, si un juego en desktop tiene una relación de aspecto que deja espacio a los lados, entonces ahi se pueden meter.

- Pero pues toca analizar, si vale la pena, si puede representar ingreso considerable para que valga la pena?

- En caso de que se decida que si, entonces deberia ser configurable desde admin, definir cuando prenderlos, cuando apagarlos, si aplicar a un porcentaje de usuarios a aplicar, y monitorear, etc.

# Técnico / dominios

Para la división técnica aplican las reglas mencionadas anteriormente: cada dominio de primer nivel, o top-level domain, se considera como si fuera un servicio aislado.

Eso implica que:

- No hay comportamiento transaccional entre dominios de primer nivel.

- Cada dominio trabaja como si tuviera sus propias tablas separadas.

- No se permiten llamadas directas entre esos dominios.

- Toda comunicación entre ellos debe pasar por el composer o el orchestrator.

- Las referencias entre dominios se hacen mediante UUIDs o tokens de las entidades lógicas que cada dominio expone.

Referencias entre dominios

Un dominio puede referenciar una entidad de otro, pero siempre mediante su identificador externo.

Por ejemplo, el dominio de juegos expone el identificador de un juego. Otro dominio puede guardar y utilizar ese identificador, pero no sabe a qué tabla corresponde ni cómo se representa internamente.

Incluso puede que ese identificador no corresponda directamente con una tabla, sino con un concepto que el dominio de juegos construye o maneja de otra forma.

Para el dominio que lo recibe, representa la entidad lógica “juego”. No conoce ni necesita conocer su implementación.

Entonces sí existen relaciones entre dominios, pero hay que definirlas de esa manera: este dominio referencia un identificador expuesto por otro dominio, sin depender de sus tablas ni de su representación interna.

Divisiones internas de cada dominio

Cada dominio puede definir sus propios subdominios y las reglas de comunicación entre ellos.

No necesariamente tiene que aplicar internamente las mismas restricciones que existen entre los dominios de primer nivel. Puede decidir, por ejemplo:

- Que sus subdominios se comuniquen directamente y compartan la misma base de datos.

- Que cada subdominio actúe como un servicio separado y sea dueño de sus propias tablas.

- Que compartan tablas, pero que no hagan llamadas directas y se coordinen mediante composer u orchestrator.

Esa organización depende de las necesidades y reglas internas de cada dominio.

Por ejemplo, el dominio de play, que ya está más o menos construido, tiene una división entre session y runtime:

- Session: Se encarga de la persistencia.

- Runtime: Se encarga del tiempo real y de la ejecución del juego.

También está el sandbox, que se despliega por separado y es el que realmente ejecuta el script de backend.

Cada dominio es responsable de definir cómo se divide internamente. Lo que se mantiene como regla general es el aislamiento y la comunicación orquestada entre los dominios de primer nivel.

BTW, en esta sección voy a describir ciertos dominios y, en algunos casos, cómo interactúan para realizar determinadas operaciones. Eso no significa que debamos limitarnos únicamente a esos dominios ni mantener exactamente esa división.

Si técnicamente tiene más sentido agregar un dominio, separar uno en varios, agruparlos o cambiar la organización, esas propuestas son bienvenidas.

Todo esto es una propuesta que también está limitada por mi capacidad técnica. No es una decisión fija, sino una base para analizar y definir la organización que mejor funcione.

BTW, la estructura general de dominios que se describió al inicio aplica principalmente a los dominios tradicionales: los que son dueños de un comportamiento, de datos y de las operaciones lógicas sobre esos datos.

Pero también hay dominios que no siguen esa misma estructura y aun así se consideran separados. La idea de esa separación es que cada dominio de primer nivel pueda desplegarse eventualmente como un servicio independiente, con pocos cambios.

Por ejemplo, API podría desplegarse por separado y funcionar como una especie de gateway. Los otros dominios pasarían de exponer métodos a exponer sus propios endpoints internos, pero la regla seguiría siendo la misma: el gateway se encarga de la autorización de la request y los servicios internos confían en la información que les pasa el caller.

Entonces la división de top-level domains ya debe representar grandes unidades que puedan convertirse en servicios separados. Internamente, cada una también puede subdividirse en otros servicios si lo necesita.

La idea es organizar como un árbol

Quiero que la organización de dominios sea, en lo posible, un árbol y no un grafo de dependencias.

Podemos empezar con un nivel de profundidad, pero algunos dominios necesitan más niveles. Por ejemplo, Play tiene los subdominios Runtime y Session.

¿Por qué mantener Runtime y Session dentro de Play en lugar de subirlos al primer nivel? Porque, mientras solo Play interactúe con ellos y sea el dueño de esa lógica, no hay necesidad de exponerlos al resto de la arquitectura.

Un subdominio debería ser conocido y utilizado únicamente por su dominio padre. Así, sus detalles y cambios quedan contenidos dentro de esa agrupación.

Cuándo tendría sentido subir un subdominio de nivel

Supongamos que otro dominio, como Reportes, necesita una operación del sandbox o de Session.

En principio, lo lógico sería que acceda a esa capacidad a través de Play, siguiendo las reglas de comunicación entre dominios. Play expone una operación y por dentro llama al subdominio correspondiente.

Pero si resulta que esa operación pertenece específicamente a Session y varios dominios necesitan interactuar con Session como parte de sus operaciones principales, entonces hay que revisar si sigue teniendo sentido mantenerlo como subdominio de Play.

En ese caso, podría ser mejor convertir Session en un dominio de primer nivel, porque ya participa directamente en la coordinación lógica con otros dominios. Esa comunicación seguiría pasando por composer u orchestrator, como se definió anteriormente.

Lo que quiero evitar es que los dominios empiecen a conectarse directamente con los subdominios internos de otros, o que aparezcan conexiones entre hermanos que conviertan esa organización en un grafo.

Por qué agrupar

Si obligamos a que todo exista en un único nivel, podríamos terminar con 500 o 1.000 dominios o servicios y una arquitectura difícil de entender y mantener.

Es más fácil agrupar las capacidades que pertenecen a una misma unidad lógica y que no necesitan ser conocidas por el resto del sistema.

Esa es la idea detrás de este diseño: mantener grupos con responsabilidades claras, organizados como un árbol, y exponer al nivel superior solo lo que realmente necesita participar en la arquitectura general.

## api

El dominio API es responsable de recibir las requests y exponer la plataforma mediante llamadas de red.

Es un dominio consumidor: actúa como caller de los demás dominios, siguiendo las reglas de comunicación mediante composer y orchestrator.

Por ahora es nuestro único punto de entrada, pero eso no significa que tenga que ser siempre el único. En el futuro podemos tener otro dominio que también funcione como punto de entrada y exponga las capacidades de la plataforma de otra forma.

API no tiene persistencia propia ni necesita tablas. Su responsabilidad es coordinar el procesamiento de las requests, los middlewares y las llamadas necesarias para llegar a la operación correspondiente.

Observabilidad de las llamadas de red

Las métricas, el monitoreo y la observabilidad de API llegan hasta el nivel de la llamada de red. Por ejemplo:

- El endpoint o path solicitado.

- El tiempo total de la llamada HTTP.

- El código de respuesta, como 200 o 400.

- El resultado de la llamada a nivel HTTP.

No le corresponde interpretar qué significa el resultado desde el punto de vista lógico del negocio. Sus métricas se basan en la request y su respuesta de red.

Autenticación y autorización de la request

API es la capa encargada de aplicar la autenticación y autorización relacionadas con la seguridad de la request, mediante los middlewares correspondientes.

Los demás dominios, como play, sesión o juegos, no realizan esa autenticación y autorización. Sus métodos ya esperan recibir el identificador del usuario y los demás datos necesarios, y confían en que el caller les está pasando la información correcta.

Desde la perspectiva de uno de esos dominios, si se le indica que una acción corresponde a cierto usuario, realiza el scoping de la operación con base en ese identificador. No tiene cómo comprobar por sí mismo si la identidad recibida corresponde realmente a quien hizo la request.

API se encarga de obtener esa información mediante sus middlewares y pasarla hasta la llamada final al dominio.

Comunicación en tiempo real

API también se encarga de la capa de red de las conexiones en tiempo real, como WebSocket.

Pero el dominio que ofrece la funcionalidad en tiempo real debe exponer su propia interfaz de comunicación, que puede funcionar mediante canales, callbacks o el mecanismo que corresponda.

El dominio API es el que conoce WebSocket. El otro dominio no debe saber si sus mensajes se transportan por WebSocket, gRPC u otro mecanismo de red. Lo que conoce es una operación en tiempo real que necesita recibir y devolver mensajes consistentes o hacer streaming de datos.

API conecta esa interfaz con el transporte de red: toma los mensajes que llegan por la conexión y los entrega al dominio, y convierte lo que el dominio devuelve en mensajes para esa conexión.

También le corresponde hacer el mapeo entre una conexión WebSocket y el identificador lógico del usuario. Esa asociación y el manejo de la conexión de red pertenecen a API.

## orchestrator

El paquete Orchestrator tiene un objetivo específico. No es un dominio tradicional, pero sigue siendo un dominio de primer nivel porque podría desplegarse como un servicio separado.

Funciona como una capa intermedia de orquestación. Su propósito es coordinar operaciones entre varios dominios, no implementar la lógica que pertenece a cada uno.

Qué consideramos un workflow

Un workflow es una operación que atraviesa varios dominios. Tiene distintos pasos, aunque desde afuera pueda parecer una sola operación, casi atómica.

Cada llamada a un dominio puede considerarse un paso separado. Por eso no tiene que ser un proceso largo o con varias interacciones del usuario para considerarse un workflow.

Por ejemplo, crear un juego podría requerir operaciones en el dominio de juegos, en el de usuarios y en Play. Al dominio de juegos solo le interesa la parte que conoce y le pertenece. No necesita saber si crear ese juego también afecta al usuario de alguna forma.

Quien conoce y coordina esas relaciones es Orchestrator.

Lógica de orquestación

Orchestrator sí tiene cierto tipo de lógica de negocio, pero únicamente la relacionada con el flujo: saber cuándo llamar a cada dominio y qué hacer según sus respuestas.

Por ejemplo, puede llamar primero a un dominio y, dependiendo de lo que devuelva, decidir si continúa con otro o toma un camino distinto.

Puede tener condiciones, interpretar las respuestas y pasar los datos necesarios entre llamadas. Pero la lógica propia de cada operación debe permanecer dentro del dominio correspondiente.

Persistencia de los workflows

Orchestrator puede tener persistencia propia cuando la necesita para coordinar operaciones de escritura.

No todos los workflows requieren eso. Algunos pueden diseñarse para que el frontend los reintente, para que se completen en una interacción posterior o para que un estado parcialmente completado sea aceptable.

Por ejemplo, supongamos que crear un juego requiere crearlo tanto en el dominio de juegos como en Play:

- La creación en juegos funciona, pero la de Play falla.

- El juego sigue apareciendo cuando el usuario consulta su lista, porque esa lectura se hace desde el dominio de juegos.

- Cuando entra a editarlo, se vuelve a intentar crear lo necesario en Play si todavía no existe.

- Esa operación se puede reintentar las veces necesarias.

En un caso así, no necesariamente hace falta persistencia de orquestación, porque las operaciones están diseñadas para ser idempotentes y reintentables.

Otros workflows sí pueden necesitar una saga, operaciones de compensación, una cola para continuar de forma asíncrona o alguna verificación posterior.

Por ejemplo, podríamos registrar una tarea que revise después de cierto tiempo si el flujo terminó correctamente y, si no, ejecute una compensación.

Para esos casos, Orchestrator puede guardar información como:

- Qué workflow se está ejecutando.

- Qué pasos lo componen.

- Cuáles se completaron.

- En qué momento se completó cada uno.

- Lo necesario para continuar, reintentar o compensar.

Esa persistencia pertenece a la coordinación del flujo.

Idempotencia y seguimiento de pasos

Todos los dominios deben manejar idempotencia cuando la operación no sea naturalmente idempotente. Orchestrator también.

La forma de registrar y ejecutar los pasos depende del workflow. Por ejemplo, hay que considerar qué pasa si se escribe primero en la tabla y después se hace la llamada al otro dominio, o si se hace al revés:

- Si primero se escribe y luego se llama, puede funcionar la escritura y fallar la llamada.

- Si primero se llama y después se registra el resultado, puede funcionar la llamada y fallar la escritura.

En ese segundo caso, si la llamada es idempotente, se puede volver a ejecutar el paso aunque ya haya ocurrido. Como sigue marcado como no completado, el proceso de reintento lo vuelve a llamar sin duplicar su efecto.

También puede haber casos donde no necesitemos seguir cada paso individualmente y podamos reintentar todo el workflow, dando por hecho que el flujo completo es idempotente.

No estoy definiendo una única implementación para todos los casos. El punto es que Orchestrator puede tener lógica y persistencia para manejar esos flujos, con el seguimiento, los reintentos y las compensaciones que cada uno necesite.

Inputs, respuestas y tipos expuestos

Orchestrator también arma la respuesta que devuelve al caller.

Puede definir un tipo propio que agrupe datos de varios dominios, o puede devolver directamente un tipo expuesto por uno de los dominios que coordinó. Por ejemplo, un método de Orchestrator podría retornar un tipo del paquete Play.

Esto es una excepción explícita a la regla general de las interfaces:

- Los dominios normales solo exponen métodos cuyos inputs y outputs dependen de tipos propios.

- Orchestrator y Composer pueden usar en sus interfaces tipos expuestos por los dominios con los que interactúan.

- También pueden definir sus propios tipos cuando tenga más sentido.

Orchestrator y Composer son los únicos dominios que tienen permitida esa excepción, porque su naturaleza es depender de los demás dominios para coordinarlos o componer sus resultados.

## composer

Composer es parecido a Orchestrator, pero se encarga exclusivamente de operaciones de lectura.

Funciona como una especie de backend for frontend, aunque sería más preciso llamarlo backend for consumer. Expone métodos que pueden convertirse en endpoints y cuyo objetivo es obtener y organizar datos de distintos dominios para el consumidor.

Composición de datos

Queremos que el frontend sea lo más sencillo posible y no tenga que conocer las relaciones entre dominios para construir cada elemento que muestra.

Eso no significa que una pantalla siempre deba resolverse con una sola llamada. Hay casos donde tiene sentido hacer varias llamadas desde el frontend para ir renderizando partes sin esperar a que todas las respuestas estén listas. Esa decisión puede tomarse por optimización.

Pero si, por ejemplo, construir el item de un juego requiere combinar datos de varios dominios, no queremos que el frontend tenga que saber a qué endpoint llamar para cada parte y cómo unir los resultados.

Esa es la responsabilidad de Composer: obtener la información necesaria y organizarla.

Por ejemplo, puede llamar al dominio de sesión, recibir datos que incluyen el identificador de un juego y después usar ese identificador para consultar el dominio de juegos.

Esa lógica de relacionar y complementar datos sí pertenece a Composer.

Ejemplo: notificaciones

Como se mencionó anteriormente, una notificación puede incluir una referencia al item o entidad sobre la que trata.

Al consultar las notificaciones, Composer puede revisar el tipo de cada una y decidir qué método de qué dominio debe llamar, con qué identificador, para obtener la información complementaria del evento.

Así, el consumidor recibe la notificación con los datos necesarios, sin tener que resolver por su cuenta esas relaciones.

Solo lectura y sin persistencia

Composer no tiene persistencia propia. No necesita tablas y no tiene permitido llamar métodos de escritura.

Toda su lógica es de lectura y composición de datos.

Esto requiere cuidado porque nuestro diseño no separa formalmente las operaciones de lectura y escritura mediante CQRS. Lo más cercano serían los casos de uso, pero un caso de uso también puede realizar escrituras.

No quiero introducir esa separación ni esa complejidad solamente para Composer. La idea es respetar que los métodos que utiliza sean lógicamente de lectura, como list, get o read, y mantener esa restricción en su implementación.

## identity

En mi propuesta, Identity se encarga tanto del perfil como de la autenticación y autorización.

Inicialmente pensaba separar esos conceptos, pero me parece que tiene sentido mantenerlos juntos, porque la existencia de una cuenta está relacionada con su acceso y sus permisos. Parte de esto ya está implementado en el código.

Identity es responsable de:

- Crear las cuentas.

- Gestionar los datos propios de la cuenta y del perfil, como el display name.

- Realizar los upgrades de cuenta.

- Exponer el identificador lógico del usuario.

- Resolver la identidad a partir de los tokens.

- Gestionar los tipos de cuenta, roles y permisos de operación.

Identificador lógico y upgrade de cuenta

Los demás dominios referencian al usuario mediante un identificador lógico. No necesitan saber si corresponde a una cuenta de invitado, una cuenta normal, un profesor o cualquier otro tipo.

Identity es el que conoce qué hay detrás de ese identificador.

Por eso, el upgrade de una cuenta de invitado a una cuenta real puede ser una operación contenida completamente en Identity. Actualiza su propia información, pero conserva el identificador único de la cuenta.

Para los demás dominios sigue siendo el mismo usuario. Sus referencias no cambian y así se conserva el historial sin tener que actualizarlo en todos los dominios.

Permisos de operación y scoping

El middleware de API se comunica con Identity para resolver quién está haciendo la request y si tiene permitido realizar esa operación.

Identity obtiene el usuario a partir del token, revisa el tipo de cuenta o rol y determina si puede acceder a la operación. Por ejemplo, una cuenta de invitado no puede crear un juego.

Pero eso es distinto de decidir si ese usuario puede acceder a un recurso específico.

Identity puede decir:

“Este usuario corresponde a este identificador y tiene permitido llamar a este método”.

No revisa los parámetros para decidir si el juego solicitado le pertenece o si puede ver cierta información concreta. Esa parte le corresponde al dominio que recibe la operación.

Por ejemplo, el dominio de juegos recibe el identificador externo del usuario y el identificador del juego solicitado. Si la operación requiere que sea el dueño y los identificadores no coinciden, rechaza la operación por sus reglas de scope.

Entonces:

- Identity verifica el permiso general para realizar la operación según la cuenta o el rol.

- El dominio correspondiente aplica las reglas sobre el recurso concreto usando el identificador del usuario recibido.

Roles y modo de uso de la cuenta

Creo que Identity también debe gestionar los roles o el modo en el que se está usando una cuenta.

Por ejemplo, una misma cuenta puede utilizarse como profesor o como usuario normal. En mi propuesta, los tokens serían distintos según el modo, aunque correspondan a la misma cuenta.

Identity sabe con qué rol está actuando en ese momento y permite o rechaza operaciones con base en eso. Por ejemplo, si está usando el modo profesor, no le permite operaciones que correspondan exclusivamente al modo normal.

Todavía hay que definir bien cómo se organizan estos conceptos, porque tenemos distintas distinciones:

- Una cuenta puede ser de invitado o una cuenta normal.

- Puede utilizarse como profesor o como jugador normal.

- También está la identidad de estudiante.

Puede que esto se modele mediante tipos de cuenta, roles o algún nivel adicional. Lo importante es que Identity sea el que conozca esas diferencias y resuelva los permisos correspondientes.

Identidades de estudiantes

La parte de estudiantes todavía no está completamente definida, como se explicó en sus flujos. Pero creo que Identity también debe participar, porque ese acceso necesita algún respaldo de autenticación, tokens y permisos.

Una posibilidad es que cada estudiante asociado a una clase tenga una cuenta o identidad separada dentro de Identity.

Eso no significa crear una cuenta central que agrupe todas las clases del mismo niño. Cada identidad de estudiante para una clase sería independiente.

El acceso se genera mediante el mecanismo que definamos para esa clase: ingresar el nombre, display name o identificador correcto, como se describió anteriormente. Identity sería responsable de generar el token correspondiente y reconocerlo en las siguientes operaciones.

Así puede identificar que está actuando como estudiante y, por ejemplo, negar el acceso a Discovery.

Pero Identity no decide si ese estudiante pertenece a la clase de una actividad concreta. Eso requiere consultar la relación con la clase y corresponde a otro dominio, que todavía tenemos que definir; puede estar relacionado con sesión o con la gestión académica.

La separación sigue siendo la misma: Identity verifica el rol y el permiso general, mientras que el dominio encargado comprueba si ese usuario está vinculado como estudiante de esa clase y puede unirse a la actividad.

Información para el frontend

También habrá una operación de obtener mis datos que le indique al frontend la identidad y el rol actual: estudiante, profesor, usuario normal, etc.

Con esa información, el frontend sabe qué experiencia y qué pantallas debe renderizar.

## game

Game es el dominio dueño de la entidad lógica del juego. Es la entidad que usamos para listar juegos y que contiene información como:

- Nombre.

- Descripción.

- Imagen principal.

- Usuario dueño del juego.

- Estado lógico, como borrador, público o privado.

Expone un identificador único que representa al juego, incluso cuando todavía es un borrador.

Separación entre Game y Session

El concepto de juego está dividido, como mínimo, entre Game y Session.

Game conoce la entidad lógica, pero los scripts, los ejecutables y las versiones pertenecen a Session. Session sabe qué versiones existen, cuál está actualmente seleccionada y si una versión es ejecutable.

Por eso también hay estados distintos:

- Game maneja el estado lógico del juego, como si está público, privado o en borrador.

- Session maneja el estado de cada versión, como si es ejecutable o no.

Game no sabe ejecutar el juego ni conoce las versiones que tiene por detrás. Tampoco determina si es ejecutable; eso lo sabe Session.

Límites y búsqueda

Game puede aplicar los límites relacionados con la existencia y creación de juegos, por ejemplo:

- Cuántos juegos puede tener un usuario al mismo tiempo.

- Cuántos juegos puede crear dentro de una ventana de tiempo.

Puede hacerlo porque es el dueño de esa información y de la relación “este juego pertenece a este usuario”.

También es el dominio principal para Discovery y la búsqueda de juegos por tags, categorías, fechas, dueño y los demás criterios que correspondan.

Duda sobre el dominio de creación de juegos

Todavía tengo dudas sobre dónde debería vivir la lógica del proceso de creación.

La creación es suficientemente compleja, con todas las herramientas que hay que exponer, los pasos y las operaciones involucradas, como para considerar un dominio propio o, al menos, un subdominio.

Podría ser un subdominio de Game o un dominio de primer nivel separado. Lo dejo como propuesta.

El flujo de creación utiliza tanto Game como Session y siento que no pertenece completamente a ninguno de los dos, sino que está en medio.

Inicialmente pensaba que podía ser un flujo compartido sin un dominio dueño específico, donde Orchestrator coordinara los métodos de Game y Session. Pero hay que analizar si eso sigue teniendo sentido o si conviene separar la creación en su propio dominio.

Por ahora, lo que sí queda claro es que Game es dueño de la entidad lógica del juego, sus datos, su relación con el usuario y las operaciones de consulta y búsqueda sobre esa información.

## play

Play es el dominio encargado de la ejecución de los juegos. Mientras Game es dueño de la entidad lógica del juego, Play maneja lo necesario para ejecutarlo: sus versiones, recursos y sesiones.

Esto vuelve a conectar con la duda anterior sobre dónde debe vivir el flujo de creación de juegos: si debe ser compartido, pertenecer a Game, estar dentro de Play o tener un dominio propio. Esa decisión sigue abierta.

Relación con el juego lógico

Play conoce el identificador externo del juego al que pertenece cada versión, pero no conoce quién es el dueño o creador de ese juego. Esa información pertenece a Game.

Internamente puede tener una tabla con un registro por cada juego lógico, en una relación uno a uno. No sería una réplica de los datos de Game, sino una representación interna para organizar sus propias referencias.

Como puede haber muchas versiones de un mismo juego, esas versiones podrían referenciar el ID interno de ese registro, en lugar de repetir la referencia al identificador externo.

Versiones y ejecución

Play es el que sabe:

- Qué versiones tiene un juego.

- Cuál es la versión activa.

- Qué versiones están listas para ejecutarse y cuáles no.

- Qué assets y scripts utiliza.

- Cómo ejecutar el juego.

También crea los cuartos o sesiones de juego y aplica los límites correspondientes, como cuántas sesiones puede crear un usuario al mismo tiempo.

Información de las sesiones

Aunque Play no conoce al dueño del juego, sí conoce al usuario que creó cada sesión y a quienes participaron en ella.

Es dueño de información como:

- Quién creó la sesión o cuarto.

- Qué jugadores se unieron.

- Cuándo salieron.

- Cuál fue el resultado de la sesión, por ejemplo si terminó exitosamente o no.

Esas responsabilidades pertenecen a Play como dominio general. A continuación voy a describir los tres subdominios que lo componen.

### session

La idea inicial es que Session sea el subdominio de Play encargado de toda la persistencia: los registros en la base de datos relacional y, en general, la información que necesitemos persistir.

El concepto lógico principal es la sesión y su ciclo de vida: se crea, permanece como un cuarto o lobby, se inicia, etc.

Pero acá tengo una duda sobre si también debería ser dueño del concepto interno de juego que existe dentro de Play, incluyendo las versiones y los scripts.

Tal vez tenga sentido dividirlo en dos subdominios:

- Session, para el concepto y ciclo de vida de las sesiones.

- Un subdominio de juego dentro de Play, para su representación interna, sus versiones y sus scripts. No sería el dominio Game de primer nivel.

Si dejamos Session definido simplemente como “todo lo de persistencia”, terminaría agrupando lógica del ciclo de vida de las sesiones, del flujo de creación de juegos y del versionamiento.

No tengo decidido si esa agrupación está bien o si conviene separarla. Por ahora, la propuesta inicial es concentrar la persistencia en Session, pero queda pendiente analizar si debería subdividirse.

### runtime

Runtime es el subdominio encargado de la ejecución y del estado en memoria de las sesiones.

Una instancia es dueña de una sesión y todas las operaciones de esa sesión se dirigen al contenedor o instancia correspondiente. Su ciclo de vida, su estado y los cambios durante la ejecución se manejan en la memoria local de ese runtime.

Runtime mantiene el controlador de la sesión en memoria y ejecuta sus pasos. También gestiona las conexiones lógicas con los usuarios.

Para realizar sus operaciones, interactúa con otros subdominios:

- Sandbox: Para ejecutar los scripts.

- Session: Para enviar las actualizaciones que deban persistirse en la base de datos o en almacenamiento externo.

Por ejemplo, durante la ejecución va enviando información para construir el historial del juego, y esa información queda guardada mediante Session.

Esas escrituras son operaciones secundarias respecto a su responsabilidad principal: mantener y controlar la sesión en memoria, ejecutar sus pasos y gestionar las conexiones lógicas de sus participantes.

#### Sandbox

Sandbox no es propiamente un dominio ni un subdominio, sino un servicio dedicado a ejecutar los scripts de backend de los juegos.

A diferencia de la separación lógica de los dominios, esta separación sí debe existir físicamente: Sandbox tiene que ejecutarse como un despliegue o proceso separado.

La idea es aislar la ejecución de los scripts por seguridad, además de que se trata de código escrito en otro lenguaje. Puede funcionar como un proceso separado en la misma máquina y comunicarse mediante pipes o algún otro mecanismo, pero debe mantenerse como un proceso aparte.

Runtime se comunica directamente con Sandbox y ambos mantienen en memoria el estado actual de la sesión. Sandbox es el que ejecuta el script, mientras que Runtime controla esa interacción y es, de cierta forma, el dueño de la sesión correspondiente dentro de Sandbox.

## notifications

Notifications es un dominio separado encargado de las notificaciones. No voy a entrar nuevamente en todo el detalle, porque su funcionamiento y la forma de integrarlo con los demás servicios ya se describieron anteriormente.

Los demás servicios son consumidores de Notifications. Notifications no se acopla a ellos, pero ellos sí se acoplan a Notifications. En ese sentido, es un dominio especial que permite ese acoplamiento.

De cierta forma, necesita conocer qué operaciones de notificación va a soportar para sus callers. Otra posibilidad, como se mencionó antes, es resolverlo mediante templates que el caller pueda personalizar.

Referencias externas

Notifications puede guardar identificadores externos. Por ejemplo, una notificación relacionada con un juego puede incluir un identificador asociado con ese juego.

Pero no le corresponde resolver esa relación ni conocer la entidad que hay detrás. Para Notifications, ese identificador es solamente un token externo.

Es el caller quien conoce su significado. Por ejemplo, Orchestrator o Composer puede solicitar las notificaciones asociadas con cierto identificador y saber que corresponden a un juego, una acción o alguna otra entidad.

Notifications devuelve las notificaciones correspondientes; el caller es quien conecta esa información con su contexto lógico.

## report

Report es el dominio encargado de los reportes. Como se explicó anteriormente, no se trata simplemente de reportes genéricos: cada tipo puede tener sus propios datos, relaciones y comportamiento, y esa lógica queda encapsulada en este dominio.

Report conoce los tipos de reporte disponibles, como un reporte sobre un juego o sobre una sesión. En ese sentido, conoce esos conceptos lógicos y puede referenciarlos mediante sus identificadores externos.

Según el tipo de reporte, define:

- Qué campos se requieren y qué valores se pueden reportar.

- Qué prioridad corresponde según la información recibida.

- Si requiere una respuesta del administrador.

También es dueño del intercambio que ocurre dentro del reporte. Un reporte puede recibir una respuesta del administrador y después otra del usuario que lo envió, continuando la conversación según las reglas correspondientes.

La máquina de estados del reporte, sus transiciones y las reglas de esas interacciones pertenecen a este paquete.

Report tiene sus propias tablas y reglas de negocio, y se relaciona con las entidades de otros dominios mediante sus identificadores externos.

## classroom

Classroom es el nombre que tengo en mente para el dominio que concentra las funcionalidades específicas de profesores. El nombre es una propuesta.

Sería dueño de toda la lógica relacionada con:

- Gestión de clases.

- Vinculación de estudiantes con clases.

- Material de estudio y contexto de las clases.

- Notas.

- Sesiones realizadas dentro de cada clase.

- La librería de actividades del profesor, incluyendo los juegos que incorpora como forks.

Classroom tiene sus propias tablas para gestionar esas relaciones y referencia las entidades de otros dominios mediante sus identificadores externos.

Por ejemplo, su librería referencia juegos mediante los identificadores que expone Game, y cada clase referencia las sesiones realizadas mediante los identificadores que expone Play.

Qué conoce cada dominio

La idea es que Game y Play puedan soportar las capacidades necesarias para la experiencia académica sin conocer cómo Classroom las utiliza.

Game puede saber que un juego está marcado como académico, igual que sabe si es público, privado o si está disponible como plantilla. También puede conocer los constraints que correspondan a esa característica, pero no necesita saber que Classroom lo tiene en la librería de un profesor ni cómo lo organiza.

Play puede soportar la capacidad de que un script exporte resultados en forma de notas. Pero no necesita conocer las reglas académicas ni qué hace Classroom después con esas notas.

El concepto de que una sesión pertenece a una clase existe en Classroom. Play solo conoce la sesión y su ejecución; no necesita saber que está asociada con un salón ni el significado académico de sus participantes.

Validación para unirse a una sesión de clase

Acá aparece una parte importante de la orquestación: si una sesión pertenece a una clase, antes de permitir que un usuario se una hay que validar su vinculación con esa clase.

Esa validación no corresponde a Play ni a Session, porque no conocen esa relación. Corresponde a Classroom.

El flujo podría ser:

- Llega una solicitud para que un usuario se una a una sesión.

- Orchestrator consulta a Classroom si esa sesión está asociada con una clase.

- Si no lo está, continúa con el flujo normal sin aplicar las reglas de Classroom.

- Si sí lo está, le pide a Classroom que valide si el usuario puede unirse.

- Classroom revisa si el identificador externo del usuario está asociado con esa clase y aplica sus reglas.

- Si lo permite, Orchestrator continúa con la operación de unión en Play, pasando el identificador del usuario y el de la sesión.

Classroom conoce esa vinculación porque es dueño de las clases y de las relaciones con sus estudiantes.

Relación con Identity

Como se explicó en Identity, el estudiante tiene una forma especial de acceso, pero para el resto del sistema sigue estando representado por un identificador externo de usuario.

Los dominios que reciben ese identificador no tienen que resolver qué tipo de cuenta hay detrás. Esa responsabilidad está en Identity y en la capa superior que valida la request.

Identity determina que el usuario está actuando como estudiante y que tiene permitido realizar la operación en general.

Cuando la operación llega a Classroom, este no tiene que volver a determinar si la cuenta es de tipo estudiante. Lo que valida es su propia relación:

“¿Este identificador de usuario está vinculado con esta clase?”

Así se mantiene la separación entre el permiso general de la cuenta y la regla específica de acceso a la clase.

Classroom como parte opcional de un flujo

Lo complejo es que Classroom aparece como una llamada intermedia opcional dentro de operaciones que también existen fuera de la experiencia de profesor.

Por ejemplo, unirse a una sesión puede requerir pasar por Classroom o no. Eso depende de si la sesión está asociada con una clase.

En la propuesta anterior, incluso para saber si hace falta esa validación tendríamos que consultar primero a Classroom. Puede que encontremos otra forma de resolverlo, pero la idea es mantener esa decisión en la capa de orquestación, sin hacer que Session conozca las clases.

Tal vez se podría implementar como algún tipo de middleware opcional, aunque creo que encaja principalmente en Orchestrator: consultar el contexto, decidir qué camino aplica y llamar a los dominios correspondientes.

Exportación y consulta de notas

La exportación de notas puede tratarse como una capacidad de Play: el script puede generar resultados mediante un contrato, en este caso notas por participante.

Play soporta esa funcionalidad, pero no necesita conocer las condiciones académicas bajo las cuales se utiliza ni cómo se gestionan después los resultados.

Game, por su parte, conoce la clasificación del juego como académico. Classroom es el que conoce cómo utilizar esas capacidades dentro de la experiencia de profesor.

Por ejemplo, para obtener y procesar las notas de las sesiones de una clase, podríamos tener una coordinación como esta:

- Orchestrator consulta a Classroom los UUIDs de las sesiones asociadas con la clase.

- Classroom devuelve esos identificadores, porque es quien mantiene la relación.

- Orchestrator consulta a Play los resultados de las sesiones identificadas.

- Play devuelve los resultados en notas que produjeron esas sesiones.

- Orchestrator se los entrega a Classroom para que los maneje dentro de su lógica académica.

No sería Classroom llamando directamente a Play. Toda esa comunicación sigue siendo orquestada.

Acoplamiento mediante conceptos e identificadores

No espero que los dominios ignoren completamente lo que existe fuera de ellos. Es normal que Classroom conozca conceptos como juegos, sesiones y usuarios, porque necesita relacionarlos con su propia lógica.

Lo importante es que ese conocimiento se limite a las referencias y contratos que necesita, sin depender de cómo los otros dominios implementan sus entidades.

Classroom puede saber que cierto identificador representa una sesión, pero no conoce sus tablas ni cómo se ejecuta. Lo mismo aplica a los juegos y a los usuarios.

Cada dominio implementa capacidades que tienen sentido dentro de su responsabilidad. Después, las capas superiores las coordinan para ofrecer una funcionalidad transversal del producto.

La parte que probablemente quede un poco menos elegante es tener que introducir Classroom opcionalmente en algunos flujos: comprobar si existe una relación con una clase y, si existe, aplicar sus reglas antes de continuar. Si no existe, se omite esa parte.

Creo que ese costo sigue siendo aceptable si permite mantener las responsabilidades separadas y evitar que Game o Play tengan que conocer toda la experiencia académica.

## plan

Plan es el último dominio que tengo en mente por ahora, pero eso no significa que estos sean todos los dominios que necesariamente debe tener la plataforma.

Su responsabilidad es gestionar los planes y los límites de capacidad que le corresponden a cada usuario según su suscripción, sus compras y sus condiciones actuales.

Tres tipos de límites

Hay que distinguir tres niveles de límites:

- Límites de red: Los aplica API, porque es el dominio que expone la plataforma al mundo. Incluyen el rate limiting para evitar ataques y controlar las llamadas recibidas.

- Límites lógicos del dominio: Son las restricciones propias de cada dominio. Por ejemplo, aunque una request haya pasado el filtro de red, el dominio puede decidir que no tiene sentido permitir que alguien cree diez sesiones por segundo o incluso por minuto.

- Límites de capacidad por plan: Definen cuánto puede usar una cuenta según su plan y sus condiciones. Estos son responsabilidad de Plan.

Plan no reemplaza los límites propios de cada dominio. Define los valores de capacidad que después se pasan a las operaciones correspondientes.

Obtención y aplicación de límites

Por ejemplo, una operación de crear sesión puede funcionar así:

- Identity valida que el tipo de cuenta o rol tenga permitido realizar esa operación.

- Una capa intermedia consulta a Plan los límites del usuario. Puede ser una llamada de Orchestrator; no necesariamente tiene que ser un middleware de API.

- Plan devuelve los límites que corresponden. Por ejemplo, crear hasta 20 sesiones en una ventana de los últimos 10 días.

- Orchestrator pasa esos valores al dominio encargado de la sesión, junto con el UUID del usuario.

- Ese dominio consulta su propia información para determinar cuántas sesiones ha creado el usuario y si puede crear otra.

- Aplica el límite más restrictivo entre el recibido y sus propias restricciones.

El dominio de sesión no sabe que existe Plan ni de dónde vienen esos valores. Su interfaz simplemente permite que el caller indique los límites con los que debe trabajar, y confía en que recibió los valores correctos.

Si el límite recibido es más restrictivo, aplica ese. Si el límite propio del dominio es más restrictivo, aplica el suyo.

Plan define la capacidad; el dominio dueño de los datos verifica el uso real y aplica la restricción.

Persistencia y límites por defecto

Plan tiene persistencia propia y tablas para gestionar los planes y las capacidades de los usuarios.

Eso no significa que necesariamente deba guardar un registro para cada usuario de la plataforma. Probablemente solo necesite información específica de las cuentas que tienen condiciones distintas a las gratuitas por defecto, por ejemplo:

- Una suscripción.

- Una compra o microtransacción que amplía sus límites.

- Alguna otra condición de plan que modifique su capacidad.

Cuando recibe un identificador de usuario, puede responder los límites de una operación específica o todos los límites que le corresponden:

- Si tiene información de ese usuario, calcula los valores actuales según su plan, sus compras y las condiciones registradas.

- Si no tiene información, devuelve los límites por defecto de las cuentas gratuitas normales.

También es responsable de realizar los upgrades de plan. En esencia, un upgrade aumenta la capacidad disponible y, en el caso del plan de profesor, habilita funcionalidades adicionales.

Plan de profesor y relación con Identity

Plan es el que sabe si una cuenta tiene acceso a la experiencia de profesor. Identity es el que maneja el rol con el que esa cuenta está actuando.

La propuesta para cambiar del modo normal al modo profesor sería:

- El usuario solicita cambiar al modo profesor.

- El flujo de autenticación coordina una consulta a Plan para confirmar si esa cuenta tiene habilitado ese acceso.

- Plan responde si puede utilizarlo.

- Si está permitido, Identity genera los tokens de acceso con los permisos de profesor.

- A partir de ahí, el usuario puede acceder a los paneles y endpoints reservados para ese rol.

Identity no tendría que consultar a Plan en cada operación posterior. Reconoce que el usuario está actuando con un token de profesor, cuyo permiso se concedió después de confirmar el acceso con Plan.

Esto sigue siendo la misma cuenta, pero utilizada con los permisos del modo profesor.

Después, cada dominio aplica sus propias reglas sobre los recursos solicitados. Por ejemplo, Classroom recibe el identificador del usuario y comprueba qué clases tiene asociadas y qué operaciones puede realizar sobre ellas.

Así se distribuyen las responsabilidades: Plan conoce la capacidad y las funcionalidades contratadas, Identity genera y valida los permisos del rol, y cada dominio aplica sus reglas sobre los datos que le pertenecen.

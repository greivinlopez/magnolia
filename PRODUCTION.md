# Notas de producción — Magnolia

## Dirección

Paleta solicitada: Dark Green #0A3323, Moss Green #839958, Beige #F7F4D5, Rosy Brown #D3968C y Midnight Green #105666. Verde oscuro y beige como base; verde musgo para bordes y fondos suaves; rosa para detalles; verde medianoche para texto secundario y la sección de proceso. Playfair Display para titulares, DM Sans para lectura. Fuentes cargadas desde Google Fonts con alternativas del sistema. Logo de referencia suministrado por el usuario, preservado sin redibujar en `assets/brand/magnolia-silhouette.png`.

Contenido comercial basado en la información entregada por el usuario. Se conservan las tres áreas de servicio, los entregables y el alcance de certificaciones y ensayos. No se agregaron testimonios, cifras ni certificaciones propias.

## Producción visual

Proveedor: PicX MCP, dentro de esta conversación.
Modelo: `fal-ai/kling-video/v3/pro`.
Generación: `169c540c-5864-486c-8632-2b63de4c41a7`.
Duración solicitada: 12 segundos, 1080p, 16:9, sin audio.
Créditos reportados por PicX: 552.

Se consultaron plantillas de PicX. Los resultados de anime/fantasía no correspondían a la escena solicitada, por lo que se utilizó una descripción específica de la toma continua. El prompt completo se conserva en `assets/source/generation-prompt.txt`.

Se inspeccionaron fotogramas de apertura, descenso, oclusión, revelación y cierre. La toma mantiene el agua, las lámparas y la flor; termina en una magnolia natural. El video original permanece intacto y termina en su último fotograma; no se transforma en logo. El número exacto de lámparas no se garantiza en todos los fotogramas por oclusión y recorte; se solicitaron siete y la escena conserva una cantidad reducida.

## Scroll y carga

217 fotogramas WebP, 1280 × 720, muestreados a 18 fps; aproximadamente 6,37 MB en total. Póster inmediato, tres solicitudes simultáneas como máximo y caché de 18 fotogramas decodificados. Las peticiones fallidas se reintentan un máximo de dos veces por fotograma. Las descargas de fotogramas se omiten cuando se solicita movimiento reducido o ahorro de datos.

500vh de recorrido activo más 100vh de escenario visible. Cronología segmentada: apertura 0–16%; pausa 16–22%; descenso 22–65%; revelación 65–84%; acercamiento 84–91%; cierre 91–100%. El scroll es nativo, reversible y se puede saltar. Los textos y controles son HTML.

## Verificación

Compilación estática y comprobación de sintaxis. Revisión de dimensiones y numeración de todos los fotogramas. Prueba visual en navegador integrado a 319 px de ancho: portada, descenso, revelación, navegación a servicios, apertura de consultoría y acceso al contacto. Se ajustó la posición del texto de revelación para dejar visible la flor en móvil. La fluidez en dispositivos reales, la vista de escritorio y el modo de movimiento reducido no han sido probados en todos los navegadores.

No se envió ningún mensaje ni se confirmó ninguna cita durante la verificación. Correo y WhatsApp configurados con los datos facilitados por el usuario.

## Integración del logo

La versión actual utiliza la nueva silueta PNG transparente (824 × 824) suministrada por el usuario, sin recortes del diseño. Cabecera y pie conservan el nombre en HTML al lado del símbolo. El símbolo aparece sobre marfil en las zonas oscuras y sobre el fondo de la sección en el enfoque. Se sustituyó también en el tablero visual.

Se eliminó la transición a marfil y el logo al final de la historia. La cronología llega a los 12 segundos y conserva el fotograma final de la magnolia blanca antes de continuar al contenido.


## Adaptación móvil — 25 de octubre de 2026

Skill aplicado: `mobile prompt.md`, entregado por el usuario. La misma página y base de código incluyen composiciones responsive independientes.

Video vertical PicX: `7ddd428d-2439-48b7-8ec5-80979c094d75`, modelo `fal-ai/kling-video/v3/pro`, 12 segundos, 1080p, 9:16, sin sonido; 552 créditos reportados. La tentativa previa por referencia `ee771a27-2c05-4afc-a455-21b5fe145cf0` falló con 404; el proveedor también reportó 552 créditos para esa tentativa, sin confirmar reembolso. La versión completada se generó mediante descripción textual: conserva lámparas de papel, agua otoñal, descenso de cámara y magnolia blanca; no es una reproducción exacta de los objetos del clip horizontal.

Se inspeccionaron fotogramas cada dos segundos. Una única toma evita empalmes. El video original vertical se conserva en `assets/source/magnolia-mobile-original.mp4`. La secuencia publicada utiliza los primeros 10 segundos para evitar que el acercamiento final corte los pétalos en pantallas altas: 181 WebP de 720 × 1280 a 18 fps, 6.99 MB decimales en total (6,988,730 bytes). Esto es peso de archivos, no una medición de velocidad de carga. El escritorio conserva su video y final originales, sin transformación al logo.

El móvil tiene 320svh de recorrido activo y una breve pausa final. El texto inicial desaparece durante el movimiento y reaparece un mensaje con CTA en el cierre. Encabezado fijo fuera de la escena, menú dialog con foco circular explícito, Escape, cierre al seleccionar y enlaces compensados 84 px en las pruebas. Los campos usan 16 px y los controles principales al menos 44 px. Safe areas implementadas con env().

Verificación: navegador integrado a 320×568, 390×844 y 430×932; escritorio a 1440×900. Comprobados menú, Escape, retorno de foco, Mayús+Tab, destino de enfoque, ausencia de desbordamiento horizontal, navegación persistente, portada y cierre. Prueba aislada del renderer en Node comprobó selección exclusiva de rutas móvil/escritorio, cancelación al cruzar breakpoint, cero solicitudes en movimiento reducido/ahorro de datos y póster ante fallo de manifiesto. No se midieron velocidades de red ni rendimiento en teléfonos físicos; movimiento reducido y fallos se verificaron mediante el harness, no mediante preferencias reales del dispositivo. La secuencia no se precarga completa y la interfaz no espera a su descarga.

## Vista previa al compartir

Open Graph y Twitter Card incluidos directamente en el HTML, con URL canónica https://magnoliasostenible.com/. Imagen `assets/social/magnolia-share-v1.jpg`, 1200 × 630, 145,289 bytes. Generada con PicX `openai/gpt-image-2`, ID `img_301973d8e647`, 53 créditos reportados; adaptada al formato horizontal y comprimida a JPEG. El original permanece en assets/source. No se enviaron mensajes de prueba a terceros. Se verifica disponibilidad pública y metadatos; el renderizado final en WhatsApp depende de su cliente y caché.

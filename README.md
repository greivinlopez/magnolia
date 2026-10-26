# Magnolia

Sitio editorial en español para consultoría en sostenibilidad textil, talleres y asesoría de consumo responsable.

## Ejecutar

Requiere Node.js 20 o posterior. Sin dependencias npm.

```sh
npm run dev
npm run check
npm run build
```

La vista local se sirve en http://localhost:4173. El sitio estático listo para hosting se genera en `dist/`.

## Editar

- `content.json`: servicios, entregables, correo, teléfonos y futura URL de reservas.
- `index.html`: textos de portada, enfoque y proceso.
- `styles.css`: paleta, tipografía y distribución adaptable.
- `style-tile.html`: tablero de dirección visual con los mismos estilos.
- `assets/sequence.json`: índice de paquetes de escritorio. `assets/manifest.json` conserva la fuente de fotogramas para regenerarlos.
- `app.js`: contenido y comportamiento de contacto.
- `motion.js`: selección de secuencia, suavizado y cronologías de scroll.
- `frame-store.js`: descargas agrupadas, prioridad de fotogramas y caché.
- `navigation.js`: menú móvil accesible.
- `mobile.css`: composición y navegación móvil.
- `assets/mobile/sequence.json`: índice de paquetes de la secuencia vertical independiente.

La silueta transparente suministrada se conserva intacta en `assets/brand/magnolia-silhouette.png`. Se utiliza en cabecera, pie, enfoque y tablero visual, con fondos acordes a cada sección. El video termina en su último fotograma de la flor blanca, sin transición al logo ni pantalla final de marca.

El formulario abre el cliente de correo del visitante con un borrador dirigido a contacto@magnoliasostenible.com; no envía mensajes desde un servidor. Los botones de WhatsApp abren los números facilitados. Concertar una cita es una solicitud de disponibilidad, no una reserva automática.

## Render

Se incluye `render.yaml` para un sitio estático: `npm run build`, directorio `dist`. El despliegue automático está desactivado en el archivo. El repositorio remoto existente es https://github.com/greivinlopez/magnolia.

El sitio se publica en Render desde la rama `main` de este repositorio. Los despliegues se activan manualmente.

## Medios

El clip original se conserva localmente en `assets/source/magnolia-original.mp4`. La carpeta `assets/source` no se publica en el build ni se incluye en Git. Los paquetes que contienen la secuencia WebP son parte del sitio. Ver `PRODUCTION.md` para procedencia y límites.

## Experiencia móvil

El mismo sitio selecciona automáticamente la secuencia vertical hasta 760 px y la horizontal por encima de ese ancho. El póster también es responsive. Cabecera fija, menú modal con teclado y Escape, controles táctiles amplios y enlaces con compensación de cabecera. El recorrido activo móvil es 320svh; escritorio conserva 500svh. Se omiten los fotogramas con movimiento reducido o ahorro de datos. La caché mantiene como máximo 18 imágenes decodificadas, 16 MiB de datos comprimidos y dos solicitudes simultáneas. Las descargas comprimidas se reutilizan al retroceder.

Para regenerar los paquetes después de cambiar los fotogramas: `npm run pack:frames`. Los nombres incorporan un hash del contenido; guarda también ambos archivos `sequence.json`. El build publica los paquetes y omite los fotogramas individuales. Ejecuta `npm test` para verificar prioridad, límites de memoria, fallos y limpieza.

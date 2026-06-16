# Cadence — Landing

Estudio creativo y tecnológico (Barcelona). Identidad de marca, diseño web y crecimiento.
Sitio estático, sin build. HTML + CSS + JS y una secuencia de fotogramas para el hero cinematográfico.

## Estructura
```
index.html
vercel.json
robots.txt
assets/
  css/styles.css
  js/main.js
  img/   (favicon.svg, poster.jpg, og.jpg)
  frames/  (f001.webp … secuencia del hero)
```

## Configurar
Edita `assets/js/main.js` → objeto `CONFIG`:
- `whatsapp`  tu número (prefijo, sin + ni espacios)
- `email`     tu email
- `revealAt`  cuándo aparece el titular al hacer scroll (0–1)

## Desarrollo local
El hero carga imágenes por red, así que usa un servidor local (no abras el archivo con doble clic):
```
npx serve .
# o
python3 -m http.server 8080
```

## Deploy en Vercel (GitHub)
1. Crea un repo y sube todo el contenido de esta carpeta a la raíz.
2. En vercel.com → Add New → Project → importa el repo.
3. Framework Preset: **Other** (es estático, sin build). Deploy.
Cada `git push` actualiza la web.

## Cambiar el vídeo del hero (recomendado para producción)
El hero usa una secuencia de fotogramas. Para regenerarla desde un vídeo nuevo
(idealmente un export en HD y SIN marca de agua), con ffmpeg:
```
ffmpeg -i tu-video.mp4 -vf "fps=18,scale=752:560" -c:v libwebp -q:v 50 -vsync 0 assets/frames/f%03d.webp
```
Ajusta `frameCount` en `CONFIG` al número de imágenes resultante.

## Formulario
Ahora abre el cliente de correo (mailto). Para recibir leads de verdad,
conecta el form a Formspree o Supabase (un endpoint en el `submit` de `main.js`).

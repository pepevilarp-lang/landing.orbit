/* =========================================================
   Cadence — main.js
   Scroll-driven cinematic hero (canvas frame sequence)
   ========================================================= */

/* ---- CONFIG: edita estos valores ---- */
const CONFIG = {
  whatsapp: "34600000000",                 // tu número, prefijo incluido, sin + ni espacios
  email:    "hola@cadence.studio",          // tu email
  waMessage:"Hola Cadence, quiero crear mi identidad de marca.",
  frameCount: 91,                           // nº de imágenes en assets/frames
  framePath: (i) => `f${String(i).padStart(3,"0")}.webp`,
  revealAt: 0.62                            // progreso (0-1) en el que aparece el titular
};

/* ---- enlaces WhatsApp / email ---- */
const waLink = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.waMessage)}`;
document.querySelectorAll(".js-wa").forEach(a => { a.href = waLink; a.target = "_blank"; a.rel = "noopener"; });

const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

/* =========================================================
   1. Preload de la secuencia de fotogramas
   ========================================================= */
const frames = [];
let loaded = 0;
const loader = document.getElementById("loader");
const lpfill = document.getElementById("lpfill");

function preload() {
  for (let i = 1; i <= CONFIG.frameCount; i++) {
    const img = new Image();
    img.decoding = "async";
    img.src = CONFIG.framePath(i);
    img.onload = img.onerror = () => {
      loaded++;
      if (lpfill) lpfill.style.width = Math.round((loaded / CONFIG.frameCount) * 100) + "%";
      if (loaded === 1) render(0);                       // pinta el primer frame cuanto antes
      if (loaded === CONFIG.frameCount) hideLoader();
    };
    frames.push(img);
  }
  // failsafe: nunca dejes el loader colgado
  setTimeout(hideLoader, 4000);
}

let loaderHidden = false;
function hideLoader() {
  if (loaderHidden) return;
  loaderHidden = true;
  loader && loader.classList.add("done");
}

/* =========================================================
   2. Canvas + render "cover"
   ========================================================= */
const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d", { alpha: false });
let cw = 0, ch = 0;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cw = Math.floor(canvas.clientWidth * dpr);
  ch = Math.floor(canvas.clientHeight * dpr);
  canvas.width = cw; canvas.height = ch;
  render(lastIdx, true);
}

let lastIdx = -1;
function render(idx, force) {
  idx = Math.max(0, Math.min(CONFIG.frameCount - 1, idx | 0));
  // si el frame pedido no está listo, busca el más cercano cargado
  let img = frames[idx];
  if (!img || !img.complete || !img.naturalWidth) {
    for (let d = 1; d < CONFIG.frameCount; d++) {
      const a = frames[idx - d], b = frames[idx + d];
      if (a && a.complete && a.naturalWidth) { img = a; break; }
      if (b && b.complete && b.naturalWidth) { img = b; break; }
    }
  }
  if (!img || !img.naturalWidth) return;
  if (idx === lastIdx && !force) return;
  lastIdx = idx;
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const s = Math.max(cw / iw, ch / ih);
  const w = iw * s, h = ih * s;
  ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
}

/* =========================================================
   3. Scroll storytelling (lerp -> 60fps)
   ========================================================= */
const cine = document.getElementById("top");
const stage = cine.querySelector(".stage");
const intro = document.getElementById("intro");
const main = document.getElementById("main");
const redglow = document.getElementById("redglow");
const progressBar = document.getElementById("progress");

let curIdx = 0;
const easeInOut = (x) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

function tick() {
  const span = Math.max(cine.offsetHeight - stage.offsetHeight, 1);
  const p = Math.min(Math.max(window.scrollY / span, 0), 1);

  // fotograma objetivo con suavizado
  const target = easeInOut(p) * (CONFIG.frameCount - 1);
  curIdx += (target - curIdx) * 0.16;
  render(Math.round(curIdx));

  // capas (solo opacity/transform -> GPU)
  redglow.style.opacity = (0.12 + p * 0.5).toFixed(3);
  intro.style.opacity = Math.max(1 - p * 5, 0).toFixed(3);
  const lc = Math.min(Math.max((p - CONFIG.revealAt) / 0.26, 0), 1);
  main.style.opacity = lc.toFixed(3);
  main.style.transform = `translateY(${(1 - lc) * 26}px)`;

  // barra de progreso global
  const docH = document.documentElement.scrollHeight - innerHeight;
  progressBar.style.width = (window.scrollY / docH * 100) + "%";

  requestAnimationFrame(tick);
}

/* =========================================================
   4. Reveals + red line
   ========================================================= */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.16 });
document.querySelectorAll(".rv, .redline").forEach(el => io.observe(el));

/* =========================================================
   5. Formulario -> mailto (conéctalo a Formspree/Supabase para producción)
   ========================================================= */
const form = document.getElementById("form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target;
  if (!f.nombre.value || !f.email.value || !f.mensaje.value) { f.reportValidity(); return; }
  const body =
    `Nombre: ${f.nombre.value}%0D%0AEmail: ${f.email.value}%0D%0AEmpresa: ${f.empresa.value}%0D%0A%0D%0A${f.mensaje.value}`;
  window.location.href =
    `mailto:${CONFIG.email}?subject=${encodeURIComponent("Nuevo proyecto · " + f.nombre.value)}&body=${body}`;
});

/* =========================================================
   6. Init
   ========================================================= */
window.addEventListener("resize", resize, { passive: true });

if (reduce) {
  // sin animación: muestra el último frame (Sagrada) + titular
  preload();
  const show = () => { resize(); render(CONFIG.frameCount - 1, true); main.style.opacity = 1; intro.style.opacity = 0; };
  setTimeout(show, 300);
} else {
  resize();
  preload();
  requestAnimationFrame(tick);
}

/* =========================================================
   Cadence — main.js  (hero de imagen única, zoom a la Sagrada)
   ========================================================= */

/* ---- CONFIG: edita estos valores ---- */
const CONFIG = {
  whatsapp: "34600000000",                  // tu número, prefijo incluido, sin + ni espacios
  email:    "hola@cadence.studio",           // tu email
  waMessage:"Hola Cadence, quiero crear mi identidad de marca.",
  revealAt: 0.55                             // progreso (0-1) en el que aparece el titular
};

/* enlaces WhatsApp / email */
const waLink = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.waMessage)}`;
document.querySelectorAll(".js-wa").forEach(a => { a.href = waLink; a.target = "_blank"; a.rel = "noopener"; });

const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

const img      = document.getElementById("heroImg");
const scrim    = document.getElementById("scrim");
const cine     = document.getElementById("top");
const stage    = cine.querySelector(".stage");
const intro    = document.getElementById("intro");
const main     = document.getElementById("main");
const redglow  = document.getElementById("redglow");
const focus    = document.getElementById("focus");
const progress = document.getElementById("progress");

const easeInOut = (x) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
let cur = 0;

function tick() {
  const span = Math.max(cine.offsetHeight - stage.offsetHeight, 1);
  const target = Math.min(Math.max(window.scrollY / span, 0), 1);
  cur += (target - cur) * 0.10;                 // suavizado -> flow
  const p = cur, e = easeInOut(p);

  // zoom moderado hacia la Sagrada (transform -> GPU, 60fps)
  img.style.transform = `scale(${(1.05 + e * 0.50).toFixed(4)})`;

  // capas (solo opacity)
  redglow.style.opacity = (0.12 + p * 0.55).toFixed(3);
  focus.style.opacity   = Math.min(Math.max((p - 0.15) / 0.6, 0), 1) * 0.9;
  scrim.style.opacity   = (0.28 + p * 0.34).toFixed(3);   // oscurece para que el titular se lea
  intro.style.opacity   = Math.max(1 - p * 5, 0).toFixed(3);

  const lc = Math.min(Math.max((p - CONFIG.revealAt) / 0.28, 0), 1);
  main.style.opacity = lc.toFixed(3);
  main.style.transform = `translateY(${((1 - lc) * 26).toFixed(1)}px)`;

  // barra de progreso global
  const docH = document.documentElement.scrollHeight - innerHeight;
  if (docH > 0) progress.style.width = (window.scrollY / docH * 100) + "%";

  requestAnimationFrame(tick);
}

if (reduce) {
  img.style.transform = "scale(1.15)";
  scrim.style.opacity = 0.45; if(focus) focus.style.opacity = 0.7;
  main.style.opacity = 1;
  intro.style.opacity = 0;
} else {
  requestAnimationFrame(tick);
}

/* reveals + red line */
const io = new IntersectionObserver((entries) => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
}, { threshold: 0.16 });
document.querySelectorAll(".rv, .redline").forEach(el => io.observe(el));

/* formulario -> mailto (conéctalo a Formspree/Supabase para producción) */
const form = document.getElementById("form");
form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const f = ev.target;
  if (!f.nombre.value || !f.email.value || !f.mensaje.value) { f.reportValidity(); return; }
  const body = `Nombre: ${f.nombre.value}%0D%0AEmail: ${f.email.value}%0D%0AEmpresa: ${f.empresa.value}%0D%0A%0D%0A${f.mensaje.value}`;
  window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Nuevo proyecto · " + f.nombre.value)}&body=${body}`;
});

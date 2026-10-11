// Studio address. The contact form, mailto fallback, and footer link all read this.
const STUDIO_MAIL = "studio@example.com";

const frames = [...document.querySelectorAll(".frame")];
const stills = [...document.querySelectorAll(".still")];
const dialog = document.querySelector(".lightbox");
const lightboxImg = dialog.querySelector("img");
const lightboxTitle = dialog.querySelector(".lb-title");
const lightboxNote = dialog.querySelector(".lb-note");
const lightboxMeta = dialog.querySelector(".lb-meta");
const lightboxCount = dialog.querySelector(".lb-count");

let active = [];
let cursor = 0;

document.querySelectorAll("[data-mail]").forEach((node) => {
  node.textContent = STUDIO_MAIL;
  if (node instanceof HTMLAnchorElement) node.href = `mailto:${STUDIO_MAIL}`;
});

const form = document.querySelector(".note");
if (form) form.action = `mailto:${STUDIO_MAIL}`;

const yearNode = document.querySelector("[data-year]");
if (yearNode) yearNode.textContent = String(new Date().getFullYear());

const nav = document.querySelector(".nav");
const progress = document.querySelector(".progress");
const sheet = document.querySelector(".hero-sheet");

function onScroll() {
  const scrolled = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.transform = `scaleX(${max > 0 ? scrolled / max : 0})`;
  if (nav && sheet) {
    const trigger = sheet.getBoundingClientRect().top + scrolled - nav.offsetHeight;
    nav.classList.toggle("is-solid", scrolled >= trigger - 1);
  }
}

document.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const filters = document.querySelector(".filters");
const grid = document.querySelector(".grid");

filters?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  const filter = button.dataset.filter;
  filters.querySelectorAll("button").forEach((item) => {
    const on = item === button;
    item.classList.toggle("is-on", on);
    item.setAttribute("aria-pressed", on ? "true" : "false");
  });
  frames.forEach((frame) => {
    frame.hidden = filter !== "all" && frame.dataset.cat !== filter;
  });
  grid?.classList.toggle("is-filtered", filter !== "all");
});

function show(set, index) {
  const list = set.filter((node) => !node.hidden);
  if (!list.length) return;
  active = list;
  cursor = (index + list.length) % list.length;
  const node = list[cursor];
  const source = node.querySelector("img");
  lightboxImg.src = source.currentSrc || source.src;
  lightboxImg.alt = node.dataset.alt || "";
  lightboxTitle.textContent = node.dataset.title || "";
  lightboxNote.textContent = node.dataset.note || "";
  lightboxMeta.textContent = node.dataset.meta || "";
  lightboxCount.textContent = `${String(cursor + 1).padStart(2, "0")}  /  ${String(list.length).padStart(2, "0")}`;
  if (!dialog.open) dialog.showModal();
}

document.querySelector(".grid")?.addEventListener("click", (event) => {
  const frame = event.target.closest(".frame");
  if (!frame || frame.hidden) return;
  const visible = frames.filter((item) => !item.hidden);
  show(frames, visible.indexOf(frame));
});

document.querySelector(".film")?.addEventListener("click", (event) => {
  const still = event.target.closest(".still");
  if (!still) return;
  show(stills, stills.indexOf(still));
});

dialog.querySelector(".lb-next")?.addEventListener("click", () => show(active, cursor + 1));
dialog.querySelector(".lb-prev")?.addEventListener("click", () => show(active, cursor - 1));
dialog.querySelector(".lb-close")?.addEventListener("click", () => dialog.close());

dialog.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    show(active, cursor + 1);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    show(active, cursor - 1);
  }
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const message = String(data.get("message") || "").trim();
  const body = `${message}\n\n— ${name}\n${email}`;
  window.location.href = `mailto:${STUDIO_MAIL}?subject=${encodeURIComponent(`A sitting — ${name}`)}&body=${encodeURIComponent(body)}`;
  const status = form.querySelector(".form-status");
  if (status) status.textContent = "Your mail app should open with the note ready to send.";
});

const links = [...document.querySelectorAll(".nav a[href^='#']")].filter((link) => link.getAttribute("href") !== "#top");
const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);

const spy = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = `#${entry.target.id}`;
    links.forEach((link) => {
      const on = link.getAttribute("href") === id;
      link.classList.toggle("is-here", on);
      if (on) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  });
}, { rootMargin: "-45% 0px -50% 0px", threshold: 0.01 });

sections.forEach((section) => spy.observe(section));

const at = new URLSearchParams(window.location.search).get("at");
if (at) {
  const node = document.getElementById(at);
  if (node) {
    document.documentElement.style.scrollBehavior = "auto";
    node.scrollIntoView();
  }
}

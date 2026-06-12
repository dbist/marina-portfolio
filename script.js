const header = document.querySelector("[data-header]");

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

// Mobile navigation disclosure
const navToggle = document.querySelector("[data-nav-toggle]");
if (navToggle && header) {
  const closeNav = () => {
    header.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  };
  navToggle.addEventListener("click", () => {
    const open = header.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  header.querySelectorAll(".nav a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });
}

// Lightbox for enlarging high-resolution deck boards
const lightbox = document.querySelector("[data-lightbox]");
if (lightbox) {
  const lightboxImg = lightbox.querySelector(".lightbox-img");
  const lightboxClose = lightbox.querySelector(".lightbox-close");
  let lastFocused = null;

  const openLightbox = (src, alt) => {
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lastFocused = document.activeElement;
    lightbox.hidden = false;
    document.body.classList.add("has-lightbox-open");
    lightboxClose.focus();
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    lightboxImg.removeAttribute("src");
    document.body.classList.remove("has-lightbox-open");
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  };

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    // Minimal focus trap: only the close button is interactive.
    if (event.key === "Tab") {
      event.preventDefault();
      lightboxClose.focus();
    }
  });

  // Only the deck board imagery is worth enlarging; the small homepage
  // mood-board photos and anchor-wrapped thumbnails are left alone.
  const zoomables = [...document.querySelectorAll(".deck-section img")].filter(
    (img) => !img.closest("a"),
  );
  zoomables.forEach((img) => {
    img.classList.add("is-zoomable");
    img.setAttribute("role", "button");
    img.setAttribute("tabindex", "0");
    img.setAttribute(
      "aria-label",
      img.alt ? `Enlarge: ${img.alt}` : "Enlarge image",
    );
    const trigger = () => openLightbox(img.currentSrc || img.src, img.alt);
    img.addEventListener("click", trigger);
    img.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        trigger();
      }
    });
  });
}

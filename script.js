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

  // The deck boards and the homepage Featured Product Projects cards are worth
  // enlarging; the small homepage mood-board photos and anchor-wrapped
  // thumbnails are left alone.
  const zoomables = [
    ...document.querySelectorAll(".deck-section img, .product-grid img"),
  ].filter((img) => !img.closest("a"));
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

// Subtle scroll-reveal for content sections. Progressive enhancement: the
// hidden starting state is only applied once JS adds `reveal-ready`, and the
// CSS for it is gated behind prefers-reduced-motion: no-preference, so content
// is always fully visible without JS and for reduced-motion users.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
if ("IntersectionObserver" in window && !reduceMotion.matches) {
  // Reveal each content section except the above-the-fold hero.
  const revealables = [...document.querySelectorAll("main > section")].filter(
    (section) => !section.classList.contains("hero"),
  );

  if (revealables.length) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );

    revealables.forEach((section) => {
      section.classList.add("reveal-ready");
      observer.observe(section);
    });
  }
}

// Scrollspy: highlight the nav link for the section currently in view (#61).
// Progressive enhancement — no effect without JS or IntersectionObserver.
if ("IntersectionObserver" in window) {
  const linkByHash = new Map();
  document.querySelectorAll(".nav a[href^='#']").forEach((link) => {
    const id = decodeURIComponent(link.hash.slice(1));
    const section = id && document.getElementById(id);
    if (section) linkByHash.set(section, link);
  });

  if (linkByHash.size) {
    // Track how much of each spied section is on screen and activate the
    // top-most visible one, so the highlight follows the reading position.
    const visibility = new Map();
    const setActive = (activeLink) => {
      linkByHash.forEach((link) => {
        const on = link === activeLink;
        link.classList.toggle("is-active", on);
        if (on) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibility.set(entry.target, entry.intersectionRatio);
        });
        let best = null;
        let bestTop = Infinity;
        visibility.forEach((ratio, section) => {
          if (ratio <= 0) return;
          const top = section.getBoundingClientRect().top;
          if (top < bestTop) {
            bestTop = top;
            best = section;
          }
        });
        setActive(best ? linkByHash.get(best) : null);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.01, 1] },
    );

    linkByHash.forEach((link, section) => spy.observe(section));
  }
}

/* =========================================================
   AP Vision — Interactions premium
   ========================================================= */

const prefersReduced =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* -------- INTRO — écriture lettre par lettre + plume qui bondit -------- */
function runIntro() {
  const intro = document.querySelector(".intro");
  if (!intro) {
    kickHero();
    return;
  }

  document.body.style.overflow = "hidden";

  // Détection : logo dispo ou fallback texte "Vision 24"
  const testImg = new Image();
  testImg.onerror = () => {
    const full = intro.querySelector(".intro__logo-full");
    const fallback = intro.querySelector(".intro__fallback");
    if (full) full.style.display = "none";
    if (fallback) fallback.style.display = "flex";
  };
  testImg.src = "assets/img/logo-bordeaux.png";

  // Une seule animation : fade + zoom (200 delay + 1600 anim + 900 tagline delay + 900 tagline)
  const totalWrite = prefersReduced ? 300 : 1900;
  const holdAfter = prefersReduced ? 100 : 500;

  setTimeout(() => {
    intro.classList.add("is-done");
    document.body.style.overflow = "";
    kickHero();
  }, totalWrite + holdAfter);
}

/* -------- HERO — entrées séquencées + parallaxe -------- */
function kickHero() {
  const nav = document.querySelector(".nav");
  const els = document.querySelectorAll(".hero-anim");
  const delays = [0, 120, 220, 320, 420];

  els.forEach((el, i) => {
    setTimeout(() => {
      el.animate(
        [
          { opacity: 0, transform: "translateY(24px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        {
          duration: prefersReduced ? 200 : 1000,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "forwards",
        }
      );
    }, delays[i] || i * 100);
  });

  setTimeout(() => nav && nav.classList.add("is-shown"), 400);
}

/* -------- NAV — scroll state + mobile -------- */
function initNav() {
  const nav = document.querySelector(".nav");
  const burger = document.querySelector(".nav__burger");
  const overlay = document.querySelector(".nav-overlay");

  if (!nav) return;

  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (burger && overlay) {
    const toggle = () => {
      nav.classList.toggle("is-open");
      overlay.classList.toggle("is-open");
      document.body.style.overflow = overlay.classList.contains("is-open")
        ? "hidden"
        : "";
    };
    burger.addEventListener("click", toggle);
    overlay.querySelectorAll("a").forEach((a) => a.addEventListener("click", toggle));
  }
}

/* -------- REVEAL — apparition au scroll -------- */
function initReveal() {
  const items = document.querySelectorAll(".js-reveal");
  if (prefersReduced) {
    items.forEach((el) => {
      el.style.opacity = 1;
      el.style.transform = "none";
      el.style.filter = "none";
    });
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target;
          const delay = parseFloat(el.dataset.delay || 0) * 1000;
          el.animate(
            [
              { opacity: 0, transform: "translateY(28px)", filter: "blur(6px)" },
              { opacity: 1, transform: "translateY(0)", filter: "blur(0)" },
            ],
            {
              duration: 900,
              delay,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
              fill: "forwards",
            }
          );
          io.unobserve(el);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );
  items.forEach((el) => io.observe(el));
}

/* -------- HERO PARALLAXE — vidéo qui glisse doucement -------- */
function initHeroParallax() {
  const media = document.querySelector(".hero__media");
  if (!media || prefersReduced) return;

  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          media.style.transform = `translateY(${y * 0.25}px) scale(1.08)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* -------- BEST SELLERS — Photo + liste rotative -------- */
function initBestSellersRotator() {
  const showcase = document.querySelector(".bs-showcase");
  if (!showcase) return;

  const photos = showcase.querySelectorAll(".bs-showcase__photo");
  const items = showcase.querySelectorAll(".bs-item");
  if (!photos.length) return;

  let i = 0;
  let timer = null;
  const INTERVAL = 5000;

  const goTo = (idx) => {
    photos.forEach((p, k) => p.classList.toggle("is-active", k === idx));
    items.forEach((it, k) => {
      it.classList.remove("is-active");
      // Reset progress bar animation
      const bar = it.querySelector(".bs-item__progress span");
      if (bar) {
        bar.style.animation = "none";
        bar.offsetWidth; // reflow
        bar.style.animation = "";
      }
    });
    items[idx] && items[idx].classList.add("is-active");
    i = idx;
  };

  const start = () => {
    if (prefersReduced) return;
    timer = setInterval(() => goTo((i + 1) % photos.length), INTERVAL);
  };
  const stop = () => timer && clearInterval(timer);

  items.forEach((it, k) =>
    it.addEventListener("click", () => {
      stop();
      goTo(k);
      start();
    })
  );

  goTo(0);
  start();
}

/* -------- BAR GOURMAND (page dédiée) — même moteur -------- */
function initBarPage() {
  const scene = document.querySelector(".bar-scene__stage");
  if (!scene) return;

  const slides = scene.querySelectorAll(".bar-slide");
  const tabs = document.querySelectorAll(".bar-tabs button");
  let i = 0;
  let timer;

  const goTo = (idx) => {
    slides.forEach((s, k) => s.classList.toggle("is-active", k === idx));
    tabs.forEach((t, k) => t.classList.toggle("is-active", k === idx));
    i = idx;
  };

  tabs.forEach((t, k) =>
    t.addEventListener("click", () => {
      clearInterval(timer);
      goTo(k);
      timer = setInterval(() => goTo((i + 1) % slides.length), 5000);
    })
  );

  goTo(0);
  if (!prefersReduced) {
    timer = setInterval(() => goTo((i + 1) % slides.length), 5000);
  }
}

/* -------- FAQ — accordion -------- */
function initFaq() {
  document.querySelectorAll(".faq__item").forEach((item) => {
    const q = item.querySelector(".faq__q");
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      item.parentElement.querySelectorAll(".faq__item.is-open").forEach((o) =>
        o.classList.remove("is-open")
      );
      if (!isOpen) item.classList.add("is-open");
    });
  });
}

/* -------- TESTIMONIALS SLIDER -------- */
function initTestimonials() {
  const track = document.querySelector(".testimonials__track");
  const prev = document.querySelector(".testimonials__prev");
  const next = document.querySelector(".testimonials__next");
  if (!track) return;

  let index = 0;
  const cards = track.children;
  const max = cards.length;

  const compute = () => {
    if (!cards.length) return 0;
    const first = cards[0].getBoundingClientRect();
    const style = getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || 0);
    return first.width + gap;
  };

  const update = () => {
    const step = compute();
    track.style.transform = `translateX(${-step * index}px)`;
  };

  const clamp = () => {
    if (index < 0) index = max - 1;
    if (index >= max) index = 0;
  };

  prev &&
    prev.addEventListener("click", () => {
      index--;
      clamp();
      update();
    });
  next &&
    next.addEventListener("click", () => {
      index++;
      clamp();
      update();
    });

  window.addEventListener("resize", update);
  update();

  // Auto-play doux
  if (!prefersReduced) {
    setInterval(() => {
      index++;
      clamp();
      update();
    }, 6000);
  }
}

/* -------- SMOOTH SCROLL sur les ancres -------- */
function initAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* -------- SVC ROWS — Click reveal preview, second click navigates -------- */
function initSvcRowsClick() {
  const rows = document.querySelectorAll(".svc-row");
  if (!rows.length) return;

  rows.forEach((row) => {
    const link = row.querySelector(".svc-row__link");
    if (!link) return;

    link.addEventListener("click", (e) => {
      // Si la ligne n'est pas active, premier clic = révèle la photo
      if (!row.classList.contains("is-active")) {
        e.preventDefault();
        // Ferme les autres lignes
        rows.forEach((r) => r.classList.remove("is-active"));
        row.classList.add("is-active");
      }
      // Sinon, la ligne est déjà active → laisse le lien suivre son cours
    });
  });

  // Clic ailleurs ferme la preview
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".svc-row")) {
      rows.forEach((r) => r.classList.remove("is-active"));
    }
  });
}

/* -------- ANNOTATIONS SUR PHOTOS — toggle mobile -------- */
function initAnnotations() {
  document.querySelectorAll(".annot").forEach((a) => {
    const dot = a.querySelector(".annot__dot");
    if (!dot) return;
    dot.addEventListener("click", (e) => {
      e.preventDefault();
      const wasOpen = a.classList.contains("is-open");
      // Ferme les autres
      a.parentElement
        .querySelectorAll(".annot.is-open")
        .forEach((o) => o.classList.remove("is-open"));
      if (!wasOpen) a.classList.add("is-open");
    });
  });
  // Ferme sur clic ailleurs
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".annot")) {
      document
        .querySelectorAll(".annot.is-open")
        .forEach((o) => o.classList.remove("is-open"));
    }
  });
}

/* -------- INIT -------- */
document.addEventListener("DOMContentLoaded", () => {
  initSvcRowsClick();
  initAnnotations();
  runIntro();
  initNav();
  initReveal();
  initHeroParallax();
  initBestSellersRotator();
  initFaq();
  initTestimonials();
  initAnchors();
  initBarPage();
});

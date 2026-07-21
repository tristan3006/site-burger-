/* ═══════════════════════════════════════════
   FAMILY'ZZ — interactions & animations
   100% vanilla JS, zéro dépendance
   ═══════════════════════════════════════════ */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Intro : le burger s'assemble puis traverse l'écran ── */
  const preloader = document.getElementById("preloader");
  const endIntro = () => {
    preloader.classList.add("is-done");
    document.body.classList.add("intro-done");
  };
  window.addEventListener("load", () => {
    if (reduceMotion) { endIntro(); return; }
    preloader.classList.add("is-play");
    setTimeout(endIntro, 1450);
  });
  // Sécurité : ne jamais rester bloqué sur l'intro
  setTimeout(endIntro, 4500);

  /* ── Split du titre héro en caractères ── */
  document.querySelectorAll("[data-split]").forEach((el) => {
    const text = el.textContent;
    el.textContent = "";
    [...text].forEach((ch, i) => {
      const span = document.createElement("span");
      span.className = "char";
      span.style.setProperty("--i", i);
      span.textContent = ch;
      el.appendChild(span);
    });
  });

  /* ── Curseur custom ── */
  const cursor = document.getElementById("cursor");
  const ring = document.getElementById("cursorRing");
  if (matchMedia("(hover: hover)").matches && !reduceMotion) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      cursor.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll("a, button, .dish, .review").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
    });
  }

  /* ── Boutons magnétiques ── */
  if (matchMedia("(hover: hover)").matches && !reduceMotion) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.22}px, ${y * 0.28}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ── Nav : fond au scroll ── */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── Menu mobile ── */
  const navBurger = document.getElementById("navBurger");
  const mobileMenu = document.getElementById("mobileMenu");
  const toggleMenu = (open) => {
    navBurger.classList.toggle("is-open", open);
    mobileMenu.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  navBurger.addEventListener("click", () =>
    toggleMenu(!mobileMenu.classList.contains("is-open"))
  );
  mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => toggleMenu(false))
  );

  /* ── Burger héro : parallaxe des couches ── */
  const heroBurger = document.getElementById("heroBurger");
  const layers = heroBurger ? [...heroBurger.querySelectorAll(".b-layer")] : [];
  if (layers.length && !reduceMotion) {
    // À la souris : les couches s'écartent selon leur profondeur
    window.addEventListener("mousemove", (e) => {
      const cx = e.clientX / window.innerWidth - 0.5;
      const cy = e.clientY / window.innerHeight - 0.5;
      layers.forEach((l) => {
        const d = parseFloat(l.dataset.depth);
        l.style.transform = `translate(${cx * d * 0.9}px, ${cy * d * 0.55}px)`;
      });
    });
    // Au scroll : le burger "explose" doucement en couches
    window.addEventListener("scroll", () => {
      const t = Math.min(window.scrollY / window.innerHeight, 1);
      heroBurger.style.transform = `translateY(${t * 60}px) scale(${1 - t * 0.12})`;
      heroBurger.style.opacity = 1 - t * 0.9;
      layers.forEach((l, i) => {
        const spread = (layers.length - 1 - i) * t * 26;
        l.style.translate = `0 ${-spread}px`;
      });
    }, { passive: true });
  }

  /* ── Reveal au scroll ── */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
  );
  document.querySelectorAll(".reveal, .reveal-line").forEach((el) => io.observe(el));

  /* ── Compteurs animés ── */
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        counterIO.unobserve(entry.target);
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const decimals = parseInt(el.dataset.decimals || "0", 10);
        const suffix = el.querySelector("i");
        const suffixHTML = suffix ? suffix.outerHTML : "";
        const dur = 1600;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          const val = (target * eased).toFixed(decimals).replace(".", ",");
          el.innerHTML = val + suffixHTML;
          if (p < 1) requestAnimationFrame(step);
        };
        if (reduceMotion) {
          el.innerHTML = target.toFixed(decimals).replace(".", ",") + suffixHTML;
        } else {
          requestAnimationFrame(step);
        }
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-count]").forEach((el) => counterIO.observe(el));

  /* ── Onglets du menu ── */
  const tabs = document.querySelectorAll(".menu__tab");
  const dishes = document.querySelectorAll(".dish");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      const cat = tab.dataset.tab;
      dishes.forEach((d) => {
        const show = d.dataset.cat === cat;
        d.classList.toggle("is-hidden", !show);
        if (show) {
          d.classList.remove("is-in");
          requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add("is-in")));
        }
      });
    });
  });

  /* ── Tilt 3D sur les cartes ── */
  if (matchMedia("(hover: hover)").matches && !reduceMotion) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ── Avis : drag horizontal ── */
  const track = document.getElementById("reviewsTrack");
  if (track) {
    let isDown = false, startX = 0, scrollStart = 0;
    track.addEventListener("pointerdown", (e) => {
      isDown = true;
      startX = e.clientX;
      scrollStart = track.scrollLeft;
      track.classList.add("is-dragging");
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      track.scrollLeft = scrollStart - (e.clientX - startX);
    });
    ["pointerup", "pointercancel"].forEach((ev) =>
      track.addEventListener(ev, () => {
        isDown = false;
        track.classList.remove("is-dragging");
      })
    );
  }
})();

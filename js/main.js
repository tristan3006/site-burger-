/* ═══════════════════════════════════════════
   FAMILY'ZZ — interactions & animations
   100% vanilla JS, zéro dépendance
   ═══════════════════════════════════════════ */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Intro : le burger arrive du monde réel, couche par couche ── */
  const preloader = document.getElementById("preloader");
  let introTimer = null;
  const endIntro = () => {
    if (preloader.classList.contains("is-done")) return;
    clearTimeout(introTimer);
    preloader.classList.add("is-done");
    document.body.classList.add("intro-done");
  };
  window.addEventListener("load", () => {
    if (reduceMotion) { endIntro(); return; }
    preloader.classList.add("is-play");
    introTimer = setTimeout(endIntro, 5150);
  });
  document.getElementById("introSkip").addEventListener("click", endIntro);
  // Sécurité : ne jamais rester bloqué sur l'intro
  setTimeout(endIntro, 9000);

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

  /* ── Atelier : compose ton burger ── */
  const builderSvg = document.getElementById("builderSvg");
  if (builderSvg) {
    const NS = "http://www.w3.org/2000/svg";
    const XLINK = "http://www.w3.org/1999/xlink";
    const BASE_PRICE = 6.5; // pain artisanal + garniture de base
    const INGS = {
      steak:  { sym: "#p-steak",  h: 16, price: 2.5, label: "Steak smashé" },
      cheese: { sym: "#p-cheese", h: 9,  price: 1.0, label: "Cheddar affiné" },
      salad:  { sym: "#p-salad",  h: 13, price: 0.6, label: "Salade croquante" },
      tomato: { sym: "#p-tomato", h: 9,  price: 0.6, label: "Tomate fraîche" },
      onions: { sym: "#p-onions", h: 10, price: 0.8, label: "Oignons caramélisés" },
      sauce:  { sym: "#p-sauce",  h: 8,  price: 0.5, label: "Sauce signature" },
    };
    const MAX_LAYERS = 12;
    let stack = ["salad", "cheese", "steak"]; // burger de départ appétissant
    const priceEl = document.getElementById("buildPrice");
    const countEl = document.getElementById("buildCount");
    const msgEl = document.getElementById("buildMsg");
    const euros = (n) => n.toFixed(2).replace(".", ",") + " €";

    const makeUse = (sym, y) => {
      const use = document.createElementNS(NS, "use");
      use.setAttribute("href", sym);
      use.setAttributeNS(XLINK, "xlink:href", sym);
      use.setAttribute("y", y);
      return use;
    };

    const render = (newIndex = -1) => {
      builderSvg.innerHTML = "";
      const stackH = stack.reduce((s, k) => s + INGS[k].h, 0);
      const total = 74 + stackH;
      builderSvg.setAttribute("viewBox", `0 0 200 ${total}`);

      // Pain du haut (dessiné en premier : les couches passent devant)
      const top = document.createElementNS(NS, "g");
      top.setAttribute("class", "builder-layer builder-layer--fixed");
      top.appendChild(makeUse("#p-bun-top", 0));
      builderSvg.appendChild(top);

      // Ingrédients, du haut de la pile vers le bas
      let y = 52;
      for (let i = stack.length - 1; i >= 0; i--) {
        const key = stack[i];
        const g = document.createElementNS(NS, "g");
        g.setAttribute("class", "builder-layer" + (i === newIndex ? " is-new" : ""));
        g.appendChild(makeUse(INGS[key].sym, y));
        const idx = i;
        const title = document.createElementNS(NS, "title");
        title.textContent = INGS[key].label + " — cliquer pour retirer";
        g.appendChild(title);
        g.addEventListener("click", () => {
          stack.splice(idx, 1);
          msgEl.textContent = INGS[key].label + " retiré.";
          render();
        });
        builderSvg.appendChild(g);
        y += INGS[key].h;
      }

      // Pain du bas
      const bot = document.createElementNS(NS, "g");
      bot.setAttribute("class", "builder-layer builder-layer--fixed");
      bot.appendChild(makeUse("#p-bun-bot", 50 + stackH));
      builderSvg.appendChild(bot);

      // Prix + compteur
      const price = BASE_PRICE + stack.reduce((s, k) => s + INGS[k].price, 0);
      priceEl.textContent = euros(price);
      priceEl.classList.remove("pop");
      void priceEl.offsetWidth;
      priceEl.classList.add("pop");
      countEl.textContent = stack.length
        ? `(${stack.length} ingrédient${stack.length > 1 ? "s" : ""})`
        : "(pain nature… osé)";
    };

    document.querySelectorAll(".ing").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (stack.length >= MAX_LAYERS) {
          msgEl.textContent = "Même le Triple Z n'ose pas monter aussi haut 😅";
          return;
        }
        msgEl.textContent = "";
        stack.push(btn.dataset.ing);
        render(stack.length - 1);
      });
    });
    document.getElementById("buildReset").addEventListener("click", () => {
      stack = [];
      msgEl.textContent = "On repart de zéro, chef !";
      render();
    });
    render();
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

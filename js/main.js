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
    introTimer = setTimeout(endIntro, 3350);
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

  /* ── Burger héro : parallaxe des couches + ingrédients flottants ── */
  const heroBurger = document.getElementById("heroBurger");
  const layers = heroBurger ? [...heroBurger.querySelectorAll(".b-layer")] : [];
  const bits = heroBurger ? [...heroBurger.querySelectorAll(".bit")] : [];
  if (layers.length && !reduceMotion) {
    // À la souris : les couches s'écartent selon leur profondeur
    window.addEventListener("mousemove", (e) => {
      const cx = e.clientX / window.innerWidth - 0.5;
      const cy = e.clientY / window.innerHeight - 0.5;
      layers.forEach((l) => {
        const d = parseFloat(l.dataset.depth);
        l.style.transform = `translate(${cx * d * 0.9}px, ${cy * d * 0.55}px)`;
      });
      bits.forEach((b) => {
        const d = parseFloat(b.dataset.depth);
        b.style.transform = `translate(${cx * d * -1.4}px, ${cy * d * -0.9}px)`;
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

  /* ── Ouvert / fermé en direct (horaires indicatifs) ── */
  // [ouverture, fermeture] en minutes — index = getDay() (0 = dimanche)
  const SCHEDULE = [
    [12 * 60, 22 * 60 + 30],       // dim
    [11 * 60 + 30, 22 * 60 + 30],  // lun
    [11 * 60 + 30, 22 * 60 + 30],  // mar
    [11 * 60 + 30, 22 * 60 + 30],  // mer
    [11 * 60 + 30, 22 * 60 + 30],  // jeu
    [11 * 60 + 30, 23 * 60],       // ven
    [11 * 60 + 30, 23 * 60],       // sam
  ];
  const fmtH = (mins) =>
    Math.floor(mins / 60) + "h" + String(mins % 60).padStart(2, "0");
  const updateOpenStatus = () => {
    const now = new Date();
    const [open, close] = SCHEDULE[now.getDay()];
    const mins = now.getHours() * 60 + now.getMinutes();
    let isOpen, text;
    if (mins >= open && mins < close) {
      isOpen = true;
      text = "Ouvert — on smashe jusqu'à " + fmtH(close);
    } else if (mins < open) {
      isOpen = false;
      text = "Fermé — ouvre aujourd'hui à " + fmtH(open);
    } else {
      isOpen = false;
      text = "Fermé — réouverture demain à " + fmtH(SCHEDULE[(now.getDay() + 1) % 7][0]);
    }
    const pill = document.getElementById("openStatus");
    pill.hidden = false;
    pill.classList.toggle("is-closed", !isOpen);
    document.getElementById("openText").textContent = text;
    const line = document.getElementById("hoursStatus");
    line.hidden = false;
    line.textContent = text;
    line.classList.toggle("is-closed", !isOpen);
  };
  updateOpenStatus();
  setInterval(updateOpenStatus, 60000);

  /* ── Burger-témoin dévoré au fil du scroll ── */
  const nibble = document.getElementById("nibble");
  if (nibble) {
    const bites = [...nibble.querySelectorAll(".bite")];
    const radii = [30, 28, 32, 30, 26, 34];
    window.addEventListener("scroll", () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      bites.forEach((b, i) => {
        b.setAttribute("r", p > (i + 1) / (bites.length + 1) ? radii[i] : 0);
      });
      nibble.classList.toggle("is-eaten", p > 0.96);
    }, { passive: true });
  }

  /* ── Quiz : quel burger es-tu ? ── */
  const quizBox = document.getElementById("quizBox");
  if (quizBox) {
    const QUESTIONS = [
      { q: "Ton samedi soir idéal ?", a: [
        ["Canapé, plaid, série", "classic"],
        ["Grande tablée qui parle fort", "signature"],
        ["Match avec les potes", "triple"],
        ["Balade et marché le lendemain", "veggie"],
      ]},
      { q: "Ta sauce de cœur ?", a: [
        ["Ketchup, valeur sûre", "classic"],
        ["La signature, évidemment", "signature"],
        ["Miel-moutarde", "chicken"],
        ["Yaourt aux herbes", "veggie"],
      ]},
      { q: "Face à un défi, tu fais quoi ?", a: [
        ["Je fonce, on verra bien", "triple"],
        ["Je réfléchis, puis je fonce", "signature"],
        ["Je contourne avec style", "chicken"],
        ["Je reste zen, ça va passer", "veggie"],
      ]},
      { q: "Ta faim un midi normal ?", a: [
        ["Raisonnable", "classic"],
        ["Solide", "signature"],
        ["Il va falloir du renfort", "triple"],
        ["Je picore… en théorie", "chicken"],
      ]},
      { q: "Ce qui compte le plus dans un burger ?", a: [
        ["La tradition, bien faite", "classic"],
        ["Le goût, point final", "signature"],
        ["Le croustillant", "chicken"],
        ["La fraîcheur", "veggie"],
      ]},
    ];
    const RESULTS = {
      classic: { name: "Le Classic Smash", price: "10,90 €", vb: 132,
        desc: "Fiable, généreux, jamais décevant : tu es la valeur sûre que tout le monde est content de retrouver.",
        svg: '<use href="#burger-classic"/>' },
      signature: { name: "Le Family'zz", price: "13,90 €", vb: 128,
        desc: "Chaleureux, généreux, un brin star : c'est pour toi qu'on fait le déplacement. Le patron de la carte.",
        svg: '<use href="#p-bun-top"/><use href="#p-cheese" y="52"/><use href="#p-steak" y="60"/><use href="#p-cheese" y="78"/><use href="#p-steak" y="86"/><use href="#p-bun-bot" y="104"/>' },
      chicken: { name: "Le Chicken Crunch", price: "11,90 €", vb: 120,
        desc: "Croustillant dehors, tendre dedans. Tu caches bien ton jeu — et c'est exactement ce qu'on aime.",
        svg: '<use href="#p-bun-top" y="4"/><use href="#p-salad" y="54"/><use href="#p-cheese" y="66"/><use href="#p-chicken" y="76"/><use href="#p-bun-bot" y="94"/>' },
      veggie: { name: "Le Green Garden", price: "11,50 €", vb: 120,
        desc: "Frais, malin, plein de bonnes idées : tu prouves qu'on peut être green et sérieusement gourmand.",
        svg: '<use href="#p-bun-top" y="4"/><use href="#p-salad" y="54"/><use href="#p-tomato" y="66"/><use href="#p-veggie" y="76"/><use href="#p-bun-bot" y="94"/>' },
      triple: { name: "Le Triple Z", price: "16,90 €", vb: 148,
        desc: "Trois étages, zéro compromis. Tu vois grand, tout le temps — et tu assumes jusqu'à la dernière bouchée.",
        svg: '<use href="#p-bun-top"/><use href="#p-cheese" y="52"/><use href="#p-steak" y="60"/><use href="#p-cheese" y="76"/><use href="#p-steak" y="84"/><use href="#p-cheese" y="100"/><use href="#p-steak" y="108"/><use href="#p-bun-bot" y="126"/>' },
    };
    const PRIORITY = ["signature", "triple", "chicken", "veggie", "classic"];
    let qIndex = 0;
    let scores = {};

    const showQuestion = () => {
      const { q, a } = QUESTIONS[qIndex];
      quizBox.innerHTML =
        '<div class="quiz__inner">' +
        `<p class="quiz__step">Question ${qIndex + 1} / ${QUESTIONS.length}</p>` +
        `<h3 class="quiz__q">${q}</h3>` +
        '<div class="quiz__answers">' +
        a.map(([t, k], i) => `<button class="quiz__ans" type="button" data-k="${k}">${t}</button>`).join("") +
        "</div></div>";
      quizBox.querySelectorAll(".quiz__ans").forEach((btn) => {
        btn.addEventListener("click", () => {
          scores[btn.dataset.k] = (scores[btn.dataset.k] || 0) + 1;
          qIndex++;
          if (qIndex < QUESTIONS.length) showQuestion();
          else showResult();
        });
      });
    };

    const showResult = () => {
      const best = PRIORITY.reduce((acc, k) =>
        (scores[k] || 0) > (scores[acc] || 0) ? k : acc, "classic");
      const r = RESULTS[best];
      quizBox.innerHTML =
        '<div class="quiz__inner quiz__result">' +
        '<p class="quiz__rlabel">Ton burger de destin, c\'est…</p>' +
        `<svg class="quiz__svg" viewBox="0 0 200 ${r.vb}" aria-hidden="true">${r.svg}</svg>` +
        `<h3 class="quiz__rname">${r.name}</h3>` +
        `<p class="quiz__rdesc">${r.desc}</p>` +
        `<p class="quiz__rprice">${r.price}</p>` +
        '<div class="quiz__actions">' +
        '<a class="btn btn--primary" href="#menu">Retrouve-le sur la carte</a>' +
        '<button class="btn btn--ghost" type="button" id="quizAgain">Refaire le test</button>' +
        "</div></div>";
      document.getElementById("quizAgain").addEventListener("click", () => {
        qIndex = 0; scores = {}; showQuestion();
      });
    };
    showQuestion();
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

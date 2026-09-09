/**
 * Bidirectional scroll sync for Featured Projects (Framer Cases section).
 * Framer's scroll variant sticks on the way up (especially Variant 7).
 */
(function () {
  const DESKTOP_MQ = window.matchMedia("(min-width: 810px)");
  const CASE_COUNT = 6;
  const ANCHOR_RATIO = 0.38;

  const CASE_VARIANTS = [
    {
      name: "1",
      className: "framer-x4HmG framer-qtojw framer-w6hrx3 framer-v-w6hrx3",
      href: "./cases/mb-byreign",
      caption: "Création d'une plateforme d'agence immobilière à Dubaï",
      imgSrc: "/assets/images/image-694703c6.jpg?width=2400&height=1345",
      imgSrcset:
        "/assets/images/image-694703c6.jpg?scale-down-to=512&width=2400&height=1345 512w,/assets/images/image-694703c6.jpg?scale-down-to=1024&width=2400&height=1345 1024w,/assets/images/image-694703c6.jpg?scale-down-to=2048&width=2400&height=1345 2048w,/assets/images/image-694703c6.jpg?width=2400&height=1345 2400w",
    },
    {
      name: "Variant 2",
      className: "framer-x4HmG framer-qtojw framer-w6hrx3 framer-v-pcutiv",
      href: "./cases/luxkey",
      caption:
        "Plateforme complète pour une conciergerie de location courte durée",
    },
    {
      name: "Variant 3",
      className: "framer-x4HmG framer-qtojw framer-w6hrx3 framer-v-1auo6pa",
      href: "./cases/latifa-b",
      caption:
        "Création d'une identité visuelle complète avec stratégie de branding",
    },
    {
      name: "Variant 4",
      className: "framer-x4HmG framer-qtojw framer-w6hrx3 framer-v-3gsf58",
      href: "./cases/les-gourmandises-de-nadj",
      caption: "Site vitrine avec capture de leads pour un traiteur sucré-salé",
    },
    {
      name: "Variant 5",
      className: "framer-x4HmG framer-qtojw framer-w6hrx3 framer-v-1elu7dv",
      href: "./cases/lheritage-francais",
      caption:
        "Création d’un e-commerce Shopify pour une marque de vêtements et accessoires",
    },
    {
      name: "Variant 6",
      className: "framer-x4HmG framer-qtojw framer-w6hrx3 framer-v-skg5ri",
      href: "./cases/liga-del-pueblo",
      caption:
        "Landing page pour un tournoi de football organisé par l’association Bz Family",
    },
  ];

  let section = null;
  let caseItems = [];
  let variantCache = CASE_VARIANTS.map((entry) => ({ ...entry }));
  let activeIndex = -1;
  let rafId = 0;
  let scrollEndTimer = 0;
  let loopRafId = 0;
  let initialized = false;

  function getImageHost() {
    return document.querySelector(
      '[data-framer-name="Images"] .framer-tkxz0b-container > div'
    );
  }

  function getActiveIndexFromItems() {
    const anchorY = window.innerHeight * ANCHOR_RATIO;
    let bestIndex = 0;
    let bestDistance = Infinity;

    caseItems.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - anchorY);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    return bestIndex;
  }

  function setListActive(index) {
    caseItems.forEach((item, i) => {
      const blocks = item.querySelectorAll(".framer-AQmVP");
      blocks.forEach((block) => {
        const name = block.getAttribute("data-framer-name") || "";
        const isActive = i === index;
        const shouldBeActive = name.startsWith("Active");
        if (isActive !== shouldBeActive) {
          block.style.opacity = isActive ? "1" : "0.55";
        }
      });
    });
  }

  function captureVariant(index) {
    const host = getImageHost();
    if (!host) return null;

    const img = host.querySelector("img");
    const link = host.querySelector("a[href]");
    const caption = host.querySelector(
      '[data-framer-component-type="RichTextContainer"] p'
    );

    return {
      name: host.getAttribute("data-framer-name") || CASE_VARIANTS[index].name,
      className: host.className,
      href: link?.getAttribute("href") || CASE_VARIANTS[index].href,
      imgSrc: img?.getAttribute("src") || "",
      imgSrcset: img?.getAttribute("srcset") || "",
      caption: caption?.textContent?.trim() || CASE_VARIANTS[index].caption,
    };
  }

  function mergeCache(index, captured) {
    if (!captured) return;

    const imgUpdate = {};
    if (captured.imgSrc) {
      imgUpdate.imgSrc = captured.imgSrc;
      imgUpdate.imgSrcset = captured.imgSrcset || "";
    }

    variantCache[index] = {
      ...CASE_VARIANTS[index],
      ...variantCache[index],
      ...imgUpdate,
    };
  }

  function opportunisticCache(index) {
    mergeCache(index, captureVariant(index));
  }

  function ensureImage(host, cached) {
    if (!cached?.imgSrc) return;

    const wrapper = host.querySelector("[data-framer-background-image-wrapper]");
    if (!wrapper) return;

    wrapper.style.backgroundImage = "";
    wrapper.style.backgroundSize = "";
    wrapper.style.backgroundRepeat = "";

    let img = wrapper.querySelector("img");
    if (!img) {
      img = document.createElement("img");
      img.decoding = "async";
      img.loading = "lazy";
      img.style.cssText =
        "display:block;width:100%;height:100%;border-radius:inherit;object-fit:cover;object-position:center";
      wrapper.appendChild(img);
    }

    if (img.getAttribute("src") !== cached.imgSrc) {
      img.setAttribute("src", cached.imgSrc);
      if (cached.imgSrcset) {
        img.setAttribute("srcset", cached.imgSrcset);
      } else {
        img.removeAttribute("srcset");
      }
    }
  }

  function isHostSynced(index) {
    const host = getImageHost();
    const expected = variantCache[index] || CASE_VARIANTS[index];
    if (!host || !expected) return true;

    const link = host.querySelector("a[href]");
    const hostVariant = host.className.match(/framer-v-[a-z0-9]+/)?.[0];
    const expectedVariant = expected.className.match(/framer-v-[a-z0-9]+/)?.[0];

    return (
      host.getAttribute("data-framer-name") === expected.name &&
      hostVariant === expectedVariant &&
      link?.getAttribute("href") === expected.href
    );
  }

  function applyVariant(index, force) {
    if (!force && index === activeIndex && isHostSynced(index)) return;

    const cached = {
      ...CASE_VARIANTS[index],
      imgSrc:
        variantCache[index]?.imgSrc || CASE_VARIANTS[index].imgSrc || "",
      imgSrcset:
        variantCache[index]?.imgSrcset || CASE_VARIANTS[index].imgSrcset || "",
    };
    const host = getImageHost();
    if (!host) return;

    activeIndex = index;
    host.setAttribute("data-framer-name", cached.name);
    host.className = cached.className;

    const link = host.querySelector("a[href]");
    if (link && cached.href) link.setAttribute("href", cached.href);

    ensureImage(host, cached);

    const caption = host.querySelector(
      '[data-framer-component-type="RichTextContainer"] p'
    );
    if (caption && cached.caption) caption.textContent = cached.caption;

    setListActive(index);
  }

  function isSectionInView() {
    if (!section) return false;
    const rect = section.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }

  function syncFromScroll() {
    if (!initialized || !DESKTOP_MQ.matches || !isSectionInView()) return;

    const index = getActiveIndexFromItems();
    opportunisticCache(index);

    if (index !== activeIndex || !isHostSynced(index)) {
      applyVariant(index, true);
    }
  }

  function stopSyncLoop() {
    if (loopRafId) cancelAnimationFrame(loopRafId);
    loopRafId = 0;
  }

  function startSyncLoop() {
    if (loopRafId || !initialized) return;

    const tick = () => {
      if (!initialized || !isSectionInView()) {
        stopSyncLoop();
        return;
      }
      syncFromScroll();
      loopRafId = requestAnimationFrame(tick);
    };

    loopRafId = requestAnimationFrame(tick);
  }

  function onScroll() {
    if (!initialized) return;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(syncFromScroll);

    if (isSectionInView()) startSyncLoop();

    clearTimeout(scrollEndTimer);
    scrollEndTimer = window.setTimeout(() => {
      syncFromScroll();
      if (isSectionInView()) startSyncLoop();
    }, 80);
  }

  function disableHoverDuringScroll() {
    if (!section) return;
    const list = section.querySelector('[data-framer-name="Items"]');
    if (!list) return;

    list.classList.add("wetarget-cases-scrolling");
    clearTimeout(disableHoverDuringScroll.timer);
    disableHoverDuringScroll.timer = window.setTimeout(() => {
      list.classList.remove("wetarget-cases-scrolling");
    }, 180);
  }

  function init(retryCount) {
    if (!DESKTOP_MQ.matches) return;

    section =
      document.querySelector('section[data-framer-name="Cases"]') ||
      document.querySelector('[data-framer-name="Cases"]');
    if (!section) {
      if (retryCount < 30) window.setTimeout(() => init(retryCount + 1), 200);
      return;
    }

    caseItems = [...section.querySelectorAll('[data-framer-name="Case item"]')]
      .filter((el) => el.id && el.id !== "case-7")
      .slice(0, CASE_COUNT);

    if (caseItems.length < CASE_COUNT || !getImageHost()) {
      if (retryCount < 30) window.setTimeout(() => init(retryCount + 1), 200);
      return;
    }

    opportunisticCache(0);
    initialized = true;
    activeIndex = -1;
    syncFromScroll();
    watchSection();
    if (isSectionInView()) startSyncLoop();
  }

  function watchSection() {
    if (!section || watchSection.observer) return;

    watchSection.observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        if (visible) startSyncLoop();
        else stopSyncLoop();
      },
      { root: null, threshold: 0 }
    );

    watchSection.observer.observe(section);
  }

  function injectStyles() {
    if (document.getElementById("wetarget-cases-scroll-style")) return;
    const style = document.createElement("style");
    style.id = "wetarget-cases-scroll-style";
    style.textContent = `
      @media (min-width: 810px) {
        [data-framer-name="Cases"] [data-framer-name="Items"].wetarget-cases-scrolling a {
          pointer-events: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function boot() {
    injectStyles();
    window.setTimeout(() => init(0), 400);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("wheel", disableHoverDuringScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  DESKTOP_MQ.addEventListener("change", () => {
    initialized = false;
    activeIndex = -1;
    variantCache = CASE_VARIANTS.map((entry) => ({ ...entry }));
    if (DESKTOP_MQ.matches) window.setTimeout(() => init(0), 300);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();

// Hair Beat by Valery — small progressive enhancements. The page works fully without this file.
(() => {
  // Instagram adds ?utm_source=ig&utm_medium=social&utm_content=link_in_bio to link-in-bio visits.
  // Drop tracking tags like these from the address bar, so a copied link is just the domain.
  const url = new URL(location.href);
  const tracking = [...url.searchParams.keys()].filter((key) => /^utm_|^(fbclid|igshid|gclid)$/.test(key));
  if (tracking.length) {
    for (const key of tracking) url.searchParams.delete(key);
    history.replaceState(history.state, "", url.pathname + url.search + url.hash);
  }

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  const header = document.querySelector("[data-header]");
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Phone & tablet menu. While it is open, the page behind it can't be scrolled or tabbed into.
  const menu = document.querySelector("[data-menu]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  if (menu && menuToggle) {
    const behind = document.querySelectorAll("main, footer, [data-mobile-book]");
    const isOpen = () => menuToggle.getAttribute("aria-expanded") === "true";
    const setOpen = (open, { focusMenu = false, returnFocus = false } = {}) => {
      menuToggle.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
      document.documentElement.classList.toggle("menu-open", open);
      for (const el of behind) el.inert = open;
      if (open && focusMenu) menu.querySelector("a")?.focus({ preventScroll: true });
      else if (!open && returnFocus) menuToggle.focus();
    };
    // Keyboard users (click with detail 0) go straight to the first link; taps leave focus on the button.
    menuToggle.addEventListener("click", (event) => setOpen(!isOpen(), { focusMenu: event.detail === 0 }));
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) setOpen(false, { returnFocus: true });
    });
    window.matchMedia("(min-width: 1081px)").addEventListener("change", (event) => {
      if (event.matches && isOpen()) setOpen(false);
    });
  }

  // Swap in the latest Instagram photos when the feed is available (see src/worker.js).
  // On any problem the six built-in photos stay as they are.
  const gallery = document.querySelector("[data-ig-gallery]");
  if (gallery && "fetch" in window) {
    fetch("/api/instagram", { headers: { accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const posts = (data && Array.isArray(data.posts) ? data.posts : []).filter((p) =>
          typeof p.src === "string" && p.src.startsWith("/api/instagram/media/") &&
          typeof p.permalink === "string" && p.permalink.startsWith("https://www.instagram.com/"));
        if (posts.length < 3) return;
        const defaultAlt = "Recent hair work by Valery at Hair Beat";
        const fallbackAlt = window.hbText ? window.hbText("work.photoAlt", defaultAlt) : defaultAlt;
        const tiles = gallery.querySelectorAll(".gallery-item");
        posts.slice(0, tiles.length).forEach((post, i) => {
          const tile = tiles[i];
          const img = tile.querySelector("img");
          tile.href = post.permalink;
          img.src = post.src;
          img.alt = post.alt || fallbackAlt;
          img.removeAttribute("data-i18n-attr"); // the caption is the alt text now; the language switch leaves it alone
          tile.querySelector(".gallery-tag")?.remove();
        });
      })
      .catch(() => {});
  }

  if (!("IntersectionObserver" in window)) return;

  // Hide the mobile "Book now" bar while the hero (which has its own booking button) is on screen.
  const mobileBook = document.querySelector("[data-mobile-book]");
  const hero = document.querySelector(".hero");
  if (mobileBook && hero) {
    new IntersectionObserver(([entry]) => {
      mobileBook.classList.toggle("is-hidden", entry.isIntersecting);
    }, { threshold: 0.25 }).observe(hero);
  }

  // Fade sections in as they scroll into view. Anything already on screen is left alone to avoid a flash.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const revealer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      entry.target.classList.remove("pre-reveal");
      revealer.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -8% 0px" });

  for (const el of document.querySelectorAll(".reveal")) {
    if (el.getBoundingClientRect().top < window.innerHeight) continue;
    el.classList.add("pre-reveal");
    revealer.observe(el);
  }
})();

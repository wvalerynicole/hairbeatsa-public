// Hair Beat by Valery — small progressive enhancements. The page works fully without this file.
(() => {
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  const header = document.querySelector("[data-header]");
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

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
        const tiles = gallery.querySelectorAll(".gallery-item");
        posts.slice(0, tiles.length).forEach((post, i) => {
          const tile = tiles[i];
          const img = tile.querySelector("img");
          tile.href = post.permalink;
          img.src = post.src;
          img.alt = post.alt || "Recent hair work by Valery at Hair Beat";
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

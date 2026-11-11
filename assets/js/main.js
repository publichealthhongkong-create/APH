/* APHK — shared interactions */
(() => {
  "use strict";

  const doc = document;
  const root = doc.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     Sticky header & back to top
     ------------------------------------------------------------------ */
  const header = doc.querySelector(".site-header");
  const backToTop = doc.querySelector("[data-back-to-top]");

  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 12);
    if (backToTop) backToTop.classList.toggle("is-visible", y > 650);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------ */
  const mobileNav = doc.querySelector("[data-mobile-nav]");
  const menuToggle = doc.querySelector("[data-menu-toggle]");
  const menuClose = doc.querySelector("[data-menu-close]");
  let lastFocused = null;

  const getFocusable = (container) =>
    Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null);

  const openMenu = () => {
    if (!mobileNav) return;
    lastFocused = doc.activeElement;
    mobileNav.classList.add("is-open");
    mobileNav.setAttribute("aria-hidden", "false");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
    doc.body.classList.add("no-scroll");
    window.setTimeout(() => {
      const focusable = getFocusable(mobileNav);
      if (focusable.length) focusable[0].focus();
    }, 60);
  };

  const closeMenu = ({ restoreFocus = true } = {}) => {
    if (!mobileNav) return;
    mobileNav.classList.remove("is-open");
    mobileNav.setAttribute("aria-hidden", "true");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    doc.body.classList.remove("no-scroll");
    if (restoreFocus && lastFocused) lastFocused.focus();
  };

  if (menuToggle) menuToggle.addEventListener("click", openMenu);
  if (menuClose) menuClose.addEventListener("click", () => closeMenu());

  if (mobileNav) {
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeMenu({ restoreFocus: false }));
    });

    mobileNav.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusable(mobileNav);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && doc.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && doc.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileNav?.classList.contains("is-open")) {
      closeMenu();
    }
  });

  /* ------------------------------------------------------------------
     Active navigation state
     ------------------------------------------------------------------ */
  const path = window.location.pathname.split("/").pop() || "index.html";
  doc.querySelectorAll("[data-nav-link]").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });

  /* ------------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------------ */
  const revealItems = doc.querySelectorAll("[data-reveal]");
  if (revealItems.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      revealItems.forEach((item) => observer.observe(item));
    }
  }

  /* ------------------------------------------------------------------
     Program filters
     ------------------------------------------------------------------ */
  const filterButtons = doc.querySelectorAll("[data-filter]");
  const programCards = doc.querySelectorAll("[data-program]");
  const filterStatus = doc.querySelector("[data-filter-status]");

  if (filterButtons.length && programCards.length) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        let visible = 0;

        filterButtons.forEach((btn) => {
          const active = btn === button;
          btn.classList.toggle("is-active", active);
          btn.setAttribute("aria-pressed", active ? "true" : "false");
        });

        programCards.forEach((card) => {
          const show = filter === "all" || card.dataset.program === filter;
          card.hidden = !show;
          if (show) visible += 1;
        });

        if (filterStatus) {
          filterStatus.textContent = `現正顯示 ${visible} 個支援計劃。`;
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     Newsletter — opens a subscription email
     ------------------------------------------------------------------ */
  const newsletter = doc.querySelector("[data-newsletter]");
  if (newsletter) {
    const input = newsletter.querySelector('input[type="email"]');
    const status = newsletter.querySelector("[data-newsletter-status]");

    newsletter.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!input || !input.reportValidity()) return;
      const email = input.value.trim();
      const mailto = `mailto:admin@publichealth.org.hk?subject=${encodeURIComponent(
        "訂閱香港公共健康協會電子通訊"
      )}&body=${encodeURIComponent(`你好，我希望訂閱協會電子通訊。\n\n電郵：${email}\n`)}`;
      if (status) status.textContent = "已準備訂閱電郵，請於郵件應用程式按「傳送」。";
      window.setTimeout(() => {
        window.location.href = mailto;
      }, 500);
    });
  }

  /* ------------------------------------------------------------------
     FAQ: allow only one open item at a time (progressive enhancement)
     ------------------------------------------------------------------ */
  const faqItems = doc.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------ */
  doc.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();

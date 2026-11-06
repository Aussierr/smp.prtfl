(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const systemTheme = window.matchMedia("(prefers-color-scheme: light)");

  function getTheme() {
    return root.dataset.theme || (systemTheme.matches ? "light" : "dark");
  }

  function updateThemeLabel() {
    const nextTheme = getTheme() === "light" ? "dark" : "light";
    themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} theme`);
  }

  themeToggle.addEventListener("click", () => {
    const nextTheme = getTheme() === "light" ? "dark" : "light";
    root.dataset.theme = nextTheme;
    updateThemeLabel();

    try {
      localStorage.setItem("theme", nextTheme);
    } catch (error) {
      console.error("Unable to save the theme preference.", error);
    }
  });

  systemTheme.addEventListener("change", () => {
    if (!root.dataset.theme) {
      updateThemeLabel();
    }
  });
  updateThemeLabel();

  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const mobileNavigation = window.matchMedia("(max-width: 900px)");

  function closeMenu() {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    menuToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
  }

  function toggleMenu() {
    const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    navLinks.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", `${isOpen ? "Close" : "Open"} navigation menu`);
    menuToggle.innerHTML = `<i class="fa-solid fa-${isOpen ? "xmark" : "bars"}" aria-hidden="true"></i>`;
  }

  menuToggle.addEventListener("click", toggleMenu);

  navLinks.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuToggle.focus();
    }
  });

  mobileNavigation.addEventListener("change", closeMenu);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!reduceMotion.matches) {
    const horizontalSections = [...document.querySelectorAll(".horizontal-scroll-section")].map((section) => ({
      section,
      sticky: section.querySelector(".horizontal-scroll-sticky"),
      viewport: section.querySelector(".horizontal-scroll-viewport"),
      track: section.querySelector(".horizontal-scroll-track"),
      progress: section.querySelector(".horizontal-scroll-progress"),
      progressFill: section.querySelector(".horizontal-scroll-progress span"),
      counter: section.querySelector(".horizontal-scroll-count"),
      travel: 0,
      scrollDistance: 0,
      pinHeight: 0,
      activeCard: -1,
    }));

    function updateHorizontalSections() {
      const scrollTop = window.scrollY;

      horizontalSections.forEach((item) => {
        const sectionTop = item.section.getBoundingClientRect().top + scrollTop;
        const progress = item.scrollDistance
          ? Math.min(1, Math.max(0, (scrollTop - sectionTop) / item.scrollDistance))
          : 0;
        const cards = item.track.children;
        const visibleCard = Math.round(progress * Math.max(0, cards.length - 1));
        const offset = item.section.id === "tech-stack"
          ? Math.min(
            item.travel,
            Math.max(
              0,
              cards[visibleCard].offsetLeft + cards[visibleCard].offsetWidth / 2 - item.viewport.clientWidth / 2
            )
          )
          : item.travel * progress;

        item.track.style.transform = `translate3d(${-offset}px, 0, 0)`;
        item.progress.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
        item.progressFill.style.transform = `scaleX(${progress})`;

        if (visibleCard !== item.activeCard) {
          item.activeCard = visibleCard;
          [...cards].forEach((card, index) => {
            card.classList.toggle("is-active", index === visibleCard);
          });
          item.counter.textContent = `${String(visibleCard + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
        }
      });
    }

    function measureHorizontalSections() {
      horizontalSections.forEach((item) => {
        item.travel = Math.max(0, item.track.scrollWidth - item.viewport.clientWidth);
        item.scrollDistance = item.section.id === "tech-stack" ? item.travel * 0.5 : item.travel;
        item.pinHeight = item.sticky.getBoundingClientRect().height;
        item.section.style.setProperty("--horizontal-travel", `${item.travel}px`);
        item.section.style.setProperty("--horizontal-scroll-distance", `${item.scrollDistance}px`);
        item.section.style.setProperty("--horizontal-pin-height", `${item.pinHeight}px`);
      });
      updateHorizontalSections();
    }

    function scrollToCard(item, card) {
      const sectionTop = item.section.getBoundingClientRect().top + window.scrollY;
      if (item.section.id === "tech-stack") {
        const cardIndex = [...item.track.children].indexOf(card);
        const progress = cardIndex / Math.max(1, item.track.children.length - 1);
        window.scrollTo({ top: sectionTop + item.scrollDistance * progress, behavior: "smooth" });
        return;
      }

      const cardOffset = Math.min(item.travel, Math.max(0, card.offsetLeft));
      const progress = item.travel ? cardOffset / item.travel : 0;
      window.scrollTo({ top: sectionTop + item.scrollDistance * progress, behavior: "smooth" });
    }

    root.classList.add("horizontal-scroll-ready");
    measureHorizontalSections();
    window.addEventListener("scroll", updateHorizontalSections, { passive: true });
    window.addEventListener("resize", measureHorizontalSections, { passive: true });

    horizontalSections.forEach((item) => {
      item.viewport.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
          return;
        }

        event.preventDefault();
        if (item.section.id === "tech-stack") {
          const currentIndex = item.activeCard < 0 ? 0 : item.activeCard;
          const direction = event.key === "ArrowRight" ? 1 : -1;
          const nextIndex = Math.min(item.track.children.length - 1, Math.max(0, currentIndex + direction));
          const progress = nextIndex / Math.max(1, item.track.children.length - 1);
          const sectionTop = item.section.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: sectionTop + item.scrollDistance * progress, behavior: "smooth" });
          return;
        }

        const currentOffset = item.travel
          ? Math.min(1, Math.max(0, (window.scrollY - (item.section.getBoundingClientRect().top + window.scrollY)) / item.scrollDistance)) * item.travel
          : 0;
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const cardGap = Number.parseFloat(getComputedStyle(item.track).columnGap) || 0;
        const nextOffset = Math.min(
          item.travel,
          Math.max(0, currentOffset + direction * (item.track.children[0].offsetWidth + cardGap))
        );
        const sectionTop = item.section.getBoundingClientRect().top + window.scrollY;
        const progress = item.travel ? nextOffset / item.travel : 0;
        window.scrollTo({ top: sectionTop + item.scrollDistance * progress, behavior: "smooth" });
      });

      item.track.addEventListener("focusin", (event) => {
        const card = event.target.closest(".skill-card, .project-card");
        if (card && item.travel) {
          scrollToCard(item, card);
        }
      });
    });
  }

  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    root.classList.add("motion-ready");

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
  }

  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !message) {
      formStatus.textContent = "Please complete all fields before preparing your email.";
      contactForm.querySelector(":invalid")?.focus();
      return;
    }

    const subject = `Portfolio inquiry from ${name}`;
    const body = `Message from: ${name}\nReply to: ${email}\n\n${message}`;
    const mailtoUrl = `mailto:saustinjhon@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    formStatus.textContent =
      "Your email app should open with this message. Send the draft there to deliver it.";
    window.location.href = mailtoUrl;
  });
})();

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

const navLinks = [...document.querySelectorAll(".nav-link")];
const sections = [...document.querySelectorAll("main section[id]")];
const menuToggle = document.querySelector("#menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const siteHeader = document.querySelector("#site-header");
const themeToggle = document.querySelector("#theme-toggle");
const themeToggleLabel = themeToggle?.querySelector(".theme-toggle-label");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const scrollProgress = document.querySelector("#scroll-progress");
const contactForm = document.querySelector("#contact-form");
const phoneInput = document.querySelector("#phone");
const formStatus = document.querySelector("#form-status");
const toastContainer = document.querySelector("#toast-container");
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

function applyTheme(theme, persist = true) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  const isDark = nextTheme === "dark";
  if (themeToggle) {
    const actionLabel = isDark ? "Switch to light mode" : "Switch to dark mode";
    themeToggle.setAttribute("aria-label", actionLabel);
    themeToggle.setAttribute("title", actionLabel);
    themeToggle.setAttribute("aria-pressed", String(isDark));
    if (themeToggleLabel)
      themeToggleLabel.textContent = isDark ? "DARK" : "LIGHT";
  }
  if (themeColorMeta)
    themeColorMeta.setAttribute("content", isDark ? "#191a17" : "#f3f0e8");
  if (persist) {
    try {
      window.localStorage.setItem("portfolio-theme", nextTheme);
    } catch (error) {
      // The visual toggle still works when storage is blocked.
    }
  }
}

applyTheme(document.documentElement.dataset.theme || "light", false);
themeToggle?.addEventListener("click", () => {
  const activeTheme =
    document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  applyTheme(activeTheme === "dark" ? "light" : "dark");
});

function closeMenu() {
  if (!menuToggle || !navigation) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  navigation.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

function toggleMenu() {
  if (!menuToggle || !navigation) return;
  const shouldOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(shouldOpen));
  menuToggle.setAttribute(
    "aria-label",
    shouldOpen ? "Close navigation" : "Open navigation",
  );
  navigation.classList.toggle("is-open", shouldOpen);
  document.body.classList.toggle(
    "menu-open",
    shouldOpen && window.innerWidth <= 820,
  );
}

menuToggle?.addEventListener("click", toggleMenu);
navLinks.forEach((link) => {
  link.addEventListener("click", () => closeMenu());
});
document.querySelectorAll('a[href="#home"]').forEach((link) => {
  link.addEventListener("click", () => closeMenu());
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 820) closeMenu();
});

// A slim top line provides orientation without adding a large fixed UI element.
function updateScrollProgress() {
  if (!scrollProgress) return;
  const scrollableDistance =
    document.documentElement.scrollHeight - window.innerHeight;
  const progress =
    scrollableDistance > 0
      ? Math.min(1, Math.max(0, window.scrollY / scrollableDistance))
      : 0;
  scrollProgress.style.transform = `scaleX(${progress})`;
}

// Update the active navigation item based on the section that occupies the viewport.
function updateActiveNavigation() {
  const headerOffset = (siteHeader?.offsetHeight || 0) + 90;
  let activeId = "home";
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= headerOffset)
      activeId = section.id;
  }
  if (
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 8
  ) {
    activeId = "contact";
  }
  navLinks.forEach((link) => {
    const active = link.getAttribute("href") === `#${activeId}`;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 12);
}
let scrollQueued = false;
window.addEventListener(
  "scroll",
  () => {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(() => {
      updateActiveNavigation();
      updateScrollProgress();
      scrollQueued = false;
    });
  },
  { passive: true },
);
window.addEventListener("resize", () => {
  updateActiveNavigation();
  updateScrollProgress();
});
window.addEventListener("load", () => {
  updateActiveNavigation();
  updateScrollProgress();
});
updateActiveNavigation();
updateScrollProgress();

// Subtle entrance reveals only add motion when JS is available; CSS leaves content readable by default.
if ("IntersectionObserver" in window && !reducedMotion) {
  const revealTargets = document.querySelectorAll(
    ".project, .section-heading, .expertise-row, .timeline-item, .skill-group, .contact-form",
  );
  revealTargets.forEach((element) => element.classList.add("reveal-ready"));
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -35px 0px" },
  );
  revealTargets.forEach((element) => revealObserver.observe(element));
}

let iti = null;
if (phoneInput && typeof window.intlTelInput === "function") {
  iti = window.intlTelInput(phoneInput, {
    initialCountry: "vn",
    separateDialCode: true,
    nationalMode: true,
    autoPlaceholder: "polite",
    utilsScript: "https://unpkg.com/intl-tel-input@17.0.8/build/js/utils.js",
  });

  // Support pasting an international number by switching the country and leaving the national number in the field.
  phoneInput.addEventListener("input", () => {
    const value = phoneInput.value.trim();
    if (!value.startsWith("+")) return;
    const countries = [...iti.getCountriesData()].sort(
      (a, b) => b.dialCode.length - a.dialCode.length,
    );
    const country = countries.find((item) =>
      value.startsWith(`+${item.dialCode}`),
    );
    if (!country) return;
    iti.setCountry(country.iso2);
    phoneInput.value = value.slice(country.dialCode.length + 1).trim();
  });
  phoneInput.addEventListener("countrychange", () =>
    phoneInput.setCustomValidity(""),
  );
}

function showToast(message, type = "success") {
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = `toast${type === "error" ? " is-error" : ""}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  const mark = document.createElement("span");
  mark.className = "toast-mark";
  mark.setAttribute("aria-hidden", "true");
  mark.textContent = type === "error" ? "!" : "✓";
  const text = document.createElement("span");
  text.textContent = message;
  toast.append(mark, text);
  toastContainer.append(toast);
  window.requestAnimationFrame(() => toast.classList.add("show"));
  window.setTimeout(() => {
    toast.classList.remove("show");
    window.setTimeout(() => toast.remove(), 250);
  }, 5200);
}

function setFormStatus(message, type = "") {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.classList.toggle("success", type === "success");
}

function validateField(field) {
  if (!field) return true;
  let valid = field.checkValidity();
  if (field === phoneInput) {
    valid = Boolean(iti && iti.isValidNumber());
    if (!iti)
      field.setCustomValidity(
        "Phone validation could not load. Please refresh and try again.",
      );
    else if (!valid)
      field.setCustomValidity(
        "Please enter a valid phone number for the selected country.",
      );
    else field.setCustomValidity("");
  }
  field.setAttribute("aria-invalid", String(!valid));
  return valid;
}

contactForm?.querySelectorAll("input, textarea").forEach((field) => {
  field.addEventListener("input", () => {
    field.setCustomValidity("");
    if (field.hasAttribute("aria-invalid")) validateField(field);
  });
});

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFormStatus("");

  const fields = [
    contactForm.querySelector("#full-name"),
    contactForm.querySelector("#email-address"),
    phoneInput,
    contactForm.querySelector("#message"),
  ];
  let firstInvalidField = null;
  for (const field of fields) {
    if (!validateField(field)) {
      firstInvalidField ||= field;
    }
  }
  if (firstInvalidField) {
    firstInvalidField.reportValidity();
    firstInvalidField.focus();
    setFormStatus("Please check the required fields and try again.", "error");
    return;
  }

  if (!window.db || !window.collection || !window.addDoc || !window.emailjs) {
    const message =
      "The contact service is currently unavailable. Please email me directly instead.";
    setFormStatus(message, "error");
    showToast(message, "error");
    console.error(
      "Contact integrations are unavailable.",
      window.portfolioIntegrationsError || "Integration globals missing",
    );
    return;
  }

  const submitButton = contactForm.querySelector('button[type="submit"]');
  const buttonLabel = submitButton?.querySelector("span:first-child");
  if (submitButton) submitButton.disabled = true;
  if (buttonLabel) buttonLabel.textContent = "Sending…";
  setFormStatus("Sending your message…");

  const fullName = contactForm.querySelector("#full-name").value.trim();
  const email = contactForm.querySelector("#email-address").value.trim();
  const subject = contactForm.querySelector("#subject").value.trim();
  const message = contactForm.querySelector("#message").value.trim();
  const fullPhoneNumber = iti.getNumber();
  const createdAt = new Date();
  const formData = {
    name: fullName,
    email,
    phone: fullPhoneNumber,
    subject,
    message,
    createdAt,
  };
  const templateParams = {
    from_name: fullName,
    from_email: email,
    from_phone: fullPhoneNumber,
    subject,
    message,
    current_year: createdAt.getFullYear(),
  };

  let savedToFirestore = false;
  try {
    // Both existing delivery paths must complete before the form reports full success.
    const docRef = await window.addDoc(
      window.collection(window.db, "contacts"),
      formData,
    );
    savedToFirestore = true;
    console.info("Contact saved to Firestore.", docRef.id);
    await window.emailjs.send(
      "service_nlr9hlv",
      "template_009u9w2",
      templateParams,
    );
    console.info("EmailJS notification sent.");

    contactForm.reset();
    phoneInput.setCustomValidity("");
    if (iti) iti.setCountry("vn");
    contactForm
      .querySelectorAll('[aria-invalid="true"]')
      .forEach((field) => field.removeAttribute("aria-invalid"));
    setFormStatus(
      "Thanks — your message has been sent successfully.",
      "success",
    );
    showToast("Thanks — your message has been sent successfully.", "success");
  } catch (error) {
    console.error("Contact submission did not complete successfully:", error);
    const message = savedToFirestore
      ? "Your message was saved, but the email notification failed. Please contact me directly if you need confirmation."
      : "We couldn’t complete the submission. Please try again or contact me by email.";
    setFormStatus(message, "error");
    showToast(message, "error");
  } finally {
    if (submitButton) submitButton.disabled = false;
    if (buttonLabel) buttonLabel.textContent = "Send message";
  }
});

const yearElement = document.getElementById("current-year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const navLinks = document.querySelectorAll("nav a.nav-link");
const sections = document.querySelectorAll("section");

window.addEventListener("scroll", () => {
  let currentSectionId = "home";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    if (window.scrollY >= sectionTop - 160) {
      currentSectionId = section.getAttribute("id");
    }
  });

  if (
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 50
  ) {
    currentSectionId = "contact";
  }

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${currentSectionId}`) {
      link.classList.add("active");
    }
  });
});

navLinks.forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href");
    const targetSection = document.querySelector(targetId);

    if (targetSection) {
      const targetPosition = targetSection.offsetTop - 100;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });

      history.pushState(
        null,
        null,
        window.location.origin + window.location.pathname,
      );
    }
  });
});

const phoneInput = document.querySelector("#phone");
const iti = window.intlTelInput(phoneInput, {
  initialCountry: "vn",
  separateDialCode: true,
  enableOnDialCode: true,
  utilsScript: "https://unpkg.com/intl-tel-input@17.0.8/build/js/utils.js",
});

document.addEventListener("keydown", function (e) {
  const countryList = document.querySelector(".iti__country-list");

  if (countryList && !countryList.classList.contains("iti__hide")) {
    const key = e.key.toLowerCase();

    if (key.length === 1 && key >= "a" && key <= "z") {
      const countries = Array.from(document.querySelectorAll(".iti__country"));

      const matchingCountries = countries.filter((c) => {
        const countryName = c
          .querySelector(".iti__country-name")
          .textContent.trim()
          .toLowerCase();
        return countryName.startsWith(key);
      });

      if (matchingCountries.length > 0) {
        const currentHighlightIdx = matchingCountries.findIndex((c) =>
          c.classList.contains("iti__highlight"),
        );

        let nextCountry;
        if (
          currentHighlightIdx === -1 ||
          currentHighlightIdx === matchingCountries.length - 1
        ) {
          nextCountry = matchingCountries[0];
        } else {
          nextCountry = matchingCountries[currentHighlightIdx + 1];
        }

        if (nextCountry) {
          countries.forEach((c) => c.classList.remove("iti__highlight"));
          nextCountry.classList.add("iti__highlight");

          nextCountry.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    }
  }
});

phoneInput.addEventListener("input", function () {
  let value = phoneInput.value.trim();

  if (value.startsWith("+")) {
    const countries = iti.getCountriesData();

    for (let i = 0; i < countries.length; i++) {
      const countryData = countries[i];
      if (value.startsWith("+" + countryData.dialCode)) {
        iti.setCountry(countryData.iso2);

        phoneInput.value = value.replace("+" + countryData.dialCode, "").trim();
        break;
      }
    }
  }
});

function showToast(message) {
  const container = document.getElementById("toast-container");

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 5000);
}

const form = document.querySelector(".contact form");
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  phoneInput.setCustomValidity("");

  const fullPhoneNumber = iti.getNumber();
  const isValid = iti.isValidNumber();

  if (!isValid) {
    phoneInput.setCustomValidity("Please enter a valid phone number!");
    form.reportValidity();
    return;
  }

  const fullName = form.querySelector("input[placeholder='Full Name']").value;
  const email = form.querySelector("input[placeholder='Email Address']").value;
  const subject = form.querySelector("input[placeholder='Subject']").value;
  const message = form.querySelector("textarea").value;

  const formData = {
    name: fullName,
    email: email,
    phone: fullPhoneNumber,
    subject: subject,
    message: message,
    createdAt: new Date(),
  };

  try {
    if (window.db && window.addDoc && window.collection) {
      const docRef = await window.addDoc(
        window.collection(window.db, "contacts"),
        formData,
      );
      console.log("Successfully saved to Firebase! Document ID:", docRef.id);
    } else {
      console.error("Firebase global variables are not defined.");
    }

    const templateParams = {
      from_name: fullName,
      from_email: email,
      from_phone: fullPhoneNumber,
      subject: subject,
      message: message,
      current_year: new Date().getFullYear(),
    };

    await window.emailjs.send(
      "service_nlr9hlv",
      "template_009u9w2",
      templateParams,
    );
    console.log("Notification email sent successfully!");

    showToast("Thank you! Your message has been sent successfully.");
    form.reset();
  } catch (error) {
    console.error("Error processing form submission:", error);
    showToast("Failed to send message. Please try again later.");
  }
});

phoneInput.addEventListener("input", function () {
  phoneInput.setCustomValidity("");
});

const logo = document.querySelector(".logo");
logo.addEventListener("click", function (e) {
  e.preventDefault();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  history.pushState(
    null,
    null,
    window.location.origin + window.location.pathname,
  );
});

const menuIcon = document.querySelector("#menu-icon");
const nav = document.querySelector("nav");

menuIcon.addEventListener("click", () => {
  menuIcon.classList.toggle("fa-xmark");
  nav.classList.toggle("active");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    menuIcon.classList.remove("fa-xmark");
    nav.classList.remove("active");
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        entry.target.classList.remove("hidden-up", "hidden-down");
      } else {
        entry.target.classList.remove("show");

        if (entry.boundingClientRect.top < 0) {
          entry.target.classList.add("hidden-up");
        } else {
          entry.target.classList.add("hidden-down");
        }
      }
    });
  },
  {
    threshold: 0.1,
  },
);

const hiddenElements = document.querySelectorAll(
  ".box, .home-content, .contact form",
);
hiddenElements.forEach((el) => observer.observe(el));

document.addEventListener("contextmenu", (event) => event.preventDefault());

document.addEventListener("keydown", function (event) {
  if (
    event.key === "F12" ||
    (event.ctrlKey &&
      event.shiftKey &&
      (event.key === "i" || event.key === "j")) ||
    (event.ctrlKey && event.key === "u") ||
    (event.ctrlKey && event.key === "s")
  ) {
    event.preventDefault();
  }
});

document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");
const revealItems = document.querySelectorAll(".reveal");
const portfolioCards = document.querySelectorAll("[data-youtube-url]");
const langButtons = document.querySelectorAll("[data-lang]");
const currentYear = new Date().getFullYear();

const pageTitles = {
  en: "Creep Lab Studio | Recording, Mixing & Mastering",
  th: "Creep Lab Studio | บันทึกเสียง มิกซ์ และมาสเตอร์",
};

function setHeaderState() {
  header.classList.toggle("is-scrolled", window.scrollY > 20);
}

function setMenu(open) {
  menu.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  const lang = document.documentElement.lang === "th" ? "th" : "en";
  menuToggle.setAttribute(
    "aria-label",
    open
      ? lang === "th"
        ? "ปิดเมนู"
        : "Close menu"
      : lang === "th"
        ? "เปิดเมนู"
        : "Open menu"
  );
}

function translateValue(value) {
  return value.replace("{year}", currentYear);
}

function getStoredLanguage() {
  try {
    return localStorage.getItem("creepLabLanguage");
  } catch (error) {
    return null;
  }
}

function setStoredLanguage(lang) {
  try {
    localStorage.setItem("creepLabLanguage", lang);
  } catch (error) {
    // Some mobile in-app browsers block storage; language switching should still work.
  }
}

function applyLanguage(lang) {
  const nextLang = lang === "th" ? "th" : "en";

  document.documentElement.lang = nextLang;
  document.title = pageTitles[nextLang];

  document.querySelectorAll("[data-en][data-th]").forEach((element) => {
    const value = translateValue(element.dataset[nextLang]);
    const attr = element.dataset.i18nAttr;

    if (attr) {
      element.setAttribute(attr, value);
      return;
    }

    element.innerHTML = value;
  });

  langButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === nextLang);
    button.setAttribute("aria-pressed", String(button.dataset.lang === nextLang));
  });

  setStoredLanguage(nextLang);
  setMenu(false);
}

function getYouTubeId(url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "");
    }

    return parsed.searchParams.get("v");
  } catch (error) {
    return null;
  }
}

portfolioCards.forEach((card) => {
  const id = getYouTubeId(card.dataset.youtubeUrl);
  const image = card.querySelector("img");

  if (id && image) {
    image.src = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
    image.onerror = () => {
      image.onerror = null;
      image.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    };
  }
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -50px 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("in-view"));
}

menuToggle.addEventListener("click", () => {
  setMenu(!menu.classList.contains("is-open"));
});

menu.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    setMenu(false);
  }
});

langButtons.forEach((button) => {
  button.addEventListener("click", () => applyLanguage(button.dataset.lang));
});

window.addEventListener("scroll", setHeaderState, { passive: true });
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenu(false);
  }
});

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = currentYear;
});

const savedLanguage = getStoredLanguage();
const browserLanguage = navigator.language.toLowerCase().startsWith("th") ? "th" : "en";

applyLanguage(savedLanguage || browserLanguage);
setHeaderState();

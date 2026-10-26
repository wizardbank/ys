document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Navbar burger ---------- */
  const burger = document.querySelector(".navbar-burger");
  const menu = burger && document.getElementById(burger.dataset.target);

  if (burger && menu) {
    burger.addEventListener("click", () => {
      const open = burger.classList.toggle("is-active");
      menu.classList.toggle("is-active", open);
    });
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Sections and their data files ---------- */
  const sections = [
    { id: "season1-container", name: "Anime Season 1", file: "season1/season1.json" },
    { id: "season2-container", name: "Anime Season 2", file: "season2/season2.json" },
    { id: "season3-container", name: "Anime Season 3", file: "season3/season3.json" },
    { id: "manga-container", name: "Manga", file: "manga/manga.json" },
    { id: "other-container", name: "Other Trips", file: "other/other.json" },
  ];

  /* ---------- Helpers ---------- */
  // textContent keeps all text XSS-safe
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  // Only allow http(s) links (blocks javascript: and similar)
  function safeUrl(value) {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      const url = new URL(value, location.href);
      return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  }

  /* ---------- Card ---------- */
  // Item shape: { "title": "", "description": "", "link": "" }
  function createCard(item) {
    const card = el("div", "card");

    if (item.title) {
      const header = el("header", "card-header");
      header.appendChild(el("p", "card-header-title", item.title));
      card.appendChild(header);
    }

    if (item.description) {
      card.appendChild(el("div", "card-content", item.description));
    }

    const url = safeUrl(item.link);
    if (url) {
      const footer = el("footer", "card-footer");
      const link = el("a", "card-footer-item", "Discover");
      link.href = url;
      // Links to other pages of this site open in the same tab
      if (new URL(url).origin !== location.origin) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      footer.appendChild(link);
      card.appendChild(footer);
    }

    return card;
  }

  /* ---------- Section states ---------- */
  function showMessage(container, text) {
    container.replaceChildren(el("p", "empty-state", text));
  }

  function showError(container, section) {
    const box = el("div", "load-error");
    box.appendChild(
      el("p", "has-text-danger", `Couldn't load ${section.name}. Check your connection and try again.`)
    );
    const retry = el("button", "button is-small", "Try again");
    retry.type = "button";
    retry.addEventListener("click", () => loadSection(section));
    box.appendChild(retry);
    container.replaceChildren(box);
  }

  /* ---------- Load one section ---------- */
  async function loadSection(section) {
    const container = document.getElementById(section.id);
    if (!container) return;

    showMessage(container, "Loading...");

    try {
      const res = await fetch(section.file);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Invalid format: expected an array");

      if (data.length === 0) {
        showMessage(container, "No locations here yet. Be the first to contribute!");
        return;
      }

      const fragment = document.createDocumentFragment();
      data.forEach((item) => {
        const column = el("div", "column");
        column.appendChild(createCard(item));
        fragment.appendChild(column);
      });
      container.replaceChildren(fragment);
    } catch (err) {
      console.error(`Error loading ${section.file}:`, err);
      showError(container, section);
    }
  }

  // Sections load independently, so one failure doesn't affect the rest
  sections.forEach(loadSection);
});
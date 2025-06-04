document.addEventListener("DOMContentLoaded", () => {
  // Navbar burger toggle with element existence check
  const burger = document.querySelector(".navbar-burger");
  if (burger) {
    const menu = document.getElementById(burger.dataset.target);
    if (menu) {
      burger.addEventListener("click", () => {
        burger.classList.toggle("is-active");
        menu.classList.toggle("is-active");
      });
    }
  }

  // Sections and corresponding JSON data files
  const sections = [
    { id: "season1-container", file: "data/season1.json" },
    { id: "season2-container", file: "data/season2.json" },
    { id: "season3-container", file: "data/season3.json" },
    { id: "manga-container", file: "data/manga.json" },
    { id: "other-container", file: "data/other.json" },
  ];

  // Create a card element from data item
  function createCard(item) {
    const card = document.createElement("div");
    card.className = "card";

    if (item.title) {
      const header = document.createElement("header");
      header.className = "card-header";
      const title = document.createElement("p");
      title.className = "card-header-title";
      title.textContent = item.title;
      header.appendChild(title);
      card.appendChild(header);
    }

    if (item.description) {
      const cardContent = document.createElement("div");
      cardContent.className = "card-content";
      const content = document.createElement("div");
      content.className = "content";
      content.textContent = item.description;
      cardContent.appendChild(content);
      card.appendChild(cardContent);
    }

    if (item.link) {
      const footer = document.createElement("footer");
      footer.className = "card-footer";
      const link = document.createElement("a");
      link.className = "card-footer-item";
      link.href = item.link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Discover";
      footer.appendChild(link);
      card.appendChild(footer);
    }

    return card;
  }

  // Load data for each section asynchronously
  sections.forEach(async ({ id, file }) => {
    const container = document.getElementById(id);
    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      container.innerHTML = "";

      const fragment = document.createDocumentFragment();
      data.forEach((item) => {
        const column = document.createElement("div");
        column.className = "column is-4";
        column.appendChild(createCard(item));
        fragment.appendChild(column);
      });
      container.appendChild(fragment);
    } catch (err) {
      container.innerHTML = `
        <p class="has-text-danger">⚠️ Failed to load data for ${id.replace(
          "-container",
          ""
        )}.</p>
      `;
      console.error(`Error loading ${file}:`, err);
    }
  });
});

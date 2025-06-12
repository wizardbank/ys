document.addEventListener("DOMContentLoaded", () => {
  // Toggle burger navbar untuk perangkat seluler
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

  // Definisi bagian dan file data JSON yang sesuai
  // Tambahkan 'estimatedItems' untuk memperkirakan jumlah item yang akan dimuat
  // Ini digunakan untuk merender placeholder kerangka awal dan mengurangi CLS
  const sections = [
    { id: "season1-container", file: "data/season1.json", estimatedItems: 6 },
    { id: "season2-container", file: "data/season2.json", estimatedItems: 6 },
    { id: "season3-container", file: "data/season3.json", estimatedItems: 6 },
    { id: "manga-container", file: "data/manga.json", estimatedItems: 3 },
    { id: "other-container", file: "data/other.json", estimatedItems: 3 },
  ];

  /**
   * Membuat elemen kartu (card) dari item data yang disediakan.
   * Jika item adalah null atau placeholder, itu akan membuat kartu kerangka.
   * @param {Object|null} item - Data untuk kartu, atau null untuk kartu kerangka.
   * @returns {HTMLElement} Elemen div kartu yang dibuat.
   */
  function createCard(item = null) {
    const card = document.createElement("div");
    card.className = "card";

    // Jika tidak ada item yang disediakan, buat kartu kerangka (skeleton)
    if (!item) {
      const header = document.createElement("header");
      header.className = "card-header";
      const title = document.createElement("p");
      title.className = "card-header-title";
      title.textContent = "Loading..."; // Placeholder untuk judul
      header.appendChild(title);
      card.appendChild(header);

      const cardContent = document.createElement("div");
      cardContent.className = "card-content";
      const content = document.createElement("div");
      content.className = "content";
      // Gunakan non-breaking spaces dan br untuk memberikan tinggi visual pada area konten
      content.innerHTML = "&nbsp;<br>&nbsp;<br>&nbsp;"; // Placeholder untuk deskripsi
      cardContent.appendChild(content);
      card.appendChild(cardContent);
      return card;
    }

    // --- Buat kartu konten yang sebenarnya ---
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

  /**
   * Merender kartu placeholder kerangka ke dalam kontainer yang diberikan.
   * @param {HTMLElement} container - Elemen DOM untuk ditambahkan placeholder.
   * @param {number} count - Jumlah kartu placeholder yang akan dirender.
   */
  function renderPlaceholders(container, count) {
    container.innerHTML = ""; // Bersihkan teks "Loading..." yang ada
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const column = document.createElement("div");
      column.className = "column is-4"; // Ukuran kolom Bulma untuk kartu
      column.appendChild(createCard(null)); // Berikan null untuk membuat kerangka
      fragment.appendChild(column);
    }
    container.appendChild(fragment);
  }

  // Muat data untuk setiap bagian secara asynchronous
  sections.forEach(async ({ id, file, estimatedItems }) => {
    const container = document.getElementById(id);

    // 1. Render placeholder kerangka segera (ini mengurangi CLS)
    if (container && estimatedItems > 0) {
      renderPlaceholders(container, estimatedItems);
    }

    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // 2. Bersihkan placeholder dan render konten aktual
      container.innerHTML = ""; // Bersihkan konten (kerangka) yang ada
      const fragment = document.createDocumentFragment();
      data.forEach((item) => {
        const column = document.createElement("div");
        column.className = "column is-4";
        column.appendChild(createCard(item));
        fragment.appendChild(column);
      });
      container.appendChild(fragment);
    } catch (err) {
      // Jika pemuatan gagal, tampilkan pesan error
      container.innerHTML = `
        <p class="has-text-danger">⚠️ Gagal memuat data untuk ${id.replace(
          "-container",
          ""
        )}. Silakan coba lagi nanti.</p>
      `;
      console.error(`Error loading ${file}:`, err);
    }
  });
});

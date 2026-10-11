document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      menu.classList.toggle("hidden", expanded);
    });
  }

  const search = document.querySelector("[data-venue-search]");
  if (search) {
    const cards = [...document.querySelectorAll("[data-venue-card]")];
    const empty = document.querySelector("[data-empty-search]");
    search.addEventListener("input", () => {
      const query = search.value.trim().toLocaleLowerCase();
      let visible = 0;
      cards.forEach((card) => {
        const matches = card.dataset.searchName.includes(query);
        card.hidden = !matches;
        if (matches) visible += 1;
      });
      if (empty) empty.classList.toggle("hidden", visible > 0);
    });
  }
});

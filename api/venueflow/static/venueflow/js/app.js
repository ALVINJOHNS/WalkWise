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

  const toast = document.querySelector("[data-flow-toast]");
  let toastTimer;
  document.querySelectorAll("[data-flow-target]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!toast) return;
      const destination = button.dataset.flowName || button.dataset.flowTarget;
      toast.textContent = `${destination} is mapped as the next step. Navigation will be connected soon.`;
      toast.hidden = false;
      toast.classList.add("flow-toast--visible");
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => {
        toast.classList.remove("flow-toast--visible");
        window.setTimeout(() => { toast.hidden = true; }, 200);
      }, 2800);
    });
  });

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

(() => {
  const page = document.querySelector(".visitor-layout");
  if (!page) return;

  const search = page.querySelector("[data-place-search]");
  const statusFilter = page.querySelector("[data-status-filter]");
  const resultCount = page.querySelector("[data-result-count]");
  const noResults = page.querySelector("[data-no-results]");
  const detailName = page.querySelector("[data-detail-name]");
  const detailCopy = page.querySelector("[data-detail-copy]");
  const detailStatus = page.querySelector("[data-detail-status]");
  const map = page.querySelector("[data-visitor-map]");
  const locateButton = page.querySelector("[data-locate-me]");
  const locationMessage = page.querySelector("[data-location-message]");
  const startMarker = page.querySelector("[data-start-marker]");
  const items = [...page.querySelectorAll("[data-place-item]")];
  const pins = [...page.querySelectorAll("[data-place-pin]")];
  let selectedId = null;

  function statusLabel(status) {
    return status === "unavailable" ? "Status unavailable" : status[0].toUpperCase() + status.slice(1);
  }

  function selectPlace(id) {
    const item = items.find((place) => place.dataset.placeId === id);
    if (!item || item.hidden) return;

    selectedId = id;
    items.forEach((place) => {
      place.setAttribute("aria-pressed", String(place === item));
    });
    pins.forEach((pin) => {
      const selected = pin.dataset.placeId === id;
      pin.setAttribute("aria-pressed", String(selected));
    });

    detailName.textContent = item.dataset.placeName;
    detailCopy.textContent = item.dataset.placeDescription || item.dataset.placeKind;
    detailStatus.textContent = statusLabel(item.dataset.placeStatus);
  }

  function applyFilters() {
    const query = search.value.trim().toLocaleLowerCase();
    const wantedStatus = statusFilter.value;
    let visibleCount = 0;

    items.forEach((item) => {
      const matchesName = item.dataset.placeName.toLocaleLowerCase().includes(query);
      const matchesStatus = wantedStatus === "all" || item.dataset.placeStatus === wantedStatus;
      const visible = matchesName && matchesStatus;
      item.hidden = !visible;
      const matchingPin = pins.find((pin) => pin.dataset.placeId === item.dataset.placeId);
      if (matchingPin) matchingPin.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    if (noResults) noResults.hidden = items.length === 0 || visibleCount !== 0;
    if (resultCount) resultCount.textContent = `Showing ${visibleCount} of ${items.length} places`;

    if (selectedId && items.find((item) => item.dataset.placeId === selectedId)?.hidden) {
      selectedId = null;
      items.forEach((item) => item.setAttribute("aria-pressed", "false"));
      pins.forEach((pin) => pin.setAttribute("aria-pressed", "false"));
      detailName.textContent = "Choose a place";
      detailCopy.textContent = "Select a map pin or destination to see its details.";
      detailStatus.textContent = "";
    }
  }

  items.forEach((item) => item.addEventListener("click", () => selectPlace(item.dataset.placeId)));
  pins.forEach((pin) => pin.addEventListener("click", () => selectPlace(pin.dataset.placeId)));
  search?.addEventListener("input", applyFilters);
  statusFilter?.addEventListener("change", applyFilters);

  function markManualStart(x, y) {
    startMarker.hidden = false;
    startMarker.style.left = `${Math.max(0, Math.min(100, x))}%`;
    startMarker.style.top = `${Math.max(0, Math.min(100, y))}%`;
    locationMessage.textContent = "Approximate starting point marked. Route guidance is not connected yet.";
  }

  let mapPointerStart = null;
  map?.addEventListener("pointerdown", (event) => {
    if (event.target.closest?.("[data-place-pin]")) {
      mapPointerStart = null;
      return;
    }
    mapPointerStart = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
  });

  map?.addEventListener("pointerup", (event) => {
    if (!mapPointerStart || mapPointerStart.pointerId !== event.pointerId) return;
    const distance = Math.hypot(event.clientX - mapPointerStart.x, event.clientY - mapPointerStart.y);
    mapPointerStart = null;
    if (distance > 12 || event.target.closest?.("[data-place-pin]")) return;
    const bounds = map.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    markManualStart(((event.clientX - bounds.left) / bounds.width) * 100, ((event.clientY - bounds.top) / bounds.height) * 100);
  });

  map?.addEventListener("pointercancel", () => {
    mapPointerStart = null;
  });

  map?.addEventListener("keydown", (event) => {
    if (event.target !== map || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    markManualStart(50, 50);
  });

  locateButton?.addEventListener("click", () => {
    if (!navigator.geolocation) {
      locationMessage.textContent = "Location is unavailable in this browser. Tap the map to mark an approximate starting point.";
      return;
    }
    locationMessage.textContent = "Requesting device location…";
    navigator.geolocation.getCurrentPosition(
      () => {
        locationMessage.textContent = "Location access is available. Tap the map to mark your approximate starting point; route guidance is not connected yet.";
      },
      (error) => {
        locationMessage.textContent = error.code === error.PERMISSION_DENIED
          ? "Location permission was denied. Tap the map to mark an approximate starting point."
          : "Could not get your location. Tap the map to mark an approximate starting point.";
      },
      { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 },
    );
  });

  applyFilters();
})();

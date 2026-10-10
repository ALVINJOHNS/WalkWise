(() => {
  const root = document.querySelector("[data-organizer]");
  if (!root) return;

  const $ = (selector) => root.querySelector(selector);
  const canvas = $("[data-canvas]");
  const venuePicker = $ ("[data-venue]");
  if (!canvas || !venuePicker) return;

  const state = { venue: null, imageData: "", places: [], nodes: [], edges: [], selected: null, dirty: false, drag: null };
  const controls = {
    backdrop: $("[data-backdrop]"), markers: $("[data-markers]"), lines: $("[data-lines]"), empty: $("[data-empty]"),
    placeList: $("[data-place-list]"), nodeList: $("[data-node-list]"), edgeList: $("[data-edge-list]"),
    fields: $("[data-place-fields]"), errors: $("[data-errors]"), saveState: $("[data-save-state]"),
  };
  const makeId = (prefix) => `${prefix}-${crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10)}`;
  const setDirty = () => { state.dirty = true; controls.saveState.textContent = "Unsaved changes"; };
  const esc = (value) => String(value ?? "");

  function selectedItem() {
    if (!state.selected) return null;
    const collection = state.selected.type === "place" ? state.places : state.nodes;
    return collection.find((item) => item.id === state.selected.id) || null;
  }

  function render() {
    controls.backdrop.src = state.imageData || state.venue?.plan_image_url || "";
    controls.backdrop.hidden = !controls.backdrop.src;
    if (controls.backdrop.src) {
      controls.backdrop.onload = () => {
        canvas.style.aspectRatio = `${controls.backdrop.naturalWidth} / ${controls.backdrop.naturalHeight}`;
        canvas.style.minHeight = "0";
      };
    } else {
      canvas.style.aspectRatio = "1.45";
      canvas.style.minHeight = "420px";
    }
    controls.empty.hidden = Boolean(controls.backdrop.src);
    controls.markers.replaceChildren();
    controls.lines.replaceChildren();
    controls.lines.setAttribute("viewBox", "0 0 1000 1000");
    controls.lines.setAttribute("preserveAspectRatio", "none");
    for (const edge of state.edges) {
      const from = state.nodes.find((node) => node.id === edge.from);
      const to = state.nodes.find((node) => node.id === edge.to);
      if (!from || !to) continue;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", from.x * 1000); line.setAttribute("y1", from.y * 1000);
      line.setAttribute("x2", to.x * 1000); line.setAttribute("y2", to.y * 1000); line.setAttribute("class", "path-line");
      controls.lines.append(line);
    }
    [...state.places.map((item) => ({ ...item, type: "place" })), ...state.nodes.map((item) => ({ ...item, type: "node" }))].forEach((item) => {
      const marker = document.createElement("button");
      marker.type = "button"; marker.className = `map-marker ${item.type === "node" ? "node" : ""} ${state.selected?.id === item.id ? "selected" : ""}`;
      marker.style.left = `${item.x * 100}%`; marker.style.top = `${item.y * 100}%`;
      marker.setAttribute("aria-label", `${item.type === "node" ? "Path point" : item.name || "Unnamed destination"}`);
      marker.dataset.type = item.type; marker.dataset.id = item.id;
      marker.addEventListener("pointerdown", (event) => {
        event.stopPropagation(); state.selected = { type: item.type, id: item.id }; state.drag = item.id;
        canvas.setPointerCapture(event.pointerId); render();
      });
      marker.addEventListener("click", (event) => event.stopPropagation());
      controls.markers.append(marker);
    });
    renderList(controls.placeList, state.places, "place");
    renderList(controls.nodeList, state.nodes, "node");
    controls.edgeList.replaceChildren();
    state.edges.forEach((edge) => {
      const a = state.nodes.find((node) => node.id === edge.from);
      const b = state.nodes.find((node) => node.id === edge.to);
      const li = document.createElement("li"); li.className = "item-row";
      li.textContent = `${a?.name || edge.from} ↔ ${b?.name || edge.to}`;
      controls.edgeList.append(li);
    });
    const place = state.selected?.type === "place" ? selectedItem() : null;
    controls.fields.hidden = !place;
    if (place) {
      root.querySelectorAll("[data-field]").forEach((field) => { if (field.value !== esc(place[field.dataset.field])) field.value = esc(place[field.dataset.field]); });
    }
  }

  function renderList(list, items, type) {
    list.replaceChildren();
    items.forEach((item, index) => {
      const li = document.createElement("li"); li.className = `item-row ${state.selected?.id === item.id ? "active" : ""}`;
      const button = document.createElement("button"); button.type = "button";
      button.textContent = type === "place" ? (item.name || `Destination ${index + 1}`) : item.name;
      button.addEventListener("click", () => { state.selected = { type, id: item.id }; render(); });
      li.append(button);
      if (type === "place") { const status = document.createElement("small"); status.textContent = item.status || "open"; li.append(status); }
      list.append(li);
    });
  }

  function coordinates(event) {
    const bounds = canvas.getBoundingClientRect();
    return { x: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)), y: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)) };
  }
  function addPlace(point = { x: .5, y: .5 }) {
    const place = { id: makeId("place"), name: "", category: "facility", description: "", status: "open", ...point };
    state.places.push(place); state.selected = { type: "place", id: place.id }; setDirty(); render(); root.querySelector('[data-field="name"]').focus();
  }
  function addNode(point = { x: .5, y: .5 }) {
    const node = { id: makeId("node"), name: `Point ${state.nodes.length + 1}`, ...point };
    state.nodes.push(node); state.selected = { type: "node", id: node.id }; setDirty(); render();
  }

  async function loadVenue(id) {
    controls.saveState.textContent = "Loading…"; controls.errors.textContent = "";
    try {
      const response = await fetch(`/api/venues/${encodeURIComponent(id)}/`, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`Could not load venue (${response.status}).`);
      state.venue = await response.json();
      const draft = state.venue.calibration?.organizer_draft || {};
      state.imageData = draft.image_data || "";
      state.places = Array.isArray(draft.places) ? draft.places : [];
      state.nodes = Array.isArray(draft.nodes) ? draft.nodes : [];
      state.edges = Array.isArray(draft.edges) ? draft.edges : [];
      state.selected = null; state.dirty = false; controls.saveState.textContent = "Saved"; render();
    } catch (error) { controls.errors.textContent = error.message; controls.saveState.textContent = "Load failed"; }
  }

  function validate() {
    const errors = [];
    const names = new Set();
    state.places.forEach((place, index) => {
      const name = place.name.trim();
      if (!name) errors.push(`Destination ${index + 1} needs a name.`);
      else if (names.has(name.toLocaleLowerCase())) errors.push(`“${name}” is used by more than one destination.`);
      names.add(name.toLocaleLowerCase());
      if (!place.category.trim()) errors.push(`${name || `Destination ${index + 1}`} needs a category.`);
    });
    const nodeIds = new Set(state.nodes.map((node) => node.id));
    state.edges.forEach((edge, index) => {
      if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) errors.push(`Connection ${index + 1} refers to a missing path point.`);
      if (edge.from === edge.to) errors.push(`Connection ${index + 1} needs two different path points.`);
    });
    return errors;
  }

  async function save() {
    const errors = validate();
    controls.errors.textContent = errors.join(" ");
    if (errors.length) { controls.saveState.textContent = "Fix validation issues"; return; }
    controls.saveState.textContent = "Saving…";
    try {
      const calibration = { ...(state.venue.calibration || {}), organizer_draft: {
        format: 1, places: state.places, nodes: state.nodes, edges: state.edges, image_data: state.imageData,
      } };
      const response = await fetch(`/api/venues/${encodeURIComponent(state.venue.id)}/`, {
        method: "PATCH", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ calibration }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || JSON.stringify(data) || `Save failed (${response.status}).`);
      state.venue = data; state.dirty = false; controls.saveState.textContent = "Saved";
      controls.errors.textContent = "Draft saved to this venue.";
    } catch (error) { controls.saveState.textContent = "Save failed"; controls.errors.textContent = error.message; }
  }

  venuePicker.addEventListener("change", () => {
    if (state.dirty && !window.confirm("Discard unsaved organizer changes?")) { venuePicker.value = state.venue.id; return; }
    loadVenue(venuePicker.value);
  });
  $("[data-image]").addEventListener("change", (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (!/^image\/(png|jpeg)$/.test(file.type)) { controls.errors.textContent = "Choose a PNG or JPG image."; return; }
    const reader = new FileReader();
    reader.onload = () => { state.imageData = String(reader.result); setDirty(); render(); };
    reader.onerror = () => { controls.errors.textContent = "The selected image could not be read."; };
    reader.readAsDataURL(file);
  });
  $("[data-add-place]").addEventListener("click", () => addPlace());
  $("[data-add-node]").addEventListener("click", () => addNode());
  $("[data-connect]").addEventListener("click", () => {
    if (state.selected?.type === "node") {
      const first = state.nodes.find((node) => node.id === state.selected.id);
      if (!state.connectFrom) { state.connectFrom = first.id; controls.errors.textContent = "Choose another path point to complete the connection."; return; }
      if (state.connectFrom !== first.id) { state.edges.push({ id: makeId("edge"), from: state.connectFrom, to: first.id }); state.connectFrom = null; setDirty(); controls.errors.textContent = ""; render(); return; }
    }
    controls.errors.textContent = "Select a path point, click Connect, select a second point, then click Connect again.";
  });
  $("[data-save]").addEventListener("click", save);
  $("[data-delete-place]").addEventListener("click", () => {
    state.places = state.places.filter((place) => place.id !== state.selected?.id); state.selected = null; setDirty(); render();
  });
  root.querySelectorAll("[data-field]").forEach((field) => field.addEventListener("input", () => {
    const place = selectedItem(); if (!place || state.selected.type !== "place") return;
    place[field.dataset.field] = field.value; setDirty(); renderListsOnly();
  }));
  function renderListsOnly() { renderList(controls.placeList, state.places, "place"); }

  canvas.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".map-marker")) return;
    if (state.selected) { const item = selectedItem(); if (item) { Object.assign(item, coordinates(event)); setDirty(); render(); return; } }
    if (state.placeMode) addPlace(coordinates(event));
    else if (state.nodeMode) addNode(coordinates(event));
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!state.drag) return;
    const item = state.places.find((p) => p.id === state.drag) || state.nodes.find((n) => n.id === state.drag);
    if (item) { Object.assign(item, coordinates(event)); setDirty(); render(); }
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((name) => canvas.addEventListener(name, () => { state.drag = null; }));
  $("[data-add-place]").addEventListener("contextmenu", (event) => { event.preventDefault(); state.placeMode = true; });
  $("[data-add-node]").addEventListener("contextmenu", (event) => { event.preventDefault(); state.nodeMode = true; });
  loadVenue(venuePicker.value);
})();

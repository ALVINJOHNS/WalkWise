(() => {
  const root = document.querySelector("[data-organizer]");
  if (!root) return;

  const $ = (selector) => root.querySelector(selector);
  const canvas = $("[data-canvas]");
  const venuePicker = $ ("[data-venue]");
  if (!canvas || !venuePicker) return;

  const state = { venue: null, imageData: "", places: [], nodes: [], edges: [], geoOutline: [], currentLocation: null, geoWatchId: null, selected: null, dirty: false, drag: null };
  const controls = {
    backdrop: $("[data-backdrop]"), markers: $("[data-markers]"), lines: $("[data-lines]"), empty: $("[data-empty]"),
    placeList: $("[data-place-list]"), nodeList: $("[data-node-list]"), edgeList: $("[data-edge-list]"),
    fields: $("[data-place-fields]"), errors: $("[data-errors]"), saveState: $("[data-save-state]"),
    gpsStatus: $("[data-gps-status]"), startOutline: $("[data-start-outline]"), stopOutline: $("[data-stop-outline]"),
    placeLocation: $("[data-place-location]"), setPlaceLocation: $("[data-set-place-location]"),
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
    controls.empty.hidden = Boolean(controls.backdrop.src) || state.geoOutline.length > 0 || Boolean(state.currentLocation);
    controls.markers.replaceChildren();
    controls.lines.replaceChildren();
    controls.lines.setAttribute("viewBox", "0 0 1000 1000");
    controls.lines.setAttribute("preserveAspectRatio", "none");
    const gpsPoints = state.geoOutline.length ? state.geoOutline : (state.currentLocation ? [state.currentLocation] : []);
    if (gpsPoints.length) {
      const lats = gpsPoints.map((point) => point.latitude);
      const lngs = gpsPoints.map((point) => point.longitude);
      const minLat = Math.min(...lats), maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
      const latRange = maxLat - minLat;
      const lngRange = maxLng - minLng;
      const project = (point) => ({
        x: lngRange ? ((point.longitude - minLng) / lngRange) * 940 + 30 : 500,
        y: latRange ? ((maxLat - point.latitude) / latRange) * 940 + 30 : 500,
      });
      const projectedPoints = state.geoOutline.map(project);
      const points = projectedPoints.map((point) => `${point.x},${point.y}`).join(" ");
      if (projectedPoints.length) {
        const outline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        outline.setAttribute("points", state.geoRecording || state.geoOutline.length < 3 ? points : `${points} ${points.split(" ")[0]}`);
        outline.setAttribute("class", "geo-outline");
        controls.lines.append(outline);
      }
      projectedPoints.forEach(({ x, y }) => {
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("cx", x); dot.setAttribute("cy", y); dot.setAttribute("r", "4"); dot.setAttribute("class", "geo-point");
        controls.lines.append(dot);
      });
      if (state.currentLocation) {
        const { x, y } = project(state.currentLocation);
        const metersPerDegree = 111320;
        const maxSpanMeters = Math.max(latRange * metersPerDegree, lngRange * metersPerDegree * Math.cos((minLat + maxLat) * Math.PI / 360), 1);
        const accuracyRadius = Math.max(8, Math.min(90, (state.currentLocation.accuracy || 0) * 940 / maxSpanMeters));
        const accuracy = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        accuracy.setAttribute("cx", x); accuracy.setAttribute("cy", y); accuracy.setAttribute("r", accuracyRadius); accuracy.setAttribute("class", "gps-accuracy");
        controls.lines.append(accuracy);
        const pointer = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        pointer.setAttribute("cx", x); pointer.setAttribute("cy", y); pointer.setAttribute("r", "8"); pointer.setAttribute("class", "gps-live-pointer");
        pointer.setAttribute("aria-label", `Current GPS position, ${state.currentLocation.latitude.toFixed(6)}, ${state.currentLocation.longitude.toFixed(6)}`);
        controls.lines.append(pointer);
      }
    }
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
    controls.setPlaceLocation.hidden = !place;
    controls.placeLocation.hidden = !place;
    if (place) {
      root.querySelectorAll("[data-field]").forEach((field) => { if (field.value !== esc(place[field.dataset.field])) field.value = esc(place[field.dataset.field]); });
      controls.placeLocation.textContent = place.geolocation ? `GPS: ${place.geolocation.latitude.toFixed(6)}, ${place.geolocation.longitude.toFixed(6)} · ±${Math.round(place.geolocation.accuracy)} m` : "No GPS location saved for this destination.";
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

  function locationFix(position) {
    const coords = position.coords;
    return {
      latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy,
      altitude: coords.altitude, altitude_accuracy: coords.altitudeAccuracy,
      heading: coords.heading, speed: coords.speed, timestamp: new Date(position.timestamp).toISOString(),
    };
  }

  function locationError(error, tracking = false) {
    const messages = {
      1: "Location permission was denied. Allow location access in your browser settings, then try again.",
      2: "Your device could not determine a location. Check that location services are enabled.",
      3: "Location lookup timed out. Try again in an open area.",
    };
    const message = messages[error.code] || "Could not access your location.";
    controls.gpsStatus.textContent = message;
    if (tracking && state.geoWatchId !== null) stopOutlineRecording(message);
  }

  function requestLocation(onSuccess) {
    if (!window.isSecureContext || !navigator.geolocation) {
      controls.gpsStatus.textContent = "GPS needs browser location support and a secure page (HTTPS or localhost).";
      return;
    }
    controls.gpsStatus.textContent = "Requesting location permission and GPS fix…";
    navigator.geolocation.getCurrentPosition((position) => {
      const fix = locationFix(position); state.currentLocation = fix; onSuccess(fix);
    }, locationError, { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
  }

  function stopOutlineRecording(message = "") {
    if (state.geoWatchId !== null) navigator.geolocation.clearWatch(state.geoWatchId);
    state.geoWatchId = null; state.geoRecording = false; state.geoWatchToken = (state.geoWatchToken || 0) + 1;
    controls.startOutline.disabled = false; controls.stopOutline.hidden = true;
    controls.gpsStatus.textContent = message || `Outline recording stopped · ${state.geoOutline.length} GPS samples saved in this draft.`;
    if (state.geoOutline.length) setDirty();
    render();
  }

  function startOutlineRecording() {
    if (!window.isSecureContext || !navigator.geolocation) {
      controls.gpsStatus.textContent = "GPS needs browser location support and a secure page (HTTPS or localhost).";
      return;
    }
    controls.gpsStatus.textContent = "Waiting for GPS permission and first fix…";
    state.geoRecording = true; controls.startOutline.disabled = true; controls.stopOutline.hidden = false;
    const watchToken = (state.geoWatchToken || 0) + 1;
    state.geoWatchToken = watchToken;
    state.geoWatchId = navigator.geolocation.watchPosition((position) => {
      if (!state.geoRecording || state.geoWatchToken !== watchToken) return;
      const fix = locationFix(position);
      state.geoOutline.push(fix);
      state.currentLocation = fix; controls.gpsStatus.textContent = `Recording venue outline · ${state.geoOutline.length} GPS samples · current fix ±${Math.round(fix.accuracy)} m`;
      setDirty(); render();
    }, (error) => {
      if (state.geoWatchToken === watchToken) locationError(error, true);
    }, { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
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
      state.geoOutline = Array.isArray(draft.geo_outline) ? draft.geo_outline : [];
      state.currentLocation = state.geoOutline.at(-1) || null;
      controls.gpsStatus.textContent = state.geoOutline.length ? `Saved outline loaded · ${state.geoOutline.length} GPS samples.` : "GPS is off. Choose a GPS action to request location access.";
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
        geo_outline: state.geoOutline,
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
    if (state.geoWatchId !== null) navigator.geolocation.clearWatch(state.geoWatchId);
    state.geoWatchId = null; state.geoRecording = false;
    controls.startOutline.disabled = false; controls.stopOutline.hidden = true;
    loadVenue(venuePicker.value);
  });
  $("[data-current-location]").addEventListener("click", () => requestLocation((fix) => {
    controls.gpsStatus.textContent = `Current location: ${fix.latitude.toFixed(6)}, ${fix.longitude.toFixed(6)} · ±${Math.round(fix.accuracy)} m`;
    render();
  }));
  controls.setPlaceLocation.addEventListener("click", () => requestLocation((fix) => {
    const place = selectedItem();
    if (!place || state.selected.type !== "place") return;
    place.geolocation = fix; setDirty(); render();
    controls.gpsStatus.textContent = `Saved GPS fix for ${place.name || "this destination"}: ${fix.latitude.toFixed(6)}, ${fix.longitude.toFixed(6)} · ±${Math.round(fix.accuracy)} m`;
  }));
  controls.startOutline.addEventListener("click", startOutlineRecording);
  controls.stopOutline.addEventListener("click", () => stopOutlineRecording());
  $("[data-clear-outline]").addEventListener("click", () => {
    if (state.geoWatchId !== null) navigator.geolocation.clearWatch(state.geoWatchId);
    state.geoWatchId = null; state.geoRecording = false; state.geoOutline = [];
    controls.startOutline.disabled = false; controls.stopOutline.hidden = true;
    controls.gpsStatus.textContent = "Recorded outline cleared."; setDirty(); render();
  });
  function loadImageFile(file) {
    if (!file) return;
    if (!/^image\/(png|jpeg)$/.test(file.type)) { controls.errors.textContent = "Choose a PNG or JPG image."; return; }
    const reader = new FileReader();
    reader.onload = () => { state.imageData = String(reader.result); controls.errors.textContent = ""; setDirty(); render(); };
    reader.onerror = () => { controls.errors.textContent = "The selected image could not be read."; };
    reader.readAsDataURL(file);
  }
  $("[data-image]").addEventListener("change", (event) => loadImageFile(event.target.files?.[0]));
  ["dragenter", "dragover"].forEach((name) => canvas.addEventListener(name, (event) => {
    event.preventDefault(); canvas.classList.add("is-dragover");
  }));
  ["dragleave", "drop"].forEach((name) => canvas.addEventListener(name, (event) => {
    event.preventDefault(); canvas.classList.remove("is-dragover");
  }));
  canvas.addEventListener("drop", (event) => {
    const file = [...(event.dataTransfer?.files || [])].find((item) => /^image\/(png|jpeg)$/.test(item.type));
    if (!file) { controls.errors.textContent = "Drop a PNG or JPG floor plan."; return; }
    loadImageFile(file);
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
  window.addEventListener("beforeunload", () => { if (state.geoWatchId !== null) navigator.geolocation.clearWatch(state.geoWatchId); });
  loadVenue(venuePicker.value);
})();

(() => {
  const root = document.querySelector("[data-organizer]");
  if (!root) return;

  const $ = (selector) => root.querySelector(selector);
  const canvas = $("[data-canvas]");
  const venuePicker = $ ("[data-venue]");
  if (!canvas || !venuePicker) return;

  const state = { venue: null, imageData: "", places: [], nodes: [], edges: [], geoOutline: [], currentLocation: null, geoWatchId: null, mapMode: "floorplan", leafletMap: null, leafletLayers: null, mapPlacement: false, mapAddType: null, selected: null, dirty: false, drag: null };
  const controls = {
    backdrop: $("[data-backdrop]"), markers: $("[data-markers]"), lines: $("[data-lines]"), empty: $("[data-empty]"),
    placeList: $("[data-place-list]"), nodeList: $("[data-node-list]"), edgeList: $("[data-edge-list]"),
    fields: $("[data-place-fields]"), errors: $("[data-errors]"), saveState: $("[data-save-state]"),
    gpsStatus: $("[data-gps-status]"), startOutline: $("[data-start-outline]"), stopOutline: $("[data-stop-outline]"),
    placeLocation: $("[data-place-location]"), setPlaceLocation: $("[data-set-place-location]"), placeOnMap: $("[data-place-on-map]"),
    leafletMap: $("[data-leaflet-map]"), mapStatus: $("[data-map-status]"), gpsDistance: $("[data-gps-distance]"),
    mapViewTools: $("[data-map-view-tools]"), floorplanView: $("[data-map-view='floorplan']"), nodeFields: $("[data-node-fields]"),
    nodeLocation: $("[data-node-location]"), setNodeLocation: $("[data-set-node-location]"), nodeOnMap: $("[data-node-on-map]"),
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
    const planImage = state.imageData || state.venue?.plan_image_url || "";
    controls.backdrop.src = planImage;
    controls.backdrop.hidden = !planImage || state.mapMode === "street";
    if (controls.backdrop.src) {
      controls.backdrop.onload = () => {
        canvas.style.aspectRatio = `${controls.backdrop.naturalWidth} / ${controls.backdrop.naturalHeight}`;
        canvas.style.minHeight = "0";
      };
    } else {
      canvas.style.aspectRatio = "1.45";
      canvas.style.minHeight = "420px";
    }
    controls.empty.hidden = state.mapMode === "street" || Boolean(planImage) || state.geoOutline.length > 0 || Boolean(state.currentLocation);
    canvas.dataset.mapMode = state.mapMode;
    controls.mapViewTools.hidden = !state.currentLocation && !state.geoOutline.length;
    controls.floorplanView.hidden = !planImage;
    controls.leafletMap.hidden = state.mapMode !== "street";
    controls.markers.hidden = state.mapMode === "street";
    controls.lines.hidden = state.mapMode === "street";
    controls.gpsDistance.textContent = `Recorded path distance: ${formatDistance(totalTrackDistance(state.geoOutline))}`;
    controls.markers.replaceChildren();
    controls.lines.replaceChildren();
    controls.lines.setAttribute("viewBox", "0 0 1000 1000");
    controls.lines.setAttribute("preserveAspectRatio", "none");
    if (!window.L && state.geoOutline.length) {
      const gpsPoints = state.geoOutline;
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
      const distance = a?.geolocation && b?.geolocation ? ` · ${formatDistance(distanceMeters(a.geolocation, b.geolocation))}` : "";
      li.textContent = `${a?.name || edge.from} ↔ ${b?.name || edge.to}${distance}`;
      controls.edgeList.append(li);
    });
    const place = state.selected?.type === "place" ? selectedItem() : null;
    const node = state.selected?.type === "node" ? selectedItem() : null;
    controls.fields.hidden = !place;
    controls.setPlaceLocation.hidden = !place;
    controls.placeLocation.hidden = !place;
    controls.placeOnMap.hidden = !place || state.mapMode !== "street";
    controls.nodeFields.hidden = !node;
    controls.nodeOnMap.hidden = !node || state.mapMode !== "street";
    if (place) {
      root.querySelectorAll("[data-field]").forEach((field) => { if (field.value !== esc(place[field.dataset.field])) field.value = esc(place[field.dataset.field]); });
      controls.placeLocation.textContent = place.geolocation ? `GPS: ${place.geolocation.latitude.toFixed(6)}, ${place.geolocation.longitude.toFixed(6)} · ±${Math.round(place.geolocation.accuracy || 0)} m` : "No GPS location saved. Place it on the street map to make it visible there.";
    }
    if (node) controls.nodeLocation.textContent = node.geolocation ? `GPS: ${node.geolocation.latitude.toFixed(6)}, ${node.geolocation.longitude.toFixed(6)} · ±${Math.round(node.geolocation.accuracy || 0)} m` : "No GPS coordinate saved. Place it on the street map to make it visible there.";
    if (state.mapPlacement) {
      controls.mapStatus.textContent = "Click the street map to place the selected item.";
      if (state.leafletMap) state.leafletMap.getContainer().style.cursor = "crosshair";
    }
    renderLeafletLayers();
  }

  function ensureLeafletMap(center) {
    if (state.leafletMap) return true;
    if (!window.L) {
      controls.mapStatus.textContent = "Leaflet did not load. Check the internet connection and reload to use the street map.";
      return false;
    }
    state.leafletMap = window.L.map(controls.leafletMap, { zoomControl: true, scrollWheelZoom: true });
    state.leafletMap.on("click", (event) => {
      if (state.mapAddType) {
        const type = state.mapAddType;
        state.mapAddType = null;
        state.mapPlacement = false;
        state.leafletMap.getContainer().style.cursor = "";
        const geolocation = { latitude: event.latlng.lat, longitude: event.latlng.lng, accuracy: 0, timestamp: new Date().toISOString() };
        if (type === "place") addPlace({ x: .5, y: .5, geolocation });
        else addNode({ x: .5, y: .5, geolocation });
        controls.mapStatus.textContent = `Added ${type === "place" ? "destination" : "path point"} at the selected map location.`;
        return;
      }
      if (!state.mapPlacement) return;
      const item = selectedItem();
      if (!item || !state.selected) return;
      item.geolocation = {
        latitude: event.latlng.lat, longitude: event.latlng.lng, accuracy: 0,
        timestamp: new Date().toISOString(),
      };
      state.mapPlacement = false;
      state.leafletMap.getContainer().style.cursor = "";
      setDirty(); render();
      controls.mapStatus.textContent = `Placed ${state.selected.type} on the street map.`;
    });
    const tiles = window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      referrerPolicy: "strict-origin-when-cross-origin",
    }).addTo(state.leafletMap);
    tiles.on("tileerror", () => { controls.mapStatus.textContent = "Some street-map tiles could not load. Check your internet connection; GPS recording can continue."; });
    state.leafletLayers = window.L.layerGroup().addTo(state.leafletMap);
    window.L.control.scale({ metric: true, imperial: false }).addTo(state.leafletMap);
    state.leafletMap.setView([center.latitude, center.longitude], 19);
    controls.mapStatus.textContent = "OpenStreetMap · drag to pan, scroll or pinch to zoom.";
    window.setTimeout(() => state.leafletMap?.invalidateSize(), 0);
    return true;
  }

  function renderLeafletLayers() {
    const center = state.currentLocation || state.geoOutline.at(-1) || state.places.find((place) => place.geolocation)?.geolocation || state.nodes.find((node) => node.geolocation)?.geolocation;
    if (!center) return;
    if (!ensureLeafletMap(center)) return;
    state.leafletLayers.clearLayers();
    if (state.geoOutline.length > 1) {
      window.L.polyline(state.geoOutline.map((point) => [point.latitude, point.longitude]), {
        color: "#087f79", weight: 5, opacity: .9,
      }).addTo(state.leafletLayers);
    }
    state.places.forEach((place) => {
      if (!place.geolocation) return;
      const marker = window.L.circleMarker([place.geolocation.latitude, place.geolocation.longitude], {
        radius: state.selected?.type === "place" && state.selected.id === place.id ? 11 : 8,
        color: state.selected?.type === "place" && state.selected.id === place.id ? "#f59e0b" : "#ffffff",
        weight: 3, fillColor: "#0f8b83", fillOpacity: 1,
      }).addTo(state.leafletLayers);
      const label = document.createElement("span"); label.textContent = place.name || "Destination";
      marker.bindTooltip(label);
      marker.on("click", (event) => {
        if (state.mapAddType) return;
        window.L.DomEvent.stopPropagation(event);
        state.selected = { type: "place", id: place.id }; state.mapPlacement = false; render();
      });
    });
    state.nodes.forEach((node) => {
      if (!node.geolocation) return;
      const marker = window.L.circleMarker([node.geolocation.latitude, node.geolocation.longitude], {
        radius: state.selected?.type === "node" && state.selected.id === node.id ? 9 : 6,
        color: state.selected?.type === "node" && state.selected.id === node.id ? "#f59e0b" : "#ffffff",
        weight: 3, fillColor: "#6d45c7", fillOpacity: 1,
      }).addTo(state.leafletLayers);
      marker.bindTooltip(node.name || "Path point");
      marker.on("click", (event) => {
        if (state.mapAddType) return;
        window.L.DomEvent.stopPropagation(event);
        state.selected = { type: "node", id: node.id }; state.mapPlacement = false; render();
      });
    });
    state.edges.forEach((edge) => {
      const from = state.nodes.find((node) => node.id === edge.from);
      const to = state.nodes.find((node) => node.id === edge.to);
      if (!from?.geolocation || !to?.geolocation) return;
      window.L.polyline([[from.geolocation.latitude, from.geolocation.longitude], [to.geolocation.latitude, to.geolocation.longitude]], {
        color: "#6d45c7", weight: 4, dashArray: "7 6",
      }).addTo(state.leafletLayers);
    });
    if (state.currentLocation) {
      const accuracy = Number(state.currentLocation.accuracy) || 0;
      window.L.circle([state.currentLocation.latitude, state.currentLocation.longitude], {
        radius: accuracy, color: "#2563eb", weight: 1, fillColor: "#2563eb", fillOpacity: .1,
      }).addTo(state.leafletLayers);
      const pointer = window.L.marker([state.currentLocation.latitude, state.currentLocation.longitude], {
        icon: window.L.divIcon({ className: "gps-location-icon", html: '<span class="gps-location-dot" aria-hidden="true"></span>', iconSize: [30, 30], iconAnchor: [15, 15] }),
        keyboard: false,
      }).addTo(state.leafletLayers);
      pointer.bindTooltip("Live GPS location", { permanent: true, direction: "top", offset: [0, -12], className: "gps-location-label" });
      pointer.on("click", (event) => window.L.DomEvent.stopPropagation(event));
      if (state.geoRecording) state.leafletMap.panInside(pointer.getLatLng(), { padding: [60, 60] });
    }
    if (state.mapMode === "street") window.setTimeout(() => state.leafletMap?.invalidateSize(), 0);
  }

  function distanceMeters(a, b) {
    const radians = (degrees) => degrees * Math.PI / 180;
    const dLat = radians(b.latitude - a.latitude), dLng = radians(b.longitude - a.longitude);
    const value = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(dLng / 2) ** 2;
    return 6371000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
  }

  function totalTrackDistance(points) {
    return points.slice(1).reduce((sum, point, index) => sum + distanceMeters(points[index], point), 0);
  }

  function formatDistance(meters) {
    return meters >= 1000 ? `${(meters / 1000).toFixed(2)} km` : `${meters.toFixed(1)} m`;
  }

  function renderList(list, items, type) {
    list.replaceChildren();
    items.forEach((item, index) => {
      const li = document.createElement("li"); li.className = `item-row ${state.selected?.id === item.id ? "active" : ""}`;
      const button = document.createElement("button"); button.type = "button";
      button.textContent = type === "place" ? (item.name || `Destination ${index + 1}`) : item.name;
      button.addEventListener("click", () => {
        state.selected = { type, id: item.id }; state.mapPlacement = false; state.mapAddType = null;
        if (state.leafletMap) state.leafletMap.getContainer().style.cursor = "";
        render();
      });
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
    const place = { id: makeId("place"), name: "", category: "facility", description: "", status: "open", ...(state.mapMode === "street" && state.currentLocation ? { geolocation: state.currentLocation } : {}), ...point };
    state.places.push(place); state.selected = { type: "place", id: place.id }; setDirty(); render(); root.querySelector('[data-field="name"]').focus();
  }
  function addNode(point = { x: .5, y: .5 }) {
    const node = { id: makeId("node"), name: `Point ${state.nodes.length + 1}`, ...(state.mapMode === "street" && state.currentLocation ? { geolocation: state.currentLocation } : {}), ...point };
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
      state.currentLocation = fix; state.mapMode = "street"; controls.gpsStatus.textContent = `Recording venue outline · ${state.geoOutline.length} GPS samples · current fix ±${Math.round(fix.accuracy)} m`;
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
      state.currentLocation = state.geoOutline.at(-1) || state.places.find((place) => place.geolocation)?.geolocation || state.nodes.find((node) => node.geolocation)?.geolocation || null;
      state.mapMode = draft.map_mode || (state.currentLocation ? "street" : "floorplan");
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
        geo_outline: state.geoOutline, map_mode: state.mapMode,
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
    state.mapMode = "street";
    controls.gpsStatus.textContent = `Current location: ${fix.latitude.toFixed(6)}, ${fix.longitude.toFixed(6)} · ±${Math.round(fix.accuracy)} m`;
    render();
    window.setTimeout(() => { state.leafletMap?.invalidateSize(); state.leafletMap?.panTo([fix.latitude, fix.longitude]); }, 0);
  }));
  controls.setPlaceLocation.addEventListener("click", () => requestLocation((fix) => {
    const place = selectedItem();
    if (!place || state.selected.type !== "place") return;
    place.geolocation = fix; state.mapMode = "street"; setDirty(); render();
    controls.gpsStatus.textContent = `Saved GPS fix for ${place.name || "this destination"}: ${fix.latitude.toFixed(6)}, ${fix.longitude.toFixed(6)} · ±${Math.round(fix.accuracy)} m`;
  }));
  controls.setNodeLocation.addEventListener("click", () => requestLocation((fix) => {
    const node = selectedItem();
    if (!node || state.selected.type !== "node") return;
    node.geolocation = fix; state.mapMode = "street"; setDirty(); render();
  }));
  controls.placeOnMap.addEventListener("click", () => {
    state.mapAddType = null;
    state.mapPlacement = true; controls.mapStatus.textContent = "Click the street map to place the selected destination.";
    state.leafletMap?.getContainer().style.setProperty("cursor", "crosshair");
  });
  controls.nodeOnMap.addEventListener("click", () => {
    state.mapAddType = null;
    state.mapPlacement = true; controls.mapStatus.textContent = "Click the street map to place the selected path point.";
    state.leafletMap?.getContainer().style.setProperty("cursor", "crosshair");
  });
  root.querySelectorAll("[data-map-view]").forEach((button) => button.addEventListener("click", () => {
    state.mapMode = button.dataset.mapView;
    state.mapPlacement = false;
    state.mapAddType = null;
    if (state.leafletMap) state.leafletMap.getContainer().style.cursor = "";
    render();
    window.setTimeout(() => state.leafletMap?.invalidateSize(), 0);
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
    reader.onload = () => { state.mapMode = "floorplan"; state.imageData = String(reader.result); controls.errors.textContent = ""; setDirty(); render(); };
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
  function beginMapAddition(type) {
    if (state.mapMode !== "street" || !state.leafletMap) {
      if (type === "place") addPlace(); else addNode();
      return;
    }
    state.mapPlacement = false;
    state.mapAddType = type;
    state.leafletMap.getContainer().style.cursor = "crosshair";
    controls.mapStatus.textContent = `Click the street map to add a ${type === "place" ? "destination" : "path point"}.`;
  }
  $("[data-add-place]").addEventListener("click", () => beginMapAddition("place"));
  $("[data-add-node]").addEventListener("click", () => beginMapAddition("node"));
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
    if (state.mapMode === "street" && state.leafletMap) return;
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

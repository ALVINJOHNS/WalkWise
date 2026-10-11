(() => {
  const page = document.querySelector("[data-visitor-app]");
  if (!page) return;

  const mapElement = page.querySelector("[data-visitor-map]");
  const mapMessage = page.querySelector("[data-map-message]");
  const locationMessage = page.querySelector("[data-location-message]");
  const locateButton = page.querySelector("[data-locate-me]");
  const stopLocatingButton = page.querySelector("[data-stop-locating]");
  const recenterButton = page.querySelector("[data-recenter]");
  const manualStartButton = page.querySelector("[data-manual-start]");
  const mapModeButton = page.querySelector("[data-map-mode]");
  const routeButton = page.querySelector("[data-route-destination]");
  const routeCard = page.querySelector("[data-route-card]");
  const routeTitle = page.querySelector("[data-route-title]");
  const routeNext = page.querySelector("[data-route-next]");
  const routeDistance = page.querySelector("[data-route-distance]");
  const search = page.querySelector("[data-place-search]");
  const items = [...page.querySelectorAll("[data-place-item]")];
  const noResults = page.querySelector("[data-no-results]");
  const noMappedDestinations = page.querySelector("[data-no-mapped-destinations]");
  const dataElement = document.getElementById("visitor-map-data");
  let data;
  try { data = JSON.parse(dataElement?.textContent || "{}"); }
  catch { data = {}; }

  const nodes = Array.isArray(data.nodes) ? data.nodes : [];
  const edges = Array.isArray(data.edges) ? data.edges : [];
  const places = Array.isArray(data.places) ? data.places : [];
  const placesById = new Map(places.map((place) => [place.id, place]));
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  let map = null;
  let mapMode = null;
  let currentLocation = null;
  let locationWatchId = null;
  let selectedPlaceId = null;
  let manualStartNodeId = null;
  let manualStartMode = false;
  let activeRoute = null;
  let baseLayer = null;
  let contentLayer = null;
  let routeLayer = null;
  let userMarker = null;
  let userAccuracy = null;

  const geoNodes = nodes.filter((node) => validPoint(node.location));
  const geoPlaces = places.filter((place) => validPoint(place.location) || validPoint(nodesById.get(place.access_node_id)?.location));
  const hasStreetData = geoNodes.length > 0 || geoPlaces.length > 0;
  const hasPlan = typeof data.plan_image === "string" && data.plan_image.startsWith("data:image/")
    || typeof data.plan_image === "string" && /^https?:\/\//i.test(data.plan_image);

  function validPoint(point) {
    return point && Number.isFinite(Number(point.latitude)) && Number.isFinite(Number(point.longitude))
      && Math.abs(Number(point.latitude)) <= 90 && Math.abs(Number(point.longitude)) <= 180;
  }

  function showMessage(message) {
    mapMessage.textContent = message;
    mapMessage.hidden = false;
  }

  function hideMessage() { mapMessage.hidden = true; }

  function planLatLng(item) {
    return [(1 - Number(item.y)) * 1000, Number(item.x) * 1000];
  }

  function itemLatLng(item, mode = mapMode) {
    if (mode === "street") {
      const point = validPoint(item.location) ? item.location : placesById.has(item.id) ? nodesById.get(item.access_node_id)?.location : null;
      return validPoint(point) ? [Number(point.latitude), Number(point.longitude)] : null;
    }
    if (mode === "plan" && Number.isFinite(Number(item.x)) && Number.isFinite(Number(item.y))) return planLatLng(item);
    return null;
  }

  function hasPathNodesOnMap() {
    return nodes.some((node) => itemLatLng(node));
  }

  function distanceMeters(a, b) {
    const rad = (degrees) => degrees * Math.PI / 180;
    const dLat = rad(b.latitude - a.latitude);
    const dLng = rad(b.longitude - a.longitude);
    const value = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
    return 6371000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
  }

  function edgeLength(edge, mode = mapMode) {
    const length = Number(edge.length_m);
    if (Number.isFinite(length) && length >= 0 && edge.length_m !== null && edge.length_m !== "") return length;
    const from = nodesById.get(edge.from_node);
    const to = nodesById.get(edge.to_node);
    if (mode === "street" && validPoint(from?.location) && validPoint(to?.location)) return distanceMeters(from.location, to.location);
    return 1;
  }

  function initializeMap(mode, center) {
    if (!window.L) {
      showMessage("The map library did not load. Check your internet connection and reload.");
      return false;
    }
    if (map) {
      map.remove();
      map = null;
    }
    mapMode = mode;
    baseLayer = null;
    contentLayer = null;
    routeLayer = null;
    userMarker = null;
    userAccuracy = null;
    mapElement.replaceChildren();

    const options = mode === "plan" ? { crs: L.CRS.Simple, minZoom: -3, maxZoom: 3, zoomControl: true } : { zoomControl: true, maxZoom: 19 };
    map = L.map(mapElement, options);
    contentLayer = L.layerGroup().addTo(map);
    routeLayer = L.layerGroup().addTo(map);

    if (mode === "street") {
      baseLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        referrerPolicy: "strict-origin-when-cross-origin",
      }).addTo(map);
      baseLayer.on("tileerror", () => locationMessage.textContent = "Street-map tiles could not load. Check your internet connection; saved place data is still available.");
      const points = [...geoNodes, ...geoPlaces].map((item) => itemLatLng(item, "street"));
      if (center) map.setView([center.latitude, center.longitude], 17);
      else if (points.length) map.fitBounds(L.latLngBounds(points).pad(.18), { maxZoom: 18 });
      else map.setView([0, 0], 2);
      mapModeButton.hidden = !hasPlan;
      mapModeButton.textContent = "Show venue plan";
    } else {
      baseLayer = L.imageOverlay(data.plan_image, [[0, 0], [1000, 1000]]).addTo(map);
      map.fitBounds([[0, 0], [1000, 1000]]);
      mapModeButton.hidden = !hasStreetData && !currentLocation;
      mapModeButton.textContent = "Show street map";
    }
    applySearch();

    map.on("click", (event) => {
      if (!manualStartMode || mapMode !== "plan") return;
      const nearest = nearestNodeInPlan(event.latlng);
      if (nearest && map.distance(event.latlng, itemLatLng(nearest, "plan")) <= 35) setManualStart(nearest.id);
    });
    drawMapData();
    hideMessage();
    return true;
  }

  function nearestNodeInPlan(latlng) {
    let nearest = null;
    let best = Infinity;
    nodes.forEach((node) => {
      const point = itemLatLng(node, "plan");
      if (!point) return;
      const distance = map.distance(latlng, point);
      if (distance < best) { best = distance; nearest = node; }
    });
    return nearest;
  }

  function drawMapData() {
    if (!map || !contentLayer) return;
    contentLayer.clearLayers();
    const visibleNodes = mapMode === "street" ? geoNodes : nodes;
    const visiblePlaces = mapMode === "street" ? geoPlaces : places;

    edges.forEach((edge) => {
      const from = nodesById.get(edge.from_node);
      const to = nodesById.get(edge.to_node);
      const a = from && itemLatLng(from);
      const b = to && itemLatLng(to);
      if (!a || !b) return;
      L.polyline([a, b], {
        color: edge.closed ? "#64748b" : "#6547a8",
        weight: edge.closed ? 3 : 5,
        opacity: edge.closed ? .7 : .9,
        dashArray: edge.closed ? "7 8" : null,
      }).addTo(contentLayer).bindTooltip(edge.closed ? "Organizer marked closed" : "Organizer path");
    });

    visibleNodes.forEach((node) => {
      const point = itemLatLng(node);
      if (!point) return;
      const marker = L.marker(point, {
        icon: L.divIcon({ className: "", html: '<span class="visitor-path-node"></span>', iconSize: [16, 16], iconAnchor: [8, 8] }),
        keyboard: true,
        title: `${node.name} · choose as route start`,
      }).addTo(contentLayer);
      marker.bindTooltip(node.name);
      marker.on("click", () => {
        manualStartNodeId = node.id;
        manualStartMode = false;
        locationMessage.textContent = `Route start set to ${node.name}. Choose a destination and route there.`;
        if (selectedPlaceId) createRoute();
      });
    });

    visiblePlaces.forEach((place) => {
      if (!place.name.toLocaleLowerCase().includes(search.value.trim().toLocaleLowerCase())) return;
      const point = itemLatLng(place);
      if (!point) return;
      const placeIndex = Math.max(1, places.findIndex((candidate) => candidate.id === place.id) + 1);
      const marker = L.marker(point, {
        icon: L.divIcon({ className: "", html: `<span class="visitor-place-icon"><span>${placeIndex}</span></span>`, iconSize: [32, 38], iconAnchor: [16, 36] }),
        title: place.name,
      }).addTo(contentLayer);
      marker.bindTooltip(place.name, { direction: "top", offset: [0, -28] });
      marker.on("click", () => selectPlace(place.id, false));
    });

    if (currentLocation && mapMode === "street") drawCurrentLocation();
    if (activeRoute) drawRoute();
  }

  function selectPlace(id, pan = true) {
    const place = placesById.get(id);
    if (!place) return;
    selectedPlaceId = id;
    items.forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.placeId === id)));
    routeButton.disabled = false;
    const point = itemLatLng(place);
    if (pan && point && map) map.flyTo(point, Math.max(map.getZoom(), mapMode === "street" ? 17 : 0));
    locationMessage.textContent = place.access_node_id
      ? `Selected ${place.name}. Route follows the organizer's paths.`
      : `${place.name} has no organizer-assigned path entry yet.`;
    routeButton.textContent = `Route to ${place.name}`;
  }

  function applySearch() {
    const query = search.value.trim().toLocaleLowerCase();
    let shown = 0;
    items.forEach((item) => {
      const place = placesById.get(item.dataset.placeId);
      const hasPosition = mapMode === "plan"
        ? Number.isFinite(Number(place?.x)) && Number.isFinite(Number(place?.y))
        : mapMode === "street" && Boolean(place && itemLatLng(place, "street"));
      const visible = hasPosition && item.dataset.placeName.toLocaleLowerCase().includes(query);
      item.hidden = !visible;
      if (visible) shown += 1;
    });
    noMappedDestinations.hidden = items.length === 0 || shown !== 0 || query.length > 0;
    noResults.hidden = items.length === 0 || shown !== 0 || query.length === 0;
    if (selectedPlaceId && items.find((item) => item.dataset.placeId === selectedPlaceId)?.hidden) {
      selectedPlaceId = null;
      routeButton.disabled = true;
    }
  }

  function setManualStart(nodeId) {
    const node = nodesById.get(nodeId);
    if (!node) return;
    manualStartNodeId = node.id;
    manualStartMode = false;
    locationMessage.textContent = `Route start set to ${node.name}. Choose a destination and route there.`;
    if (selectedPlaceId) createRoute();
  }

  function nearestGpsNode() {
    if (!currentLocation || mapMode !== "street") return null;
    let nearest = null;
    let distance = Infinity;
    geoNodes.forEach((node) => {
      const candidate = distanceMeters(currentLocation, node.location);
      if (candidate < distance) { distance = candidate; nearest = node; }
    });
    return nearest && distance <= 150 ? nearest : null;
  }

  function findPath(startId, destinationId) {
    const distances = new Map([[startId, 0]]);
    const previous = new Map();
    const pending = new Set(nodes.map((node) => node.id));
    while (pending.size) {
      let current = null;
      let best = Infinity;
      pending.forEach((id) => {
        const value = distances.get(id);
        if (value !== undefined && value < best) { best = value; current = id; }
      });
      if (current === null) break;
      pending.delete(current);
      if (current === destinationId) break;
      edges.forEach((edge) => {
        if (edge.closed) return;
        const forward = edge.from_node === current;
        const backward = edge.to_node === current && edge.direction !== "forward";
        if (!forward && !backward) return;
        const nextId = forward ? edge.to_node : edge.from_node;
        if (!pending.has(nextId)) return;
        const candidate = best + edgeLength(edge);
        if (candidate < (distances.get(nextId) ?? Infinity)) {
          distances.set(nextId, candidate);
          previous.set(nextId, { nodeId: current, edge });
        }
      });
    }
    if (!distances.has(destinationId)) return null;
    const pathNodes = [destinationId];
    const pathEdges = [];
    let cursor = destinationId;
    while (cursor !== startId) {
      const step = previous.get(cursor);
      if (!step) return null;
      pathEdges.unshift(step.edge);
      pathNodes.unshift(step.nodeId);
      cursor = step.nodeId;
    }
    return { nodeIds: pathNodes, edgeIds: pathEdges.map((edge) => edge.id) };
  }

  function createRoute() {
    const place = placesById.get(selectedPlaceId);
    if (!place) return;
    if (!place.access_node_id || !nodesById.has(place.access_node_id)) {
      locationMessage.textContent = "This destination is not connected to an organizer path yet.";
      return;
    }
    let start = nearestGpsNode();
    if (!start && manualStartNodeId && nodesById.has(manualStartNodeId)) start = nodesById.get(manualStartNodeId);
    if (!start) {
      if (mapMode === "plan" && nodes.length) {
        manualStartMode = true;
        locationMessage.textContent = "Tap an organizer path point on the venue plan to choose where your route starts.";
      } else if (!currentLocation) {
        locationMessage.textContent = "Tap Locate me or choose an organizer path point as your route start.";
      } else {
        locationMessage.textContent = "You are more than 150 m from the mapped path. Choose a path point to start your route.";
      }
      manualStartButton.hidden = !hasPathNodesOnMap();
      return;
    }

    if (!itemLatLng(start) || !itemLatLng(nodesById.get(place.access_node_id))) {
      locationMessage.textContent = "The start or destination path point is not positioned on this map.";
      return;
    }
    const path = findPath(start.id, place.access_node_id);
    if (!path) {
      locationMessage.textContent = "No open organizer path connects your start to this destination.";
      return;
    }
    if (path.nodeIds.some((id) => !itemLatLng(nodesById.get(id)))) {
      locationMessage.textContent = "Some points on this organizer path are not positioned on the map yet.";
      return;
    }
    activeRoute = { ...path, progressIndex: 1, placeId: place.id };
    routeTitle.textContent = `Route to ${place.name}`;
    routeCard.hidden = false;
    drawRoute();
  }

  function drawRoute() {
    if (!map || !routeLayer || !activeRoute) return;
    routeLayer.clearLayers();
    const routeNodes = activeRoute.nodeIds.map((id) => nodesById.get(id)).filter(Boolean);
    const routePoints = routeNodes.map((node) => itemLatLng(node)).filter(Boolean);
    if (!routePoints.length) return;
    L.polyline(routePoints, { color: "#087f79", weight: 8, opacity: .95, lineCap: "round", lineJoin: "round" }).addTo(routeLayer);
    if (currentLocation && mapMode === "street") {
      L.polyline([[currentLocation.latitude, currentLocation.longitude], routePoints[0]], { color: "#087f79", weight: 4, dashArray: "6 8", opacity: .75 }).addTo(routeLayer);
    }
    const destination = placesById.get(activeRoute.placeId);
    const nextNode = routeNodes[Math.min(activeRoute.progressIndex, routeNodes.length - 1)];
    routeNext.textContent = routeNodes.length <= 1 ? "You are at the destination path point." : `Next: ${nextNode?.name || "follow the highlighted path"}`;
    const fullDistance = activeRoute.edgeIds.reduce((total, id) => total + edgeLength(edges.find((edge) => edge.id === id)), 0);
    if (mapMode === "street" && Number.isFinite(fullDistance)) routeDistance.textContent = `${fullDistance < 1000 ? `${Math.round(fullDistance)} m` : `${(fullDistance / 1000).toFixed(1)} km`} along organizer paths`;
    else routeDistance.textContent = "Follow the highlighted organizer path";
    locationMessage.textContent = destination ? `Following the route to ${destination.name}.` : "Following the highlighted route.";
  }

  function drawCurrentLocation() {
    if (!map || mapMode !== "street" || !currentLocation) return;
    if (userMarker) userMarker.remove();
    if (userAccuracy) userAccuracy.remove();
    userAccuracy = L.circle([currentLocation.latitude, currentLocation.longitude], {
      radius: Number(currentLocation.accuracy) || 0,
      color: "#2563eb", weight: 1, fillColor: "#2563eb", fillOpacity: .1,
    }).addTo(map);
    userMarker = L.marker([currentLocation.latitude, currentLocation.longitude], {
      icon: L.divIcon({ className: "", html: '<span class="visitor-current-icon"></span>', iconSize: [24, 24], iconAnchor: [12, 12] }),
      title: "Your location",
      zIndexOffset: 1000,
    }).addTo(map);
    userMarker.bindTooltip(`You · accuracy ±${Math.round(Number(currentLocation.accuracy) || 0)} m`, { direction: "top" });
    if (activeRoute) {
      const routeNodes = activeRoute.nodeIds.map((id) => nodesById.get(id)).filter(Boolean);
      for (let index = activeRoute.progressIndex; index < routeNodes.length; index += 1) {
        if (validPoint(routeNodes[index].location) && distanceMeters(currentLocation, routeNodes[index].location) < 18) activeRoute.progressIndex = Math.min(index + 1, routeNodes.length - 1);
      }
      drawRoute();
    }
  }

  function updateLocation(position, initial) {
    currentLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };
    if (!map || (initial && mapMode !== "street")) initializeMap("street", currentLocation);
    drawCurrentLocation();
    recenterButton.hidden = false;
    const nearPath = nearestGpsNode();
    manualStartButton.hidden = !hasPathNodesOnMap() || Boolean(nearPath);
    locationMessage.textContent = mapMode === "plan"
      ? "GPS location received, but the venue plan is not aligned to GPS. Switch to the street map to view it."
      : `Your location is shown with ±${Math.round(currentLocation.accuracy)} m accuracy.${nearPath ? ` Nearest organizer path point: ${nearPath.name}.` : " Choose an organizer path point to start navigation."}`;
    if (initial) map?.panTo([currentLocation.latitude, currentLocation.longitude]);
  }

  function onLocationError(error) {
    locationMessage.textContent = error.code === error.PERMISSION_DENIED
      ? "Location permission was denied. Choose a path point on the map to set a manual start."
      : "Could not get your location. Check device location settings or choose a path point manually.";
    manualStartButton.hidden = !hasPathNodesOnMap();
  }

  function stopLocating() {
    if (locationWatchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(locationWatchId);
    locationWatchId = null;
    stopLocatingButton.hidden = true;
    locationMessage.textContent = currentLocation ? "Location updates stopped; your last position is still shown." : "Location updates stopped.";
  }

  items.forEach((item) => item.addEventListener("click", () => selectPlace(item.dataset.placeId)));
  search.addEventListener("input", () => { applySearch(); drawMapData(); });
  routeButton.addEventListener("click", createRoute);
  page.querySelector("[data-stop-route]").addEventListener("click", () => {
    activeRoute = null;
    routeLayer?.clearLayers();
    routeCard.hidden = true;
    locationMessage.textContent = "Route stopped.";
  });
  manualStartButton.addEventListener("click", () => {
    manualStartMode = true;
    locationMessage.textContent = mapMode === "plan"
      ? "Tap an organizer path point on the venue plan to set your route start."
      : "Tap an organizer path point to set your route start.";
  });
  mapModeButton.addEventListener("click", () => {
    if (!hasPlan) return;
    initializeMap(mapMode === "plan" ? "street" : "plan", currentLocation);
    manualStartButton.hidden = !hasPathNodesOnMap();
    if (mapMode === "plan" && currentLocation) locationMessage.textContent = "Showing the venue plan. Your GPS position cannot align to it until the organizer adds geographic anchors.";
    else locationMessage.textContent = "Street map selected.";
    if (activeRoute) drawRoute();
  });
  locateButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
      locationMessage.textContent = "Location is not available in this browser. Choose an organizer path point to set a manual start.";
      manualStartButton.hidden = !hasPathNodesOnMap();
      return;
    }
    locationMessage.textContent = "Requesting your location…";
    if (locationWatchId !== null) navigator.geolocation.clearWatch(locationWatchId);
    stopLocatingButton.hidden = false;
    navigator.geolocation.getCurrentPosition(
      (position) => updateLocation(position, true),
      onLocationError,
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    );
    locationWatchId = navigator.geolocation.watchPosition(
      (position) => updateLocation(position, false),
      onLocationError,
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 },
    );
  });
  recenterButton.addEventListener("click", () => {
    if (currentLocation && mapMode === "street") map?.flyTo([currentLocation.latitude, currentLocation.longitude], Math.max(map.getZoom(), 17));
  });
  stopLocatingButton.addEventListener("click", stopLocating);
  window.addEventListener("beforeunload", () => {
    if (locationWatchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(locationWatchId);
  });

  applySearch();
  if (!window.L) {
    showMessage("The map library did not load. Check your internet connection and reload.");
  } else if (hasStreetData) {
    initializeMap("street");
    if (hasPlan) mapModeButton.hidden = false;
  } else if (hasPlan) {
    initializeMap("plan");
    showMessage("This venue has a saved floor plan. Add GPS positions to its path points to show it on a street map.");
  } else {
    showMessage("The organizer has not uploaded a floor plan or positioned paths on a street map yet. Tap Locate me to see your location.");
    mapModeButton.hidden = true;
  }
  manualStartButton.hidden = !hasPathNodesOnMap();
})();

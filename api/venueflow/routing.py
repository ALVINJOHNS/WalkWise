"""Pure-Python routing over explicit venue path nodes and edges.

``find_route`` minimizes edge count with breadth-first search, then reports
distance and approximate walking time for that selected route. The default
walking speed is 1.2 meters per second; duration excludes congestion, mobility
adjustments, and dwell time. Input records use string IDs; convert Django
foreign-key values to IDs before calling this module.
"""

from collections import deque
from collections.abc import Mapping
from math import fsum, isfinite


DEFAULT_WALKING_SPEED_MPS = 1.2


def _result(
    *, ok, node_ids=None, edge_ids=None, distance_m=None, duration_s=None,
    reason=None, message=None
):
    """Build the stable result shape shared by successful and failed routes."""
    result = {
        "ok": ok,
        "node_ids": node_ids or [],
        "edge_ids": edge_ids or [],
        "distance_m": distance_m,
        "duration_s": duration_s,
    }
    if reason is not None:
        result["reason"] = reason
        result["message"] = message
    return result


def _failure(reason, message):
    return _result(ok=False, reason=reason, message=message)


def _identifier(value):
    return isinstance(value, str) and bool(value.strip())


def _route_result(node_path, edge_path, edges_by_id):
    """Calculate metrics for a selected route or return an explicit failure."""
    lengths = []
    for edge_id in edge_path:
        length = edges_by_id[edge_id].get("length_m")
        if isinstance(length, bool) or not isinstance(length, (int, float)):
            return _failure(
                "invalid_length",
                f"Edge {edge_id} must have a finite, non-negative numeric length_m.",
            )
        try:
            finite_length = isfinite(length)
        except OverflowError:
            finite_length = False
        if not finite_length or length < 0:
            return _failure(
                "invalid_length",
                f"Edge {edge_id} must have a finite, non-negative numeric length_m.",
            )
        lengths.append(length)

    try:
        distance_m = fsum(lengths)
        duration_s = distance_m / DEFAULT_WALKING_SPEED_MPS
    except (OverflowError, ValueError):
        return _failure("invalid_length", "Route distance exceeds the supported finite range.")
    if not isfinite(distance_m) or not isfinite(duration_s):
        return _failure("invalid_length", "Route metrics exceed the supported finite range.")

    return _result(
        ok=True,
        node_ids=node_path,
        edge_ids=edge_path,
        distance_m=distance_m,
        duration_s=duration_s,
    )


def _suggestion_failure(reason, message):
    """Build the stable result shape used when no suggestion can be made."""
    return {
        "ok": False,
        "place": None,
        "route": None,
        "travel_time_s": None,
        "wait_minutes": None,
        "ranking_time_s": None,
        "reason": reason,
        "message": message,
    }


def _wait_seconds(place):
    """Return (wait minutes, wait seconds), or None for malformed supplied data."""
    if "waitMinutes" not in place:
        return None, 0.0

    wait_minutes = place["waitMinutes"]
    if isinstance(wait_minutes, bool) or not isinstance(wait_minutes, (int, float)):
        return None
    try:
        if not isfinite(wait_minutes) or wait_minutes < 0:
            return None
        wait_seconds = wait_minutes * 60
    except (OverflowError, TypeError):
        return None
    if not isfinite(wait_seconds):
        return None
    return wait_minutes, wait_seconds


def _suggestion_reason(travel_time_s, wait_minutes):
    """Describe the selected ranking inputs using rounded display values."""
    travel_minutes = travel_time_s / 60
    reason = f"Approx. {travel_minutes:.0f} min walking time"
    if wait_minutes is not None:
        reason += f"; organizer wait estimate adds {wait_minutes:.0f} min"
    return reason + "."


def suggest_next_place(nodes, edges, places, start_node_id):
    """Recommend the open, reachable place with the lowest estimated total time.

    ``nodes`` and ``edges`` use the same plain mapping records accepted by
    :func:`find_route`. Each place mapping must contain non-empty string
    ``id`` and ``name``, strict boolean ``open``, and a non-empty string
    ``access_node_id``. Optional ``waitMinutes`` must be a finite,
    non-negative number; it is converted to seconds and added to route
    ``duration_s`` for ranking only. Missing wait data adds no penalty.

    Malformed candidates, every occurrence of duplicate place IDs, closed
    places, invalid routes, and invalid wait estimates are skipped. Equal
    ranking times preserve input order. Shared graph/place iterables are
    materialized once so generators work across candidate evaluations.

    Returns a stable success mapping with the selected place, the exact route
    result, travel/wait/ranking values, and a concise reason. Invalid shared
    inputs return ``reason="invalid_input"``; valid inputs with no candidate
    return ``reason="no_eligible_place"``. The function performs no I/O and
    does not import Django.
    """
    if not _identifier(start_node_id):
        return _suggestion_failure("invalid_input", "Start node ID must be a non-empty string.")
    if nodes is None or edges is None or places is None:
        return _suggestion_failure("invalid_input", "Nodes, edges, and places must be iterable records.")
    try:
        node_records = list(nodes)
        edge_records = list(edges)
        place_records = list(places)
    except TypeError:
        return _suggestion_failure("invalid_input", "Nodes, edges, and places must be iterable records.")

    place_id_counts = {}
    for place in place_records:
        if isinstance(place, Mapping) and _identifier(place.get("id")):
            place_id = place["id"]
            place_id_counts[place_id] = place_id_counts.get(place_id, 0) + 1

    best = None
    for place in place_records:
        if not isinstance(place, Mapping):
            continue
        place_id = place.get("id")
        name = place.get("name")
        access_node_id = place.get("access_node_id")
        if (
            not _identifier(place_id)
            or place_id_counts.get(place_id) != 1
            or not _identifier(name)
            or place.get("open") is not True
            or not _identifier(access_node_id)
        ):
            continue

        wait_values = _wait_seconds(place)
        if wait_values is None:
            continue
        wait_minutes, wait_seconds = wait_values

        route = find_route(node_records, edge_records, start_node_id, access_node_id)
        if not route["ok"]:
            continue
        travel_time_s = route["duration_s"]
        if isinstance(travel_time_s, bool) or not isinstance(travel_time_s, (int, float)):
            continue
        try:
            if not isfinite(travel_time_s) or travel_time_s < 0:
                continue
            ranking_time_s = travel_time_s + wait_seconds
        except (OverflowError, TypeError):
            continue
        if not isfinite(ranking_time_s):
            continue

        if best is None or ranking_time_s < best["ranking_time_s"]:
            best = {
                "ok": True,
                "place": {"id": place_id, "name": name},
                "route": route,
                "travel_time_s": travel_time_s,
                "wait_minutes": wait_minutes,
                "ranking_time_s": ranking_time_s,
                "reason": _suggestion_reason(travel_time_s, wait_minutes),
            }

    if best is None:
        return _suggestion_failure(
            "no_eligible_place",
            "No open place with a valid access node and route is available.",
        )
    return best


def find_route(nodes, edges, start_node_id, destination_node_id):
    """Find a minimum-hop route through explicitly connected graph records.

    Args:
        nodes: Iterable of mappings with a unique, non-empty string ``id``.
        edges: Iterable of mappings with unique ``id``, ``from_node`` and
            ``to_node`` IDs. ``closed`` defaults to false and ``direction``
            defaults to ``"both"``. Supported directions are ``"both"`` and
            ``"forward"`` (from ``from_node`` to ``to_node``).
        start_node_id: Existing node ID where the route begins.
        destination_node_id: Existing destination access node ID.

    Returns:
        A dictionary containing ``ok``, ordered ``node_ids`` and ``edge_ids``,
        and ``distance_m`` / ``duration_s`` values. Failures also contain
        a stable ``reason`` and a concise ``message``. Reasons are ``invalid_input``,
        ``invalid_graph``, ``unknown_start``, ``unknown_destination``, and
        ``unreachable``.

    The search is deterministic: among equally short routes, adjacency follows
    the input edge order. Closed edges are ignored and coordinates are never
    used to create connections or choose a route. ``length_m`` on every edge
    in the selected route must be finite, numeric, and non-negative. Duration
    is distance divided by the conservative default walking speed of 1.2 m/s;
    it excludes congestion, mobility adjustments, and dwell time. Consumers
    can resolve ``edge_ids`` against their source edge records to obtain
    stored geometry; this function returns no inferred geometry.
    """
    if not _identifier(start_node_id) or not _identifier(destination_node_id):
        return _failure("invalid_input", "Start and destination IDs must be non-empty strings.")

    if nodes is None or edges is None:
        return _failure("invalid_input", "Nodes and edges must be iterable records.")

    try:
        node_records = list(nodes)
        edge_records = list(edges)
    except TypeError:
        return _failure("invalid_input", "Nodes and edges must be iterable records.")

    node_ids = set()
    for node in node_records:
        if not isinstance(node, Mapping) or not _identifier(node.get("id")):
            return _failure("invalid_graph", "Every node must have a non-empty string ID.")
        node_id = node["id"]
        if node_id in node_ids:
            return _failure("invalid_graph", f"Duplicate node ID: {node_id}.")
        node_ids.add(node_id)

    if start_node_id not in node_ids:
        return _failure("unknown_start", f"Start node does not exist: {start_node_id}.")
    if destination_node_id not in node_ids:
        return _failure("unknown_destination", f"Destination node does not exist: {destination_node_id}.")

    adjacency = {node_id: [] for node_id in node_ids}
    edge_ids = set()
    edges_by_id = {}
    for edge in edge_records:
        if not isinstance(edge, Mapping):
            return _failure("invalid_graph", "Every edge must be a mapping record.")
        edge_id = edge.get("id")
        from_node = edge.get("from_node")
        to_node = edge.get("to_node")
        if not _identifier(edge_id) or not _identifier(from_node) or not _identifier(to_node):
            return _failure("invalid_graph", "Every edge must have a non-empty ID and endpoint IDs.")
        if edge_id in edge_ids:
            return _failure("invalid_graph", f"Duplicate edge ID: {edge_id}.")
        edge_ids.add(edge_id)
        edges_by_id[edge_id] = edge
        if from_node not in node_ids or to_node not in node_ids:
            return _failure("invalid_graph", f"Edge {edge_id} references an unknown endpoint.")

        closed = edge.get("closed", False)
        direction = edge.get("direction", "both")
        if not isinstance(closed, bool):
            return _failure("invalid_graph", f"Edge {edge_id} has an invalid closed value.")
        if direction not in ("both", "forward"):
            return _failure("invalid_graph", f"Edge {edge_id} has unsupported direction: {direction}.")
        if closed:
            continue

        adjacency[from_node].append((to_node, edge_id))
        if direction == "both":
            adjacency[to_node].append((from_node, edge_id))

    if start_node_id == destination_node_id:
        return _result(ok=True, node_ids=[start_node_id], distance_m=0.0, duration_s=0.0)

    queue = deque([start_node_id])
    visited = {start_node_id}
    previous = {}

    while queue:
        current = queue.popleft()
        for neighbor, edge_id in adjacency[current]:
            if neighbor in visited:
                continue
            visited.add(neighbor)
            previous[neighbor] = (current, edge_id)
            if neighbor == destination_node_id:
                node_path = [destination_node_id]
                edge_path = []
                cursor = destination_node_id
                while cursor != start_node_id:
                    parent, path_edge_id = previous[cursor]
                    node_path.append(parent)
                    edge_path.append(path_edge_id)
                    cursor = parent
                node_path.reverse()
                edge_path.reverse()
                return _route_result(node_path, edge_path, edges_by_id)
            queue.append(neighbor)

    return _failure("unreachable", "No open path connects the requested nodes.")

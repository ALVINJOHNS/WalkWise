"""Pure-Python routing over explicit venue path nodes and edges.

``find_route`` minimizes the number of edges (not distance) with breadth-first
search. Route metrics remain ``None`` for the metrics phase to calculate.
Input records use string IDs; convert Django foreign-key values to IDs before
calling this module.
"""

from collections import deque
from collections.abc import Mapping


def _result(*, ok, node_ids=None, edge_ids=None, reason=None, message=None):
    """Build the stable result shape shared by successful and failed routes."""
    result = {
        "ok": ok,
        "node_ids": node_ids or [],
        "edge_ids": edge_ids or [],
        "distance_m": None,
        "duration_s": None,
    }
    if reason is not None:
        result["reason"] = reason
        result["message"] = message
    return result


def _failure(reason, message):
    return _result(ok=False, reason=reason, message=message)


def _identifier(value):
    return isinstance(value, str) and bool(value.strip())


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
        and ``distance_m`` / ``duration_s`` placeholders. Failures also contain
        a stable ``reason`` and a concise ``message``. Reasons are ``invalid_input``,
        ``invalid_graph``, ``unknown_start``, ``unknown_destination``, and
        ``unreachable``.

    The search is deterministic: among equally short routes, adjacency follows
    the input edge order. Closed edges are ignored and coordinates are never
    used to create connections or choose a route.
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
        return _result(ok=True, node_ids=[start_node_id])

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
                return _result(ok=True, node_ids=node_path, edge_ids=edge_path)
            queue.append(neighbor)

    return _failure("unreachable", "No open path connects the requested nodes.")

from django.db import connection, transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from .models import MapFeature, PathEdge, PathNode
from .serializers import EventSerializer, MapDraftSerializer, VenueSerializer
from .selectors import list_events, list_venues


@api_view(["GET"])
def health(request):
    try:
        connection.ensure_connection()
    except Exception:
        return Response({"status": "error", "database": "unavailable"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    return Response({"status": "ok", "database": "ok"})


class VenueViewSet(viewsets.ModelViewSet):
    serializer_class = VenueSerializer

    def get_queryset(self):
        return list_venues()

    @action(detail=True, methods=("get", "put"), url_path="map-draft")
    def map_draft(self, request, pk=None):
        venue = self.get_object()
        if request.method == "GET":
            return Response(_map_draft_payload(venue))

        serializer = MapDraftSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        snapshot = serializer.validated_data
        with transaction.atomic():
            conflicts = {
                "features": list(MapFeature.objects.filter(pk__in=[row["id"] for row in snapshot["features"]]).exclude(venue=venue).values_list("id", flat=True)),
                "nodes": list(PathNode.objects.filter(pk__in=[row["id"] for row in snapshot["nodes"]]).exclude(venue=venue).values_list("id", flat=True)),
                "edges": list(PathEdge.objects.filter(pk__in=[row["id"] for row in snapshot["edges"]]).exclude(venue=venue).values_list("id", flat=True)),
            }
            conflicts = {key: ids for key, ids in conflicts.items() if ids}
            if conflicts:
                return Response({"ids": {key: f"Already used by another venue: {', '.join(ids)}" for key, ids in conflicts.items()}}, status=status.HTTP_400_BAD_REQUEST)

            features = snapshot["features"]
            nodes = snapshot["nodes"]
            edges = snapshot["edges"]
            feature_ids = [row["id"] for row in features]
            node_ids = [row["id"] for row in nodes]
            edge_ids = [row["id"] for row in edges]
            # Delete old edges first so node removal cannot leave stale references.
            PathEdge.objects.filter(venue=venue).exclude(pk__in=edge_ids).delete()
            MapFeature.objects.filter(venue=venue).exclude(pk__in=feature_ids).delete()
            PathNode.objects.filter(venue=venue).exclude(pk__in=node_ids).delete()

            for row in nodes:
                row = dict(row)
                properties = dict(row.pop("properties"))
                properties["name"] = row.pop("name")
                geolocation = row.pop("geolocation", None)
                if geolocation is not None:
                    properties["geolocation"] = geolocation
                PathNode.objects.update_or_create(
                    id=row.pop("id"), venue=venue,
                    defaults={"plan_x": row.pop("x"), "plan_y": row.pop("y"), "properties": properties},
                )

            for row in features:
                row = dict(row)
                properties = dict(row.pop("properties"))
                properties.update({"description": row.pop("description"), "status": row.pop("status")})
                geolocation = row.pop("geolocation", None)
                if geolocation is not None:
                    properties["geolocation"] = geolocation
                MapFeature.objects.update_or_create(
                    id=row.pop("id"), venue=venue,
                    defaults={
                        "name": row.pop("name"), "kind": row.pop("category"),
                        "plan_x": row.pop("x"), "plan_y": row.pop("y"), "properties": properties,
                    },
                )

            for row in edges:
                row = dict(row)
                from_node = PathNode.objects.get(pk=row.pop("from_id"), venue=venue)
                to_node = PathNode.objects.get(pk=row.pop("to_id"), venue=venue)
                edge_id = row.pop("id")
                PathEdge.objects.update_or_create(
                    id=edge_id, venue=venue,
                    defaults={"from_node": from_node, "to_node": to_node, **row},
                )

            # Legacy organizer collections are removed in the same transaction
            # as the authoritative rows, so a later empty snapshot cannot revive them.
            calibration = dict(venue.calibration or {})
            draft = calibration.get("organizer_draft")
            if isinstance(draft, dict):
                draft = dict(draft)
                for key in ("places", "nodes", "edges"):
                    draft.pop(key, None)
                calibration["organizer_draft"] = draft
                venue.calibration = calibration
                venue.save(update_fields=("calibration", "updated_at"))

        return Response(_map_draft_payload(venue))


def _map_draft_payload(venue):
    features = []
    for feature in venue.features.order_by("id"):
        properties = dict(feature.properties or {})
        features.append({
            **properties,
            "id": feature.id, "name": feature.name, "category": feature.kind,
            "x": feature.plan_x, "y": feature.plan_y,
            "description": properties.get("description", ""),
            "status": properties.get("status", "open"),
            "geolocation": properties.get("geolocation"),
            "properties": properties,
        })
    nodes = []
    for node in venue.path_nodes.order_by("id"):
        properties = dict(node.properties or {})
        nodes.append({
            **properties, "id": node.id, "name": properties.get("name", f"Point {node.id}"),
            "x": node.plan_x, "y": node.plan_y, "geolocation": properties.get("geolocation"),
            "properties": properties,
        })
    edges = [
        {
            "id": edge.id, "from": edge.from_node_id, "to": edge.to_node_id,
            "from_node": edge.from_node_id, "to_node": edge.to_node_id,
            "length_m": edge.length_m, "direction": edge.direction,
            "accessible": edge.accessible, "closed": edge.closed,
            "access_rules": edge.access_rules,
        }
        for edge in venue.path_edges.select_related("from_node", "to_node").order_by("id")
    ]
    return {"features": features, "nodes": nodes, "edges": edges}


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer

    def get_queryset(self):
        return list_events()


@api_view(["POST"])
def route_request(request):
    return Response({"error": "not_implemented", "domain": "routing"}, status=status.HTTP_501_NOT_IMPLEMENTED)

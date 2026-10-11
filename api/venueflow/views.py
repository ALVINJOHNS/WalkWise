import uuid

from django.db import connection, transaction
from django.http import Http404
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from .models import Event, MapFeature, MapVersion, PathEdge, PathNode, Venue
from .routing import find_route
from .serializers import EventSerializer, MapDraftSerializer, RouteRequestSerializer, VenueSerializer
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
                        "access_node_id": row.pop("access_node_id", None),
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
            "access_node_id": feature.access_node_id,
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

    @action(detail=True, methods=("post",), url_path="publish")
    def publish(self, request, pk=None):
        selected_event = self.get_object()
        with transaction.atomic():
            event = Event.objects.select_for_update().get(pk=selected_event.pk)
            event.status = "published"
            event.save(update_fields=("status",))
            previous = MapVersion.objects.filter(event=event).order_by("-version").first()
            version_number = previous.version + 1 if previous else 1
            version = MapVersion.objects.create(
                id=str(uuid.uuid4()),
                event=event,
                version=version_number,
                snapshot=_published_snapshot(event),
            )
        return Response({
            "event_id": event.id,
            "version": version.version,
            "published_at": version.published_at,
            "snapshot": version.snapshot,
        }, status=status.HTTP_201_CREATED)


def _published_snapshot(event):
    venue = event.venue
    return {
        "venue": {"id": venue.id, "slug": venue.slug, "name": venue.name},
        "event": {
            "id": event.id, "title": event.title, "status": "published",
            "starts_at": event.starts_at.isoformat() if event.starts_at else None,
            "ends_at": event.ends_at.isoformat() if event.ends_at else None,
        },
        **_map_draft_payload(venue),
    }


@api_view(["POST"])
def route_request(request):
    serializer = RouteRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    values = serializer.validated_data
    venue = Venue.objects.filter(pk=values["venue_id"]).first()
    if venue is None:
        raise Http404("Venue not found.")

    version = (
        MapVersion.objects.filter(event__venue=venue, event__status="published")
        .select_related("event")
        .order_by("-published_at", "-version", "event_id")
        .first()
    )
    if version is None:
        raise Http404("Venue has no published map snapshot.")

    snapshot = version.snapshot
    if not isinstance(snapshot, dict):
        raise serializers.ValidationError({"snapshot": "Published snapshot is malformed."})
    nodes = snapshot.get("nodes")
    edges = snapshot.get("edges")
    features = snapshot.get("features")
    if not isinstance(nodes, list) or not isinstance(edges, list) or not isinstance(features, list):
        raise serializers.ValidationError({"snapshot": "Published snapshot is missing features, nodes, or edges."})
    if any(
        not isinstance(node, dict) or not isinstance(node.get("id"), str) or not node["id"].strip()
        for node in nodes
    ):
        raise serializers.ValidationError({"snapshot": "Published snapshot contains an invalid node record."})
    if any(
        not isinstance(feature, dict) or not isinstance(feature.get("id"), str) or not feature["id"].strip()
        for feature in features
    ):
        raise serializers.ValidationError({"snapshot": "Published snapshot contains an invalid feature record."})

    start_node_id = values["start_node_id"]
    if not any(isinstance(node, dict) and node.get("id") == start_node_id for node in nodes):
        raise serializers.ValidationError({"start_node_id": "Unknown node in the published snapshot."})
    feature = next((
        row for row in features
        if isinstance(row, dict) and row.get("id") == values["destination_feature_id"]
    ), None)
    if feature is None:
        raise serializers.ValidationError({"destination_feature_id": "Unknown feature in the published snapshot."})
    access_node_id = feature.get("access_node_id")
    node_ids = {node["id"] for node in nodes}
    if not isinstance(access_node_id, str) or access_node_id not in node_ids:
        raise serializers.ValidationError({
            "destination_feature_id": "Feature has no valid access node in the published snapshot."
        })

    route = find_route(nodes, edges, start_node_id, access_node_id)
    if route.get("reason") == "unknown_start":
        raise serializers.ValidationError({"start_node_id": route["message"]})
    if route.get("reason") == "unknown_destination":
        raise serializers.ValidationError({"destination_feature_id": route["message"]})
    if route.get("reason") in ("invalid_graph", "invalid_input"):
        raise serializers.ValidationError({"snapshot": route.get("message", "Published graph is invalid.")})

    return Response({
        "venue_id": venue.id,
        "event_id": version.event_id,
        "version": version.version,
        "route": route,
    })

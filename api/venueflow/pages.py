import json
import math

from django.http import Http404, JsonResponse
from django.shortcuts import render

from .organizer_ai import FloorPlanAnalysisError, extract_destinations
from .selectors import list_venues, venue_by_slug


def _point_payload(point, stored=None):
    value = stored if isinstance(stored, dict) else None
    try:
        latitude = float(value["latitude"]) if value else point.y
        longitude = float(value["longitude"]) if value else point.x
    except (AttributeError, KeyError, TypeError, ValueError):
        return None
    if not math.isfinite(latitude) or not math.isfinite(longitude):
        return None
    if not -90 <= latitude <= 90 or not -180 <= longitude <= 180:
        return None
    return {"latitude": latitude, "longitude": longitude}


def _visitor_map_data(venue, event):
    nodes = []
    for node in venue.path_nodes.order_by("id"):
        properties = node.properties if isinstance(node.properties, dict) else {}
        nodes.append({
            "id": node.id,
            "name": properties.get("name") or f"Path point {node.id}",
            "x": node.plan_x,
            "y": node.plan_y,
            "location": _point_payload(node.location, properties.get("geolocation")),
        })

    places = []
    for feature in venue.features.order_by("name", "id"):
        properties = feature.properties if isinstance(feature.properties, dict) else {}
        places.append({
            "id": feature.id,
            "name": feature.name,
            "kind": feature.kind,
            "description": properties.get("description", ""),
            "status": properties.get("status", "unavailable"),
            "x": feature.plan_x,
            "y": feature.plan_y,
            "location": _point_payload(feature.location, properties.get("geolocation")),
            "access_node_id": properties.get("access_node_id"),
        })

    edges = [
        {
            "id": edge.id,
            "from_node": edge.from_node_id,
            "to_node": edge.to_node_id,
            "direction": edge.direction,
            "closed": edge.closed,
            "length_m": edge.length_m,
        }
        for edge in venue.path_edges.order_by("id")
    ]

    calibration = venue.calibration if isinstance(venue.calibration, dict) else {}
    drafts = calibration.get("organizer_drafts") if isinstance(calibration.get("organizer_drafts"), dict) else {}
    draft = drafts.get(event.id, {}) if event else {}
    if not isinstance(draft, dict):
        draft = {}
    if not draft:
        draft = calibration.get("organizer_draft", {})
    if not isinstance(draft, dict):
        draft = {}
    image = draft.get("image_data") or venue.plan_image_url or ""

    return {"nodes": nodes, "edges": edges, "places": places, "plan_image": image}


def home(request):
    venues = list_venues()
    return render(request, "venueflow/home.html", {"venues": venues})


def organizer(request):
    if request.method == "POST":
        if request.content_type != "application/json" or len(request.body) > 15 * 1024 * 1024:
            return JsonResponse({"detail": "Send a floor plan smaller than 10 MB."}, status=400)
        try:
            body = json.loads(request.body)
            if body.get("action") != "analyze_floor_plan":
                return JsonResponse({"detail": "Unknown organizer action."}, status=400)
            analysis = extract_destinations(body.get("image_data"))
        except (json.JSONDecodeError, AttributeError):
            return JsonResponse({"detail": "The floor-plan request is invalid."}, status=400)
        except FloorPlanAnalysisError as error:
            return JsonResponse({"detail": str(error)}, status=503 if "not configured" in str(error) else 400)
        return JsonResponse(analysis)
    if request.method != "GET":
        return JsonResponse({"detail": "Method not allowed."}, status=405)
    return render(request, "venueflow/organizer.html", {"venues": list_venues()})


def visitor(request, slug):
    venue = venue_by_slug(slug)
    if venue is None:
        raise Http404("Venue not found")
    event = venue.events.filter(status="published").order_by("id").first() or venue.events.order_by("id").first()
    event_status = event.status if event else None
    freshness_state = {
        "published": "current",
        "paused": "paused",
    }.get(event_status, "saved")
    return render(request, "venueflow/visitor.html", {
        "venue": venue,
        "freshness_state": freshness_state,
        "freshness_updated_at": venue.updated_at,
        "visitor_map_data": _visitor_map_data(venue, event),
    })

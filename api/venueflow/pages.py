import json

from django.http import Http404, JsonResponse
from django.shortcuts import render

from .organizer_ai import FloorPlanAnalysisError, extract_destinations
from .selectors import list_events, list_venues, venue_by_slug


def home(request):
    venues = list_venues()
    events = list_events()
    return render(request, "venueflow/home.html", {
        "venues": venues,
        "venue_count": venues.count(),
        "event_count": events.count(),
        "published_count": events.filter(status="published").count(),
    })


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
    event_status = venue.events.values_list("status", flat=True).order_by("id").first()
    freshness_state = {
        "published": "current",
        "paused": "paused",
    }.get(event_status, "saved")
    return render(request, "venueflow/visitor.html", {
        "venue": venue,
        "freshness_state": freshness_state,
        "freshness_updated_at": venue.updated_at,
    })

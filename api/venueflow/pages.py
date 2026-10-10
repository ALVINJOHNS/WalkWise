from django.http import Http404
from django.shortcuts import render

from .selectors import list_venues, venue_by_slug


def home(request):
    return render(request, "venueflow/home.html", {"venue_count": list_venues().count()})


def organizer(request):
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

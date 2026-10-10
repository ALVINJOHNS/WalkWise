from .models import Event, Venue


def list_venues():
    return Venue.objects.all().order_by("name")


def list_events():
    return Event.objects.select_related("venue").all().order_by("title")


def venue_by_slug(slug):
    return Venue.objects.filter(slug=slug).first()

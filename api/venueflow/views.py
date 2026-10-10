from django.db import connection
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .serializers import EventSerializer, VenueSerializer
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


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer

    def get_queryset(self):
        return list_events()


@api_view(["POST"])
def route_request(request):
    return Response({"error": "not_implemented", "domain": "routing"}, status=status.HTTP_501_NOT_IMPLEMENTED)

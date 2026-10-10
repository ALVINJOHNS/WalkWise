from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import EventViewSet, VenueViewSet, health, route_request

router = DefaultRouter()
router.register("venues", VenueViewSet, basename="venue")
router.register("events", EventViewSet, basename="event")

urlpatterns = [
    path("health", health, name="health"),
    path("route", route_request, name="route"),
    path("", include(router.urls)),
]

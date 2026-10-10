from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import EventViewSet, VenueViewSet, health, route_request

router = DefaultRouter()
router.register("venues", VenueViewSet)
router.register("events", EventViewSet)

urlpatterns = [
    path("health", health, name="health"),
    path("route", route_request, name="route"),
    path("", include(router.urls)),
]

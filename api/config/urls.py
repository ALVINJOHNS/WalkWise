from django.urls import include, path
from venueflow import pages

urlpatterns = [
    path("api/", include("venueflow.urls")),
    path("", pages.home, name="home"),
    path("organizer/", pages.organizer, name="organizer"),
    path("v/<slug:slug>/", pages.visitor, name="visitor"),
]

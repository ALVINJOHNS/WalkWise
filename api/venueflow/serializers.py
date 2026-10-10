import json

from rest_framework import serializers

from .models import Event, EventItem, MapFeature, MapVersion, PathEdge, PathNode, Venue


class VenueSerializer(serializers.ModelSerializer):
    boundary = serializers.SerializerMethodField()

    class Meta:
        model = Venue
        fields = ("id", "slug", "name", "plan_image_url", "boundary", "calibration", "created_at", "updated_at")
        read_only_fields = ("boundary", "created_at", "updated_at")

    def get_boundary(self, venue):
        return json.loads(venue.boundary.geojson) if venue.boundary else None


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ("id", "venue", "title", "starts_at", "ends_at", "status")

    def validate(self, attrs):
        starts_at = attrs.get("starts_at", getattr(self.instance, "starts_at", None))
        ends_at = attrs.get("ends_at", getattr(self.instance, "ends_at", None))
        if starts_at and ends_at and ends_at <= starts_at:
            raise serializers.ValidationError({"ends_at": "End time must be after start time."})
        return attrs


class MapFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = MapFeature
        fields = "__all__"


class PathNodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PathNode
        fields = "__all__"


class PathEdgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PathEdge
        fields = "__all__"


class EventItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventItem
        fields = "__all__"


class MapVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MapVersion
        fields = "__all__"
        read_only_fields = ("published_at",)

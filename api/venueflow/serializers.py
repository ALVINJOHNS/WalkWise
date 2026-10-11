import json
import math

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


class FinitePlanCoordinateField(serializers.FloatField):
    def to_internal_value(self, data):
        if isinstance(data, bool):
            raise serializers.ValidationError("A finite number between 0 and 1 is required.")
        value = super().to_internal_value(data)
        if not math.isfinite(value) or not 0 <= value <= 1:
            raise serializers.ValidationError("A finite number between 0 and 1 is required.")
        return value


class MapDraftFeatureSerializer(serializers.Serializer):
    id = serializers.CharField(max_length=80, allow_blank=False)
    name = serializers.CharField(max_length=200, allow_blank=False)
    category = serializers.CharField(max_length=50, allow_blank=False)
    x = FinitePlanCoordinateField()
    y = FinitePlanCoordinateField()
    description = serializers.CharField(required=False, allow_blank=True, default="")
    status = serializers.ChoiceField(choices=("open", "closed", "delayed"), required=False, default="open")
    access_node_id = serializers.CharField(max_length=80, required=False, allow_null=True, allow_blank=False)
    properties = serializers.DictField(required=False, default=dict)
    geolocation = serializers.JSONField(required=False, allow_null=True)


class MapDraftNodeSerializer(serializers.Serializer):
    id = serializers.CharField(max_length=80, allow_blank=False)
    name = serializers.CharField(max_length=200, allow_blank=False)
    x = FinitePlanCoordinateField()
    y = FinitePlanCoordinateField()
    properties = serializers.DictField(required=False, default=dict)
    geolocation = serializers.JSONField(required=False, allow_null=True)


class MapDraftEdgeSerializer(serializers.Serializer):
    id = serializers.CharField(max_length=80, allow_blank=False)
    from_node = serializers.CharField(max_length=80, required=False, allow_blank=False)
    to_node = serializers.CharField(max_length=80, required=False, allow_blank=False)
    from_id = serializers.CharField(max_length=80, required=False, allow_blank=False)
    to_id = serializers.CharField(max_length=80, required=False, allow_blank=False)
    from_ = serializers.CharField(max_length=80, required=False, allow_blank=False)
    to = serializers.CharField(max_length=80, required=False, allow_blank=False)
    length_m = serializers.FloatField(required=False, allow_null=True)
    direction = serializers.ChoiceField(choices=("both", "forward"), required=False, default="both")
    accessible = serializers.BooleanField(required=False, default=True)
    closed = serializers.BooleanField(required=False, default=False)
    access_rules = serializers.DictField(required=False, default=dict)

    def to_internal_value(self, data):
        if isinstance(data, dict) and "from" in data and "from_" not in data:
            data = {**data, "from_": data["from"]}
        return super().to_internal_value(data)

    def validate(self, attrs):
        from_values = [attrs.pop(key, None) for key in ("from_node", "from_id", "from_")]
        to_values = [attrs.pop(key, None) for key in ("to_node", "to_id", "to")]
        from_id = next((value for value in from_values if value), None)
        to_id = next((value for value in to_values if value), None)
        if not from_id or not to_id:
            raise serializers.ValidationError({"from/to": "Both edge endpoints are required."})
        attrs["from_id"] = from_id
        attrs["to_id"] = to_id
        length = attrs.get("length_m")
        if length is not None and (isinstance(length, bool) or not math.isfinite(length) or length < 0):
            raise serializers.ValidationError({"length_m": "Must be a finite, non-negative number."})
        return attrs


class MapDraftSerializer(serializers.Serializer):
    features = MapDraftFeatureSerializer(many=True, allow_empty=True)
    nodes = MapDraftNodeSerializer(many=True, allow_empty=True)
    edges = MapDraftEdgeSerializer(many=True, allow_empty=True)

    def validate(self, attrs):
        errors = {}
        for key in ("features", "nodes", "edges"):
            ids = [item["id"] for item in attrs[key]]
            if len(ids) != len(set(ids)):
                errors[key] = "IDs must be unique within this collection."
        node_ids = {item["id"] for item in attrs["nodes"]}
        for index, feature in enumerate(attrs["features"]):
            access_node_id = feature.get("access_node_id")
            if access_node_id is not None and access_node_id not in node_ids:
                if isinstance(errors.get("features"), str):
                    errors["features"] = {"non_field_errors": errors["features"]}
                errors.setdefault("features", {})[index] = {
                    "access_node_id": "Must reference a path node in this venue snapshot."
                }
        for index, edge in enumerate(attrs["edges"]):
            if edge["from_id"] not in node_ids or edge["to_id"] not in node_ids:
                if isinstance(errors.get("edges"), str):
                    errors["edges"] = {"non_field_errors": errors["edges"]}
                errors.setdefault("edges", {})[index] = {
                    "from/to": "Each endpoint must reference a node in this venue snapshot."
                }
            elif edge["from_id"] == edge["to_id"]:
                if isinstance(errors.get("edges"), str):
                    errors["edges"] = {"non_field_errors": errors["edges"]}
                errors.setdefault("edges", {})[index] = {"to": "An edge must connect two different nodes."}
        if errors:
            raise serializers.ValidationError(errors)
        return attrs


class RouteRequestSerializer(serializers.Serializer):
    venue_id = serializers.CharField(max_length=80, allow_blank=False)
    start_node_id = serializers.CharField(max_length=80, allow_blank=False)
    destination_feature_id = serializers.CharField(max_length=80, allow_blank=False)

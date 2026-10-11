from django.contrib.gis.db import models


class Venue(models.Model):
    id = models.CharField(primary_key=True, max_length=80)
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=200)
    plan_image_url = models.URLField(blank=True)
    boundary = models.GeometryField(srid=4326, null=True, blank=True)
    calibration = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Event(models.Model):
    STATUS_CHOICES = (("draft", "Draft"), ("published", "Published"))

    id = models.CharField(primary_key=True, max_length=80)
    venue = models.ForeignKey(Venue, related_name="events", on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="draft")


class MapFeature(models.Model):
    id = models.CharField(primary_key=True, max_length=80)
    venue = models.ForeignKey(Venue, related_name="features", on_delete=models.CASCADE)
    kind = models.CharField(max_length=50)
    name = models.CharField(max_length=200)
    plan_x = models.FloatField()
    plan_y = models.FloatField()
    location = models.PointField(srid=4326, null=True, blank=True)
    properties = models.JSONField(default=dict, blank=True)
    access_node = models.ForeignKey(
        "PathNode", related_name="accessible_features", on_delete=models.SET_NULL,
        null=True, blank=True,
    )


class PathNode(models.Model):
    id = models.CharField(primary_key=True, max_length=80)
    venue = models.ForeignKey(Venue, related_name="path_nodes", on_delete=models.CASCADE)
    plan_x = models.FloatField()
    plan_y = models.FloatField()
    location = models.PointField(srid=4326, null=True, blank=True)
    properties = models.JSONField(default=dict, blank=True)


class PathEdge(models.Model):
    id = models.CharField(primary_key=True, max_length=80)
    venue = models.ForeignKey(Venue, related_name="path_edges", on_delete=models.CASCADE)
    from_node = models.ForeignKey(PathNode, related_name="outgoing_edges", on_delete=models.CASCADE)
    to_node = models.ForeignKey(PathNode, related_name="incoming_edges", on_delete=models.CASCADE)
    length_m = models.FloatField(null=True, blank=True)
    direction = models.CharField(max_length=20, default="both")
    accessible = models.BooleanField(default=True)
    closed = models.BooleanField(default=False)
    access_rules = models.JSONField(default=dict, blank=True)


class EventItem(models.Model):
    id = models.CharField(primary_key=True, max_length=80)
    event = models.ForeignKey(Event, related_name="items", on_delete=models.CASCADE)
    kind = models.CharField(max_length=50)
    name = models.CharField(max_length=200)
    plan_x = models.FloatField()
    plan_y = models.FloatField()
    properties = models.JSONField(default=dict, blank=True)


class MapVersion(models.Model):
    id = models.CharField(primary_key=True, max_length=80)
    event = models.ForeignKey(Event, related_name="versions", on_delete=models.CASCADE)
    version = models.PositiveIntegerField()
    snapshot = models.JSONField()
    published_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=("event", "version"), name="unique_event_map_version")]

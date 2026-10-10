from django.contrib.postgres.operations import CreateExtension
from django.db import migrations, models
import django.contrib.gis.db.models.fields
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        CreateExtension("postgis"),
        migrations.CreateModel(name="Venue", fields=[
            ("id", models.CharField(max_length=80, primary_key=True, serialize=False)),
            ("slug", models.SlugField(unique=True)), ("name", models.CharField(max_length=200)),
            ("plan_image_url", models.URLField(blank=True)),
            ("boundary", django.contrib.gis.db.models.fields.GeometryField(blank=True, null=True, srid=4326)),
            ("calibration", models.JSONField(blank=True, default=dict)),
            ("created_at", models.DateTimeField(auto_now_add=True)), ("updated_at", models.DateTimeField(auto_now=True)),
        ]),
        migrations.CreateModel(name="PathNode", fields=[
            ("id", models.CharField(max_length=80, primary_key=True, serialize=False)),
            ("plan_x", models.FloatField()), ("plan_y", models.FloatField()),
            ("location", django.contrib.gis.db.models.fields.PointField(blank=True, null=True, srid=4326)),
            ("venue", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="path_nodes", to="venueflow.venue")),
        ]),
        migrations.CreateModel(name="Event", fields=[
            ("id", models.CharField(max_length=80, primary_key=True, serialize=False)),
            ("title", models.CharField(max_length=200)), ("starts_at", models.DateTimeField(blank=True, null=True)),
            ("ends_at", models.DateTimeField(blank=True, null=True)), ("status", models.CharField(default="draft", max_length=30)),
            ("venue", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="events", to="venueflow.venue")),
        ]),
        migrations.CreateModel(name="MapFeature", fields=[
            ("id", models.CharField(max_length=80, primary_key=True, serialize=False)), ("kind", models.CharField(max_length=50)),
            ("name", models.CharField(max_length=200)), ("plan_x", models.FloatField()), ("plan_y", models.FloatField()),
            ("location", django.contrib.gis.db.models.fields.PointField(blank=True, null=True, srid=4326)),
            ("properties", models.JSONField(blank=True, default=dict)),
            ("venue", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="features", to="venueflow.venue")),
        ]),
        migrations.CreateModel(name="PathEdge", fields=[
            ("id", models.CharField(max_length=80, primary_key=True, serialize=False)), ("length_m", models.FloatField(blank=True, null=True)),
            ("direction", models.CharField(default="both", max_length=20)), ("accessible", models.BooleanField(default=True)),
            ("closed", models.BooleanField(default=False)), ("access_rules", models.JSONField(blank=True, default=dict)),
            ("from_node", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="outgoing_edges", to="venueflow.pathnode")),
            ("to_node", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="incoming_edges", to="venueflow.pathnode")),
            ("venue", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="path_edges", to="venueflow.venue")),
        ]),
        migrations.CreateModel(name="EventItem", fields=[
            ("id", models.CharField(max_length=80, primary_key=True, serialize=False)), ("kind", models.CharField(max_length=50)),
            ("name", models.CharField(max_length=200)), ("plan_x", models.FloatField()), ("plan_y", models.FloatField()),
            ("properties", models.JSONField(blank=True, default=dict)),
            ("event", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="items", to="venueflow.event")),
        ]),
        migrations.CreateModel(name="MapVersion", fields=[
            ("id", models.CharField(max_length=80, primary_key=True, serialize=False)), ("version", models.PositiveIntegerField()),
            ("snapshot", models.JSONField()), ("published_at", models.DateTimeField(auto_now_add=True)),
            ("event", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="versions", to="venueflow.event")),
        ], options={"constraints": [models.UniqueConstraint(fields=("event", "version"), name="unique_event_map_version")]}),
    ]

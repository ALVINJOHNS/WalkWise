from django.core.management.base import BaseCommand

from venueflow.models import Event, MapFeature, PathEdge, PathNode, Venue


class Command(BaseCommand):
    help = "Create or refresh the local demo venue and its connected path graph."

    def handle(self, *args, **options):
        venue, _ = Venue.objects.update_or_create(
            id="venue-kochi-01",
            defaults={"slug": "kochi-expo", "name": "Kochi Community Expo"},
        )
        event, _ = Event.objects.update_or_create(
            id="event-kochi-01",
            defaults={"venue": venue, "title": "Kochi Community Expo", "status": "published"},
        )
        node_rows = [
            ("entrance", .12, .55),
            ("junction", .50, .55),
            ("hall", .82, .30),
            ("stage", .82, .78),
        ]
        nodes = {}
        for node_id, x, y in node_rows:
            nodes[node_id], _ = PathNode.objects.update_or_create(
                id=node_id, defaults={"venue": venue, "plan_x": x, "plan_y": y},
            )
        for edge_id, from_id, to_id in [
            ("path-west", "entrance", "junction"),
            ("path-north", "junction", "hall"),
            ("path-south", "junction", "stage"),
        ]:
            PathEdge.objects.update_or_create(
                id=edge_id,
                defaults={"venue": venue, "from_node": nodes[from_id], "to_node": nodes[to_id]},
            )
        for feature_id, name, kind, x, y in [
            ("food-court", "Food Court", "food", .79, .28),
            ("main-stage", "Main Stage", "stage", .84, .80),
            ("help-desk", "Help Desk", "facility", .20, .50),
        ]:
            MapFeature.objects.update_or_create(
                id=feature_id,
                defaults={"venue": venue, "name": name, "kind": kind, "plan_x": x, "plan_y": y},
            )
        self.stdout.write(self.style.SUCCESS(f"Seeded {venue.name} ({event.title})"))

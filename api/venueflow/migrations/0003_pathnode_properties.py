from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("venueflow", "0002_alter_event_status")]

    operations = [
        migrations.AddField(
            model_name="pathnode",
            name="properties",
            field=models.JSONField(blank=True, default=dict),
        ),
    ]

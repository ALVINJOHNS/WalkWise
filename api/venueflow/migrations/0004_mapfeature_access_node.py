from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("venueflow", "0003_pathnode_properties")]

    operations = [
        migrations.AddField(
            model_name="mapfeature",
            name="access_node",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="accessible_features",
                to="venueflow.pathnode",
            ),
        ),
    ]

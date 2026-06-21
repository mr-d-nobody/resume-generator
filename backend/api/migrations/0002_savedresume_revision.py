from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0001_savedresume"),
    ]

    operations = [
        migrations.AddField(
            model_name="savedresume",
            name="revision",
            field=models.PositiveBigIntegerField(default=1),
        ),
    ]

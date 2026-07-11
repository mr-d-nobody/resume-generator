from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("api", "0002_savedresume_revision")]
    operations = [
        migrations.CreateModel(
            name="RateLimitBucket",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("key", models.CharField(max_length=64, unique=True)),
                ("window_start", models.DateTimeField()),
                ("count", models.PositiveIntegerField(default=0)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
    ]

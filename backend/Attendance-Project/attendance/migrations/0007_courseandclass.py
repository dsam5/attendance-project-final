# Generated by Django 5.0.3 on 2024-07-08 18:09

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('attendance', '0006_coursesession'),
    ]

    operations = [
        migrations.CreateModel(
            name='CourseAndClass',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('class_id', models.ForeignKey(db_column='class_id', on_delete=django.db.models.deletion.CASCADE, to='attendance.class')),
                ('course_code', models.ForeignKey(db_column='course_code', on_delete=django.db.models.deletion.CASCADE, to='attendance.course')),
            ],
            options={
                'db_table': 'course_and_class',
                'unique_together': {('course_code', 'class_id')},
            },
        ),
    ]

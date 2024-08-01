# Generated by Django 5.0.3 on 2024-06-09 11:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('attendance', '0004_alter_faceencoding_student_exam_number'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='attendance',
            unique_together={('attendance_date', 'student_exam_number', 'course_id')},
        ),
        migrations.AddField(
            model_name='attendance',
            name='attended',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='attendance',
            name='attendance_time',
            field=models.TimeField(blank=True, null=True),
        ),
    ]
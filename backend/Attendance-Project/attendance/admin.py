from django.contrib import admin
from .models import Attendance, Class, Course, Student

# Register your models here.

admin.site.register(Attendance)
admin.site.register(Class)
admin.site.register(Course)
admin.site.register(Student)

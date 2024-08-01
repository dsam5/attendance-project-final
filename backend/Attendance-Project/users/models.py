# Create your models here.
from django.db import models
from django.contrib.auth.models import User

# class Student(models.Model):
#     student_exam_number = models.IntegerField(unique=True, primary_key=True)
#     student_number = models.IntegerField()
#     lastname = models.CharField(max_length=50)
#     firstname = models.CharField(max_length=50)
#     class_id = models.CharField(max_length=10)
#     student_year = models.IntegerField()

# class FaceEncoding(models.Model):
#     student = models.OneToOneField(Student, on_delete=models.CASCADE)
#     encoding = models.BinaryField()

#     def __str__(self):
#         return self.student.firstname + ' ' + self.student.lastname

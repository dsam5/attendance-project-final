from django.db import models

# Create your models here.
class Class(models.Model):
    class_id = models.CharField(max_length=15, primary_key=True)
    class_year = models.IntegerField()
    department = models.CharField(max_length=30)
    faculty = models.CharField(max_length=50)
    college = models.CharField(max_length=30)

    class Meta:
        db_table = 'class'  # Explicitly set the table name

    def __str__(self):
        return self.class_id

class Course(models.Model):
    course_id = models.CharField(max_length=10, primary_key=True)
    course_name = models.CharField(max_length=100)
    course_year = models.IntegerField()

    class Meta:
        db_table = 'course'  # Explicitly set the table name

    def __str__(self):
        return self.course_name

class Student(models.Model):
    student_exam_number = models.IntegerField(unique=True, primary_key=True)
    student_number = models.IntegerField()
    lastname = models.CharField(max_length=50)
    firstname = models.CharField(max_length=50)
    class_id = models.ForeignKey(Class, on_delete=models.CASCADE,db_column='class_id')
    student_year = models.IntegerField()

    class Meta:
        db_table = 'student'  # Explicitly set the table name

    def __str__(self):
        return f"{self.firstname} {self.lastname}"


class CourseAndClass(models.Model):
    course_code = models.ForeignKey(Course, on_delete=models.CASCADE, db_column='course_code')
    class_id = models.ForeignKey(Class, on_delete=models.CASCADE, db_column='class_id')

    class Meta:
        db_table = 'course_and_class'  # Explicitly set the table name
        unique_together = (('course_code', 'class_id'),)  # Composite primary key

    def __str__(self):
        return f'{self.course_code} - {self.class_id}'

class FaceEncoding(models.Model):
    student_exam_number = models.OneToOneField(Student, on_delete=models.CASCADE,db_column='student_exam_number')
    encoding = models.TextField()

    class Meta:
        db_table = 'face_encoding'

    def __str__(self):
        return self.student_exam_number + " - "+ encoding


class Attendance(models.Model):
    attendance_date = models.DateField()
    student_exam_number = models.ForeignKey(Student, on_delete=models.CASCADE, db_column='student_exam_number')
    course_id = models.ForeignKey(Course, on_delete=models.CASCADE, db_column='course_id')
    attendance_time = models.TimeField(null=True, blank=True)
    attended = models.BooleanField(default=True)

    class Meta:
        unique_together = ('attendance_date', 'student_exam_number', 'course_id')
        db_table = 'attendance'

    def __str__(self):
        return f"{self.attendance_date} - {self.student_exam_number}"


class CourseSession(models.Model):
    session_date = models.DateField()
    course_id = models.ForeignKey(Course, on_delete=models.CASCADE, db_column='course_id')
    session_time = models.TimeField()

    class Meta:
        unique_together = ('session_date', 'course_id')
        db_table = 'course_session'

    def __str__(self):
        return f"{self.session_date} - {self.course_id}"


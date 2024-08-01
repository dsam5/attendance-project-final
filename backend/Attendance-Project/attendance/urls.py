from django.urls import path
from . import views

urlpatterns = [
    # paths for student info
    path('students/',views.list_all_students),
    path('students/<str:student_exam_number>/', views.get_single_student, name='get_single_student'),
    path('students/delete/<int:student_exam_number>/', views.delete_student, name='delete_student'),
    path('students/add',views.add_student, name='add_student'),

    # paths for classes
    path('classes/', views.get_all_classes, name='get_all_classes'),
    path('classes/<str:class_id>/', views.get_single_class, name='get_single_class'),
    
    path('classes/delete/<str:class_id>/', views.delete_class, name='delete_class'),

    # paths for courses
    path('courses/', views.get_all_courses, name='get_all_courses'),
    path('courses/add/', views.add_course, name='add_course'),
    path('courses/<str:course_id>/', views.get_single_course, name='get_single_course'),
    path('courses/delete/<str:course_id>/', views.delete_course, name='delete_course'),


    path('encode/', views.capture_encoding, name='capture_encoding'),
    path('take-auto/', views.take_attendance, name='take_attendance'),
    path('take-auto-1/', views.take_attendance1, name='take_attendance_1'),
    path('take-manual/', views.take_attendance_manual, name='take_manual_attendance'),


    path('list-all/', views.list_all_attendances, name='list_all_attendances'),
    path('sessions/list-all/', views.list_all_course_sessions, name='list_all_course_sessions'),

    path('list-all-grouped-detailed/', views.list_grouped_attendances, name='list_grouped_attendances_detailed'),
    path('list-course-attendance/<str:course_id>/',views.list_course_attendance, name='list_course_attendance'),
    path('track-student/<str:course_id>/<str:student_exam_number>/', views.track_student_attendance, name='track_student_attendance'),
    path('exam-eligibility/<str:course_id>/', views.check_exam_eligibility,name='check_exam_eligibility'),
    path('exam-eligibility-2/<str:course_id>/', views.check_exam_eligibility2,name='check_exam_eligibility2'),

    path('track-full/<str:course_id>/', views.track_attendance_for_year, name='track_attendance_for_year'),
    # authentication test
    path('protected/',views.protected_view, name="protected-view")
]




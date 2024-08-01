import os
import uuid
import cv2
import numpy as np
import logging
from datetime import datetime
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, Http404
from django.core.files.temp import NamedTemporaryFile
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import User
from .models import Student, Class, Course, Attendance, FaceEncoding, CourseSession, CourseAndClass
import face_recognition
import json

# from django.views.decorators.csrf import csrf_exempt
logger = logging.getLogger(__name__)
# Create your views here.
def index(request):
    return render(request,"take-attendance.html")

#@csrf_exempt   
def process_image(request):
    if request.method == 'POST' and request.FILES.get('imageData'):
        # Get the uploaded image file
        image_file = request.FILES['imageData']
        
        # Define the path to save the image temporarily
        curr_dir = os.path.abspath("attendance")
        temp_image_path = os.path.join('./attendance', image_file.name) 
        # """
        try:
            # Save the image to the temporary directory
            with open(temp_image_path, 'wb') as f:
                for chunk in image_file.chunks():
                    f.write(chunk)

            # Now you can pass this image path to your custom face checking function
            # For example:
            # result = your_custom_face_checking_function(temp_image_path)

            # Delete the temporary image file after processing
            #os.remove(temp_image_path)

            # Returning a JSON response with a success message
            return JsonResponse({'message': 'Image processed successfully.'})

        except Exception as e:
            # If an error occurs, return an error message
            return JsonResponse({'error': str(e)}, status=500)
        # """

    # If request method is not POST or imageData is not provided, return an error message
    return JsonResponse({'error': 'Invalid request.'}, status=400)


# student views
def list_all_students(request):
    try:
        students = list(Student.objects.values())
        return JsonResponse(students, safe=False)
    except:
        return JsonResponse({"msg":"error listing students"})


def get_single_student(request, student_exam_number):
    try:
        student = Student.objects.get(student_exam_number=student_exam_number)
        # class_id = student.class_id
        student_data = {
            'student_exam_number': student.student_exam_number,
            'student_number': student.student_number,
            'firstname': student.firstname,
            'lastname': student.lastname,
            'class':str(student.class_id),
            'year': student.student_year
        }
        print(student.class_id)
        return JsonResponse(student_data)
    except Student.DoesNotExist:
        return JsonResponse({"error":f"student with id {student_exam_number} does not exist"})
        # raise Http404("Student exam number does not exist")


# @csrf_exempt
def delete_student(request, student_exam_number):
    try:
        student = Student.objects.get(student_exam_number=student_exam_number)
        student_exam_number = student.student_exam_number
        student.delete()
        return JsonResponse({'message': f'Student with exam number {student_exam_number} deleted successfully'})
    except Student.DoesNotExist:
        return JsonResponse({"error":"Error deleting student"})
        # raise Http404("Student exam number does not exist")


# add a student
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_student(request):
    if request.method == 'POST':
        student_exam_number = request.POST.get('student_exam_number')
        student_number = request.POST.get('student_number')
        firstname = request.POST.get('firstname')
        lastname = request.POST.get('lastname')
        class_id = request.POST.get('class_id')
        student_year = request.POST.get('student_year')
        image_file = request.FILES.get('image')

        if not (image_file):
            return JsonResponse({"error":"image is required--"},status = 400)
        # Validate required fields
        if not (student_exam_number and student_number and firstname and lastname and class_id and student_year): # and image_file):
            return JsonResponse({'error': 'All fields are required'}, status=400)

        # Check if class exists
        raw_class_id = class_id
        new_class_id = raw_class_id[:-1].upper() + raw_class_id[-1]
        student_class = get_object_or_404(Class, pk=new_class_id)

        # Read the image file to create face encoding using your custom function
        image_path = f'uploads/{image_file.name}'
        with open(image_path, 'wb') as f:
            for chunk in image_file.chunks():
                f.write(chunk)

        face_encoding = get_face_encoding(image_path)

        if face_encoding is None:
            return JsonResponse({'error': 'No face detected in the image'}, status=400)

        # Store student details
        student = Student.objects.create(
            student_exam_number=student_exam_number,
            student_number=student_number,
            firstname=firstname,
            lastname=lastname,
            class_id=student_class,
            student_year=student_year
        )

        encoding_list = face_encoding.tolist()  # Convert numpy array to list
        encoding_json = json.dumps(encoding_list)  # Convert list to JSON string
        # Store face encoding
        face_encoding_instance = FaceEncoding.objects.create(
            student_exam_number=student,
            encoding=encoding_json
        )

        # Clean up the uploaded file
        os.remove(image_path)

        return JsonResponse({
            'student_exam_number': student.student_exam_number,
            'student_number': student.student_number,
            'firstname': student.firstname,
            'lastname': student.lastname,
            'class': student.class_id.class_id,
            'year': student.student_year,
            'encoding': face_encoding_instance.encoding
        }, status=201)

# update a student

# classes views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_classes(request):
    try:
        classes = list(Class.objects.values())
        return JsonResponse(classes, safe=False)
    except:
        return JsonResponse({"msg":"error listing classes"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_single_class(request, class_id):
    try:
        single_class = Class.objects.get(class_id=class_id)
        class_data = {
            'class_id': single_class.class_id,
            'class_year': single_class.class_year,
            'department': single_class.department,
            'faculty': single_class.faculty,
            'college': single_class.college
        }
        return JsonResponse(class_data)
    except Class.DoesNotExist:
        raise Http404("Class does not exist")

# @csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_class(request, class_id):
    if request.method == 'DELETE':
        try:
            single_class = Class.objects.get(class_id=class_id)
            single_class.delete()
            return JsonResponse({'message': f'Class {class_id} deleted successfully'})
        except Class.DoesNotExist:
            raise Http404("Class does not exist")
    else:
        return JsonResponse({'error': 'Invalid HTTP method'}, status=405)

# view functions for adding and updating class may be added 

# course views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_courses(request):
    try:
        courses = list(Course.objects.values())
        return JsonResponse(courses, safe=False)
    except :
        return JsonResponse({"msg":"error obtaining course informationss"})

def get_single_course(request, course_id):
    try:
        course = Course.objects.get(course_id=course_id)
        course_data = {
            'course_id': course.course_id,
            'course_name': course.course_name,
            'course_year': course.course_year
        }
        return JsonResponse(course_data)
    except Course.DoesNotExist:
        raise Http404("Course does not exist")

# @csrf_exempt
def delete_course(request, course_id):
    if request.method == 'DELETE':
        try:
            course = Course.objects.get(course_id=course_id)
            course.delete()
            return JsonResponse({'message': f'Course {course_id} deleted successfully'})
        except Course.DoesNotExist:
            raise Http404("Course does not exist")
    else:
        return JsonResponse({'error': 'Invalid HTTP method'}, status=405)

from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework import status
from .models import Course

@permission_classes([IsAuthenticated])
@api_view(['POST'])
def add_course(request):
    if request.method == 'POST':
        course_id = request.POST.get('course_id')
        course_name = request.POST.get('course_name')
        course_year = request.POST.get('course_year')

        if not course_id or not course_name or not course_year:
            return JsonResponse({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if Course.objects.filter(pk=course_id).exists():
            return JsonResponse({'error': 'Course with this ID already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            course_year = int(course_year)
        except ValueError:
            return JsonResponse({'error': 'Course year must be an integer.'}, status=status.HTTP_400_BAD_REQUEST)

        course = Course(course_id=course_id, course_name=course_name, course_year=course_year)
        course.save()

        return JsonResponse({'message': 'Course added successfully.'}, status=status.HTTP_201_CREATED)

    else:
        return JsonResponse({"error":"Invalid request"},status=400)

# function to obtain face encodings
def get_face_encoding(image):
    
    curr_image = cv2.imread(image)
    image_rgb = cv2.cvtColor(curr_image,cv2.COLOR_BGR2RGB)

    # obtain the encoding
    encoding = face_recognition.face_encodings(image_rgb)

    # convert encoding to numpy array
    # encoding = np.array(encoding)[0]
    
    # add encoding to dictionary
    if len(encoding) > 0 and type(encoding) is not str:
        encoding = np.array(encoding)[0]
        return encoding
    else:
        return "No face from the given image"
    # except:
    #     return "Error while reading image"
    

def capture_encoding(request):
    if request.method == 'POST':
        student_exam_number = request.POST.get('student_exam_number')
        image_file = request.FILES.get('image')

        if not student_exam_number or not image_file:
            return JsonResponse({'error': 'Missing student exam number or image'}, status=400)

        try:
            student = Student.objects.get(student_exam_number=student_exam_number)
        except Student.DoesNotExist:
            return JsonResponse({'error': 'Student not found'}, status=404)

        # Save the image to the uploads directory
        uploads_dir = os.path.join(settings.BASE_DIR, 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)
        unique_filename = f"{uuid.uuid4().hex}.jpg"
        image_path = os.path.join(uploads_dir, unique_filename)

        with open(image_path, 'wb') as f:
            for chunk in image_file.chunks():
                f.write(chunk)

        # Process the image to get face encoding
        encoding = get_face_encoding(image_path)

        if encoding is None:
            return JsonResponse({'error': 'No face detected'}, status=400)

        encoding_list = encoding.tolist()  # Convert numpy array to list
        encoding_json = json.dumps(encoding_list)  # Convert list to JSON string

        # Create or update the face encoding for the student
        face_encoding, created = FaceEncoding.objects.update_or_create(
            student_exam_number=student,
            defaults={'encoding': encoding_json}
        )

        # Optionally clean up the uploaded file
        os.remove(image_path)

        
        return JsonResponse({'message': 'Face encoding captured successfully',
                                'encoding': encoding_json}, status=201)
    else:
        return JsonResponse({'error': 'Invalid HTTP method'}, status=405)

# compares face encodings
def compare_encodings(known_encoding, unknown_encoding, tolerance=0.5):
    return np.linalg.norm(known_encoding - unknown_encoding) <= tolerance


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def take_attendance(request):
    if request.method == 'POST' and request.FILES.get('image'):
        image_file = request.FILES['image']
        course_id = request.POST.get('course_id')
        
        if not course_id or not image_file:
            return JsonResponse({'error': 'Missing course ID or image'}, status=400)

        try:
            course = Course.objects.get(course_id=course_id)
        except Course.DoesNotExist:
            return JsonResponse({'error': 'Course not found'}, status=404)
            
        # Save the image to a temporary file
        image_path = f'uploads/{image_file.name}'
        with open(image_path, 'wb') as f:
            for chunk in image_file.chunks():
                f.write(chunk)

        # get encoding from image
        unknown_encoding = get_face_encoding(image_path)
        os.remove(image_path)
        
        # checks if a face was captured
        if unknown_encoding is None:
            return JsonResponse({'error': 'No face detected'}, status=400)

        # # Process the image for face recognition
        # known_encodings = list(FaceEncoding.objects.values_list('encoding', flat=True))
        # known_encodings = [np.frombuffer(enc, dtype=np.float64) for enc in known_encodings]

        # Retrieve all known encodings
        """
        face_encodings = FaceEncoding.objects.all()
        known_encodings = []

        for face_encoding in face_encodings:
            encoding_str = face_encoding.encoding
            # encoding_list = list(map(float, encoding_str.split(',')))  
            try: 
                encoding_list = list(map(float, encoding_str.strip('[]').split(','))) # Convert string to list of floats
                known_encoding = np.array(encoding_list, dtype=np.float64)
                known_encodings.append(known_encoding)
                print(f"Known encoding for student {face_encoding.student_exam_number}: {known_encoding}")
            except ValueError as e:
                print(f"Error converting encoding: {e}")
                continue
        """
        
        # Check for matches
        # Iterate over stored encodings and compare with current one
        for face_encoding in FaceEncoding.objects.all():
            known_encoding_list = json.loads(face_encoding.encoding)
            known_encoding = np.array(known_encoding_list)

            if compare_encodings(known_encoding, unknown_encoding):

                # student_exam_number = FaceEncoding.objects.get(encoding=known_encoding.tobytes()).student_exam_number
                student_exam_number = face_encoding.student_exam_number.student_exam_number
                student = Student.objects.get(student_exam_number=student_exam_number)
                course = Course.objects.get(course_id=course_id)
                now = datetime.now()
                date_today = now.date()
                time_now = now.time()

                # Ensure the course session exists
                course_session, created = CourseSession.objects.get_or_create(
                    session_date=date_today,
                    course_id=course,
                    defaults={'session_time': time_now}
                )

                # Record the attendance
                attendance, created = Attendance.objects.get_or_create(
                    attendance_date=date_today,
                    student_exam_number=student,
                    course_id=course,
                    defaults={'attendance_time': time_now,'attended':True}
                )

                return JsonResponse({
                    'date': date_today,
                    'student_exam_number': student.student_exam_number,
                    'course_id': course.course_id,
                    'time': time_now
                }, status=200)
        return JsonResponse({'error': 'No match found'}, status=404)
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def take_attendance1(request,):
    if request.method == 'POST' and request.FILES.get('image'):
        image_file = request.FILES['image']
        course_id = request.POST.get('course_id')
        
        if not image_file :
            with open('error.txt', 'w') as f:
                f.write('problem with image')

        if not course_id:
            with open('erro2r.txt', 'w') as f:
                f.write('problem with course_id')

        if not course_id or not image_file:
            return JsonResponse({'error': 'Missing course ID or image'}, status=400)

        course = get_object_or_404(Course, course_id=course_id)

        # Save the image to a temporary file
        image_path = f'uploads/{image_file.name}'
        with open(image_path, 'wb') as f:
            for chunk in image_file.chunks():
                f.write(chunk)

        # Get encoding from image
        unknown_encoding = get_face_encoding(image_path)
        os.remove(image_path)

        if unknown_encoding is None:
            return JsonResponse({'error': 'No face detected'}, status=400)
        
        if type(unknown_encoding) is str:
            return JsonResponse({"error":unknown_encoding},status= 400) 

        # Check for matches
        for face_encoding in FaceEncoding.objects.all():
            known_encoding_list = json.loads(face_encoding.encoding)
            known_encoding = np.array(known_encoding_list)

            if compare_encodings(known_encoding, unknown_encoding):
                student = face_encoding.student_exam_number

                # Check if student's year matches course year
                if student.class_id.class_year != course.course_year:
                    return JsonResponse({
                        'error': f"Student is not in {course.course_year} course year"
                    }, status=400)

                now = datetime.now()
                date_today = now.date()
                time_now = now.time()

                # Ensure the course session exists
                course_session, created = CourseSession.objects.get_or_create(
                    session_date=date_today,
                    course_id=course,
                    defaults={'session_time': time_now}
                )

                # Record the attendance
                attendance, created = Attendance.objects.get_or_create(
                    attendance_date=date_today,
                    student_exam_number=student,
                    course_id=course,
                    defaults={'attendance_time': time_now, 'attended': True}
                )

                return JsonResponse({
                    'date': date_today,
                    'student_exam_number': student.student_exam_number,
                    'student_name': f"{student.firstname} {student.lastname}",
                    'course_id': course.course_id,
                    'time': time_now
                }, status=200)
        return JsonResponse({'error': 'No match found'}, status=404)
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def take_attendance_manual(request):
    if request.method == 'POST':
        student_exam_number = request.POST.get('student_exam_number')
        course_id = request.POST.get('course_id')
        session_date = request.POST.get('session_date')
        session_time = request.POST.get('session_time')

        # Validate required fields
        if not (student_exam_number and course_id and session_date and session_time):
            return JsonResponse({'error': 'Missing required fields'}, status=400)
        
        # Parse session date and time
        try:
            session_date = datetime.strptime(session_date, '%Y-%m-%d').date()
            session_time = datetime.strptime(session_time, '%H:%M:%S.%f').time()
        except ValueError:
            return JsonResponse({'error': 'Invalid date or time format'}, status=400)

        # Get student and course objects
        try:
            student = Student.objects.get(student_exam_number=student_exam_number)
            course = Course.objects.get(course_id=course_id)
        except (Student.DoesNotExist, Course.DoesNotExist):
            return JsonResponse({'error': 'Student or Course not found'}, status=404)

        # Ensure the course session exists
        course_session, created = CourseSession.objects.get_or_create(
            session_date=session_date,
            course_id=course,
            defaults={'session_time': session_time}
        )

        # Create attendance record
        attendance, created = Attendance.objects.get_or_create(
            attendance_date=session_date,
            student_exam_number=student,
            course_id=course,
            defaults={'attendance_time': session_time, 'attended': True}
        )

        if not created:
            # If the record already exists, update the 'attended' field to True
            attendance.attended = True
            attendance.save()
            return JsonResponse({'message': 'Attendance already recorded for this session, updated attendance to True'}, status=200)

        return JsonResponse({
                'message': 'Attendance recorded successfully',
                'student_exam_number': student_exam_number,
                'course_id': course_id,
                'session_date': session_date,
                'session_time': session_time,
                'attended': True
            }, status=201)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


# displaying attendance records

# list all attendances
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_all_attendances(request):
    attendances = Attendance.objects.all()
    attendance_list = []

    for attendance in attendances:
        attendance_list.append({
            'attendance_date': attendance.attendance_date,
            'student_exam_number': attendance.student_exam_number.student_exam_number,
            'course_id': attendance.course_id.course_id,
            'attendance_time': attendance.attendance_time,
            'attended': attendance.attended
        })

    return JsonResponse(attendance_list, safe=False)

# list all course sessions
def list_all_course_sessions(request):
    sessions = CourseSession.objects.all()
    session_list = []

    for session in sessions:
        session_list.append({
            'session_date': session.session_date,
            'course_id': session.course_id.course_id,
            'session_time': session.session_time
        })

    return JsonResponse(session_list, safe=False)


# attendances for all course sessions
def list_grouped_attendances(request):
    # Get all attendances
    attendances = Attendance.objects.select_related('course_id', 'student_exam_number').all()

    grouped_data = {}

    # Group attendances by course and session date/time
    for attendance in attendances:
        course_name = attendance.course_id.course_name
        session_date = attendance.attendance_date
        session_time = attendance.attendance_time
        course_year = attendance.course_id.course_year  # Assuming you have course_year in Course model

        if course_name not in grouped_data:
            grouped_data[course_name] = {}

        session_key = f"{session_date}"

        if session_key not in grouped_data[course_name]:
            grouped_data[course_name][session_key] = {'records': [], 'summary': {}}

        # Add attendance record to the appropriate group
        grouped_data[course_name][session_key]['records'].append({
            'student_exam_number': attendance.student_exam_number.student_exam_number,
            'student_name': f"{attendance.student_exam_number.firstname} {attendance.student_exam_number.lastname}",
            'attendance_time': session_time,
            'attended': attendance.attended
        })

    # Add students who did not attend
    for course_name, sessions in grouped_data.items():
        for session_key, session_data in sessions.items():
            # List of students who attended
            attended_students = [record['student_exam_number'] for record in session_data['records']]

            # Get all students for the same year as the course
            course = Course.objects.get(course_name=course_name)
            students_in_year = Student.objects.filter(class_id__class_year=course.course_year)

            total_students = students_in_year.count()
            attended_count = len(attended_students)
            not_attended_count = total_students - attended_count

            # Find students who did not attend
            for student in students_in_year:
                if student.student_exam_number not in attended_students:
                    session_data['records'].append({
                        'student_exam_number': student.student_exam_number,
                        'student_name': f"{student.firstname} {student.lastname}",
                        'attended': False
                    })

            # Add summary
            session_data['summary'] = {
                'total_students': total_students,
                'attended': attended_count,
                'not_attended': not_attended_count
            }

    return JsonResponse(grouped_data, safe=False)

# check attendance by course
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_course_attendance(request, course_id):
    try:
        course = Course.objects.get(pk=course_id)
    except Course.DoesNotExist:
        return JsonResponse({'error': 'Course does not exist'}, status=404)

    # Get all attendances for the given course
    attendances = Attendance.objects.filter(course_id=course).select_related('student_exam_number')

    grouped_data = {}

    # Group attendances by session date/time
    for attendance in attendances:
        session_date = attendance.attendance_date
        session_time = attendance.attendance_time

        session_key = f"{session_date}"

        if session_key not in grouped_data:
            grouped_data[session_key] = {'records': [], 'summary': {}}

        # Add attendance record to the appropriate group
        grouped_data[session_key]['records'].append({
            'student_exam_number': attendance.student_exam_number.student_exam_number,
            'student_name': f"{attendance.student_exam_number.firstname} {attendance.student_exam_number.lastname}",
            'attendance_time': session_time,
            'attended': attendance.attended
        })

    # Add students who did not attend and summary
    for session_key, session_data in grouped_data.items():
        attended_students = [record['student_exam_number'] for record in session_data['records']]
        
        students_in_year = Student.objects.filter(class_id__class_year=course.course_year)

        total_students = students_in_year.count()
        attended_count = len(attended_students)
        not_attended_count = total_students - attended_count

        # Find students who did not attend
        for student in students_in_year:
            if student.student_exam_number not in attended_students:
                session_data['records'].append({
                    'student_exam_number': student.student_exam_number,
                    'student_name': f"{student.firstname} {student.lastname}",
                    'attended': False
                })

        # Add summary
        session_data['summary'] = {
            'total_students': total_students,
            'attended': attended_count,
            'not_attended': not_attended_count
        }

    return JsonResponse(grouped_data, safe=False)

# track attendance by course and student exam number
def track_student_attendance(request, course_id, student_exam_number):
    # Check if course exists
    try:
        course = Course.objects.get(pk=course_id)
    except Course.DoesNotExist:
        return JsonResponse({'error': 'Course not found'}, status=404)

    # Check if student exists
    try:
        student = Student.objects.get(student_exam_number=student_exam_number)
    except Student.DoesNotExist:
        return JsonResponse({'error': 'Student not found'}, status=404)

    # Get all the dates for the course
    course_sessions = CourseSession.objects.filter(course_id=course_id)
    all_dates = [session.session_date.strftime('%Y-%m-%d') for session in course_sessions]

    # Get attendance records for the specified student and course
    attendances = Attendance.objects.filter(course_id=course, student_exam_number=student)

    # Create a dictionary of the student's attendance
    student_attendance = {attendance.attendance_date.strftime('%Y-%m-%d'): "attended" if attendance.attended else "not attended" for attendance in attendances}

    # Create the response data
    attendance_data = {}
    for date in all_dates:
        attendance_data[date] = student_attendance.get(date, "not attended")

    return JsonResponse(attendance_data, safe=False)


# this one is the final one to be implemented
def check_exam_eligibility(request, course_id):
    course = get_object_or_404(Course, course_id=course_id)

    # Get the class_ids associated with the course
    class_ids = CourseAndClass.objects.filter(course_code=course).values_list('class_id', flat=True)
    
    if not class_ids:
        return JsonResponse({'error': 'No classes found for the given course'}, status=404)
    
    # Get the students in the classes associated with the course
    students_in_course = Student.objects.filter(class_id__in=class_ids)
    
    eligibility_data = {
        'course_id': course_id,
        'course_name': course.course_name,
        'students': []
    }
    
    for student in students_in_course:
        # Count the number of missed sessions for the student in the course
        missed_sessions_count = Attendance.objects.filter(
            student_exam_number=student,
            course_id=course,
            attended=False
        ).count()
        
        can_write_exam = missed_sessions_count < 3
        
        eligibility_data['students'].append({
            'student_exam_number': student.student_exam_number,
            'student_name': f"{student.firstname} {student.lastname}",
            'missed_sessions': missed_sessions_count,
            'can_write_exam': can_write_exam
        })
    
    return JsonResponse(eligibility_data, safe=False)


# a make shift exam eligiility check
def check_exam_eligibility2(request, course_id):
    course = get_object_or_404(Course, course_id=course_id)
    
    # Get the classes associated with the course year
    classes = Class.objects.filter(class_year=course.course_year)
    
    if not classes:
        return JsonResponse({'error': 'No classes found for the given course year'}, status=404)
    
    # Get the students in the classes associated with the course year
    students_in_classes = Student.objects.filter(class_id__in=classes)
    
    eligibility_data = {
        'course_id': course_id,
        'course_name': course.course_name,
        'students': []
    }
    
    for student in students_in_classes:
        # Count the number of missed sessions for the student in the course
        missed_sessions_count = Attendance.objects.filter(
            student_exam_number=student,
            course_id=course,
            attended=False
        ).count()
        
        can_write_exam = missed_sessions_count < 3
        
        eligibility_data['students'].append({
            'student_exam_number': student.student_exam_number,
            'student_name': f"{student.firstname} {student.lastname}",
            'missed_sessions': missed_sessions_count,
            'can_write_exam': can_write_exam
        })
    
    return JsonResponse(eligibility_data, safe=False)

# track all students attendances for all sessions
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def track_attendance_for_year(request, course_id):
    # Check if course exists
    try:
        course = Course.objects.get(pk=course_id)
    except Course.DoesNotExist:
        return JsonResponse({'error': 'Course not found'}, status=404)

    # Get the course year
    course_year = course.course_year

    # Get all students in the same year as the course year
    students = Student.objects.filter(student_year=course_year)

    # Get all the dates for the course sessions
    course_sessions = CourseSession.objects.filter(course_id=course_id)
    all_dates = [session.session_date.strftime('%Y-%m-%d') for session in course_sessions]

    # Initialize the response data
    response_data = {
        'course_id': course.course_id,
        'course_name': course.course_name,
        'records': []
    }

    # Iterate over each student to collect attendance data
    for student in students:
        student_record = {
            'student_exam_number': student.student_exam_number,
            'student_name': f'{student.lastname} {student.firstname}',
            'sessions': {},
            'summary': {
                'total_attended': 0,
                'total_missed': 0
            }
        }

        # Get attendance records for the student and course
        attendances = Attendance.objects.filter(course_id=course, student_exam_number=student)
        student_attendance = {attendance.attendance_date.strftime('%Y-%m-%d'): "attended" if attendance.attended else "not attended" for attendance in attendances}

        # Fill the attendance data for each date
        for date in all_dates:
            attendance_status = student_attendance.get(date, "not attended")
            student_record['sessions'][date] = attendance_status
            if attendance_status == "attended":
                student_record['summary']['total_attended'] += 1
            else:
                student_record['summary']['total_missed'] += 1

        response_data['records'].append(student_record)

    return JsonResponse(response_data, safe=False)
 


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return JsonResponse({"message": "This is a protected view!"},status = 200)


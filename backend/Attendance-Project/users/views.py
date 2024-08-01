from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required

import face_recognition
# from .models import FaceEncoding, Student
# from .forms import FaceEncodingForm

def login_view(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('dashboard')
        else:
            return render(request, 'login.html', {'error': 'Invalid credentials'})
    return render(request, 'login.html')

def logout_view(request):
    logout(request)
    return redirect('login')

@login_required
def dashboard_view(request):
    return render(request, 'dashboard.html')

"""
def capture_face(request):
    if request.method == 'POST':
        form = FaceEncodingForm(request.POST, request.FILES)
        if form.is_valid():
            student = form.save(commit=False)
            student.save()

            # Capture and encode face
            image = face_recognition.load_image_file(request.FILES['face_image'])
            face_encodings = face_recognition.face_encodings(image)

            if face_encodings:
                encoding = face_encodings[0]
                face_encoding = FaceEncoding(student=student, encoding=encoding.tobytes())
                face_encoding.save()
                return redirect('dashboard')
            else:
                return render(request, 'capture_face.html', {'form': form, 'error': 'No face detected'})
    else:
        form = FaceEncodingForm()
    return render(request, 'capture_face.html', {'form': form})
"""

from django.http import JsonResponse
import base64
import numpy as np
"""
def check_in(request):
    if request.method == 'POST':
        image_data = request.FILES['face_image'].read()
        image = face_recognition.load_image_file(image_data)
        face_encodings = face_recognition.face_encodings(image)

        if face_encodings:
            encoding = face_encodings[0]
            students = FaceEncoding.objects.all()
            for student in students:
                stored_encoding = np.frombuffer(student.encoding, dtype=np.float64)
                matches = face_recognition.compare_faces([stored_encoding], encoding)
                if matches[0]:
                    # Record attendance
                    # Save the attendance record in the Attendance model
                    return JsonResponse({'status': 'success', 'message': 'Check-in successful'})
            return JsonResponse({'status': 'failure', 'message': 'Face not recognized'})
        else:
            return JsonResponse({'status': 'failure', 'message': 'No face detected'})
    return JsonResponse({'status': 'failure', 'message': 'Invalid request'})
"""
import os
import uuid
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .models import FaceEncoding, Student

@csrf_exempt
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
        encoding = face_recognition_function(image_path)

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

        return JsonResponse({'message': 'Face encoding captured successfully'}, status=201)
    else:
        return JsonResponse({'error': 'Invalid HTTP method'}, status=405)

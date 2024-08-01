from django.core.mail import send_mail, EmailMessage
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from django.conf import settings
from django.shortcuts import redirect
from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import serializers
from django.contrib.auth.models import User

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            is_active=False  # User is not active until email is verified
        )
        user.set_password(validated_data['password'])
        user.save()

        # Send verification email
        current_site = get_current_site(self.context['request'])
        mail_subject = 'Activate your account.'
        message = f"""
        Hello {user.first_name} {user.last_name},
        
        Thank you for registering. Please click the link below to activate your account:

        http://{current_site.domain}/auth/activate/{urlsafe_base64_encode(force_bytes(user.pk))}/{default_token_generator.make_token(user)}/

        If you did not request this, please ignore this email.

        Regards,
        the myAttendance Website Team
        """
        to_email = validated_data['email']
        email = EmailMessage(mail_subject, message, to=[to_email])
        email.send()

        return user

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

def activate(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except(TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return  render(request, 'app_auth/activation_confirmation.html')
    else:
        return HttpResponse('Activation link is invalid!')

class CustomTokenObtainPairView(TokenObtainPairView):
    pass

class CustomTokenRefreshView(TokenRefreshView):
    pass

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email')

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)


from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.cache import cache

RESET_CODE_TIMEOUT = 10 * 60  # 10 minutes

@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset_code(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'User with this email does not exist.'}, status=status.HTTP_404_NOT_FOUND)

    reset_code = get_random_string(length=4, allowed_chars='0123456789')
    cache.set(f'reset_code_{user.id}', reset_code, timeout=RESET_CODE_TIMEOUT)

    # Send email
    send_mail(
        'Password Reset Code',
        f'Your password reset code is {reset_code}. It is valid for 10 minutes.',
        settings.EMAIL_HOST_USER,
        [email],
        fail_silently=False,
    )

    return Response({'message': 'Password reset code sent to your email.'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_reset_code(request):
    email = request.data.get('email')
    reset_code = request.data.get('reset_code')
    if not email or not reset_code:
        return Response({'error': 'Email and reset code are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'User with this email does not exist.'}, status=status.HTTP_404_NOT_FOUND)

    cached_reset_code = cache.get(f'reset_code_{user.id}')
    if cached_reset_code is None or cached_reset_code != reset_code:
        return Response({'error': 'Invalid or expired reset code.'}, status=status.HTTP_400_BAD_REQUEST)

    # Reset code is valid
    return Response({'message': 'Reset code verified.'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    email = request.data.get('email')
    reset_code = request.data.get('reset_code')
    new_password = request.data.get('new_password')
    new_password2 = request.data.get('new_password2')
    if not email or not reset_code or not new_password or not new_password2:
        return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if new_password != new_password2:
        return Response({'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'User with this email does not exist.'}, status=status.HTTP_404_NOT_FOUND)

    cached_reset_code = cache.get(f'reset_code_{user.id}')
    if cached_reset_code is None or cached_reset_code != reset_code:
        return Response({'error': 'Invalid or expired reset code.'}, status=status.HTTP_400_BAD_REQUEST)

    # Update the user's password
    user.set_password(new_password)
    user.save()

    # Clear the reset code from cache
    cache.delete(f'reset_code_{user.id}')

     # Send confirmation email
    send_mail(
        'Password Reset Successful',
        'Your password has been reset successfully. You can now log in with your new password.',
        settings.EMAIL_HOST_USER,
        [email],
        fail_silently=False,
    )

    return Response({'message': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)


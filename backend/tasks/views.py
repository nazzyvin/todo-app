from rest_framework import viewsets, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.shortcuts import render
from .models import List, Task
from .serializers import ListSerializer, TaskSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'username and password required'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if not user:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key})


class ListViewSet(viewsets.ModelViewSet):
    serializer_class = ListSerializer

    def get_queryset(self):
        return List.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer

    def get_queryset(self):
        queryset = Task.objects.filter(
            task_list__user=self.request.user
        )

        list_id = self.request.query_params.get('list_id')

        if list_id:
            queryset = queryset.filter(task_list=list_id)

        return queryset

    def perform_create(self, serializer):
        task_list = serializer.validated_data['task_list']

        if task_list.user != self.request.user:
            raise PermissionDenied(
                "You cannot add tasks to another user's list."
            )

        serializer.save()


@api_view(['PATCH'])
def update_user(request):
    user = request.user

    new_username = request.data.get('username')
    current_password = request.data.get('password')
    new_password = request.data.get('new_password')

    if new_username:
        if User.objects.filter(username=new_username).exclude(pk=user.pk).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        user.username = new_username
        user.save()
        return Response({'message': 'Username updated'})

    if current_password and new_password:
        if not user.check_password(current_password):
            return Response({'error': 'Invalid password'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        Token.objects.filter(user=user).delete()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'message': 'Password updated', 'token': token.key})

    return Response({'error': 'No valid fields provided'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def delete_user(request):
    user = request.user
    user.delete()
    return Response({'message': 'Account deleted'}, status=status.HTTP_204_NO_CONTENT)


def home(request):
    return render(request, "index.html")


def login_page(request):
    return render(request, "login.html")


def settings_page(request):
    return render(request, "settings.html")

def dashboard_page(request):
    return render(request, "dashboard.html")
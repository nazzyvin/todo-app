from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import ListViewSet, TaskViewSet, register, login, update_user, delete_user

router = DefaultRouter()
router.register(r'lists', ListViewSet, basename='list')
router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('auth/update/', update_user, name='update_user'),
    path('auth/delete/', delete_user, name='delete_user'),
] + router.urls

"""
```
`DefaultRouter` automatically generates all the URL patterns for your viewsets. Registering `ListViewSet` under `lists` gives you endpoints like:
```
GET    /lists/         → all lists
POST   /lists/         → create a list
GET    /lists/{id}/    → single list (with nested tasks)
PUT    /lists/{id}/    → update a list
DELETE /lists/{id}/    → delete a list

"""

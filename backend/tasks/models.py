from django.db import models
from django.contrib.auth.models import User

class List(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lists')
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.name


class Task(models.Model):
    task_list = models.ForeignKey(List, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title

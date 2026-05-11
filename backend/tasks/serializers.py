from rest_framework import serializers
from .models import List, Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'completed', 'created_at', 'updated_at', 'due_date', 'task_list']
        read_only_fields = ['created_at', 'updated_at']


class ListSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = List
        fields = ['id', 'name', 'category', 'tasks']
    
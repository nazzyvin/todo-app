from django.contrib import admin
from .models import List, Task


class TaskInline(admin.TabularInline):
    model = Task
    extra = 1


@admin.register(List)
class ListAdmin(admin.ModelAdmin):
    list_display = ['name', 'category']
    search_fields = ['name']
    inlines = [TaskInline]


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'task_list', 'completed', 'due_date', 'created_at']
    list_filter = ['completed', 'task_list']
    search_fields = ['title']

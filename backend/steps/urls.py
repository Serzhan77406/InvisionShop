from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StepViewSet

router = DefaultRouter()
# Убираем лишний 'steps', так как префикс "api/steps/" уже задан в главном urls.py
router.register(r'', StepViewSet, basename='steps')

urlpatterns = [
    path('', include(router.urls)),
]
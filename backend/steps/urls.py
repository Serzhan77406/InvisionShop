from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StepViewSet

router = DefaultRouter()
router.register(r'steps', StepViewSet, basename='step')

urlpatterns = [
    path('', include(router.urls)),
]

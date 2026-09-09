from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    PropertyObjectViewSet,
    ProjectAssignmentViewSet,
)


router = DefaultRouter()

router.register(
    r'objects',
    PropertyObjectViewSet,
    basename='propertyobject'
)

router.register(
    r'project-assignments',
    ProjectAssignmentViewSet,
    basename='projectassignment'
)


urlpatterns = [
    path('', include(router.urls)),
]
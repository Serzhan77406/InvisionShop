from django.urls import path
from .views import StepListAPIView, StepDetailAPIView

urlpatterns = [
    path('', StepListAPIView.as_view(), name='api_step_list'),
    path('<int:pk>/', StepDetailAPIView.as_view(), name='api_step_detail'),    
]
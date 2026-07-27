# from django.shortcuts import render

from rest_framework.generics import ListAPIView, RetrieveAPIView
from .models import Step
from .serializers import StepSerializer

class StepListAPIView(ListAPIView):
    queryset = Step.objects.all()
    serializer_class = StepSerializer
     


class StepDetailAPIView(RetrieveAPIView):
    queryset = Step.objects.all()
    serializer_class = StepSerializer




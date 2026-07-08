from django.contrib import admin
from django.urls import path, include
from .views import BookListAPIView

urlpatterns = [
    path('books/', BookListAPIView.as_view(), name='api_books')
]

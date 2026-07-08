from django.shortcuts import render, redirect
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import BookModelSerializer
from .models import Book

class BookListAPIView(APIView):
    def get(self, request):
        books = Book.objects.all()
        serializer = BookModelSerializer(books, many=True)
        return Response(serializer.data)

    def post(self, request):
        pass

   
 
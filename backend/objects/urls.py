from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyObjectViewSet

# Создаем роутер и регистрируем наш ViewSet
router = DefaultRouter()
router.register(r'objects', PropertyObjectViewSet, basename='propertyobject')

urlpatterns = [
    # Все эндпоинты (список, создание, удаление) подключаются одной строкой
    path('', include(router.urls)),
]

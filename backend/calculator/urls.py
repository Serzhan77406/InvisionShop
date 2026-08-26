from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TariffViewSet, CalculatePriceAPIView

router = DefaultRouter()
router.register(r'tariffs', TariffViewSet, basename='tariff')

urlpatterns = [
    # Подключает роутер тарифов (GET /api/calculator/tariffs/)
    path('', include(router.urls)),
    
    # Эндпоинт расчета (POST /api/calculator/calculate/)
    path('calculate/', CalculatePriceAPIView.as_view(), name='calculate_price'),
]

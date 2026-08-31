from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet

router = DefaultRouter()
# Оставляем пустую строку '', чтобы роутер не добавлял лишний префикс 'orders/'
router.register(r'', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]
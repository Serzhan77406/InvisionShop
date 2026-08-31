from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from .models import Tariff
from rest_framework import serializers

# Простой сериализатор для тарифов
class TariffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tariff
        fields = ['id', 'service_name', 'price_per_m2', 'is_active']

# 1. API: GET /api/calculator/tariffs/ (Открыт для всех, чтобы фронтенд мог их показать)
class TariffViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tariff.objects.filter(is_active=True)
    serializer_class = TariffSerializer
    permission_classes = [AllowAny]
    pagination_class = None  # <-- ДОБАВЬТЕ ЭТУ СТРОКУ

# 2. API: POST /api/calculator/calculate/
class CalculatePriceAPIView(APIView):
    permission_classes = [AllowAny] # Доступен даже неавторизованным гостям

    def post(self, request):
        area = request.data.get('area')
        service_ids = request.data.get('services', [])

        # Валидация входных данных
        if not area:
            return Response({"error": "Укажите площадь 'area'."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            area = float(area)
            if area <= 0:
                raise ValueError
        except ValueError:
            return Response({"error": "Площадь должна быть числом больше нуля."}, status=status.HTTP_400_BAD_REQUEST)

        # Выбираем указанные активные услуги из базы данных
        tariffs = Tariff.objects.filter(id__in=service_ids, is_active=True)
        
        breakdown = []
        total_price = 0.0

        # Математический расчет стоимости для каждой выбранной услуги
        for tariff in tariffs:
            # Считаем стоимость для данной услуги (площадь * цена за м2)
            service_cost = float(tariff.price_per_m2) * area
            total_price += service_cost
            
            breakdown.append({
                "service_id": tariff.id,
                "service_name": tariff.service_name,
                "price_per_m2": float(tariff.price_per_m2),
                "cost": round(service_cost, 2)
            })

        # Возвращаем структурированный JSON ответ для фронтенда
        return Response({
            "area": area,
            "breakdown": breakdown,
            "total": round(total_price, 2)
        }, status=status.HTTP_200_OK)


# Create your views here.

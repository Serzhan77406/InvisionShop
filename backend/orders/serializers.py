from rest_framework import serializers
from .models import Order, Appointment
from objects.models import PropertyObject


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'


class RequestMeetingSerializer(serializers.Serializer):
    """Сериализатор для создания Заявки на вызов инженера из одной формы"""
    address = serializers.CharField(write_only=True)
    area = serializers.DecimalField(max_digits=8, decimal_places=2, required=False, write_only=True)
    scheduled_date = serializers.DateField(write_only=True)
    time_slot = serializers.CharField(max_length=10, write_only=True)
    notes = serializers.CharField(required=False, allow_blank=True, write_only=True)
    
    # Необязательные расчетные данные
    estimated_price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, write_only=True)

    def create(self, validated_data):
        user = validated_data['user']
        
        # 1. Создаем или находим объект недвижимости по адресу
        property_object, _ = PropertyObject.objects.get_or_create(
            user=user,
            address=validated_data['address'],
            defaults={'area': validated_data.get('area', 0)}
        )

        # 2. Создаем Заказ (Order)
        order = Order.objects.create(
            user=user,
            property_object=property_object,
            status=Order.Statuses.MEETING_REQUESTED,
            estimated_price=validated_data.get('estimated_price')
        )

        # 3. Создаем встречу с инженером (Appointment)
        Appointment.objects.create(
            order=order,
            scheduled_date=validated_data['scheduled_date'],
            time_slot=validated_data['time_slot'],
            address=validated_data['address'],
            notes=validated_data.get('notes', '')
        )

        return order

    def to_representation(self, instance):
        # Отдаем полный сериализованный Order в ответе
        return OrderSerializer(instance).data
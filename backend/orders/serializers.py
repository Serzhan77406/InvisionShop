from rest_framework import serializers
from .models import Order, Appointment
from objects.serializers import PropertyObjectSerializer

# ДОБАВЛЕНО: Сериализатор встреч, который искал Django
class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['id', 'scheduled_date', 'time_slot', 'address', 'status', 'notes']

class OrderSerializer(serializers.ModelSerializer):
    property_object = PropertyObjectSerializer(read_only=True)
    user = serializers.ReadOnlyField(source='user.username')
    assigned_expert = serializers.ReadOnlyField(source='assigned_expert.username')
    
    # Связываем встречи с заказом
    appointments = AppointmentSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'property_object', 'status', 'status_display', 
            'estimated_price', 'final_price', 'contract_number', 
            'assigned_expert', 'current_step', 'appointments', 'created_at'
        ]

class RequestMeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['property_object', 'estimated_price']

    def create(self, validated_data):
        validated_data['status'] = Order.Statuses.MEETING_REQUESTED
        return super().create(validated_data)

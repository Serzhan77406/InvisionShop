
from rest_framework import serializers

from .models import Order, Appointment
from objects.serializers import PropertyObjectSerializer
from objects.models import PropertyObject


# ============================================================================
# СЕРИАЛИЗАТОР ВЫЕЗДА / ОСМОТРА
# ============================================================================

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment

        fields = [
            'id',
            'order',
            'scheduled_date',
            'time_slot',
            'address',
            'status',
            'notes',
        ]

        read_only_fields = [
            'id',
            'order',
            'status',
        ]


# ============================================================================
# СЕРИАЛИЗАТОР ЗАЯВКИ
# ============================================================================

class OrderSerializer(serializers.ModelSerializer):

    property_object = PropertyObjectSerializer(
        read_only=True
    )

    user = serializers.ReadOnlyField(
        source='user.username'
    )

    assigned_expert = serializers.ReadOnlyField(
        source='assigned_expert.username'
    )

    # Выезды / осмотры по заявке
    appointments = AppointmentSerializer(
        many=True,
        read_only=True
    )

    # Отображаем человекочитаемый статус
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )

    class Meta:
        model = Order

        fields = [
            'id',
            'user',
            'property_object',

            'status',
            'status_display',

            'estimated_price',
            'final_price',
            'contract_number',

            'assigned_expert',

            'current_step',
            'requested_step',

            'appointments',

            'created_at',
        ]

        read_only_fields = [
            'id',
            'user',
            'property_object',
            'status_display',
            'final_price',
            'contract_number',
            'assigned_expert',
            'current_step',
            'appointments',
            'created_at',
        ]


# ============================================================================
# СЕРИАЛИЗАТОР СОЗДАНИЯ ЗАЯВКИ КЛИЕНТОМ
# ============================================================================

class RequestMeetingSerializer(serializers.ModelSerializer):

    property_object = serializers.PrimaryKeyRelatedField(
        queryset=PropertyObject.objects.all(),
        required=False,
        allow_null=True
    )

    # Этап, который клиент хочет получить
    requested_step = serializers.IntegerField(
        min_value=1,
        max_value=7,
        required=True
    )

    class Meta:
        model = Order

        fields = [
            'property_object',
            'estimated_price',
            'requested_step',
        ]

    def create(self, validated_data):
        validated_data['status'] = (
            Order.Statuses.MEETING_REQUESTED
        )

        # Начинаем выполнение с первого этапа,
        # если клиент запросил конкретный этап.
        #
        # Сам requested_step хранится отдельно.
        validated_data.setdefault(
            'current_step',
            1
        )

        return super().create(
            validated_data
        )


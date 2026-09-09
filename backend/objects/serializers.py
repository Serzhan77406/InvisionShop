from rest_framework import serializers

from .models import PropertyObject, ProjectAssignment


class PropertyObjectSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    user_role = serializers.ReadOnlyField(source='user.role')
    property_type_display = serializers.CharField(
        source='get_property_type_display',
        read_only=True
    )

    class Meta:
        model = PropertyObject
        fields = [
            'id',
            'user',
            'user_role',
            'property_type',
            'property_type_display',
            'region',
            'address',
            'area',
        ]


class ProjectAssignmentSerializer(serializers.ModelSerializer):
    property_object_detail = PropertyObjectSerializer(
        source='property_object',
        read_only=True
    )

    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )

    construction_type_display = serializers.CharField(
        source='get_construction_type_display',
        read_only=True
    )

    design_stage_display = serializers.CharField(
        source='get_design_stage_display',
        read_only=True
    )

    class Meta:
        model = ProjectAssignment
        fields = [
            'id',

            # Связь с объектом
            'property_object',
            'property_object_detail',

            # Статус
            'status',
            'status_display',

            # 1. Общие сведения
            'object_name',
            'customer_name',
            'designer_name',

            # 2. Местоположение
            'location',

            # 3. Основание
            'design_basis',

            # 4. Назначение
            'purpose',

            # 5. Вид работ
            'construction_type',
            'construction_type_display',

            # 6. ТЭП
            'total_area',
            'building_area',
            'floors',
            'rooms',

            # Стадийность
            'design_stage',
            'design_stage_display',
            'alternative_design',

            # 7. Архитектура
            'architectural_requirements',

            # 8. Конструкции
            'structural_requirements',

            # 9. Инженерия
            'engineering_requirements',

            # 10. Благоустройство
            'landscaping_requirements',

            # 11. Безопасность
            'safety_requirements',

            # 12. Требования заказчика
            'customer_requirements',
            'special_conditions',

            # 13. Сроки
            'design_start_date',
            'design_end_date',

            # 14. Подписи
            'customer_signature',
            'designer_signature',

            # Служебные
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'status',
            'created_at',
            'updated_at',
        ]

    def validate_property_object(self, value):
        request = self.context.get('request')

        if request and request.user.is_authenticated:
            user = request.user

            # Клиент может создать задание только
            # для собственного объекта
            if user.role == user.Roles.CLIENT:
                if value.user_id != user.id:
                    raise serializers.ValidationError(
                        'Вы можете создать задание только для своего объекта.'
                    )

        return value

    def validate(self, attrs):
        request = self.context.get('request')

        if request and request.user.is_authenticated:
            user = request.user

            # Проверяем, что у объекта ещё нет задания.
            property_object = attrs.get('property_object')

            if property_object:
                existing = ProjectAssignment.objects.filter(
                    property_object=property_object
                )

                if self.instance:
                    existing = existing.exclude(
                        pk=self.instance.pk
                    )

                if existing.exists():
                    raise serializers.ValidationError({
                        'property_object':
                            'Для этого объекта уже существует задание на проектирование.'
                    })

        return attrs
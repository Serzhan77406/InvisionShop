from rest_framework import serializers
from .models import Step

class StepSerializer(serializers.ModelSerializer):
    # Делаем пользователя доступным только для чтения и выводим его username
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Step
        # Вместо '__all__' явно перечисляем поля, чтобы контролировать структуру JSON
        fields = ['id', 'user', 'title', 'is_completed']

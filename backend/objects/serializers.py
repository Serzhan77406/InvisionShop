from rest_framework import serializers
from .models import PropertyObject

class PropertyObjectSerializer(serializers.ModelSerializer):
    user = serializers. ReadOnlyField(source='user.username')

    class Meta:
        model = PropertyObject
        fields = ['id', 'user', 'property_type', 'region', 'address', 'area']


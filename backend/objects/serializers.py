from rest_framework import serializers
from .models import PropertyObject

class PropertyObjectSerializer(serializers.ModelSerializer):
    user = serializers. ReadOnlyField(source='user.username')
    user_role = serializers.ReadOnlyField(source='user.role')
    property_type_display = serializers.CharField(source='get_property_type_display', read_only=True)

    class Meta:
        model = PropertyObject
        fields = ['id', 'user', 'user_role', 'property_type', 'property_type_display', 'region', 'address', 'area']


from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import PropertyObject
from .serializers import PropertyObjectSerializer

class PropertyObjectViewSet(ModelViewSet):
    queryset = PropertyObject.objects.all()
    serializer_class = PropertyObjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # GET /api/objects/ — вернет только объекты текущего пользователя
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        # POST /api/objects/ — автоматически привяжет текущего пользователя
        serializer.save(user=self.request.user)

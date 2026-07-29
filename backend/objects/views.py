from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import PropertyObject
from .serializers import PropertyObjectSerializer

class PropertyObjectViewSet(ModelViewSet):
    queryset = PropertyObject.objects.all()
    serializer_class = PropertyObjectSerializer
    permission_classes = [IsAuthenticated]

    # def get_queryset(self):
    #     # GET /api/objects/ — вернет только объекты текущего пользователя
    #     return self.queryset.filter(user=self.request.user)
    #     if user.role in [user.Roles.EXPERT, user.Roles.ADMIN]:
    #          return PropertyObject.objects.all()

    # def perform_create(self, serializer):
    #     # POST /api/objects/ — автоматически привяжет текущего пользователя
    #     serializer.save(user=self.request.user)
    def get_queryset(self):
        user = self.request.user
        
        # Если запрашивает Эксперт или Админ — отдаем абсолютно все объекты из базы
        if user.role in [user.Roles.EXPERT, user.Roles.ADMIN]:
            return PropertyObject.objects.all()
            
        # Если запрашивает обычный Клиент — отдаем только его личные таунхаусы
        return PropertyObject.objects.filter(user=user)

    def perform_create(self, serializer):
        # При создании (POST) принудительно записываем текущего пользователя как владельца
        serializer.save(user=self.request.user)

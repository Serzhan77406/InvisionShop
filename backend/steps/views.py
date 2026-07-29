from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import Step
from .serializers import StepSerializer

class StepViewSet(ModelViewSet):
    queryset = Step.objects.all()
    serializer_class = StepSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Эксперты и админы видят шаги всех пользователей
        if user.role in [user.Roles.EXPERT, user.Roles.ADMIN]:
            return Step.objects.all()
            
        # Обычные клиенты видят только свои шаги
        return Step.objects.filter(user=user)

    def perform_create(self, serializer):
        # Ограничение: обычный клиент не может сам себе создавать шаги сделки
        if self.request.user.role == self.request.user.Roles.CLIENT:
            raise PermissionDenied("Клиенты не могут создавать шаги сделки.")
            
        # Нам нужно передать, какому именно пользователю эксперт создает этот шаг.
        # Для этого в POST запросе эксперт пришлет client_id.
        client_id = self.request.data.get('client_id')
        if not client_id:
            raise PermissionDenied("Необходимо указать client_id для привязки шага.")
            
        serializer.save(user_id=client_id)




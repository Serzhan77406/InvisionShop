from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny
from .models import Step
from .serializers import StepSerializer

class StepViewSet(ModelViewSet):
    queryset = Step.objects.all()
    serializer_class = StepSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user

        # Если пользователь вошел в систему и у него есть роль
        if user.is_authenticated:
            user_role = getattr(user, 'role', 'client')
            if user_role in ['expert', 'admin']:
                return Step.objects.all()
            
            # Если у авторизованного пользователя есть шаги — отдаем их
            user_steps = Step.objects.filter(user=user)
            if user_steps.exists():
                return user_steps

        # Если анонимный запрос или у юзера нет своих шагов — отдаем общее руководство (все шаги из базы)
        return Step.objects.all()
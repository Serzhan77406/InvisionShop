from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Order
from .serializers import OrderSerializer, RequestMeetingSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]  # Доступ только авторизованным пользователям

    def get_queryset(self):
        user = self.request.user

        # Безопасная проверка роли пользователя
        user_role = getattr(user, 'role', None)
        admin_roles = ['admin', 'expert']
        
        # Если есть структура Roles внутри модели User:
        if hasattr(user, 'Roles'):
            admin_roles = [user.Roles.EXPERT, user.Roles.ADMIN]

        # Администраторы и инженеры-эксперты видят абсолютно все заявки
        if user_role in admin_roles:
            return Order.objects.all()

        # Обычные клиенты видят только свои собственные заказы
        return Order.objects.filter(user=user)

    # 1. API: POST /api/orders/request-meeting/ — создать заявку
    @action(detail=False, methods=['post'], url_path='request-meeting')
    def request_meeting(self, request):
        serializer = RequestMeetingSerializer(data=request.data)
        if serializer.is_valid():
            # Создаем заказ и связываем с пользователем
            order = serializer.save(user=request.user)
            
            # Возвращаем клиенту полные данные созданного заказа через OrderSerializer
            response_serializer = OrderSerializer(order, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 2. API: GET /api/orders/{id}/status/ — текущий статус + прогресс по 7 шагам
    @action(detail=True, methods=['get'], url_path='status')
    def current_status_progress(self, request, pk=None):
        order = self.get_object()
        
        # Рассчитываем процент прогресса легализации (от 1 до 7)
        total_steps = 7
        progress_percentage = round((order.current_step / total_steps) * 100, 2)
        if order.status == Order.Statuses.COMPLETED:
            progress_percentage = 100.0

        return Response({
            "order_id": order.id,
            "status": order.status,
            "status_display": order.get_status_display(),
            "current_step": order.current_step,
            "total_steps": total_steps,
            "progress_percentage": progress_percentage
        }, status=status.HTTP_200_OK)
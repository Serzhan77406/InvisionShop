import io
from django.http import FileResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

from .models import Order, Appointment
from .serializers import OrderSerializer, AppointmentSerializer, RequestMeetingSerializer
from .permissions import IsExpertOrAdmin  # Импортируем наше новое правило защиты

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in [user.Roles.EXPERT, user.Roles.ADMIN]:
            return Order.objects.all()
        return Order.objects.filter(user=user)

    # Старые эндпоинты из шага 4.3...
    @action(detail=False, methods=['post'], url_path='request-meeting')
    def request_meeting(self, request):
        serializer = RequestMeetingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='status')
    def current_status_progress(self, request, pk=None):
        order = self.get_object()
        total_steps = 7
        progress_percentage = round((order.current_step / total_steps) * 100, 2)
        return Response({
            "order_id": order.id,
            "status": order.status,
            "current_step": order.current_step,
            "progress_percentage": progress_percentage
        })

    # =========================================================================
    # СТРОГО ПО ТЗ ШАГА 5.1: ЭНДПОИНТЫ ДЛЯ ИНЖЕНЕРА (EXPERT)
    # =========================================================================

    # 1. GET /api/orders/orders/expert-orders/ — список моих заказов
    @action(detail=False, methods=['get'], url_path='expert-orders', permission_classes=[IsExpertOrAdmin])
    def expert_orders(self, request):
        # Возвращает заказы, где текущий инженер назначен исполнителем
        orders = Order.objects.filter(assigned_expert=request.user)
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # 2. GET /api/orders/orders/expert-appointments/ — список моих выездов/встреч
    @action(detail=False, methods=['get'], url_path='expert-appointments', permission_classes=[IsExpertOrAdmin])
    def expert_appointments(self, request):
        # Находит встречи, привязанные к заказам текущего инженера
        appointments = Appointment.objects.filter(order__assigned_expert=request.user)
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # 3. POST /api/orders/orders/{id}/confirm-deal/ — подтвердить договор
    @action(detail=True, methods=['post'], url_path='confirm-deal', permission_classes=[IsExpertOrAdmin])
    def confirm_deal(self, request, pk=None):
        order = self.get_object()
        final_price = request.data.get('final_price')
        contract_number = request.data.get('contract_number')

        if not final_price or not contract_number:
            return Response({"error": "Укажите final_price и contract_number."}, status=status.HTTP_400_BAD_REQUEST)

        order.status = Order.Statuses.DEAL_CONFIRMED
        order.final_price = final_price
        order.contract_number = contract_number
        order.save()

        return Response({"message": "Договор успешно подтвержден, статус обновлен."}, status=status.HTTP_200_OK)

    # 4. POST /api/orders/orders/{id}/report/ — загрузить технический отчёт/заметки инженера
    @action(detail=True, methods=['post'], url_path='report', permission_classes=[IsExpertOrAdmin])
    def upload_report(self, request, pk=None):
        order = self.get_object()
        report_notes = request.data.get('report_notes', '')

        # Находим текущую встречу и закрываем её со статусом 'completed'
        appointment = order.appointments.filter(status=Appointment.Statuses.SCHEDULED).first()
        if appointment:
            appointment.status = Appointment.Statuses.COMPLETED
            appointment.notes = report_notes
            appointment.save()

        order.status = Order.Statuses.IN_PROGRESS
        order.save()

        return Response({"message": "Технический отчет сохранен, статус изменен на 'В процессе оформления'."}, status=status.HTTP_200_OK)

    # 5. POST /api/orders/orders/{id}/approve-stage/ — завершить текущий этап и перевести на следующий
    @action(detail=True, methods=['post'], url_path='approve-stage', permission_classes=[IsExpertOrAdmin])
    def approve_stage(self, request, pk=None):
        order = self.get_object()
        
        if order.current_step >= 7:
            order.status = Order.Statuses.COMPLETED
            order.save()
            return Response({"message": "Все 7 этапов легализации успешно завершены!"}, status=status.HTTP_200_OK)
        
        order.current_step += 1
        order.save()
        return Response({
            "message": f"Этап утвержден. Текущий шаг изменен на {order.current_step}",
            "current_step": order.current_step
        }, status=status.HTTP_200_OK)

    # 6. GET /api/orders/orders/{id}/download-contract/ — скачать сгенерированный PDF-договор
    @action(detail=True, methods=['get'], url_path='download-contract', permission_classes=[IsExpertOrAdmin])
    def download_contract(self, request, pk=None):
        order = self.get_object()

        if not order.contract_number:
            return Response({"error": "Договор для этой сделки еще не сформирован."}, status=status.HTTP_400_BAD_REQUEST)

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        
        p.setFont("Helvetica-Bold", 16)
        p.drawCentredString(300, 750, f"DOGOVOR OKAZANIYA USLUG N {order.contract_number}")
        
        p.setFont("Helvetica", 12)
        p.drawString(50, 700, f"Zakatshik (Klient): {order.user.username}")
        p.drawString(50, 680, f"Ispolnitel (Inzhener): {request.user.username}")
        p.drawString(50, 650, f"Predmet dogovora: Legalizaciya pristrojki k taunhausu")
        p.drawString(50, 620, f"Stoimost rabot: {order.final_price} tenge.")
        p.drawString(50, 580, "Ispolnitel obyazuetsya vypolnit vse 7 shagov tehnicheskogo kontrolya.")
        
        p.showPage()
        p.save()
        
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=f'contract_{order.contract_number}.pdf')

import io

from django.http import FileResponse
from django.contrib.auth import get_user_model

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

from .models import Order, Appointment
from .serializers import (
    OrderSerializer,
    AppointmentSerializer,
    RequestMeetingSerializer,
)
from .permissions import IsExpertOrAdmin
from accounts.views import IsAdminRole


User = get_user_model()


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Администратор видит все заявки
        if user.role == user.Roles.ADMIN:
            return Order.objects.all()

        # Инженер видит только назначенные ему заявки
        if user.role == user.Roles.EXPERT:
            return Order.objects.filter(assigned_expert=user)

        # Клиент видит только свои заявки
        return Order.objects.filter(user=user)

    # =========================================================================
    # КЛИЕНТ — ЗАПРОС ВСТРЕЧИ
    # =========================================================================

    @action(
        detail=False,
        methods=["post"],
        url_path="request-meeting"
    )
    def request_meeting(self, request):
        serializer = RequestMeetingSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # =========================================================================
    # СТАТУС ЗАЯВКИ
    # =========================================================================

    @action(
        detail=True,
        methods=["get"],
        url_path="status"
    )
    def current_status_progress(self, request, pk=None):
        order = self.get_object()

        total_steps = 7
        progress_percentage = round(
            (order.current_step / total_steps) * 100,
            2
        )

        return Response({
            "order_id": order.id,
            "status": order.status,
            "current_step": order.current_step,
            "progress_percentage": progress_percentage,
        })

    # =========================================================================
    # ИНЖЕНЕР — МОИ КЛИЕНТЫ
    # =========================================================================

    @action(
        detail=False,
        methods=["get"],
        url_path="expert-orders",
        permission_classes=[IsExpertOrAdmin]
    )
    def expert_orders(self, request):
        """
        Возвращает заявки, назначенные текущему инженеру.
        Администратор может видеть все заявки.
        """

        if request.user.role == User.Roles.ADMIN:
            orders = Order.objects.all()
        else:
            orders = Order.objects.filter(
                assigned_expert=request.user
            )

        serializer = self.get_serializer(
            orders,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # =========================================================================
    # ИНЖЕНЕР — МОИ ВЫЕЗДЫ
    # =========================================================================

    @action(
        detail=False,
        methods=["get"],
        url_path="expert-appointments",
        permission_classes=[IsExpertOrAdmin]
    )
    def expert_appointments(self, request):
        """
        Возвращает выезды текущего инженера.
        """

        if request.user.role == User.Roles.ADMIN:
            appointments = Appointment.objects.all()
        else:
            appointments = Appointment.objects.filter(
                order__assigned_expert=request.user
            )

        serializer = AppointmentSerializer(
            appointments,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # =========================================================================
    # АДМИНИСТРАТОР — НАЗНАЧЕНИЕ ИНЖЕНЕРА
    # =========================================================================

    @action(
        detail=True,
        methods=["post"],
        url_path="assign-expert",
        permission_classes=[IsAdminRole]
    )
    def assign_expert(self, request, pk=None):
        """
        Администратор назначает инженера на заявку.
        """

        order = Order.objects.get(pk=pk)

        expert_id = request.data.get("expert_id")

        if not expert_id:
            return Response(
                {
                    "error": "Необходимо указать 'expert_id'."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            expert = User.objects.get(
                id=expert_id
            )
        except User.DoesNotExist:
            return Response(
                {
                    "error": "Пользователь не найден."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Проверяем роль
        if expert.role != User.Roles.EXPERT:
            return Response(
                {
                    "error": (
                        "Назначить можно только пользователя "
                        "с ролью 'expert'."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        order.assigned_expert = expert

        # После назначения инженера заявка получает статус
        # "Встреча назначена"
        order.status = Order.Statuses.MEETING_SCHEDULED

        order.save(
            update_fields=[
                "assigned_expert",
                "status",
                "updated_at",
            ]
        )

        return Response(
            {
                "message": (
                    f"Инженер {expert.username} "
                    f"назначен на заказ №{order.id}."
                ),
                "order_id": order.id,
                "assigned_expert": expert.username,
                "status": order.status,
                "status_display": order.get_status_display(),
            },
            status=status.HTTP_200_OK
        )

    # =========================================================================
    # АДМИНИСТРАТОР — СОЗДАНИЕ ВЫЕЗДА
    # =========================================================================

    @action(
        detail=True,
        methods=["post"],
        url_path="create-appointment",
        permission_classes=[IsAdminRole]
    )
    def create_appointment(self, request, pk=None):
        """
        Администратор создаёт выезд инженера.
        """

        order = Order.objects.get(pk=pk)

        # Проверяем, назначен ли инженер
        if not order.assigned_expert:
            return Response(
                {
                    "error": (
                        "Сначала необходимо назначить "
                        "инженера на заявку."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        scheduled_date = request.data.get(
            "scheduled_date"
        )

        time_slot = request.data.get(
            "time_slot"
        )

        address = request.data.get(
            "address"
        )

        if not scheduled_date:
            return Response(
                {
                    "error": "Укажите дату выезда."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not time_slot:
            return Response(
                {
                    "error": "Укажите временной интервал."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not address:
            return Response(
                {
                    "error": "Укажите адрес объекта."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Проверяем допустимый временной интервал
        valid_slots = [
            Appointment.TimeSlots.MORNING,
            Appointment.TimeSlots.AFTERNOON,
        ]

        if time_slot not in valid_slots:
            return Response(
                {
                    "error": (
                        "Недопустимый временной интервал. "
                        "Используйте 9-13 или 13-18."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        appointment = Appointment.objects.create(
            order=order,
            scheduled_date=scheduled_date,
            time_slot=time_slot,
            address=address,
            status=Appointment.Statuses.SCHEDULED,
        )

        serializer = AppointmentSerializer(
            appointment
        )

        return Response(
            {
                "message": (
                    f"Выезд по заказу №{order.id} "
                    f"успешно назначен."
                ),
                "appointment": serializer.data,
                "engineer": order.assigned_expert.username,
            },
            status=status.HTTP_201_CREATED
        )

    # =========================================================================
    # ИНЖЕНЕР — ПОДТВЕРЖДЕНИЕ ДОГОВОРА
    # =========================================================================

    @action(
        detail=True,
        methods=["post"],
        url_path="confirm-deal",
        permission_classes=[IsExpertOrAdmin]
    )
    def confirm_deal(self, request, pk=None):
        order = self.get_object()

        final_price = request.data.get(
            "final_price"
        )

        contract_number = request.data.get(
            "contract_number"
        )

        if not final_price or not contract_number:
            return Response(
                {
                    "error": (
                        "Укажите final_price "
                        "и contract_number."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = Order.Statuses.DEAL_CONFIRMED
        order.final_price = final_price
        order.contract_number = contract_number

        order.save()

        return Response(
            {
                "message": (
                    "Договор успешно подтвержден, "
                    "статус обновлен."
                )
            },
            status=status.HTTP_200_OK
        )

    # =========================================================================
    # ИНЖЕНЕР — ТЕХНИЧЕСКИЙ ОТЧЁТ
    # =========================================================================

    @action(
        detail=True,
        methods=["post"],
        url_path="report",
        permission_classes=[IsExpertOrAdmin]
    )
    def upload_report(self, request, pk=None):
        order = self.get_object()

        report_notes = request.data.get(
            "report_notes",
            ""
        )

        # Закрываем текущий запланированный выезд
        appointment = (
            order.appointments
            .filter(
                status=Appointment.Statuses.SCHEDULED
            )
            .first()
        )

        if appointment:
            appointment.status = (
                Appointment.Statuses.COMPLETED
            )
            appointment.notes = report_notes
            appointment.save()

        order.status = Order.Statuses.IN_PROGRESS
        order.save()

        return Response(
            {
                "message": (
                    "Технический отчет сохранен. "
                    "Статус изменен на "
                    "'В процессе оформления'."
                )
            },
            status=status.HTTP_200_OK
        )

    # =========================================================================
    # ИНЖЕНЕР — ПЕРЕХОД НА СЛЕДУЮЩИЙ ЭТАП
    # =========================================================================

    @action(
        detail=True,
        methods=["post"],
        url_path="approve-stage",
        permission_classes=[IsExpertOrAdmin]
    )
    def approve_stage(self, request, pk=None):
        order = self.get_object()

        if order.current_step >= 7:
            order.status = Order.Statuses.COMPLETED
            order.save()

            return Response(
                {
                    "message": (
                        "Все 7 этапов легализации "
                        "успешно завершены!"
                    ),
                    "current_step": 7,
                },
                status=status.HTTP_200_OK
            )

        order.current_step += 1
        order.save()

        return Response(
            {
                "message": (
                    f"Этап утвержден. "
                    f"Текущий шаг изменен "
                    f"на {order.current_step}."
                ),
                "current_step": order.current_step,
            },
            status=status.HTTP_200_OK
        )

    # =========================================================================
    # ИНЖЕНЕР — СКАЧИВАНИЕ ДОГОВОРА
    # =========================================================================

    @action(
        detail=True,
        methods=["get"],
        url_path="download-contract",
        permission_classes=[IsExpertOrAdmin]
    )
    def download_contract(self, request, pk=None):
        order = self.get_object()

        if not order.contract_number:
            return Response(
                {
                    "error": (
                        "Договор для этой сделки "
                        "еще не сформирован."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        buffer = io.BytesIO()

        p = canvas.Canvas(
            buffer,
            pagesize=letter
        )

        p.setFont(
            "Helvetica-Bold",
            16
        )

        p.drawCentredString(
            300,
            750,
            f"DOGOVOR OKAZANIYA USLUG N "
            f"{order.contract_number}"
        )

        p.setFont(
            "Helvetica",
            12
        )

        p.drawString(
            50,
            700,
            f"Zakatshik (Klient): "
            f"{order.user.username}"
        )

        p.drawString(
            50,
            680,
            f"Ispolnitel (Inzhener): "
            f"{request.user.username}"
        )

        p.drawString(
            50,
            650,
            "Predmet dogovora: "
            "Legalizaciya pristrojki k taunhausu"
        )

        p.drawString(
            50,
            620,
            f"Stoimost rabot: "
            f"{order.final_price} tenge."
        )

        p.drawString(
            50,
            580,
            "Ispolnitel obyazuetsya vypolnit "
            "vse 7 shagov tehnicheskogo kontrolya."
        )

        p.showPage()
        p.save()

        buffer.seek(0)

        return FileResponse(
            buffer,
            as_attachment=True,
            filename=(
                f"contract_{order.contract_number}.pdf"
            )
        )
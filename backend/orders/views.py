
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

    # =========================================================================
    # ФИЛЬТРАЦИЯ ЗАЯВОК ПО РОЛИ ПОЛЬЗОВАТЕЛЯ
    # =========================================================================

    def get_queryset(self):
        user = self.request.user

        # Администратор видит все заявки
        if user.role == user.Roles.ADMIN:
            return Order.objects.all()

        # Инженер видит только назначенные ему заявки
        if user.role == user.Roles.EXPERT:
            return Order.objects.filter(
                assigned_expert=user
            )

        # Клиент видит только свои заявки
        return Order.objects.filter(
            user=user
        )

    # =========================================================================
    # КЛИЕНТ — ЗАПРОС ВСТРЕЧИ
    # =========================================================================

    @action(
        detail=False,
        methods=["post"],
        url_path="request-meeting"
    )
    def request_meeting(self, request):
        serializer = RequestMeetingSerializer(
            data=request.data
        )

        if serializer.is_valid():
            serializer.save(
                user=request.user
            )

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
    def current_status_progress(
        self,
        request,
        pk=None
    ):
        order = self.get_object()

        total_steps = 7

        progress_percentage = round(
            (
                order.current_step /
                total_steps
            ) * 100,
            2
        )

        return Response(
            {
                "order_id": order.id,
                "status": order.status,
                "status_display": (
                    order.get_status_display()
                ),
                "current_step": order.current_step,
                "total_steps": total_steps,
                "progress_percentage": progress_percentage,
            },
            status=status.HTTP_200_OK
        )

    # =========================================================================
    # ИНЖЕНЕР — МОИ КЛИЕНТЫ
    # =========================================================================

    @action(
        detail=False,
        methods=["get"],
        url_path="expert-orders",
        permission_classes=[IsExpertOrAdmin]
    )
    def expert_orders(
        self,
        request
    ):
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
    def expert_appointments(
        self,
        request
    ):
        """
        Возвращает выезды текущего инженера.
        Администратор видит все выезды.
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
    def assign_expert(
        self,
        request,
        pk=None
    ):
        """
        Администратор назначает инженера на заявку.
        """

        try:
            order = Order.objects.get(
                pk=pk
            )
        except Order.DoesNotExist:
            return Response(
                {
                    "error": "Заявка не найдена."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        expert_id = request.data.get(
            "expert_id"
        )

        if not expert_id:
            return Response(
                {
                    "error": (
                        "Необходимо указать "
                        "'expert_id'."
                    )
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

        # Назначить можно только пользователя с ролью expert
        if expert.role != User.Roles.EXPERT:
            return Response(
                {
                    "error": (
                        "Назначить можно только "
                        "пользователя с ролью 'expert'."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        order.assigned_expert = expert

        # После назначения инженера
        # заявка получает статус "Встреча назначена"
        order.status = (
            Order.Statuses.MEETING_SCHEDULED
        )

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
                "status_display": (
                    order.get_status_display()
                ),
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
    def create_appointment(
        self,
        request,
        pk=None
    ):
        """
        Администратор создаёт выезд инженера.
        """

        try:
            order = Order.objects.get(
                pk=pk
            )
        except Order.DoesNotExist:
            return Response(
                {
                    "error": "Заявка не найдена."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Проверяем наличие инженера
        if not order.assigned_expert:
            return Response(
                {
                    "error": (
                        "Сначала необходимо "
                        "назначить инженера "
                        "на заявку."
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
                    "error": (
                        "Укажите временной интервал."
                    )
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

        # Допустимые временные интервалы
        valid_slots = [
            Appointment.TimeSlots.MORNING,
            Appointment.TimeSlots.AFTERNOON,
        ]

        if time_slot not in valid_slots:
            return Response(
                {
                    "error": (
                        "Недопустимый временной "
                        "интервал. Используйте "
                        "9-13 или 13-18."
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
                "engineer": (
                    order.assigned_expert.username
                ),
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
    def confirm_deal(
        self,
        request,
        pk=None
    ):
        order = self.get_object()

        final_price = request.data.get(
            "final_price"
        )

        contract_number = request.data.get(
            "contract_number"
        )

        if not final_price:
            return Response(
                {
                    "error": (
                        "Укажите итоговую цену."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not contract_number:
            return Response(
                {
                    "error": (
                        "Укажите номер договора."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = (
            Order.Statuses.DEAL_CONFIRMED
        )

        order.final_price = final_price
        order.contract_number = contract_number

        order.save()

        return Response(
            {
                "message": (
                    "Договор успешно подтвержден, "
                    "статус обновлен."
                ),
                "order_id": order.id,
                "final_price": (
                    str(order.final_price)
                ),
                "contract_number": (
                    order.contract_number
                ),
                "status": order.status,
                "status_display": (
                    order.get_status_display()
                ),
            },
            status=status.HTTP_200_OK
        )

    # =========================================================================
    # ИНЖЕНЕР — ТЕХНИЧЕСКИЙ ОТЧЁТ
    # =========================================================================

    @action(
        detail=True,
        methods=["get", "post"],
        url_path="report",
        permission_classes=[IsExpertOrAdmin]
    )
    def upload_report(
        self,
        request,
        pk=None
    ):
        """
        GET:
            Получает сохранённые данные договора,
            выезда и технического отчёта.

        POST:
            Сохраняет технический отчёт,
            завершает текущий выезд и переводит
            заявку в работу.
        """

        order = self.get_object()

        # ================================================================
        # GET — ПОЛУЧЕНИЕ СОХРАНЁННЫХ ДАННЫХ
        # ================================================================

        if request.method == "GET":

            # Последний выезд с сохранённым отчётом
            appointment = (
                order.appointments
                .filter(
                    notes__isnull=False
                )
                .exclude(
                    notes=""
                )
                .order_by(
                    "-id"
                )
                .first()
            )

            return Response(
                {
                    "exists": bool(
                        appointment
                    ),

                    # ------------------------------------------------
                    # Данные договора
                    # ------------------------------------------------

                    "final_price": (
                        str(order.final_price)
                        if (
                            order.final_price
                            is not None
                        )
                        else ""
                    ),

                    "contract_number": (
                        order.contract_number
                        or ""
                    ),

                    # ------------------------------------------------
                    # Данные заявки
                    # ------------------------------------------------

                    "order_id": order.id,

                    "order_status": (
                        order.status
                    ),

                    "order_status_display": (
                        order.get_status_display()
                    ),

                    "current_step": (
                        order.current_step
                    ),

                    # ------------------------------------------------
                    # Данные выезда
                    # ------------------------------------------------

                    "appointment_id": (
                        appointment.id
                        if appointment
                        else None
                    ),

                    "scheduled_date": (
                        str(
                            appointment.scheduled_date
                        )
                        if appointment
                        else None
                    ),

                    "time_slot": (
                        appointment.time_slot
                        if appointment
                        else None
                    ),

                    "address": (
                        appointment.address
                        if appointment
                        else None
                    ),

                    "appointment_status": (
                        appointment.status
                        if appointment
                        else None
                    ),

                    # ------------------------------------------------
                    # Технический отчёт
                    # ------------------------------------------------

                    "report_notes": (
                        appointment.notes
                        if appointment
                        else ""
                    ),
                },
                status=status.HTTP_200_OK
            )

        # ================================================================
        # POST — СОХРАНЕНИЕ ТЕХНИЧЕСКОГО ОТЧЁТА
        # ================================================================

        report_notes = request.data.get(
            "report_notes",
            ""
        )

        # Защита от None
        if report_notes is None:
            report_notes = ""

        report_notes = str(
            report_notes
        ).strip()

        if not report_notes:
            return Response(
                {
                    "error": (
                        "Введите результаты "
                        "технического осмотра."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Ищем текущий запланированный выезд
        appointment = (
            order.appointments
            .filter(
                status=Appointment.Statuses.SCHEDULED
            )
            .order_by(
                "scheduled_date",
                "id"
            )
            .first()
        )

        if not appointment:
            return Response(
                {
                    "error": (
                        "Для этой заявки нет "
                        "запланированного выезда. "
                        "Сначала назначьте выезд."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Сохраняем текст отчёта
        appointment.notes = report_notes

        # Выезд завершён
        appointment.status = (
            Appointment.Statuses.COMPLETED
        )

        appointment.save(
            update_fields=[
                "notes",
                "status",
            ]
        )

        # Переводим заявку в работу
        order.status = (
            Order.Statuses.IN_PROGRESS
        )

        order.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            {
                "message": (
                    "Технический отчёт "
                    "успешно сохранён."
                ),

                "order_id": order.id,

                "final_price": (
                    str(order.final_price)
                    if (
                        order.final_price
                        is not None
                    )
                    else ""
                ),

                "contract_number": (
                    order.contract_number
                    or ""
                ),

                "report_notes": (
                    appointment.notes
                    or ""
                ),

                "appointment_id": (
                    appointment.id
                ),

                "appointment_status": (
                    appointment.status
                ),

                "order_status": (
                    order.status
                ),

                "order_status_display": (
                    order.get_status_display()
                ),
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
    def approve_stage(
        self,
        request,
        pk=None
    ):
        order = self.get_object()

        # Если уже достигнут 7 этап
        if order.current_step >= 7:
            order.current_step = 7
            order.status = (
                Order.Statuses.COMPLETED
            )

            order.save(
                update_fields=[
                    "current_step",
                    "status",
                    "updated_at",
                ]
            )

            return Response(
                {
                    "message": (
                        "Все 7 этапов "
                        "легализации успешно "
                        "завершены!"
                    ),
                    "current_step": 7,
                    "status": order.status,
                    "status_display": (
                        order.get_status_display()
                    ),
                },
                status=status.HTTP_200_OK
            )

        # Переходим на следующий этап
        order.current_step += 1

        order.save(
            update_fields=[
                "current_step",
                "updated_at",
            ]
        )

        return Response(
            {
                "message": (
                    f"Этап утвержден. "
                    f"Текущий шаг изменен "
                    f"на {order.current_step}."
                ),
                "current_step": (
                    order.current_step
                ),
                "status": order.status,
                "status_display": (
                    order.get_status_display()
                ),
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
    def download_contract(
        self,
        request,
        pk=None
    ):
        order = self.get_object()

        if not order.contract_number:
            return Response(
                {
                    "error": (
                        "Договор для этой сделки "
                        "ещё не сформирован."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        buffer = io.BytesIO()

        p = canvas.Canvas(
            buffer,
            pagesize=letter
        )

        # ------------------------------------------------------------
        # Заголовок
        # ------------------------------------------------------------

        p.setFont(
            "Helvetica-Bold",
            16
        )

        p.drawCentredString(
            300,
            750,
            (
                "DOGOVOR OKAZANIYA USLUG N "
                f"{order.contract_number}"
            )
        )

        # ------------------------------------------------------------
        # Основная информация
        # ------------------------------------------------------------

        p.setFont(
            "Helvetica",
            12
        )

        p.drawString(
            50,
            700,
            (
                "Zakatshik (Klient): "
                f"{order.user.username}"
            )
        )

        p.drawString(
            50,
            680,
            (
                "Ispolnitel (Inzhener): "
                f"{request.user.username}"
            )
        )

        p.drawString(
            50,
            650,
            (
                "Predmet dogovora: "
                "Legalizaciya pristrojki "
                "k taunhausu"
            )
        )

        p.drawString(
            50,
            620,
            (
                "Stoimost rabot: "
                f"{order.final_price} tenge."
            )
        )

        p.drawString(
            50,
            580,
            (
                "Ispolnitel obyazuetsya "
                "vypolnit vse 7 shagov "
                "tehnicheskogo kontrolya."
            )
        )

        p.showPage()
        p.save()

        buffer.seek(0)

        return FileResponse(
            buffer,
            as_attachment=True,
            filename=(
                f"contract_"
                f"{order.contract_number}.pdf"
            )
        )

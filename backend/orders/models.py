from django.db import models
from django.contrib.auth import get_user_model
from objects.models import PropertyObject

User = get_user_model()

class Order(models.Model):
    class Statuses(models.TextChoices):
        DRAFT = 'draft', 'Черновик'
        MEETING_REQUESTED = 'meeting_requested', 'Запрошена встреча'
        MEETING_SCHEDULED = 'meeting_scheduled', 'Встреча назначена'
        DEAL_CONFIRMED = 'deal_confirmed', 'Сделка подтверждена'
        IN_PROGRESS = 'in_progress', 'В процессе оформления'
        COMPLETED = 'completed', 'Успешно завершено'

    # Связи с пользователем и объектом недвижимости
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='orders',
        verbose_name="Клиент"
    )
    
    property_object = models.ForeignKey(
    PropertyObject, 
    on_delete=models.CASCADE, 
    related_name='orders',
    blank=True,
    null=True,
    verbose_name="Объект недвижимости"
    )
    
    # Статус сделки
    status = models.CharField(
        max_length=30,
        choices=Statuses.choices,
        default=Statuses.DRAFT,
        verbose_name="Статус"
    )
    
    # Финансовые поля
    estimated_price = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        blank=True, 
        null=True, 
        verbose_name="Предварительная цена"
    )
    final_price = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        blank=True, 
        null=True, 
        verbose_name="Итоговая цена"
    )
    
    # Документы и аудит
    contract_number = models.CharField(
        max_length=50, 
        blank=True, 
        null=True, 
        verbose_name="Номер договора"
    )
    assigned_expert = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='assigned_orders',
        limit_choices_to={'role': 'expert'},  # Защита: инженером можно выбрать только эксперта
        verbose_name="Назначенный инженер"
    )
    
    # Интеграция с 7 шагами легализации
    current_step = models.IntegerField(default=1, verbose_name="Текущий шаг выполнения")
    
    # Временные метки
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Заказ / Сделка"
        verbose_name_plural = "Заказы / Сделки"
        ordering = ['-created_at']

    def __str__(self):
        return f"Заказ №{self.id} ({self.get_status_display()}) — {self.user.username}"

class Appointment(models.Model):
    class TimeSlots(models.TextChoices):
        MORNING = '9-13', 'С 9:00 до 13:00'
        AFTERNOON = '13-18', 'С 13:00 до 18:00'

    class Statuses(models.TextChoices):
        SCHEDULED = 'scheduled', 'Запланирована'
        COMPLETED = 'completed', 'Выполнена'
        CANCELLED = 'cancelled', 'Отменена'

    # Связь с конкретным заказом/сделкой
    order = models.ForeignKey(
        Order, 
        on_delete=models.CASCADE, 
        related_name='appointments',
        verbose_name="Заказ"
    )
    
    # Дата и временной слот осмотра
    scheduled_date = models.DateField(verbose_name="Дата встречи")
    time_slot = models.CharField(
        max_length=10,
        choices=TimeSlots.choices,
        verbose_name="Временной интервал"
    )
    
    # Место проведения осмотра
    address = models.TextField(verbose_name="Адрес встречи")
    
    # Статус встречи
    status = models.CharField(
        max_length=20,
        choices=Statuses.choices,
        default=Statuses.SCHEDULED,
        verbose_name="Статус встречи"
    )
    
    # Дополнительные заметки инженера (например: "нужна лестница для замера крыши")
    notes = models.TextField(blank=True, null=True, verbose_name="Заметки / Комментарии")

    class Meta:
        verbose_name = "Встреча / Осмотр инженера"
        verbose_name_plural = "Встречи / Осмотры инженеров"
        ordering = ['scheduled_date', 'time_slot']

    def __str__(self):
        return f"Осмотр по Заказу №{self.order.id} на {self.scheduled_date} ({self.get_time_slot_display()})"
    


# Create your models here.

from django.contrib import admin
from .models import Order, Appointment

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    # Колонки в списке всех сделок
    list_display = ('id', 'user', 'property_object', 'status', 'current_step', 'final_price', 'created_at')
    # Фильтры справа
    list_filter = ('status', 'current_step')
    # Поиск по имени клиента или номеру договора
    search_fields = ('user__username', 'contract_number')
    # Позволяет менять статус и шаг прямо из таблицы
    list_editable = ('status', 'current_step')

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'scheduled_date', 'time_slot', 'status', 'address')
    list_filter = ('status', 'time_slot', 'scheduled_date')


# Register your models here.

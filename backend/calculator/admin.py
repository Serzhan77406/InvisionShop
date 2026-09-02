from django.contrib import admin
from .models import Tariff

@admin.register(Tariff)
class TariffAdmin(admin.ModelAdmin):
    list_display = ('id', 'service_name', 'price_per_m2', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('service_name',)
    list_editable = ('price_per_m2', 'is_active')

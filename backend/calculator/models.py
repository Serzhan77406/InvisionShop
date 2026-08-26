from django.db import models

class Tariff(models.Model):
    service_name = models.CharField(max_length=255, verbose_name="Название услуги")
    price_per_m2 = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Цена за м²")
    is_active = models.BooleanField(default=True, verbose_name="Активен")

    class Meta:
        verbose_name = "Тариф"
        verbose_name_plural = "Тарифы"

    def __str__(self):
        return f"{self.service_name} — {self.price_per_m2} тенге./м²"


# Create your models here.

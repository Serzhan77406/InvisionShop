from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class PropertyObject(models.Model):
   class PropertyType(models.TextChoices):
     HOUSE = 'house', 'дом'
     APARTMENT = 'apartment', 'квартира'
     COMMERCIAL = 'commercial', 'комерческая недвижимость'
     LAND = 'LAND', 'земельный участок'

   user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='property_objects', verbose_name='Пользователь')
   property_type = models.CharField(max_length=50, choices=PropertyType.choices, verbose_name='Тип объекта')
   region = models.CharField(max_length=100, verbose_name='Регион')
   address = models.CharField(max_length=255, verbose_name='Адрес')
   area = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Площадь (м2)')

   def __str__(self):
      return f'{self.get_property_type_display()} - {self.address}'
    

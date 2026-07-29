from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class  Roles(models.TextChoices):
        CLIENT = 'client', 'Клиент'
        EXPERT = 'expert', 'Эксперт'
        ADMIN = 'admin', 'Администратор'

    role = models.CharField( max_length=10, choices=Roles.choices,
                            default=Roles.CLIENT, verbose_name='Роль')

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        
        

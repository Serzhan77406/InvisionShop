from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()  # Динамический импорт вашей модели с ролями

class Step(models.Model):
    # Связываем шаг сделки с пользователем через правильный User
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='steps', 
        verbose_name='Пользователь'
    )
    title = models.CharField(max_length=255, verbose_name='Название шага')
    is_completed = models.BooleanField(default=False, verbose_name='Выполнено')

    class Meta:
        verbose_name = 'Шаг'
        verbose_name_plural = 'Шаги'

    def __str__(self):
        return f"{self.title} - {'Выполнено' if self.is_completed else 'В процессе'}"





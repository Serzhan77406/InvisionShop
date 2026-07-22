from django.db import models

class Step(models.Model):
    number = models.IntegerField(verbose_name="Номер шага")
    title  = models.CharField(max_length=255, verbose_name="Название")
    description = models.TextField(verbose_name="Описание")
    order = models.IntegerField(verbose_name="Порядок отображения")

    class Meta:
        verbose_name = "Шаг"
        verbose_name_plural = "Шаги"
        ordering = ['order']

    def __str__(self):
        return f"Шаг {self.number}: {self.title}"
    







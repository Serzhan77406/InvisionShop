from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class PropertyObject(models.Model):
    class PropertyType(models.TextChoices):
        HOUSE = 'house', 'Дом'
        APARTMENT = 'apartment', 'Квартира'
        COMMERCIAL = 'commercial', 'Коммерческая недвижимость'
        LAND = 'LAND', 'Земельный участок'

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='property_objects',
        verbose_name='Пользователь'
    )

    property_type = models.CharField(
        max_length=50,
        choices=PropertyType.choices,
        verbose_name='Тип объекта'
    )

    region = models.CharField(
        max_length=100,
        verbose_name='Регион'
    )

    address = models.CharField(
        max_length=255,
        verbose_name='Адрес'
    )

    area = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Площадь (м²)'
    )

    def __str__(self):
        return f'{self.get_property_type_display()} - {self.address}'


class ProjectAssignment(models.Model):
    """
    Задание на проектирование объекта
    жилищно-гражданского назначения.
    """

    class Statuses(models.TextChoices):
        DRAFT = 'draft', 'Черновик'
        SAVED = 'saved', 'Сохранено'
        APPROVED = 'approved', 'Утверждено'

    class ConstructionTypes(models.TextChoices):
        NEW = 'new', 'Новое строительство'
        RECONSTRUCTION = 'reconstruction', 'Реконструкция'
        EXTENSION = 'extension', 'Пристройка'
        RENOVATION = 'renovation', 'Реконструкция / переустройство'

    class DesignStages(models.TextChoices):
        ONE_STAGE = 'one_stage', 'Одностадийное проектирование'
        TWO_STAGE = 'two_stage', 'Двухстадийное проектирование'

    # Связь с объектом недвижимости
    property_object = models.OneToOneField(
        PropertyObject,
        on_delete=models.CASCADE,
        related_name='project_assignment',
        verbose_name='Объект недвижимости'
    )

    # Статус документа
    status = models.CharField(
        max_length=20,
        choices=Statuses.choices,
        default=Statuses.DRAFT,
        verbose_name='Статус'
    )

    # ==========================================================
    # 1. ОБЩИЕ СВЕДЕНИЯ ОБ ОБЪЕКТЕ
    # ==========================================================

    object_name = models.CharField(
        max_length=255,
        verbose_name='Наименование объекта'
    )

    customer_name = models.CharField(
        max_length=255,
        verbose_name='Заказчик'
    )

    designer_name = models.CharField(
        max_length=255,
        blank=True,
        default='',
        verbose_name='Проектировщик'
    )

    # ==========================================================
    # 2. МЕСТОПОЛОЖЕНИЕ ОБЪЕКТА
    # ==========================================================

    location = models.TextField(
        verbose_name='Местоположение объекта'
    )

    # ==========================================================
    # 3. ОСНОВАНИЕ ДЛЯ ПРОЕКТИРОВАНИЯ
    # ==========================================================

    design_basis = models.TextField(
        verbose_name='Основание для проектирования'
    )

    # ==========================================================
    # 4. НАЗНАЧЕНИЕ ОБЪЕКТА
    # ==========================================================

    purpose = models.TextField(
        verbose_name='Назначение объекта'
    )

    # ==========================================================
    # 5. ВИД СТРОИТЕЛЬНЫХ РАБОТ
    # ==========================================================

    construction_type = models.CharField(
        max_length=30,
        choices=ConstructionTypes.choices,
        verbose_name='Вид строительных работ'
    )

    # ==========================================================
    # 6. ОСНОВНЫЕ ТЕХНИКО-ЭКОНОМИЧЕСКИЕ ПОКАЗАТЕЛИ
    # ==========================================================

    total_area = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Общая площадь (м²)'
    )

    building_area = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Площадь застройки (м²)'
    )

    floors = models.PositiveIntegerField(
        blank=True,
        null=True,
        verbose_name='Количество этажей'
    )

    rooms = models.PositiveIntegerField(
        blank=True,
        null=True,
        verbose_name='Количество помещений'
    )

    # ==========================================================
    # Стадийность проектирования
    # ==========================================================

    design_stage = models.CharField(
        max_length=20,
        choices=DesignStages.choices,
        default=DesignStages.ONE_STAGE,
        verbose_name='Стадия проектирования'
    )

    alternative_design = models.BooleanField(
        default=False,
        verbose_name='Необходимость разработки альтернативного варианта'
    )

    # ==========================================================
    # 7. АРХИТЕКТУРНО-ПЛАНИРОВОЧНЫЕ ТРЕБОВАНИЯ
    # ==========================================================

    architectural_requirements = models.TextField(
        blank=True,
        default='',
        verbose_name='Архитектурно-планировочные требования'
    )

    # ==========================================================
    # 8. КОНСТРУКТИВНЫЕ РЕШЕНИЯ
    # ==========================================================

    structural_requirements = models.TextField(
        blank=True,
        default='',
        verbose_name='Конструктивные решения'
    )

    # ==========================================================
    # 9. ИНЖЕНЕРНОЕ ОБЕСПЕЧЕНИЕ
    # ==========================================================

    engineering_requirements = models.TextField(
        blank=True,
        default='',
        verbose_name='Инженерное обеспечение'
    )

    # ==========================================================
    # 10. БЛАГОУСТРОЙСТВО ТЕРРИТОРИИ
    # ==========================================================

    landscaping_requirements = models.TextField(
        blank=True,
        default='',
        verbose_name='Благоустройство территории'
    )

    # ==========================================================
    # 11. ТРЕБОВАНИЯ ПО БЕЗОПАСНОСТИ
    # ==========================================================

    safety_requirements = models.TextField(
        blank=True,
        default='',
        verbose_name='Требования по безопасности'
    )

    # ==========================================================
    # 12. ОСОБЫЕ ТРЕБОВАНИЯ ЗАКАЗЧИКА
    # ==========================================================

    customer_requirements = models.TextField(
        blank=True,
        default='',
        verbose_name='Особые требования заказчика'
    )

    special_conditions = models.TextField(
        blank=True,
        default='',
        verbose_name='Особые условия строительства'
    )

    # ==========================================================
    # 13. СРОКИ ПРОЕКТИРОВАНИЯ
    # ==========================================================

    design_start_date = models.DateField(
        blank=True,
        null=True,
        verbose_name='Дата начала проектирования'
    )

    design_end_date = models.DateField(
        blank=True,
        null=True,
        verbose_name='Дата окончания проектирования'
    )

    # ==========================================================
    # 14. ПОДПИСИ
    # ==========================================================

    customer_signature = models.CharField(
        max_length=255,
        blank=True,
        default='',
        verbose_name='Подпись заказчика'
    )

    designer_signature = models.CharField(
        max_length=255,
        blank=True,
        default='',
        verbose_name='Подпись исполнителя'
    )

    # ==========================================================
    # СЛУЖЕБНЫЕ ПОЛЯ
    # ==========================================================

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )

    class Meta:
        verbose_name = 'Задание на проектирование'
        verbose_name_plural = 'Задания на проектирование'
        ordering = ['-created_at']

    def __str__(self):
        return f'Задание на проектирование — {self.object_name}'
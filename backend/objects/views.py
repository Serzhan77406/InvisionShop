from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import PropertyObject, ProjectAssignment
from .serializers import (
    PropertyObjectSerializer,
    ProjectAssignmentSerializer,
)


class PropertyObjectViewSet(viewsets.ModelViewSet):
    serializer_class = PropertyObjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role in [
            user.Roles.EXPERT,
            user.Roles.ADMIN,
        ]:
            return PropertyObject.objects.all()

        return PropertyObject.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProjectAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = ProjectAssignment.objects.select_related(
            'property_object',
            'property_object__user',
        )

        # Администратор и инженер видят все задания
        if user.role in [
            user.Roles.EXPERT,
            user.Roles.ADMIN,
        ]:
            return queryset

        # Клиент видит только свои задания
        return queryset.filter(
            property_object__user=user
        )

    def perform_create(self, serializer):
        user = self.request.user

        property_object = serializer.validated_data.get(
            'property_object'
        )

        if user.role == user.Roles.CLIENT:
            if property_object.user_id != user.id:
                from rest_framework.exceptions import PermissionDenied

                raise PermissionDenied(
                    'Вы можете создать задание только для своего объекта.'
                )

        serializer.save()
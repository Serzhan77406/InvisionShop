from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import BasePermission

from .serializers import RegisterSerializer
from .models import User


class IsAdminRole(BasePermission):
    """
    Доступ разрешен только пользователям
    с ролью администратора.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Roles.ADMIN
        )


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                },
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
            }
        )


class UserListAPIView(APIView):
    """
    Получение списка пользователей.

    Доступ имеет только администратор.
    """

    permission_classes = [IsAdminRole]

    def get(self, request):
        users = User.objects.all().order_by("id")

        data = []

        for user in users:
            data.append(
                {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                    "role_display": user.get_role_display(),
                    "is_active": user.is_active,
                }
            )

        return Response(data)


class UserRoleUpdateAPIView(APIView):
    """
    Изменение роли пользователя.

    Только администратор может назначить:
    - client
    - expert
    - admin
    """

    permission_classes = [IsAdminRole]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)

        except User.DoesNotExist:
            return Response(
                {
                    "error": "Пользователь не найден."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        new_role = request.data.get("role")

        allowed_roles = [
            User.Roles.CLIENT,
            User.Roles.EXPERT,
            User.Roles.ADMIN,
        ]

        if new_role not in allowed_roles:
            return Response(
                {
                    "error": (
                        "Недопустимая роль. "
                        "Используйте client, expert или admin."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Защита от случайного снятия собственной роли администратора
        if user.id == request.user.id and new_role != User.Roles.ADMIN:
            return Response(
                {
                    "error": (
                        "Администратор не может самостоятельно "
                        "снять с себя роль администратора."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        user.role = new_role
        user.save(update_fields=["role"])

        return Response(
            {
                "message": "Роль пользователя успешно изменена.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                    "role_display": user.get_role_display(),
                }
            },
            status=status.HTTP_200_OK
        )
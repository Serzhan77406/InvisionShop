from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    RegisterAPIView,
    MeAPIView,
    UserListAPIView,
    UserRoleUpdateAPIView,
)


urlpatterns = [
    path(
        "auth/register/",
        RegisterAPIView.as_view(),
        name="register",
    ),

    path(
        "auth/login/",
        TokenObtainPairView.as_view(),
        name="login",
    ),

    path(
        "auth/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),

    path(
        "auth/me/",
        MeAPIView.as_view(),
        name="me",
    ),

    # Управление пользователями администратора
    path(
        "users/",
        UserListAPIView.as_view(),
        name="users-list",
    ),

    # Изменение роли пользователя
    path(
        "users/<int:user_id>/role/",
        UserRoleUpdateAPIView.as_view(),
        name="user-role-update",
    ),
]
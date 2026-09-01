from rest_framework import permissions

class IsExpertOrAdmin(permissions.BasePermission):
    """
    Разрешает доступ только пользователям с ролью expert или admin.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.role == request.user.Roles.EXPERT or 
            request.user.role == request.user.Roles.ADMIN
        )

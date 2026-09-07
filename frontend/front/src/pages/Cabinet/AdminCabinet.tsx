import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminCabinet.css';

interface Order {
  id: number;
  user: string;
  property_object: {
    address: string;
    area: string;
  };
  status: string;
  status_display: string;
  assigned_expert: string | null;
  current_step: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  role_display?: string;
  is_active?: boolean;
}

export default function AdminCabinet() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const token = localStorage.getItem('access_token');

  // Доступные статусы заявки
  const statusChoices = [
    { value: 'draft', label: 'Черновик' },
    { value: 'meeting_requested', label: 'Запрошена встреча' },
    { value: 'meeting_scheduled', label: 'Встреча назначена' },
    { value: 'deal_confirmed', label: 'Сделка подтверждена' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'completed', label: 'Завершено' },
  ];

  // Доступные роли пользователей
  const roleChoices = [
    { value: 'client', label: 'Клиент' },
    { value: 'expert', label: 'Инженер' },
    { value: 'admin', label: 'Администратор' },
  ];

  // Загружаем заявки и пользователей
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    Promise.all([
      axios.get(
        'http://localhost:8001/api/orders/orders/',
        { headers }
      ),

      axios.get(
        'http://localhost:8001/api/accounts/users/',
        { headers }
      ),
    ])
      .then(([resOrders, resUsers]) => {
        setOrders(resOrders.data);
        setUsers(resUsers.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Ошибка загрузки панели администратора:', err);

        if (err.response?.status === 401) {
          alert('Сессия истекла. Выполните вход повторно.');
          localStorage.removeItem('access_token');
          navigate('/login');
          return;
        }

        if (err.response?.status === 403) {
          alert('Доступ запрещен. Вы не являетесь администратором.');
          navigate('/cabinet');
          return;
        }

        alert('Не удалось загрузить данные панели администратора.');
        setLoading(false);
      });
  }, [token, navigate]);

  // Получаем только инженеров
  const experts = users.filter(
    (user) => user.role === 'expert'
  );

  // Изменение статуса заявки
  const handleStatusChange = async (
    orderId: number,
    newStatus: string
  ) => {
    if (!token) return;

    setActionLoading(true);

    try {
      await axios.patch(
        `http://localhost:8001/api/orders/orders/${orderId}/`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
              }
            : order
        )
      );

      alert('Статус заявки успешно изменен!');
    } catch (err) {
      console.error(err);
      alert('Ошибка при изменении статуса.');
    } finally {
      setActionLoading(false);
    }
  };

  // Назначение инженера на заявку
  const handleAssignExpert = async (
    orderId: number,
    expertId: number
  ) => {
    if (!token || !expertId) return;

    setActionLoading(true);

    try {
      await axios.post(
        `http://localhost:8001/api/orders/orders/${orderId}/assign-expert/`,
        {
          expert_id: expertId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const selectedExpert = experts.find(
        (expert) => expert.id === expertId
      );

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                assigned_expert:
                  selectedExpert?.username || null,
              }
            : order
        )
      );

      alert('Инженер успешно назначен на объект!');
    } catch (err) {
      console.error(err);
      alert('Ошибка при назначении инженера.');
    } finally {
      setActionLoading(false);
    }
  };

  // ⭐ НОВОЕ:
  // Изменение роли пользователя
  const handleRoleChange = async (
    userId: number,
    newRole: string
  ) => {
    if (!token) return;

    setActionLoading(true);

    try {
      const response = await axios.patch(
        `http://localhost:8001/api/accounts/users/${userId}/role/`,
        {
          role: newRole,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = response.data.user;

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                ...updatedUser,
              }
            : user
        )
      );

      alert(
        `Роль пользователя "${updatedUser.username}" изменена на "${updatedUser.role_display}".`
      );
    } catch (err: any) {
      console.error(err);

      const errorMessage =
        err.response?.data?.error ||
        'Ошибка при изменении роли пользователя.';

      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-status">
        Загрузка панели администратора...
      </div>
    );
  }

  return (
    <div className="admin-cabinet-container">

      <header className="admin-panel-header">
        <h1>
          ⚙️ Панель управления Light House
        </h1>

        <p>
          Глобальный мониторинг заявок и управление пользователями
        </p>
      </header>


      {/* ============================= */}
      {/* УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ */}
      {/* ============================= */}

      <section className="admin-users-section">

        <h2>
          👥 Управление пользователями
        </h2>

        <p>
          Администратор может назначить пользователю
          роль клиента, инженера или администратора.
        </p>

        <div className="admin-table-responsive">

          <table className="admin-orders-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Логин</th>
                <th>Email</th>
                <th>Текущая роль</th>
                <th>Изменить роль</th>
              </tr>
            </thead>

            <tbody>

              {users.map((user) => (

                <tr key={user.id}>

                  <td>
                    <strong>
                      {user.id}
                    </strong>
                  </td>

                  <td>
                    {user.username}
                  </td>

                  <td>
                    {user.email}
                  </td>

                  <td>
                    {user.role_display || user.role}
                  </td>

                  <td>

                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(
                          user.id,
                          e.target.value
                        )
                      }
                      disabled={actionLoading}
                      className="admin-expert-select"
                    >

                      {roleChoices.map((role) => (

                        <option
                          key={role.value}
                          value={role.value}
                        >
                          {role.label}
                        </option>

                      ))}

                    </select>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </section>


      {/* ============================= */}
      {/* УПРАВЛЕНИЕ ЗАЯВКАМИ */}
      {/* ============================= */}

      <section className="admin-orders-section">

        <h2>
          📋 Управление заявками
        </h2>

        <div className="admin-table-responsive">

          <table className="admin-orders-table">

            <thead>

              <tr>
                <th>ID</th>
                <th>Клиент</th>
                <th>Адрес и площадь</th>
                <th>Этап</th>
                <th>Текущий статус</th>
                <th>Назначить инженера</th>
              </tr>

            </thead>

            <tbody>

              {orders.map((order) => (

                <tr key={order.id}>

                  <td>
                    <strong>
                      {order.id}
                    </strong>
                  </td>

                  <td>
                    {order.user}
                  </td>

                  <td>

                    <div className="table-cell-address">
                      {order.property_object?.address ||
                        'Не указан'}
                    </div>

                    <small className="table-cell-area">
                      {order.property_object?.area || '0'} м²
                    </small>

                  </td>

                  <td>

                    <span className="step-badge-counter">
                      {order.current_step} / 7
                    </span>

                  </td>

                  <td>

                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(
                          order.id,
                          e.target.value
                        )
                      }
                      disabled={actionLoading}
                      className="admin-status-select"
                    >

                      {statusChoices.map((choice) => (

                        <option
                          key={choice.value}
                          value={choice.value}
                        >
                          {choice.label}
                        </option>

                      ))}

                    </select>

                  </td>

                  <td>

                    <select
                      value={
                        experts.find(
                          (expert) =>
                            expert.username ===
                            order.assigned_expert
                        )?.id || ''
                      }
                      onChange={(e) =>
                        handleAssignExpert(
                          order.id,
                          Number(e.target.value)
                        )
                      }
                      disabled={
                        actionLoading ||
                        order.status === 'completed' ||
                        experts.length === 0
                      }
                      className="admin-expert-select"
                    >

                      <option value="">
                        -- Выбрать инженера --
                      </option>

                      {experts.map((expert) => (

                        <option
                          key={expert.id}
                          value={expert.id}
                        >
                          {expert.username}
                        </option>

                      ))}

                    </select>

                    {order.assigned_expert && (

                      <div className="assigned-status-text">
                        ✓ Назначен: {order.assigned_expert}
                      </div>

                    )}

                    {experts.length === 0 && (

                      <div className="assigned-status-text">
                        ⚠️ Нет активных инженеров
                      </div>

                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {orders.length === 0 && (

            <p className="no-orders-alert">
              В системе пока нет активных заявок от клиентов.
            </p>

          )}

        </div>

      </section>

    </div>
  );
}
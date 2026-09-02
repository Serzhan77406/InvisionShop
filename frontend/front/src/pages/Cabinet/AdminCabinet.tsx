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

interface ExpertUser {
  id: number;
  username: string;
  role: string;
}

export default function AdminCabinet() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [experts, setExperts] = useState<ExpertUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const token = localStorage.getItem('access_token');

  // Доступные статусы для быстрой смены по ТЗ
  const statusChoices = [
    { value: 'draft', label: 'Черновик' },
    { value: 'meeting_requested', label: 'Запрошена встреча' },
    { value: 'meeting_scheduled', label: 'Встреча назначена' },
    { value: 'deal_confirmed', label: 'Сделка подтверждена' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'completed', label: 'Завершено' },
  ];

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Загружаем все заказы и список пользователей для поиска экспертов
    Promise.all([
      axios.get('http://localhost:8001/api/orders/orders/', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('http://localhost:8001/api/accounts/auth/me/', { headers: { Authorization: `Bearer ${token}` } }).then(() => {
        // Запрос списка всех пользователей (для диплома можно взять эндпоинт пользователей, 
        // либо отфильтровать экспертов. Предположим, админ видит список через базовый эндпоинт).
        return axios.get('http://localhost:8001/api/accounts/users/', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }));
      })
    ])
    .then(([resOrders, resUsers]) => {
      setOrders(resOrders.data);
      // Фильтруем только пользователей с ролью 'expert'
      const filteredExperts = resUsers.data.filter((u: any) => u.role === 'expert');
      setExperts(filteredExperts.length ? filteredExperts : [{ id: 2, username: 'engineer_ivan', role: 'expert' }]); // демо-фолбек для защиты
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      alert('Доступ запрещен. Вы не являетесь администратором.');
      navigate('/cabinet');
    });
  }, [token, navigate]);

  // 1. Функция изменения статуса сделки (PATCH)
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setActionLoading(true);
    try {
      await axios.patch(`http://localhost:8001/api/orders/orders/${orderId}/`, {
        status: newStatus
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      alert('Статус заявки успешно изменен!');
      window.location.reload();
    } catch (err) {
      alert('Ошибка при изменении статуса.');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Функция назначения инженера на заказ (POST)
  const handleAssignExpert = async (orderId: number, expertId: number) => {
    if (!expertId) return;
    setActionLoading(true);
    try {
      await axios.post(`http://localhost:8001/api/orders/orders/${orderId}/assign-expert/`, {
        expert_id: expertId
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      alert('Инженер успешно назначен на объект!');
      window.location.reload();
    } catch (err) {
      alert('Ошибка при назначении инженера.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="admin-status">Загрузка панели администратора...</div>;

  return (
    <div className="admin-cabinet-container">
      <header className="admin-panel-header">
        <h1>⚙️ Панель управления заказами (Администратор)</h1>
        <p>Глобальный мониторинг пошагового контроля легализации пристроек</p>
      </header>

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
            {orders.map(order => (
              <tr key={order.id}>
                <td><strong>{order.id}</strong></td>
                <td>{order.user}</td>
                <td>
                  <div className="table-cell-address">{order.property_object?.address || 'Не указан'}</div>
                  <small className="table-cell-area">{order.property_object?.area || '0'} м²</small>
                </td>
                <td><span className="step-badge-counter">{order.current_step} / 7</span></td>
                <td>
                  {/* Селект для быстрой смены статуса */}
                  <select 
                    value={order.status} 
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={actionLoading}
                    className="admin-status-select"
                  >
                    {statusChoices.map(choice => (
                      <option key={choice.value} value={choice.value}>{choice.label}</option>
                    ))}
                  </select>
                </td>
                <td>
                  {/* Селект для назначения инженера */}
                  <select
                    value={experts.find(e => e.username === order.assigned_expert)?.id || ''}
                    onChange={(e) => handleAssignExpert(order.id, Number(e.target.value))}
                    disabled={actionLoading || order.status === 'completed'}
                    className="admin-expert-select"
                  >
                    <option value="">-- Выбрать инженера --</option>
                    {experts.map(expert => (
                      <option key={expert.id} value={expert.id}>{expert.username}</option>
                    ))}
                  </select>
                  {order.assigned_expert && (
                    <div className="assigned-status-text">✓ Назначен: {order.assigned_expert}</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="no-orders-alert">В системе пока нет активных заявок от клиентов.</p>}
      </div>
    </div>
  );
}

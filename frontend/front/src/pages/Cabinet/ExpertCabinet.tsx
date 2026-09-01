import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ExpertCabinet.css';

interface Order {
  id: number;
  user: string;
  status_display: string;
  current_step: number;
  contract_number: string | null;
}

interface Appointment {
  id: number;
  scheduled_date: string;
  time_slot: string;
  address: string;
  status: string;
}

export default function ExpertCabinet() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Состояния для форм управления сделками (Шаг 5.2 и 5.3)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [finalPrice, setFinalPrice] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [reportNotes, setReportNotes] = useState('');
  
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    // Получаем параллельно список выездов и заказов эксперта
    Promise.all([
      axios.get('http://localhost:8001/api/orders/orders/expert-orders/', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('http://localhost:8001/api/orders/orders/expert-appointments/', { headers: { Authorization: `Bearer ${token}` } })
    ])
    .then(([resOrders, resAppoints]) => {
      setOrders(resOrders.data);
      setAppointments(resAppoints.data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [token]);

  // Функция подтверждения договора (Шаг 5.2)
  const handleConfirmDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;
    try {
      await axios.post(`http://localhost:8001/api/orders/orders/${selectedOrderId}/confirm-deal/`, {
        final_price: finalPrice,
        contract_number: contractNumber
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      alert('Договор подтвержден! Статус обновлен.');
      window.location.reload();
    } catch (err) {
      alert('Ошибка при подтверждении договора.');
    }
  };

  // Функция отправки технического отчета (Шаг 5.3)
  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;
    try {
      await axios.post(`http://localhost:8001/api/orders/orders/${selectedOrderId}/report/`, {
        report_notes: reportNotes
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      alert('Технический отчет отправлен. Статус сделки переведен в работу!');
      window.location.reload();
    } catch (err) {
      alert('Ошибка при сохранении отчета.');
    }
  };

  // Функция перевода этапа легализации (1 из 7)
  const handleApproveStage = async (orderId: number) => {
    try {
      const res = await axios.post(`http://localhost:8001/api/orders/orders/${orderId}/approve-stage/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
      window.location.reload();
    } catch (err) {
      alert('Не удалось изменить этап.');
    }
  };

  if (loading) return <div className="expert-loading">Загрузка панели инженера...</div>;

  return (
    <div className="expert-mobile-container">
      <header className="expert-header">
        <h1>👷 Панель Инженера</h1>
        <p className="expert-badge">Мобильный режим активен</p>
      </header>

      {/* РАЗДЕЛ 1: МОИ ВЫЕЗДЫ */}
      <section className="expert-card-section">
        <h2>🗓️ Мои выезды (на неделю)</h2>
        {appointments.length === 0 ? <p className="empty-text">Выездов не запланировано</p> : (
          appointments.map(app => (
            <div key={app.id} className={`appointment-mobile-card ${app.status}`}>
              <div className="card-row">
                <span className="date-tag">📅 {app.scheduled_date}</span>
                <span className="time-tag">🕒 {app.time_slot}</span>
              </div>
              <p className="address-text">📍 <strong>Адрес:</strong> {app.address}</p>
              <span className="status-badge-inline">Статус: {app.status}</span>
            </div>
          ))
        )}
      </section>

      {/* РАЗДЕЛ 2: МОИ ЗАКАЗЫ */}
      <section className="expert-card-section">
        <h2>📋 Клиенты в работе</h2>
        {orders.length === 0 ? <p className="empty-text">Нет активных клиентов</p> : (
          orders.map(order => (
            <div key={order.id} className="order-mobile-card">
              <h3>Заказ №{order.id} — {order.user}</h3>
              <p>Статус: <span className="status-highlight">{order.status_display}</span></p>
              <p>Текущий этап легализации: <strong>{order.current_step} из 7</strong></p>
              
              <div className="card-actions-grid">
                <button onClick={() => setSelectedOrderId(order.id)} className="btn-action-select">
                  🛠️ Управлять
                </button>
                <button onClick={() => handleApproveStage(order.id)} className="btn-action-next-stage">
                  ✅ Завершить этап
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* РАЗДЕЛД 3: УПРАВЛЕНИЕ ВЫБРАННЫМ ЗАКАЗОМ */}
      {selectedOrderId && (
        <div className="modal-management-panel">
          <div className="modal-content-mobile">
            <button className="btn-close-modal" onClick={() => setSelectedOrderId(null)}>❌ Закрыть</button>
            <h2>Управление Заказом №{selectedOrderId}</h2>

            {/* ФОРМА ПОДТВЕРЖДЕНИЯ СДЕЛКИ (ШАГ 5.2) */}
            <form onSubmit={handleConfirmDeal} className="mobile-expert-form">
              <h3>💼 Подтвердить сделку (Заключить договор)</h3>
              <input type="number" placeholder="Итоговая цена (тенге)" value={finalPrice} onChange={e => setFinalPrice(e.target.value)} required />
              <input type="text" placeholder="Номер официального договора" value={contractNumber} onChange={e => setContractNumber(e.target.value)} required />
              <button type="submit" className="btn-submit-deal">Подписать договор</button>
            </form>

            {/* ФОРМА ТЕХНИЧЕСКОГО ОТЧЕТА (ШАГ 5.3) */}
            <form onSubmit={handleSendReport} className="mobile-expert-form report-form-block">
              <h3>📸 Технический отчёт с объекта</h3>
              <div className="file-upload-stub">
                <input type="file" accept="image/*" disabled />
                <small>📁 Нажмите для загрузки фото изменений/пристройки</small>
              </div>
              <textarea placeholder="Результаты осмотра, замечания по конструкциям, замеры фундамента..." value={reportNotes} onChange={e => setReportNotes(e.target.value)} required />
              <button type="submit" className="btn-submit-report">📥 Отправить отчёт на бэкенд</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

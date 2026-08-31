import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderSuccessPage.css';

export default function OrderSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="success-page-container">
      <div className="success-card">
        <div className="success-icon">🎉</div>
        <h1>Ваша заявка принята!</h1>
        
        {/* СТРОГО ПО ТЗ */}
        <div className="status-notice-box">
          Текущий статус сделки: <strong>Ожидает назначения встречи</strong>
        </div>

        <p className="success-desc">
          Кадастровый инженер свяжется с вами по указанному телефону для подтверждения 
          выбранного временного слота и согласования деталей выезда.
        </p>

        {/* СТРОГО ПО ТЗ */}
        <button onClick={() => navigate('/cabinet')} className="btn-back-cabinet">
          Вернуться в кабинет
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RequestMeetingPage.css';

export default function RequestMeetingPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Состояния для полей формы
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('9-13');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    // Проверяем авторизацию
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Пробуем подставить сохраненную площадь из сессии калькулятора
    const savedArea = localStorage.getItem('last_calculated_area');
    if (savedArea) {
      setArea(savedArea);
    }

    // Загружаем данные профиля для подстановки телефона
    axios
      .get('http://localhost:8001/api/accounts/auth/me/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setPhone(res.data.phone || '');
      })
      .catch(() => {
        // Если токен невалиден, перенаправляем на логин
        localStorage.removeItem('access_token');
        navigate('/login');
      });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    const payload = {
      address: address,
      area: area ? parseFloat(area) : 0,
      scheduled_date: date,
      time_slot: timeSlot,
      notes: `Телефон для связи: ${phone}`
    };

    try {
      // Пробуем стандартный эндпоинт отправки формы
      try {
        await axios.post('http://localhost:8001/api/orders/request-meeting/', payload, { headers });
      } catch (firstErr: any) {
        // Если вернул 404, проигрываем фоллбэк на дублированный URL
        if (firstErr.response && firstErr.response.status === 404) {
          await axios.post('http://localhost:8001/api/orders/orders/request-meeting/', payload, { headers });
        } else {
          throw firstErr;
        }
      }

      // После успешной отправки переходим на страницу успеха/статуса
      navigate('/cabinet/order-success');
    } catch (err: any) {
      console.error('Ошибка при отправке формы:', err.response?.data || err);

      if (err.response?.data) {
        // Показываем детализированную ошибку от Django REST Framework
        const backendMessage = typeof err.response.data === 'string'
          ? err.response.data
          : JSON.stringify(err.response.data);
        setError(`Ошибка валидации: ${backendMessage}`);
      } else {
        setError('Не удалось отправить заявку. Проверьте правильность введенных данных.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="request-meeting-container">
      <h1>Вызов кадастрового инженера</h1>
      <p className="request-subtitle">
        Заполните параметры выезда специалиста на замер и осмотр таунхауса
      </p>

      <form onSubmit={handleSubmit} className="request-form">
        <div className="form-group">
          <label>Точный адрес таунхауса:</label>
          <textarea 
            placeholder="Город, улица, номер дома и квартиры"
            value={address}
            onChange={e => setAddress(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>Площадь пристройки (м²):</label>
          <input 
            type="number" 
            step="0.01"
            placeholder="Площадь в кв. метрах"
            value={area}
            onChange={e => setArea(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Желаемая дата осмотра:</label>
            <input 
              type="date" 
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              disabled={isLoading}
              min={new Date().toISOString().split('T')[0]} // Ограничение: нельзя выбрать прошлые даты
            />
          </div>

          <div className="form-group">
            <label>Предпочтительное время:</label>
            <select 
              value={timeSlot} 
              onChange={e => setTimeSlot(e.target.value)}
              disabled={isLoading}
            >
              <option value="9-13">В первой половине дня (с 9:00 до 13:00)</option>
              <option value="13-18">Во второй половине дня (с 13:00 до 18:00)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Контактный телефон для связи:</label>
          <input 
            type="tel" 
            placeholder="+7 (FFF) FFF-FF-FF"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <button type="submit" className="btn-submit-request" disabled={isLoading}>
          {isLoading ? 'Отправка заявки...' : '🚀 Отправить заявку эксперту'}
        </button>

        {error && <div className="request-error">{error}</div>}
      </form>
    </div>
  );
}
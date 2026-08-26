import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Cabinet.css';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: 'client' | 'expert' | 'admin';
}

export default function Cabinet() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Вытаскиваем access токен, который сохранился при логине
    const token = localStorage.getItem('access_token');
    
    // Если токена нет — перенаправляем гостя на страницу входа
    if (!token) {
      navigate('/login');
      return;
    }

    // Запрашиваем роль и данные текущего пользователя с бэкенда
    axios.get('http://localhost:8001/api/accounts/auth/me/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        setUser(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Сессия истекла. Войдите заново.');
        localStorage.clear(); // Очищаем битые токены
        setTimeout(() => navigate('/login'), 2000);
      });
  }, [navigate]);

  if (loading) {
    return <div className="cabinet-loading">{error ? error : "Загрузка личного кабинета..."}</div>;
  }

  return (
    <div className="cabinet-container">
      <header className="cabinet-header">
        <h1>Личный кабинет</h1>
        <div className="user-info-badge">
          <span>Пользователь: <strong>{user?.username}</strong></span>
          <span className="role-tag">Роль: <strong>{user?.role}</strong></span>
        </div>
      </header>

      {/* РЕНДЕР ПО РОЛЯМ СОГЛАСНО ТЗ */}
      
      {/* 1. ИНТЕРФЕЙС КЛИЕНТА */}
      {user?.role === 'client' && (
        <section className="cabinet-section client-section">
          <h2>Мои объекты</h2>
          <button 
            className="btn-create-property" 
            onClick={() => alert('Форма создания карточки таунхауса в разработке')}
          >
            ➕ Создать карточку таунхауса
          </button>
          
          <div className="objects-empty-state">
            <p>Список моих объектов (пока пусто)</p>
          </div>
        </section>
      )}

      {/* 2. ИНТЕРФЕЙС ИНЖЕНЕРА / ЭКСПЕРТА */}
      {user?.role === 'expert' && (
        <section className="cabinet-section expert-section">
          <h2>Кабинет инженера (скоро)</h2>
          <p className="section-notice">
            Здесь будет доступен список объектов недвижимости клиентов для проведения строительно-технической экспертизы и проверки документов.
          </p>
        </section>
      )}

      {/* 3. ИНТЕРФЕЙС АДМИНИСТРАТОРА */}
      {user?.role === 'admin' && (
        <section className="cabinet-section admin-section">
          <h2>Админ-панель (скоро)</h2>
          <p className="section-notice">
            Консоль глобального управления пользователями, изменения ролей, модерации заявок и редактирования нормативно-правовой базы.
          </p>
        </section>
      )}
    </div>
  );
}

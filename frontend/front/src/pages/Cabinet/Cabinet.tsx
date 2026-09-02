import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api'; // Используем настроенный Axios с токенами
import './Cabinet.css';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: 'client' | 'expert' | 'admin' | string;
}

export default function Cabinet() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    // Запрос через api.ts (baseURL и Bearer token подставляются автоматически)
    api.get<UserProfile>('/accounts/auth/me/')
      .then((response) => {
        const userData = response.data;
        
        // Приводим роль к нижнему регистру для стабильной работы условий
        if (userData && userData.role) {
          userData.role = userData.role.toLowerCase() as UserProfile['role'];
        }

        setUser(userData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Ошибка загрузки профиля:', err);
        setError('Сессия истекла. Войдите заново.');
        localStorage.clear();
        setTimeout(() => navigate('/login'), 2000);
      });
  }, [navigate]);

  if (loading) {
    return <div className="cabinet-loading">{error ? error : "Загрузка личного кабинета..."}</div>;
  }

  // Приведённое значение роли для рендеринга условий
  const normalizedRole = user?.role?.toLowerCase();

  return (
    <div className="cabinet-container">
      <header className="cabinet-header">
        <h1>Личный кабинет</h1>
        <div className="user-info-badge">
          <span>Пользователь: <strong>{user?.username}</strong></span>
          <span className="role-tag">Роль: <strong>{user?.role?.toUpperCase()}</strong></span>
        </div>
      </header>

      {/* 1. ИНТЕРФЕЙС КЛИЕНТА */}
      {normalizedRole === 'client' && (
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
      {normalizedRole === 'expert' && (
        <section className="cabinet-section expert-section">
          <h2>Кабинет инженера (эксперта РК)</h2>
          <p className="section-notice">
            Здесь доступен список объектов недвижимости клиентов для проведения строительно-технической экспертизы, проверки АПЗ, эскизных проектов и подготовки документации для ГАСК / ЦОН.
          </p>
        </section>
      )}

      {/* 3. ИНТЕРФЕЙС АДМИНИСТРАТОРА */}
      {normalizedRole === 'admin' && (
        <section className="cabinet-section admin-section">
          <h2>Панель администратора</h2>
          <p className="section-notice">
            Консоль глобального управления пользователями, назначения ролей экспертов, модерации заявок и редактирования нормативно-правовой базы РК.
          </p>
        </section>
      )}
    </div>
  );
}
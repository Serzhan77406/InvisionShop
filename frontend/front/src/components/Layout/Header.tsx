import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const hasToken = Boolean(localStorage.getItem('access_token'));

  return (
    <header className="site-header">
      <nav className="nav-menu">
        <Link to="/">Главная</Link>
        <Link to="/steps">7 шагов</Link>
        <Link to="/calculator">Калькулятор</Link>
        <Link to="/faq">FAQ</Link>
        <Link to="/laws">Законы</Link>

        {/* Если есть авторизованный пользователь ИЛИ хотя бы токен в localStorage */}
        {(user || hasToken) ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link 
              to="/cabinet" 
              style={{ 
                color: '#007bff', 
                fontWeight: 'bold', 
                textDecoration: 'underline',
                fontSize: '16px',
                cursor: 'pointer' 
              }}
            >
              👤 {user?.username ? user.username : 'Личный кабинет'}
            </Link>

            <button 
              onClick={logout} 
              className="btn-logout"
              style={{
                padding: '6px 12px',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              Выйти
            </button>
          </div>
        ) : (
          <Link 
            to="/login" 
            className="btn-login"
            style={{ fontWeight: 'bold' }}
          >
            Войти
          </Link>
        )}
      </nav>
    </header>
  );
};
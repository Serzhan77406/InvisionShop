import React from 'react';
import './Layout.css';
import { Link, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem('access_token');
  const username = localStorage.getItem('username') || 'Профиль';

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');

    navigate('/login');
  };

  return (
    <div className="layout-wrapper">

      {/* ШАПКА */}
      <header className="main-header">
        <div className="header-container">

          {/* ЛОГОТИП */}
          <Link to="/" className="logo">
            Light <span>House</span>
          </Link>

          {/* ОСНОВНОЕ МЕНЮ */}
          <nav className="main-nav">
            <Link to="/">Главная</Link>
            <Link to="/steps">7 шагов</Link>
            <Link to="/calculator">Калькулятор</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/laws">Законы</Link>
          </nav>

          {/* ПРОФИЛЬ / АВТОРИЗАЦИЯ */}
          <div className="auth-zone">

            {isAuthenticated ? (
              <div className="user-menu">

                {/* ТЕПЕРЬ ПРОФИЛЬ — НАСТОЯЩАЯ ССЫЛКА */}
                <Link
                  to="/profile"
                  className="username-badge"
                  title="Открыть профиль"
                >
                  <span className="profile-icon">👤</span>
                  <span>Профиль</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="btn-logout"
                >
                  Выйти
                </button>

              </div>
            ) : (
              <Link to="/login" className="btn-login">
                Войти
              </Link>
            )}

          </div>

        </div>
      </header>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="main-content">
        {children}
      </main>

      {/* ФУТЕР */}
      <footer className="main-footer">
        <div className="footer-container">

          <p className="copyright">
            © {new Date().getFullYear()} Light House.
            Все права защищены.
          </p>

          <div className="footer-contacts">
            <span>📞 Поддержка: +7 (999) 123-45-67</span>
            <span>✉️ Email: info@lighthouse.kz</span>
          </div>

        </div>
      </footer>

    </div>
  );
};
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  
  // Проверяем, авторизован ли пользователь (есть ли токен в localStorage)
  const isAuthenticated = !!localStorage.getItem('access_token');
  const username = localStorage.getItem('username') || 'Профиль';

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/auth/login');
  };

  return (
    <div className="layout-wrapper">
      {/* ХЕДЕР С МЕНЮ ИЗ MOCKUP */}
      <header className="main-header">
        <div className="header-container">
          <Link to="/" className="logo">
            Invision<span>Shop</span>
          </Link>
          
          <nav className="main-nav">
            <Link to="/">Главная</Link>
            <Link to="/steps">7 шагов</Link>
            <Link to="/calculator">Калькулятор</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/laws">Законы</Link>
          </nav>

          <div className="auth-zone">
            {isAuthenticated ? (
              <div className="user-menu">
                <span className="username-badge">👤 {username}</span>
                <button onClick={handleLogout} className="btn-logout">Выйти</button>
              </div>
            ) : (
              <Link to="/auth/login" className="btn-login">Войти</Link>
            )}
          </div>
        </div>
      </header>

      {/* ОСНОВНОЙ КОНТЕНТ СТРАНИЦЫ */}
      <main className="main-content">
        {children}
      </main>

      {/* ФУТЕР */}
      <footer className="main-footer">
        <div className="footer-container">
          <p className="copyright">&copy; {new Date().getFullYear()} InvisionShop. Все права защищены.</p>
          <div className="footer-contacts">
            <span>📞 Поддержка: +7 (999) 123-45-67</span>
            <span>✉️ Email: info@invisionshop.ru</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

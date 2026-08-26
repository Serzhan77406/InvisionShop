import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="site-header">
      <nav className="nav-menu">
        <Link to="/">Главная</Link>
        <Link to="/steps">7 шагов</Link>
        <Link to="/calculator">Калькулятор</Link>
        
        {user ? (
          <>
            <Link to="/cabinet">Кабинет</Link>
            <button onClick={logout} className="btn-logout">Выйти</button>
          </>
        ) : (
          <Link to="/login">Войти</Link>
        )}
      </nav>
    </header>
  );
};

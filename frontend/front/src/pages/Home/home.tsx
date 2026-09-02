// src/pages/Home/home.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleLearnHow = () => {
    navigate('/steps');
  };

  return (
    <div className="home-container">
      <section className="hero-section">
        <h1 className="hero-title">Узаконить пристройку к таунхаусу</h1>
        <p className="hero-subtitle">
          Профессиональный онлайн-сервис для быстрой и легальной регистрации изменений 
          в планировке, террас и пристроек любой сложности.
        </p>
        <button onClick={handleLearnHow} className="btn-primary-hero">
          Узнать как
        </button>
      </section>

      <section className="about-service-section">
        <h2 className="section-title">О нашем сервисе</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Пошаговый контроль</h3>
            <p>Вы увидите весь процесс легализации, разбитый на 7 понятных и прозрачных этапов.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚖️</div>
            <h3>Юридическая чистота</h3>
            <p>Все процедуры выполняются в строгом соответствии с действующим законодательством.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Помощь экспертов</h3>
            <p>Наши квалифицированные специалисты проверят ваши документы и помогут избежать отказов.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
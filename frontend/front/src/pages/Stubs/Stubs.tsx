import React from 'react';
import { Link } from 'react-router-dom';
import './Stubs.css'; // Подключаем CSS для стилизации заглушек

// Общая обертка для создания красивого центрированного контента
const StubWrapper: React.FC<{ icon: string; title: string; subtitle: string }> = ({ icon, title, subtitle }) => (
  <div className="stub-container">
    <div className="stub-card">
      <div className="stub-icon">{icon}</div>
      <h1 className="stub-title">{title}</h1>
      <p className="stub-subtitle">{subtitle}</p>
      <Link to="/" className="btn-back-home">&larr; Вернуться на главную</Link>
    </div>
  </div>
);

// export const CalculatorPage: React.FC = () => (
//   <StubWrapper 
//     icon="🧮" 
//     title="Калькулятор стоимости" 
//     subtitle="Модуль расчета госпошлин и услуг кадастровых инженеров скоро появится." 
//   />
// );

export const FAQPage: React.FC = () => (
  <StubWrapper 
    icon="❓" 
    title="Часто задаваемые вопросы" 
    subtitle="Раздел с ответами на популярные вопросы юристов и владельцев таунхаусов скоро появится." 
  />
);

export const LegalPage: React.FC = () => (
  <StubWrapper 
    icon="⚖️" 
    title="Нормативно-правовая база" 
    subtitle="Полная база актуальных статей Градостроительного и Гражданского кодексов скоро появится." 
  />
);

export const RegisterPage: React.FC = () => (
  <StubWrapper 
    icon="👤" 
    title="Создание аккаунта" 
    subtitle="Онлайн-регистрация новых пользователей скоро появится." 
  />
);

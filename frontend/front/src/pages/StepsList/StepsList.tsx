import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import './StepsList.css';

interface Step {
  id: number;
  title: string;
  is_completed: boolean;
}

// Заготовки описаний для 7 шагов легализации пристройки
const stepDescriptions: { [key: number]: string } = {
  1: "Сбор первичной документации и получение выписки из ЕГРН.",
  2: "Разработка архитектурного проекта пристройки и технического плана.",
  3: "Согласование изменений со службами ЖКХ и архитектурным отделом.",
  4: "Подача официального заявления в местную администрацию.",
  5: "Проведение строительно-технической экспертизы объекта.",
  6: "Получение акта ввода пристройки в эксплуатацию.",
  7: "Регистрация права собственности и внесение изменений в Росреестр."
};

export const StepsList: React.FC = () => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<Step[]>('/steps/')
      .then((response) => {
        // Сортируем шаги по ID, чтобы они шли по порядку от 1 до 7
        const sortedSteps = response.data.sort((a, b) => a.id - b.b);
        setSteps(sortedSteps);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Не удалось загрузить шаги сделки. Проверьте авторизацию.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading-spinner">Загрузка этапов легализации...</div>;
  if (error) return <div className="error-message-box">⚠️ {error}</div>;

  return (
    <div className="steps-page">
      <h1 className="page-title">7 шагов узаконивания пристройки</h1>
      <p className="page-subtitle">Пройдите все этапы вместе с нашими экспертами для успешной регистрации объекта</p>
      
      <div className="steps-grid">
        {steps.map((step, index) => {
          const stepNumber = index + 1; // Порядковый номер шага для отображения
          return (
            <div 
              key={step.id} 
              className={`step-card ${step.is_completed ? 'completed' : 'in-progress'}`}
              onClick={() => navigate(`/steps/${step.id}`)}
            >
              <div className="step-header">
                <span className="step-number">Шаг {stepNumber}</span>
                <span className="step-status-badge">
                  {step.is_completed ? '✅ Выполнен' : '⏳ В процессе'}
                </span>
              </div>
              <h3 className="step-card-title">{step.title}</h3>
              <p className="step-card-desc">
                {stepDescriptions[stepNumber] || "Индивидуальный этап юридического оформления пристройки."}
              </p>
              <div className="step-card-footer">
                <span className="btn-details">Подробнее &rarr;</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

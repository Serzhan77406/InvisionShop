// src/pages/StepsList/StepsList.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';

interface Step {
  id: number;
  title: string;
  is_completed: boolean;
}

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
    api.get('/steps/')
      .then((response) => {
        let rawSteps: Step[] = [];

        if (Array.isArray(response.data)) {
          rawSteps = response.data;
        } else if (response.data && Array.isArray(response.data.results)) {
          rawSteps = response.data.results;
        }

        rawSteps.sort((a, b) => a.id - b.id);
        setSteps(rawSteps);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Ошибка загрузки шагов:', err);
        setError('Не удалось загрузить список шагов.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка шагов...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>⚠️ {error}</div>;

  return (
    <div className="steps-page" style={{ padding: '20px' }}>
      <h1 className="page-title">7 шагов узаконивания пристройки</h1>
      <p className="page-subtitle">Пройдите все этапы вместе с нашими экспертами для успешной регистрации объекта</p>

      <div className="steps-grid" style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const description = stepDescriptions[stepNumber] || "Индивидуальный этап юридического оформления.";

          return (
            <div 
              key={step.id} 
              className={`step-card ${step.is_completed ? 'completed' : 'in-progress'}`}
              onClick={() => navigate(`/steps/${step.id}`)}
              style={{ cursor: 'pointer', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#fff' }}
            >
              <div className="step-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong>Шаг {stepNumber}</strong>
                <span>{step.is_completed ? '✅ Выполнен' : '⏳ В процессе'}</span>
              </div>
              <h3 style={{ margin: '5px 0' }}>{step.title}</h3>
              <p style={{ color: '#555' }}>{description}</p>
              <span style={{ color: '#0066cc', display: 'inline-block', marginTop: '10px' }}>Подробнее &rarr;</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
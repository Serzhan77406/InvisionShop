import React from 'react';
import './ProgressSidebar.css';

interface ProgressSidebarProps {
  currentStep: number;        // Число от 1 до 7 (текущий шаг)
  isStepCompleted: boolean;  // Завершен ли текущий шаг инженером
  onNextStep: () => void;     // Обработчик для перехода к следующему шагу
}

const STEP_TITLES = [
  "Сбор первичной документации и выписка ЕГРН",
  "Разработка архитектурного технического плана",
  "Согласование изменений со службами ЖКХ",
  "Подача заявления в местную администрацию",
  "Проведение строительно-технической экспертизы",
  "Получение акта ввода в эксплуатацию",
  "Регистрация права собственности в Росреестре"
];

export const ProgressSidebar: React.FC<ProgressSidebarProps> = ({
  currentStep,
  isStepCompleted,
  onNextStep
}) => {
  const totalSteps = 7;
  
  // Математический расчет процента прогресса для диплома
  const progressPercentage = Math.round(((currentStep - 1 + (isStepCompleted ? 1 : 0)) / totalSteps) * 100);

  return (
    <aside className="progress-sidebar">
      <div className="sidebar-header">
        <h3>Ход легализации</h3>
        {/* Прогресс-бар (%) */}
        <div className="progress-value">{progressPercentage}%</div>
      </div>
      
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
      </div>

      {/* Список 7 шагов с отметками */}
      <ul className="steps-status-list">
        {STEP_TITLES.map((title, index) => {
          const stepNum = index + 1;
          let statusIcon = "⏳";
          let statusClass = "waiting";
          let statusText = "Ожидает";

          if (stepNum < currentStep) {
            statusIcon = "✅";
            statusClass = "ready";
            statusText = "Готов";
          } else if (stepNum === currentStep) {
            statusIcon = isStepCompleted ? "✅" : "🔄";
            statusClass = isStepCompleted ? "ready" : "in-progress";
            statusText = isStepCompleted ? "Готов" : "В процессе";
          }

          // Проверка подсветки текущего шага
          const isCurrent = stepNum === currentStep;

          return (
            <li key={stepNum} className={`step-status-item ${statusClass} ${isCurrent ? 'current-active' : ''}`}>
              <div className="step-status-icon">{statusIcon}</div>
              <div className="step-status-info">
                <span className="step-status-num">Шаг {stepNum} — {statusText}</span>
                <p className="step-status-title">{title}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Кнопка "Следующий шаг" (доступна, если текущий шаг завершён экспертом) */}
      <div className="sidebar-footer">
        <button 
          onClick={onNextStep} 
          className="btn-next-step"
          disabled={!isStepCompleted || currentStep >= totalSteps}
        >
          {currentStep >= totalSteps && isStepCompleted ? "🎉 Все этапы пройдены!" : "Следующий шаг →"}
        </button>
        {!isStepCompleted && (
          <p className="helper-text">Ожидайте проверки и подтверждения текущего этапа инженером.</p>
        )}
      </div>
    </aside>
  );
};

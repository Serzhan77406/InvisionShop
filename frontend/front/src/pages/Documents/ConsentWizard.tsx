import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ConsentWizard.css';

export default function ConsentWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  
  // Состояние полей мастера
  const [formData, setFormData] = useState({
    owner_name: '',
    owner_iin: '',
    neighbor_name: '',
    neighbor_plot: '',
    property_desc: ''
  });

  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const handleDownload = async () => {
    // ОБЯЗАТЕЛЬНО ПО ТЗ: Проверяем авторизацию перед скачиванием
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Для скачивания юридических документов необходимо зарегистрироваться в системе.');
      navigate('/register');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await axios.post('http://localhost:8001/api/documents/generate-consent/', formData, {
        responseType: 'blob' // Важно для скачивания бинарных файлов (PDF)
      });

      // Логика скачивания файла на компьютер пользователя
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'Soglasie_Sosedei.pdf';
      link.click();
    } catch (err) {
      console.error(err);
      alert('Ошибка при генерации документа.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="wizard-page">
      <h1>Мастер формирования согласия соседей</h1>
      
      {/* Индикатор текущего шага */}
      <div className="wizard-steps-indicator">
        <span className={step === 1 ? 'active' : ''}>1. Заявитель</span>
        <span className={step === 2 ? 'active' : ''}>2. Соседи</span>
        <span className={step === 3 ? 'active' : ''}>3. Параметры</span>
      </div>

      <div className="wizard-card">
        {step === 1 && (
          <div className="wizard-step">
            <h2>Шаг 1: Данные заявителя</h2>
            <input 
              type="text" 
              placeholder="ФИО Собственника таунхауса" 
              value={formData.owner_name}
              onChange={e => setFormData({...formData, owner_name: e.target.value})}
            />
            <input 
              type="text" 
              placeholder="ИИН Собственника" 
              value={formData.owner_iin}
              onChange={e => setFormData({...formData, owner_iin: e.target.value})}
            />
            <button onClick={handleNext} className="btn-next">Далее &rarr;</button>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-step">
            <h2>Шаг 2: Данные соседей</h2>
            <input 
              type="text" 
              placeholder="ФИО Соседа (согласующего лица)" 
              value={formData.neighbor_name}
              onChange={e => setFormData({...formData, neighbor_name: e.target.value})}
            />
            <input 
              type="text" 
              placeholder="Номер смежного участка / квартиры" 
              value={formData.neighbor_plot}
              onChange={e => setFormData({...formData, neighbor_plot: e.target.value})}
            />
            <div className="wizard-buttons">
              <button onClick={handlePrev} className="btn-prev">&larr; Назад</button>
              <button onClick={handleNext} className="btn-next">Далее &rarr;</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="wizard-step">
            <h2>Шаг 3: Параметры пристройки</h2>
            <textarea 
              placeholder="Краткое описание пристройки (например: Двухэтажная терраса из металлоконструкций площадью 24 м²)" 
              value={formData.property_desc}
              onChange={e => setFormData({...formData, property_desc: e.target.value})}
            />
            <div className="wizard-buttons">
              <button onClick={handlePrev} className="btn-prev">&larr; Назад</button>
              <button 
                onClick={handleDownload} 
                className="btn-download-pdf"
                disabled={isGenerating}
              >
                {isGenerating ? 'Генерация...' : '📥 Скачать готовый PDF'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

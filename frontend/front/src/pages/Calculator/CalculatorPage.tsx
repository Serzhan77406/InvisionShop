import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CalculatorPage.css';

interface Tariff {
  id: number;
  service_name: string;
  price_per_m2: string;
  is_active: boolean;
}

interface CalculationBreakdown {
  service_id: number;
  service_name: string;
  price_per_m2: number;
  cost: number;
}

interface CalculationResult {
  area: number;
  breakdown: CalculationBreakdown[];
  total: number;
}

export default function CalculatorPage() {
  // Состояния для тарифов (услуг) с бэкенда
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Состояния формы
  const [area, setArea] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  
  // Состояния результата и ошибок
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Загружаем список активных услуг при открытии страницы
  useEffect(() => {
    axios.get('http://localhost:8001/api/calculator/tariffs/')
      .then(res => {
        setTariffs(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Не удалось загрузить тарифы услуг.');
        setLoading(false);
      });
  }, []);

  // Переключение чекбоксов услуг
  const handleServiceChange = (serviceId: number) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  // Отправка данных на расчет
  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (selectedServices.length === 0) {
      setError('Выберите хотя бы одну услугу для расчета.');
      return;
    }

    setIsCalculating(true);

    try {
      const response = await axios.post('http://localhost:8001/api/calculator/calculate/', {
        area: area,
        services: selectedServices
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Произошла ошибка при расчете.');
    } finally {
      setIsCalculating(false);
    }
  };

  if (loading) return <div className="calc-status">Загрузка модулей калькулятора...</div>;

  return (
    <div className="calculator-page-container">
      <h1 className="calc-title">Калькулятор стоимости узаконивания</h1>
      <p className="calc-subtitle">Рассчитайте предварительную стоимость легализации пристройки онлайн</p>

      <div className="calc-layout">
        {/* ФОРМА ВВОДА ПАРАМЕТРОВ */}
        <form onSubmit={handleCalculate} className="calc-form">
          <div className="form-group">
            <label htmlFor="area-input">Введите площадь пристройки (м²):</label>
            <input
              id="area-input"
              type="number"
              step="0.01"
              placeholder="Например: 45.5"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
              min="0.1"
              disabled={isCalculating}
            />
          </div>

          <div className="form-group">
            <label>Выберите необходимые услуги:</label>
            <div className="checkbox-grid">
              {tariffs.map(tariff => (
                <label key={tariff.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(tariff.id)}
                    onChange={() => handleServiceChange(tariff.id)}
                    disabled={isCalculating}
                  />
                  <span className="checkbox-text">
                    {tariff.service_name} <small>({tariff.price_per_m2} тенге/м²)</small>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-calc-submit" disabled={isCalculating}>
            {isCalculating ? 'Считаем...' : 'Рассчитать стоимость'}
          </button>

          {error && <div className="calc-error-box">⚠️ {error}</div>}
        </form>

        {/* ТАБЛИЦА С РЕЗУЛЬТАТАМИ РАСЧЕТА */}
        {result && (
          <div className="calc-results-panel">
            <h2>Результаты расчета для {result.area} м²</h2>
            <table className="calc-table">
              <thead>
                <tr>
                  <th>Название услуги</th>
                  <th>Цена за м²</th>
                  <th>Итоговая стоимость</th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.service_name}</td>
                    <td>{item.price_per_m2} тенге.</td>
                    <td>{item.cost.toLocaleString()} тенге.</td>
                  </tr>
                ))}
                <tr className="table-total-row">
                  <td colSpan={2}><strong>ИТОГО ПОД КЛЮЧ:</strong></td>
                  <td><strong>{result.total.toLocaleString()} тенге.</strong></td>
                </tr>
              </tbody>
            </table>

            {/* ОБЯЗАТЕЛЬНОЕ ПРЕДУПРЕЖДЕНИЕ ПО ТЗ */}
            <div className="calc-warning-notice">
              ℹ️ <strong>Расчёт предварительный.</strong> Точная стоимость — после осмотра инженером.
            </div>

            {/* КНОПКА ВЫЗОВА ИНЖЕНЕРА (ЗАГЛУШКА) */}
            <button 
              className="btn-call-engineer" 
              onClick={() => alert('Заявка принята! Инженер свяжется с вами в течение 15 минут (демо-заглушка).')}
            >
              📞 Вызвать инженера на осмотр
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

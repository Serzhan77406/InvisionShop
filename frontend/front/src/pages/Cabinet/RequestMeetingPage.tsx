
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RequestMeetingPage.css';

export default function RequestMeetingPage() {
  const navigate = useNavigate();

  // ============================================================
  // СОСТОЯНИЯ
  // ============================================================

  const [isLoading, setIsLoading] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string | null>(null);

  const [area, setArea] =
    useState('');

  const [requestedStep, setRequestedStep] =
    useState<number>(7);

  const [estimatedPrice, setEstimatedPrice] =
    useState<number>(0);

  const [address, setAddress] =
    useState('');

  // ============================================================
  // ЗАГРУЗКА ДАННЫХ ИЗ КАЛЬКУЛЯТОРА
  // ============================================================

  useEffect(() => {
    const token =
      localStorage.getItem('access_token');

    if (!token) {
      navigate('/login');
      return;
    }

    // ----------------------------------------------------------
    // Площадь
    // ----------------------------------------------------------

    const savedArea =
      localStorage.getItem(
        'last_calculated_area'
      );

    if (savedArea) {
      setArea(savedArea);
    }

    // ----------------------------------------------------------
    // Запрошенный клиентом этап
    // ----------------------------------------------------------

    const savedRequestedStep =
      localStorage.getItem(
        'requested_step'
      );

    if (savedRequestedStep) {
      const parsedStep =
        Number(savedRequestedStep);

      if (
        parsedStep >= 1 &&
        parsedStep <= 7
      ) {
        setRequestedStep(parsedStep);
      }
    }

    // ----------------------------------------------------------
    // Предварительная стоимость
    // ----------------------------------------------------------

    const savedTotal =
      localStorage.getItem(
        'calculated_total'
      );

    if (savedTotal) {
      const parsedTotal =
        Number(savedTotal);

      if (!Number.isNaN(parsedTotal)) {
        setEstimatedPrice(parsedTotal);
      }
    }

  }, [navigate]);

  // ============================================================
  // ОТПРАВКА ЗАЯВКИ
  // ============================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError(null);
    setIsLoading(true);

    const token =
      localStorage.getItem(
        'access_token'
      );

    if (!token) {
      navigate('/login');
      return;
    }

    // ----------------------------------------------------------
    // Проверки
    // ----------------------------------------------------------

    if (
      requestedStep < 1 ||
      requestedStep > 7
    ) {
      setError(
        'Выбран некорректный этап.'
      );

      setIsLoading(false);
      return;
    }

    if (!area) {
      setError(
        'Не указана площадь пристройки.'
      );

      setIsLoading(false);
      return;
    }

    // ----------------------------------------------------------
    // Данные для backend
    // ----------------------------------------------------------

    const payload = {
      property_object: null,

      estimated_price:
        estimatedPrice,

      requested_step:
        requestedStep,
    };

    console.log(
      'Отправляем заявку:',
      payload
    );

    try {
      await axios.post(
        'http://localhost:8001/api/orders/request-meeting/',
        payload,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      // --------------------------------------------------------
      // Заявка успешно создана
      // --------------------------------------------------------

      navigate(
        '/cabinet/order-success'
      );

    } catch (err: any) {
      console.error(
        'Ошибка при отправке заявки:',
        err.response?.data || err
      );

      const backendData =
        err.response?.data;

      if (backendData) {
        if (
          typeof backendData ===
          'string'
        ) {
          setError(
            backendData
          );
        } else {
          setError(
            JSON.stringify(
              backendData
            )
          );
        }
      } else {
        setError(
          'Не удалось отправить заявку. Проверьте данные и попробуйте снова.'
        );
      }

    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // НАЗВАНИЕ ЭТАПА
  // ============================================================

  const getStepName = (
    step: number
  ) => {
    const steps: Record<
      number,
      string
    > = {
      1: 'Первичная обработка заявки',
      2: 'Подготовка исходных материалов',
      3: 'Техническая документация',
      4: 'Согласование проекта',
      5: 'Оформление и проверка документов',
      6: 'Подготовка к завершению процедуры',
      7: 'Завершение легализации',
    };

    return (
      steps[step] ||
      `Этап ${step}`
    );
  };

  // ============================================================
  // ИНТЕРФЕЙС
  // ============================================================

  return (
    <div className="request-meeting-container">

      <h1>
        Вызов кадастрового инженера
      </h1>

      <p className="request-subtitle">
        Проверьте данные заявки перед
        отправкой специалисту
      </p>


      {/* ======================================================
          ОСНОВНАЯ ИНФОРМАЦИЯ
      ====================================================== */}

      <form
        onSubmit={handleSubmit}
        className="request-form"
      >

        {/* ПЛОЩАДЬ */}

        <div className="form-group">

          <label>
            Площадь пристройки (м²):
          </label>

          <input
            type="number"
            step="0.01"
            value={area}
            onChange={(e) =>
              setArea(e.target.value)
            }
            disabled
          />

        </div>


        {/* СТОИМОСТЬ */}

        <div className="form-group">

          <label>
            Предварительная стоимость:
          </label>

          <input
            type="text"
            value={
              estimatedPrice
                ? `${estimatedPrice.toLocaleString()} тенге`
                : 'Не рассчитана'
            }
            disabled
          />

        </div>


        {/* ==================================================
            ТРЕБУЕМЫЙ ЭТАП
        ================================================== */}

        <div className="form-group">

          <label>
            Требуемый этап легализации:
          </label>

          <input
            type="text"
            value={`Этап ${requestedStep} — ${getStepName(
              requestedStep
            )}`}
            disabled
          />

          <small>
            Этот этап выбран вами в
            калькуляторе.
          </small>

        </div>


        {/* ==================================================
            АДРЕС
        ================================================== */}

        <div className="form-group">

          <label>
            Адрес объекта:
          </label>

          <textarea
            placeholder="Город, улица, номер дома"
            value={address}
            onChange={(e) =>
              setAddress(
                e.target.value
              )
            }
            disabled={isLoading}
          />

          <small>
            Адрес сохраняется для подготовки
            последующего выезда инженера.
          </small>

        </div>


        {/* ==================================================
            ИНФОРМАЦИЯ О ДАЛЬНЕЙШЕМ ПРОЦЕССЕ
        ================================================== */}

        <div className="calc-warning-notice">

          ℹ️ После отправки заявки
          администратор назначит инженера
          и согласует дату и время выезда
          на объект.

        </div>


        {/* ==================================================
            КНОПКА
        ================================================== */}

        <button
          type="submit"
          className="btn-submit-request"
          disabled={isLoading}
        >
          {isLoading
            ? 'Отправка заявки...'
            : '🚀 Отправить заявку инженеру'}
        </button>


        {/* ==================================================
            ОШИБКА
        ================================================== */}

        {error && (
          <div className="request-error">
            ⚠️ {error}
          </div>
        )}

      </form>

    </div>
  );
}

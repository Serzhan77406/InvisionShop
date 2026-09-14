
import React, {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import { api } from '../../api';

import './Cabinet.css';


// ============================================================
// ПОЛЬЗОВАТЕЛЬ
// ============================================================

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role:
    | 'client'
    | 'expert'
    | 'admin'
    | string;
}


// ============================================================
// ОБЪЕКТ
// ============================================================

interface PropertyObject {
  id?: number;
  address?: string;
  area?: string | number;
}


// ============================================================
// ВЫЕЗД / ВСТРЕЧА
// ============================================================

interface Appointment {
  id: number;
  scheduled_date: string;
  time_slot: string;
  address: string;
  status: string;
  notes?: string | null;
}


// ============================================================
// ЗАЯВКА
// ============================================================

interface Order {
  id: number;

  user: string;

  property_object:
    | PropertyObject
    | null;

  status: string;

  status_display: string;

  estimated_price:
    | string
    | number
    | null;

  final_price:
    | string
    | number
    | null;

  contract_number:
    | string
    | null;

  assigned_expert:
    | string
    | null;

  // Текущий этап
  current_step: number;

  // Этап, который выбрал клиент
  requested_step: number;

  appointments: Appointment[];

  created_at: string;
}


// ============================================================
// КОЛИЧЕСТВО ЭТАПОВ
// ============================================================

const TOTAL_STEPS = 7;


// ============================================================
// НАЗВАНИЯ ЭТАПОВ
// ============================================================

const stepNames = [
  'Подача заявки',
  'Первичная проверка',
  'Назначение инженера',
  'Осмотр объекта',
  'Подготовка технической документации',
  'Согласование документации',
  'Завершение оформления',
];


// ============================================================
// КОМПОНЕНТ
// ============================================================

export default function Cabinet() {
  const navigate = useNavigate();


  // ==========================================================
  // СОСТОЯНИЯ
  // ==========================================================

  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [ordersLoading, setOrdersLoading] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string | null>(null);


  // ==========================================================
  // ЗАГРУЗКА ПРОФИЛЯ
  // ==========================================================

  const loadProfile = async () => {
    try {
      const response =
        await api.get<UserProfile>(
          '/accounts/auth/me/'
        );

      const userData =
        response.data;

      if (!userData) {
        throw new Error(
          'Профиль пользователя не получен'
        );
      }

      const normalizedUser:
        UserProfile = {
        ...userData,

        role:
          userData.role?.toLowerCase() ||
          'client',
      };

      setUser(
        normalizedUser
      );

      return normalizedUser;

    } catch (err) {

      console.error(
        'Ошибка загрузки профиля:',
        err
      );

      setError(
        'Сессия истекла. Войдите заново.'
      );

      localStorage.removeItem(
        'access_token'
      );

      localStorage.removeItem(
        'refresh_token'
      );

      setTimeout(() => {
        navigate('/login');
      }, 1500);

      return null;
    }
  };


  // ==========================================================
  // ЗАГРУЗКА ЗАЯВОК КЛИЕНТА
  // ==========================================================

  const loadClientOrders = async () => {
    try {

      setOrdersLoading(
        true
      );

      /*
       * ВАЖНО:
       * раньше здесь было:
       *
       * /orders/orders/
       *
       * теперь правильный endpoint:
       *
       * /orders/
       */

      const response =
        await api.get<Order[]>(
          '/orders/'
        );

      console.log(
        'Заявки клиента:',
        response.data
      );

      setOrders(
        response.data || []
      );

    } catch (err) {

      console.error(
        'Ошибка загрузки заявок клиента:',
        err
      );

      setError(
        'Не удалось загрузить заявки.'
      );

    } finally {

      setOrdersLoading(
        false
      );
    }
  };


  // ==========================================================
  // НАЧАЛЬНАЯ ЗАГРУЗКА
  // ==========================================================

  useEffect(() => {

    const token =
      localStorage.getItem(
        'access_token'
      );

    if (!token) {
      navigate('/login');
      return;
    }

    const initializeCabinet =
      async () => {

        const userData =
          await loadProfile();

        if (!userData) {
          setLoading(false);
          return;
        }

        const role =
          userData.role.toLowerCase();

        if (role === 'client') {
          await loadClientOrders();
        }

        setLoading(false);
      };

    initializeCabinet();

  }, [navigate]);


  // ==========================================================
  // АВТООБНОВЛЕНИЕ
  // ==========================================================

  useEffect(() => {

    if (
      user?.role?.toLowerCase() !==
      'client'
    ) {
      return;
    }

    const interval =
      setInterval(() => {

        loadClientOrders();

      }, 10000);

    return () =>
      clearInterval(interval);

  }, [user]);


  // ==========================================================
  // ЗАГРУЗКА
  // ==========================================================

  if (loading) {

    return (
      <div className="cabinet-loading">

        {error
          ? error
          : 'Загрузка личного кабинета...'}

      </div>
    );
  }


  const normalizedRole =
    user?.role?.toLowerCase();


  // ==========================================================
  // ПРОГРЕСС ОТНОСИТЕЛЬНО ЗАПРОШЕННОГО ЭТАПА
  // ==========================================================

  const getProgress = (
    currentStep: number,
    requestedStep: number
  ) => {

    const safeRequestedStep =
      Math.min(
        Math.max(
          requestedStep || 7,
          1
        ),
        TOTAL_STEPS
      );

    const safeCurrentStep =
      Math.min(
        Math.max(
          currentStep || 1,
          1
        ),
        safeRequestedStep
      );

    return Math.round(
      (
        safeCurrentStep /
        safeRequestedStep
      ) * 100
    );
  };


  // ==========================================================
  // НАЗВАНИЕ ТЕКУЩЕГО ЭТАПА
  // ==========================================================

  const getStepName = (
    currentStep: number
  ) => {

    const index =
      Math.min(
        Math.max(
          (currentStep || 1) - 1,
          0
        ),
        stepNames.length - 1
      );

    return stepNames[index];
  };


  // ==========================================================
  // НАЗВАНИЕ ЗАПРОШЕННОГО ЭТАПА
  // ==========================================================

  const getRequestedStepName = (
    requestedStep: number
  ) => {

    const index =
      Math.min(
        Math.max(
          (requestedStep || 1) - 1,
          0
        ),
        stepNames.length - 1
      );

    return stepNames[index];
  };


  // ==========================================================
  // ИНТЕРФЕЙС
  // ==========================================================

  return (
    <div className="cabinet-container">


      {/* =====================================================
          ШАПКА
      ===================================================== */}

      <header className="cabinet-header">

        <h1>
          Личный кабинет
        </h1>

        <div className="user-info-badge">

          <span>
            Пользователь:{' '}
            <strong>
              {user?.username}
            </strong>
          </span>

          <span className="role-tag">

            Роль:{' '}

            <strong>
              {user?.role?.toUpperCase()}
            </strong>

          </span>

        </div>

      </header>


      {/* =====================================================
          КЛИЕНТ
      ===================================================== */}

      {normalizedRole === 'client' && (

        <section
          className="
            cabinet-section
            client-section
          "
        >

          <h2>
            Мои объекты и заявки
          </h2>


          {/* =================================================
              СОЗДАТЬ ТЗ
          ================================================= */}

          <button
            className="btn-create-property"
            onClick={() =>
              navigate(
                '/technical-assignment'
              )
            }
          >

            ➕ Создать карточку таунхауса
            или техническое задание,
            утвержденное по форме СНИП

          </button>


          {/* =================================================
              МОИ ЗАЯВКИ
          ================================================= */}

          <div className="client-orders-block">

            <h2>
              📋 Мои заявки
            </h2>


            {/* -------------------------------------------------
                ОБНОВЛЕНИЕ
            ------------------------------------------------- */}

            {ordersLoading && (

              <p className="section-notice">
                Обновление информации...
              </p>

            )}


            {/* -------------------------------------------------
                ОШИБКА
            ------------------------------------------------- */}

            {error && !ordersLoading && (

              <p className="request-error">
                ⚠️ {error}
              </p>

            )}


            {/* -------------------------------------------------
                НЕТ ЗАЯВОК
            ------------------------------------------------- */}

            {!ordersLoading &&
              orders.length === 0 &&
              !error && (

                <div className="objects-empty-state">

                  <p>
                    У вас пока нет
                    созданных заявок.
                  </p>

                  <button
                    className="btn-create-property"
                    onClick={() =>
                      navigate(
                        '/calculator'
                      )
                    }
                  >
                    🧮 Перейти в калькулятор
                  </button>

                </div>

              )}


            {/* -------------------------------------------------
                ЗАЯВКИ
            ------------------------------------------------- */}

            {orders.map(
              (order) => {

                const requestedStep =
                  Math.min(
                    Math.max(
                      order.requested_step ||
                        TOTAL_STEPS,
                      1
                    ),
                    TOTAL_STEPS
                  );

                const currentStep =
                  Math.min(
                    Math.max(
                      order.current_step ||
                        1,
                      1
                    ),
                    requestedStep
                  );

                const progress =
                  getProgress(
                    currentStep,
                    requestedStep
                  );


                return (

                  <div
                    key={order.id}
                    className="client-order-card"
                  >


                    {/* =========================================
                        ЗАГОЛОВОК
                    ========================================= */}

                    <div className="order-header">

                      <h3>
                        Заявка №
                        {order.id}
                      </h3>

                      <span className="status-tag">
                        {
                          order.status_display
                        }
                      </span>

                    </div>


                    {/* =========================================
                        ОБЪЕКТ
                    ========================================= */}

                    {order.property_object && (

                      <div
                        className="
                          order-property-info
                        "
                      >

                        <p>

                          <strong>
                            📍 Адрес:
                          </strong>{' '}

                          {
                            order
                              .property_object
                              .address ||
                            'Адрес не указан'
                          }

                        </p>


                        {order
                          .property_object
                          .area && (

                          <p>

                            <strong>
                              📐 Площадь:
                            </strong>{' '}

                            {
                              order
                                .property_object
                                .area
                            }

                          </p>

                        )}

                      </div>

                    )}


                    {/* =========================================
                        ЗАПРОШЕННЫЙ ЭТАП
                    ========================================= */}

                    <div
                      className="
                        order-expert-info
                      "
                    >

                      <p>

                        <strong>
                          🎯 Требуемый этап:
                        </strong>{' '}

                        {requestedStep} из{' '}
                        {TOTAL_STEPS}

                      </p>

                      <p>

                        <strong>
                          📌 Цель заявки:
                        </strong>{' '}

                        {
                          getRequestedStepName(
                            requestedStep
                          )
                        }

                      </p>

                    </div>


                    {/* =========================================
                        ИНЖЕНЕР
                    ========================================= */}

                    <div
                      className="
                        order-expert-info
                      "
                    >

                      <p>

                        <strong>
                          👷 Инженер:
                        </strong>{' '}

                        {order.assigned_expert ? (

                          <span>
                            {
                              order
                                .assigned_expert
                            }
                          </span>

                        ) : (

                          <span>
                            Инженер пока
                            не назначен
                          </span>

                        )}

                      </p>

                    </div>


                    {/* =========================================
                        ПРОГРЕСС
                    ========================================= */}

                    <div
                      className="
                        progress-section
                      "
                    >

                      <div
                        className="
                          progress-title
                        "
                      >

                        <strong>
                          Прогресс заявки
                        </strong>

                        <span>

                          {currentStep}{' '}
                          из{' '}
                          {requestedStep}

                        </span>

                      </div>


                      <div
                        className="
                          progress-bar-container
                        "
                      >

                        <div
                          className="
                            progress-bar-fill
                          "
                          style={{
                            width:
                              `${progress}%`,
                          }}
                        />

                      </div>


                      <div
                        className="
                          progress-percent
                        "
                      >
                        Выполнено:{' '}
                        {progress}%
                      </div>


                      <div
                        className="
                          current-step-info
                        "
                      >

                        <strong>
                          Текущий этап:
                        </strong>{' '}

                        {
                          getStepName(
                            currentStep
                          )
                        }

                      </div>


                      <div
                        className="
                          current-step-info
                        "
                      >

                        <strong>
                          Следующий этап:
                        </strong>{' '}

                        {currentStep <
                        requestedStep
                          ? getStepName(
                              currentStep + 1
                            )
                          : 'Все необходимые этапы завершены'}

                      </div>

                    </div>


                    {/* =========================================
                        ЭТАПЫ
                    ========================================= */}

                    <div
                      className="
                        steps-list
                      "
                    >

                      {stepNames.map(
                        (
                          stepName,
                          index
                        ) => {

                          const stepNumber =
                            index + 1;


                          let stepClass =
                            'step-pending';


                          if (
                            stepNumber <
                            currentStep
                          ) {

                            stepClass =
                              'step-completed';

                          }


                          if (
                            stepNumber ===
                            currentStep
                          ) {

                            stepClass =
                              'step-current';

                          }


                          // Этапы после требуемого
                          // считаем ненужными
                          if (
                            stepNumber >
                            requestedStep
                          ) {

                            stepClass =
                              'step-pending';

                          }


                          return (

                            <div
                              key={
                                stepNumber
                              }
                              className={`
                                step-item
                                ${stepClass}
                              `}
                            >

                              <div
                                className="
                                  step-number
                                "
                              >

                                {stepNumber <
                                currentStep
                                  ? '✓'
                                  : stepNumber}

                              </div>


                              <div
                                className="
                                  step-name
                                "
                              >
                                {stepName}
                              </div>

                            </div>

                          );
                        }
                      )}

                    </div>


                    {/* =========================================
                        ДОГОВОР
                    ========================================= */}

                    {order.contract_number && (

                      <div
                        className="
                          contract-info
                        "
                      >

                        <p>

                          <strong>
                            📄 Номер договора:
                          </strong>{' '}

                          {
                            order.contract_number
                          }

                        </p>


                        {order.final_price && (

                          <p>

                            <strong>
                              💰 Итоговая стоимость:
                            </strong>{' '}

                            {
                              order.final_price
                            }{' '}

                            ₸

                          </p>

                        )}

                      </div>

                    )}


                    {/* =========================================
                        ВЫЕЗДЫ
                    ========================================= */}

                    {order.appointments &&
                      order.appointments
                        .length > 0 && (

                      <div
                        className="
                          appointments-info
                        "
                      >

                        <h4>
                          🗓️ Назначенные встречи
                        </h4>


                        {order
                          .appointments
                          .map(
                            (
                              appointment
                            ) => (

                              <div
                                key={
                                  appointment.id
                                }
                                className="
                                  appointment-client-item
                                "
                              >

                                <p>
                                  📅{' '}
                                  {
                                    appointment
                                      .scheduled_date
                                  }
                                </p>

                                <p>
                                  🕒{' '}
                                  {
                                    appointment
                                      .time_slot
                                  }
                                </p>

                                <p>
                                  📍{' '}
                                  {
                                    appointment
                                      .address
                                  }
                                </p>

                                <p>
                                  Статус:{' '}
                                  {
                                    appointment
                                      .status
                                  }
                                </p>


                                {appointment
                                  .status ===
                                  'completed' &&
                                  appointment
                                    .notes && (

                                  <p>

                                    <strong>
                                      📝 Результат
                                      осмотра:
                                    </strong>{' '}

                                    {
                                      appointment
                                        .notes
                                    }

                                  </p>

                                )}

                              </div>

                            )
                          )}

                      </div>

                    )}


                    

                  </div>

                );
              }
            )}

          </div>

        </section>

      )}


      {/* =====================================================
          ИНЖЕНЕР
      ===================================================== */}

      {normalizedRole === 'expert' && (

        <section
          className="
            cabinet-section
            expert-section
          "
        >

          <h2>
            Кабинет инженера
          </h2>

          <p className="section-notice">

            Здесь доступен список объектов
            недвижимости клиентов для проведения
            строительно-технической экспертизы,
            проверки АПЗ, эскизных проектов
            и подготовки документации.

          </p>

          <button
            onClick={() =>
              navigate('/expert')
            }
            className="btn-create-property"
          >
            👷 Открыть кабинет инженера
          </button>

        </section>

      )}


      {/* =====================================================
          АДМИНИСТРАТОР
      ===================================================== */}

      {normalizedRole === 'admin' && (

        <section
          className="
            cabinet-section
            admin-section
          "
        >

          <h2>
            Панель администратора
          </h2>

          <p className="section-notice">

            Консоль глобального управления
            пользователями, назначения ролей
            инженеров, модерации заявок
            и управления системой Light House.

          </p>

          <button
            onClick={() =>
              navigate('/admin-panel')
            }
            className="btn-create-property"
          >
            ⚙️ Открыть панель администратора
          </button>

        </section>

      )}

    </div>
  );
}

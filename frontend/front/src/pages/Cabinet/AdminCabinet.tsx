
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminCabinet.css';

interface Order {
  id: number;
  user: string;
  property_object: {
    address: string;
    area: string;
  };
  status: string;
  status_display: string;
  assigned_expert: string | null;
  current_step: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  role_display?: string;
  is_active?: boolean;
}

interface TechnicalReport {
  exists: boolean;
  order_id?: number;
  appointment_id?: number;
  scheduled_date?: string | null;
  time_slot?: string | null;
  address?: string | null;
  appointment_status?: string | null;
  report_notes?: string;
  report_photo_url?: string | null;

  final_price?: string;
  contract_number?: string;

  order_status?: string;
  order_status_display?: string;
  current_step?: number;
}

interface Appointment {
  id: number;
  order: number;
  scheduled_date: string;
  time_slot: string;
  address: string;
  status: string;
}

export default function AdminCabinet() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [reports, setReports] = useState<
    Record<number, TechnicalReport>
  >({});

  const [appointments, setAppointments] = useState<
    Record<number, Appointment>
  >({});

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] =
    useState<boolean>(false);

  // ============================================================
  // СОСТОЯНИЯ НАЗНАЧЕНИЯ ВЫЕЗДА
  // ============================================================

  const [
    selectedAppointmentOrderId,
    setSelectedAppointmentOrderId,
  ] = useState<number | null>(null);

  const [appointmentDate, setAppointmentDate] =
    useState('');

  const [appointmentTimeSlot, setAppointmentTimeSlot] =
    useState('9-13');

  const [appointmentAddress, setAppointmentAddress] =
    useState('');

  // ============================================================
  // СОСТОЯНИЕ ПРОСМОТРА ТЕХНИЧЕСКОГО ОТЧЁТА
  // ============================================================

  const [selectedReportOrderId, setSelectedReportOrderId] =
    useState<number | null>(null);

  const token = localStorage.getItem('access_token');

  // ============================================================
  // СТАТУСЫ ЗАЯВОК
  // ============================================================

  const statusChoices = [
    {
      value: 'draft',
      label: 'Черновик',
    },
    {
      value: 'meeting_requested',
      label: 'Запрошена встреча',
    },
    {
      value: 'meeting_scheduled',
      label: 'Встреча назначена',
    },
    {
      value: 'deal_confirmed',
      label: 'Сделка подтверждена',
    },
    {
      value: 'in_progress',
      label: 'В работе',
    },
    {
      value: 'completed',
      label: 'Завершено',
    },
  ];

  // ============================================================
  // РОЛИ
  // ============================================================

  const roleChoices = [
    {
      value: 'client',
      label: 'Клиент',
    },
    {
      value: 'expert',
      label: 'Инженер',
    },
    {
      value: 'admin',
      label: 'Администратор',
    },
  ];

  // ============================================================
  // ЗАГРУЗКА ДАННЫХ
  // ============================================================

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const loadData = async () => {
      try {
        // --------------------------------------------------------
        // 1. ЗАЯВКИ
        // --------------------------------------------------------

        const ordersResponse = await axios.get(
          'http://localhost:8001/api/orders/',
          { headers }
        );

        // --------------------------------------------------------
        // 2. ПОЛЬЗОВАТЕЛИ
        // --------------------------------------------------------

        const usersResponse = await axios.get(
          'http://localhost:8001/api/accounts/users/',
          { headers }
        );

        // --------------------------------------------------------
        // 3. ВЫЕЗДЫ
        // --------------------------------------------------------

        const appointmentsResponse = await axios.get(
          'http://localhost:8001/api/orders/expert-appointments/',
          { headers }
        );

        const loadedOrders: Order[] =
          ordersResponse.data;

        const loadedUsers: User[] =
          usersResponse.data;

        const loadedAppointments: Appointment[] =
          appointmentsResponse.data;

        setOrders(loadedOrders);
        setUsers(loadedUsers);

        // --------------------------------------------------------
        // Формируем:
        // orderId -> appointment
        // --------------------------------------------------------

        const appointmentMap: Record<
          number,
          Appointment
        > = {};

        loadedAppointments.forEach(
          (appointment) => {
            appointmentMap[appointment.order] =
              appointment;
          }
        );

        setAppointments(appointmentMap);

        // --------------------------------------------------------
        // 4. ТЕХНИЧЕСКИЕ ОТЧЁТЫ
        // --------------------------------------------------------

        const reportResults = await Promise.all(
          loadedOrders.map(async (order) => {
            try {
              const reportResponse =
                await axios.get(
                  `http://localhost:8001/api/orders/${order.id}/report/`,
                  { headers }
                );

              return {
                orderId: order.id,
                report:
                  reportResponse.data as TechnicalReport,
              };
            } catch (error) {
              console.error(
                `Не удалось получить отчёт заявки №${order.id}:`,
                error
              );

              return {
                orderId: order.id,
                report: {
                  exists: false,
                } as TechnicalReport,
              };
            }
          })
        );

        const reportMap: Record<
          number,
          TechnicalReport
        > = {};

        reportResults.forEach((item) => {
          reportMap[item.orderId] =
            item.report;
        });

        setReports(reportMap);

        console.log(
          'Получены заявки:',
          loadedOrders
        );

        console.log(
          'Получены пользователи:',
          loadedUsers
        );

        console.log(
          'Получены выезды:',
          loadedAppointments
        );

        console.log(
          'Получены отчёты:',
          reportMap
        );

        setLoading(false);
      } catch (err: any) {
        console.error(
          'Ошибка загрузки панели администратора:',
          err
        );

        if (
          err.response?.status === 401
        ) {
          alert(
            'Сессия истекла. Выполните вход повторно.'
          );

          localStorage.removeItem(
            'access_token'
          );

          navigate('/login');

          return;
        }

        if (
          err.response?.status === 403
        ) {
          alert(
            'Доступ запрещен. Вы не являетесь администратором.'
          );

          navigate('/cabinet');

          return;
        }

        alert(
          'Не удалось загрузить данные панели администратора.'
        );

        setLoading(false);
      }
    };

    loadData();
  }, [token, navigate]);

  // ============================================================
  // ИНЖЕНЕРЫ
  // ============================================================

  const experts = users.filter(
    (user) => user.role === 'expert'
  );

  // ============================================================
  // ИЗМЕНЕНИЕ СТАТУСА
  // ============================================================

  const handleStatusChange = async (
    orderId: number,
    newStatus: string
  ) => {
    if (!token) return;

    setActionLoading(true);

    try {
      await axios.patch(
        `http://localhost:8001/api/orders/${orderId}/`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setOrders(
        (previousOrders) =>
          previousOrders.map(
            (order) =>
              order.id === orderId
                ? {
                    ...order,
                    status:
                      newStatus,
                  }
                : order
          )
      );

      alert(
        'Статус заявки успешно изменен!'
      );
    } catch (err) {
      console.error(
        'Ошибка изменения статуса:',
        err
      );

      alert(
        'Ошибка при изменении статуса.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // НАЗНАЧЕНИЕ ИНЖЕНЕРА
  // ============================================================

  const handleAssignExpert = async (
    orderId: number,
    expertId: number
  ) => {
    if (!token || !expertId) return;

    setActionLoading(true);

    try {
      await axios.post(
        `http://localhost:8001/api/orders/${orderId}/assign-expert/`,
        {
          expert_id:
            expertId,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const selectedExpert =
        experts.find(
          (expert) =>
            expert.id === expertId
        );

      setOrders(
        (previousOrders) =>
          previousOrders.map(
            (order) =>
              order.id === orderId
                ? {
                    ...order,
                    assigned_expert:
                      selectedExpert?.username ||
                      null,
                    status:
                      'meeting_scheduled',
                  }
                : order
          )
      );

      alert(
        'Инженер успешно назначен на объект!'
      );
    } catch (err: any) {
      console.error(
        'Ошибка назначения инженера:',
        err
      );

      const errorMessage =
        err.response?.data?.error ||
        'Ошибка при назначении инженера.';

      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // ОТКРЫТИЕ ФОРМЫ ВЫЕЗДА
  // ============================================================

  const openAppointmentForm = (
    order: Order
  ) => {
    setSelectedAppointmentOrderId(
      order.id
    );

    setAppointmentAddress(
      order.property_object?.address ||
        ''
    );

    setAppointmentDate('');

    setAppointmentTimeSlot(
      '9-13'
    );
  };

  // ============================================================
  // ЗАКРЫТИЕ ФОРМЫ ВЫЕЗДА
  // ============================================================

  const closeAppointmentForm = () => {
    setSelectedAppointmentOrderId(
      null
    );

    setAppointmentDate('');

    setAppointmentTimeSlot(
      '9-13'
    );

    setAppointmentAddress('');
  };

  // ============================================================
  // СОЗДАНИЕ ВЫЕЗДА
  // ============================================================

  const handleCreateAppointment =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      if (
        !token ||
        !selectedAppointmentOrderId
      ) {
        return;
      }

      if (!appointmentDate) {
        alert(
          'Выберите дату выезда.'
        );

        return;
      }

      if (!appointmentAddress.trim()) {
        alert(
          'Укажите адрес объекта.'
        );

        return;
      }

      setActionLoading(true);

      try {
        const response =
          await axios.post(
            `http://localhost:8001/api/orders/${selectedAppointmentOrderId}/create-appointment/`,
            {
              scheduled_date:
                appointmentDate,

              time_slot:
                appointmentTimeSlot,

              address:
                appointmentAddress.trim(),
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const newAppointment:
          Appointment =
          response.data.appointment;

        setAppointments(
          (previousAppointments) => ({
            ...previousAppointments,

            [selectedAppointmentOrderId]:
              newAppointment,
          })
        );

        setOrders(
          (previousOrders) =>
            previousOrders.map(
              (order) =>
                order.id ===
                selectedAppointmentOrderId
                  ? {
                      ...order,
                      status:
                        'meeting_scheduled',
                    }
                  : order
            )
        );

        closeAppointmentForm();

        alert(
          'Выезд успешно назначен. Инженер увидит его в разделе «Мои выезды».'
        );
      } catch (err: any) {
        console.error(
          'Ошибка создания выезда:',
          err
        );

        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.detail ||
          'Не удалось назначить выезд.';

        alert(errorMessage);
      } finally {
        setActionLoading(false);
      }
    };

  // ============================================================
  // ИЗМЕНЕНИЕ РОЛИ
  // ============================================================

  const handleRoleChange = async (
    userId: number,
    newRole: string
  ) => {
    if (!token) return;

    setActionLoading(true);

    try {
      const response =
        await axios.patch(
          `http://localhost:8001/api/accounts/users/${userId}/role/`,
          {
            role: newRole,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const updatedUser =
        response.data.user;

      setUsers(
        (previousUsers) =>
          previousUsers.map(
            (user) =>
              user.id === userId
                ? {
                    ...user,
                    ...updatedUser,
                  }
                : user
          )
      );

      alert(
        `Роль пользователя "${updatedUser.username}" изменена на "${updatedUser.role_display}".`
      );
    } catch (err: any) {
      console.error(
        'Ошибка изменения роли:',
        err
      );

      const errorMessage =
        err.response?.data?.error ||
        'Ошибка при изменении роли пользователя.';

      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // ЗАГРУЗКА
  // ============================================================

  if (loading) {
    return (
      <div className="admin-status">
        Загрузка панели администратора...
      </div>
    );
  }

  // ============================================================
  // ВЫБРАННЫЙ ОТЧЁТ
  // ============================================================

  const selectedReport =
    selectedReportOrderId
      ? reports[selectedReportOrderId]
      : null;

  const selectedOrder =
    selectedReportOrderId
      ? orders.find(
          (order) =>
            order.id ===
            selectedReportOrderId
        )
      : null;

  // ============================================================
  // ИНТЕРФЕЙС
  // ============================================================

  return (
    <div className="admin-cabinet-container">

      {/* ======================================================
          ЗАГОЛОВОК
      ====================================================== */}

      <header className="admin-panel-header">

        <h1>
          ⚙️ Панель управления Light House
        </h1>

        <p>
          Глобальный мониторинг заявок и управление пользователями
        </p>

      </header>


      {/* ======================================================
          УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ
      ====================================================== */}

      <section className="admin-users-section">

        <h2>
          👥 Управление пользователями
        </h2>

        <p>
          Администратор может назначить пользователю
          роль клиента, инженера или администратора.
        </p>

        <div className="admin-table-responsive">

          <table className="admin-orders-table">

            <thead>

              <tr>
                <th>ID</th>
                <th>Логин</th>
                <th>Email</th>
                <th>Текущая роль</th>
                <th>Изменить роль</th>
              </tr>

            </thead>

            <tbody>

              {users.map(
                (user) => (

                  <tr key={user.id}>

                    <td>
                      <strong>
                        {user.id}
                      </strong>
                    </td>

                    <td>
                      {user.username}
                    </td>

                    <td>
                      {user.email}
                    </td>

                    <td>
                      {user.role_display ||
                        user.role}
                    </td>

                    <td>

                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(
                            user.id,
                            e.target.value
                          )
                        }
                        disabled={
                          actionLoading
                        }
                        className="admin-expert-select"
                      >

                        {roleChoices.map(
                          (role) => (

                            <option
                              key={
                                role.value
                              }
                              value={
                                role.value
                              }
                            >
                              {role.label}
                            </option>

                          )
                        )}

                      </select>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* ======================================================
          УПРАВЛЕНИЕ ЗАЯВКАМИ
      ====================================================== */}

      <section className="admin-orders-section">

        <h2>
          📋 Управление заявками
        </h2>

        <div className="admin-table-responsive">

          <table className="admin-orders-table">

            <thead>

              <tr>

                <th>
                  ID
                </th>

                <th>
                  Клиент
                </th>

                <th>
                  Адрес и площадь
                </th>

                <th>
                  Этап
                </th>

                <th>
                  Текущий статус
                </th>

                <th>
                  Инженер
                </th>

                <th>
                  Выезд
                </th>

                <th>
                  Технический отчёт
                </th>

              </tr>

            </thead>

            <tbody>

              {orders.map(
                (order) => {

                  const report =
                    reports[
                      order.id
                    ];

                  const appointment =
                    appointments[
                      order.id
                    ];

                  return (
                    <tr
                      key={
                        order.id
                      }
                    >

                      {/* ID */}

                      <td>
                        <strong>
                          {order.id}
                        </strong>
                      </td>


                      {/* КЛИЕНТ */}

                      <td>
                        {order.user}
                      </td>


                      {/* АДРЕС */}

                      <td>

                        <div className="table-cell-address">

                          {order
                            .property_object
                            ?.address ||
                            'Не указан'}

                        </div>

                        <small className="table-cell-area">

                          {order
                            .property_object
                            ?.area ||
                            '0'} м²

                        </small>

                      </td>


                      {/* ЭТАП */}

                      <td>

                        <span className="step-badge-counter">

                          {
                            order.current_step
                          }{' '}/ 7

                        </span>

                      </td>


                      {/* СТАТУС */}

                      <td>

                        <select
                          value={
                            order.status
                          }
                          onChange={(
                            e
                          ) =>
                            handleStatusChange(
                              order.id,
                              e.target
                                .value
                            )
                          }
                          disabled={
                            actionLoading
                          }
                          className="admin-status-select"
                        >

                          {statusChoices.map(
                            (
                              choice
                            ) => (

                              <option
                                key={
                                  choice.value
                                }
                                value={
                                  choice.value
                                }
                              >
                                {
                                  choice.label
                                }
                              </option>

                            )
                          )}

                        </select>

                      </td>


                      {/* ИНЖЕНЕР */}

                      <td>

                        <select
                          value={
                            experts.find(
                              (
                                expert
                              ) =>
                                expert.username ===
                                order.assigned_expert
                            )?.id || ''
                          }
                          onChange={(
                            e
                          ) =>
                            handleAssignExpert(
                              order.id,
                              Number(
                                e.target
                                  .value
                              )
                            )
                          }
                          disabled={
                            actionLoading ||
                            order.status ===
                              'completed' ||
                            experts.length ===
                              0
                          }
                          className="admin-expert-select"
                        >

                          <option value="">
                            -- Выбрать инженера --
                          </option>

                          {experts.map(
                            (
                              expert
                            ) => (

                              <option
                                key={
                                  expert.id
                                }
                                value={
                                  expert.id
                                }
                              >
                                {
                                  expert.username
                                }
                              </option>

                            )
                          )}

                        </select>


                        {order.assigned_expert && (

                          <div className="assigned-status-text">

                            ✓ Назначен:{' '}

                            {
                              order.assigned_expert
                            }

                          </div>

                        )}


                        {experts.length ===
                          0 && (

                          <div className="assigned-status-text">

                            ⚠️ Нет активных
                            инженеров

                          </div>

                        )}

                      </td>


                      {/* ==================================================
                          ВЫЕЗД
                      ================================================== */}

                      <td>

                        {appointment ? (

                          <div className="appointment-admin-block">

                            <strong>
                              ✅ Выезд назначен
                            </strong>

                            <div>
                              📅{' '}
                              {
                                appointment.scheduled_date
                              }
                            </div>

                            <div>
                              🕒{' '}
                              {
                                appointment.time_slot
                              }
                            </div>

                            <div>
                              📍{' '}
                              {
                                appointment.address
                              }
                            </div>

                            <div>
                              Статус:{' '}
                              {
                                appointment.status
                              }
                            </div>

                            {appointment.status ===
                              'scheduled' && (

                              <button
                                type="button"
                                className="btn-action-select"
                                onClick={() =>
                                  openAppointmentForm(
                                    order
                                  )
                                }
                                disabled={
                                  actionLoading ||
                                  !order.assigned_expert
                                }
                              >
                                ✏️ Изменить выезд
                              </button>

                            )}

                          </div>

                        ) : (

                          <div>

                            {!order.assigned_expert ? (

                              <div className="assigned-status-text">

                                ⚠️ Сначала назначьте
                                инженера

                              </div>

                            ) : (

                              <button
                                type="button"
                                className="btn-action-select"
                                onClick={() =>
                                  openAppointmentForm(
                                    order
                                  )
                                }
                                disabled={
                                  actionLoading
                                }
                              >
                                📅 Назначить выезд
                              </button>

                            )}

                          </div>

                        )}

                      </td>


                      {/* ==================================================
                          ТЕХНИЧЕСКИЙ ОТЧЁТ
                      ================================================== */}

                      <td>

                        {!report ||
                        !report.exists ? (

                          <div className="assigned-status-text">

                            ⏳ Отчёт ещё не отправлен

                          </div>

                        ) : (

                          <div className="technical-report-admin">

                            <strong>
                              ✅ Отчёт получен
                            </strong>

                            <button
                              type="button"
                              className="btn-action-select"
                              onClick={() =>
                                setSelectedReportOrderId(
                                  order.id
                                )
                              }
                              style={{
                                marginTop:
                                  '8px',
                                width:
                                  '100%',
                              }}
                            >
                              📄 Открыть отчёт
                            </button>

                          </div>

                        )}

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>


          {orders.length ===
            0 && (

            <p className="no-orders-alert">
              В системе пока нет активных заявок от клиентов.
            </p>

          )}

        </div>

      </section>


      {/* ======================================================
          МОДАЛЬНОЕ ОКНО НАЗНАЧЕНИЯ ВЫЕЗДА
      ====================================================== */}

      {selectedAppointmentOrderId && (

        <div className="modal-management-panel">

          <div className="modal-content-mobile">

            <button
              type="button"
              className="btn-close-modal"
              onClick={
                closeAppointmentForm
              }
            >
              ❌ Закрыть
            </button>

            <h2>
              📅 Назначение выезда
            </h2>

            <p>
              Заявка №
              {
                selectedAppointmentOrderId
              }
            </p>

            <form
              onSubmit={
                handleCreateAppointment
              }
              className="mobile-expert-form"
            >

              <label>
                Дата выезда
              </label>

              <input
                type="date"
                value={
                  appointmentDate
                }
                onChange={(e) =>
                  setAppointmentDate(
                    e.target.value
                  )
                }
                required
              />


              <label>
                Временной интервал
              </label>

              <select
                value={
                  appointmentTimeSlot
                }
                onChange={(e) =>
                  setAppointmentTimeSlot(
                    e.target.value
                  )
                }
                required
              >

                <option value="9-13">
                  С 9:00 до 13:00
                </option>

                <option value="13-18">
                  С 13:00 до 18:00
                </option>

              </select>


              <label>
                Адрес объекта
              </label>

              <textarea
                value={
                  appointmentAddress
                }
                onChange={(e) =>
                  setAppointmentAddress(
                    e.target.value
                  )
                }
                placeholder="Введите адрес объекта"
                required
              />


              <button
                type="submit"
                className="btn-submit-deal"
                disabled={
                  actionLoading
                }
              >
                {actionLoading
                  ? 'Сохранение...'
                  : '📅 Назначить выезд'}
              </button>

            </form>

          </div>

        </div>

      )}


      {/* ======================================================
          МОДАЛЬНОЕ ОКНО ТЕХНИЧЕСКОГО ОТЧЁТА
      ====================================================== */}

      {selectedReportOrderId &&
        selectedReport && (

        <div
          className="modal-management-panel"
          onClick={() =>
            setSelectedReportOrderId(
              null
            )
          }
        >

          <div
            className="modal-content-mobile"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              className="btn-close-modal"
              onClick={() =>
                setSelectedReportOrderId(
                  null
                )
              }
            >
              ❌ Закрыть
            </button>


            <h2>
              📄 Технический отчёт
            </h2>


            {selectedOrder && (
              <>
                <div
                  className="technical-report-text"
                >

                  <h3>
                    Заявка №
                    {
                      selectedOrder.id
                    }
                  </h3>

                  <p>
                    <strong>
                      👤 Клиент:
                    </strong>{' '}
                    {
                      selectedOrder.user
                    }
                  </p>

                  <p>
                    <strong>
                      👷 Инженер:
                    </strong>{' '}
                    {
                      selectedOrder.assigned_expert ||
                      'Не назначен'
                    }
                  </p>

                  <p>
                    <strong>
                      📍 Объект:
                    </strong>{' '}
                    {
                      selectedOrder
                        .property_object
                        ?.address ||
                      'Не указан'
                    }
                  </p>

                  <p>
                    <strong>
                      📐 Площадь:
                    </strong>{' '}
                    {
                      selectedOrder
                        .property_object
                        ?.area ||
                      '0'
                    }{' '}
                    м²
                  </p>

                </div>
              </>
            )}


            <div
              className="technical-report-text"
            >

              <h3>
                📝 Технический осмотр
              </h3>

              {selectedReport.scheduled_date && (
                <p>
                  <strong>
                    📅 Дата выезда:
                  </strong>{' '}
                  {
                    selectedReport.scheduled_date
                  }
                </p>
              )}

              {selectedReport.time_slot && (
                <p>
                  <strong>
                    🕒 Время:
                  </strong>{' '}
                  {
                    selectedReport.time_slot
                  }
                </p>
              )}

              {selectedReport.address && (
                <p>
                  <strong>
                    📍 Адрес выезда:
                  </strong>{' '}
                  {
                    selectedReport.address
                  }
                </p>
              )}

              {selectedReport.appointment_status && (
                <p>
                  <strong>
                    📌 Статус выезда:
                  </strong>{' '}
                  {
                    selectedReport.appointment_status
                  }
                </p>
              )}

            </div>


            <div
              className="technical-report-text"
            >

              <h3>
                💼 Договор
              </h3>

              <p>
                <strong>
                  Итоговая стоимость:
                </strong>{' '}

                {selectedReport.final_price
                  ? `${selectedReport.final_price} тенге`
                  : 'Не указана'}

              </p>

              <p>
                <strong>
                  Номер договора:
                </strong>{' '}

                {selectedReport.contract_number ||
                  'Не указан'}

              </p>

            </div>


            <div
              className="technical-report-text"
            >

              <h3>
                📝 Результаты осмотра
              </h3>

              {selectedReport.report_notes ? (

                <div className="technical-report-view">

                  {selectedReport.report_notes}

                </div>

              ) : (

                <p>
                  Текст технического отчёта отсутствует.
                </p>

              )}

            </div>


            {selectedReport.report_photo_url && (

              <div
                className="technical-report-text"
              >

                <h3>
                  📷 Фотография объекта
                </h3>

                <a
                  href={
                    selectedReport.report_photo_url
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Открыть фотографию
                </a>

              </div>

            )}


            <button
              type="button"
              className="btn-submit-deal"
              onClick={() =>
                setSelectedReportOrderId(
                  null
                )
              }
            >
              Закрыть отчёт
            </button>

          </div>

        </div>

      )}

    </div>
  );
}


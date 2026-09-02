import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ProgressSidebar } from '../../components/ProgressSidebar';
import './OrderTrackerPage.css';

interface OrderDetails {
  id: number;
  user: string;
  status_display: string;
  status: string;
  current_step: number;
  estimated_price: string | null;
  final_price: string | null;
  contract_number: string | null;
  assigned_expert: string | null;
  created_at: string;
}

export default function OrderTrackerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<boolean>(false);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    axios.get(`http://localhost:8001/api/orders/orders/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { setOrder(res.data); setLoading(false); })
      .catch(err => { console.error(err); setError('Ошибка загрузки данных.'); setLoading(false); });
  }, [id, token, navigate]);

  // Функция для скачивания PDF бланка согласия соседей (Шаг 1)
  const downloadConsentPdf = async () => {
    setDownloading(true);
    try {
      const response = await axios.post('http://localhost:8001/api/documents/generate-consent/', {
        owner_name: order?.user,
        property_desc: "пристройки к таунхаусу"
      }, { responseType: 'blob' });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Soglasie_Sosedei_Order_${id}.pdf`;
      link.click();
    } catch (err) {
      alert('Ошибка при генерации PDF.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="tracker-status">Загрузка трекера сделки...</div>;
  if (error || !order) return <div className="tracker-error-box">⚠️ {error || 'Заказ не найден.'}</div>;

  const isStepReadyForNext = order.status !== 'meeting_requested' && order.status !== 'meeting_scheduled';

  return (
    <div className="tracker-page-container">
      <button onClick={() => navigate('/cabinet')} className="btn-back-to-cabinet">
        &larr; Вернуться в личный кабинет
      </button>

      <div className="tracker-two-columns">
        
        {/* ЛЕВАЯ КОЛОНКА: ИНТЕРАКТИВНЫЕ ШАГИ И СТАТУСЫ СТРОГО ПО ТЗ */}
        <div className="tracker-main-info">
          
          <section className="info-block-card">
            <h1>Заказ №{order.id} на легализацию</h1>
            <div className="order-meta-grid">
              <div className="meta-item"><span>Статус сделки:</span> <strong>{order.status_display}</strong></div>
              <div className="meta-item"><span>Номер договора:</span> <strong>{order.contract_number || 'В процессе заключения'}</strong></div>
              <div className="meta-item"><span>Кадастровый инженер:</span> <strong>{order.assigned_expert || 'Назначается...'}</strong></div>
            </div>
          </section>

          <section className="info-block-card step-details-card">
            <h2>Текущий этап: Шаг №{order.current_step}</h2>

            {/* ШАГ 1: СОГЛАСИЯ + ТЕХОБСЛЕДОВАНИЕ */}
            {order.current_step === 1 && (
              <div className="interactive-step-content">
                <p className="step-desc-text"><strong>Сбор согласий соседей и первичное техобследование.</strong> На данном этапе необходимо скачать бланки, подписать их у владельцев смежных участков и передать инженеру для подготовки заключения.</p>
                <button className="btn-interactive-action" onClick={downloadConsentPdf} disabled={downloading}>
                  {downloading ? 'Формирование...' : '📥 Скачать сформированный PDF-бланк согласия'}
                </button>
                <div className="checklist-box">
                  <h4>Чек-лист этапа:</h4>
                  <label><input type="checkbox" defaultChecked disabled /> Замеры объекта инженером</label>
                  <label><input type="checkbox" /> Сбор подписей соседей слева/справа</label>
                </div>
              </div>
            )}

            {/* ШАГ 2: МИО, АПЗ, ТУ */}
            {order.current_step === 2 && (
              <div className="interactive-step-content">
                <p className="step-desc-text"><strong>Подача заявления в Местные исполнительные органы (МИО).</strong> Запрос архитектурно-планировочного задания (АПЗ) и технических условий (ТУ).</p>
                <a href="https://egov.kz" target="_blank" rel="noreferrer" className="btn-link-action">
                  🌐 Перейти на портал eGov.kz для подачи заявления &rarr;
                </a>
                <div className="checklist-box">
                  <h4>Инструкция:</h4>
                  <p>1. Авторизуйтесь по ЭЦП 2. Выберите услугу "Выдача АПЗ" 3. Прикрепите техпаспорт.</p>
                </div>
              </div>
            )}

            {/* ШАГ 3: ПРОЕКТИРОВАНИЕ */}
            {order.current_step === 3 && (
              <div className="interactive-step-content">
                <p className="step-desc-text"><strong>Проектирование пристройки.</strong> Наша проектная организация на основе АПЗ разрабатывает официальный эскизный и рабочий проект вашей пристройки/террасы.</p>
                <div className="status-banner-info">
                  👷 <strong>Статус:</strong> Кадастровое бюро формирует проектные чертежи. Изменения согласуются с сейсмо- и пожарными нормами.
                </div>
              </div>
            )}

            {/* ШАГ 4: ГАСК */}
            {order.current_step === 4 && (
              <div className="interactive-step-content">
                <p className="step-desc-text"><strong>Уведомление ГАСК (Государственный архитектурно-строительный контроль).</strong> Регистрация начала строительно-монтажных работ.</p>
                <div className="docs-download-grid">
                  <button className="btn-secondary-download" onClick={() => alert('Скачивание договора авторского надзора')}>📄 Договор Авторского надзора (АН)</button>
                  <button className="btn-secondary-download" onClick={() => alert('Скачивание договора технического надзора')}>📄 Договор Технического надзора (ТН)</button>
                </div>
              </div>
            )}

            {/* ШАГ 5: ИСПОЛНИТЕЛЬНАЯ СЪЁМКА */}
            {order.current_step === 5 && (
              <div className="interactive-step-content">
                <p className="step-desc-text"><strong>Исполнительная геодезическая съёмка.</strong> Инженер выезжает на объект со спутниковым оборудованием для фиксации точных координат пристройки на земельном участке.</p>
                <div className="status-banner-pending">
                  ⏳ <strong>Текущий статус:</strong> Ожидайте выезда геодезиста. Результаты будут загружены в информационную систему архитектуры автоматически.
                </div>
              </div>
            )}

            {/* ШАГ 6: АКТ ПРИЁМКИ */}
            {order.current_step === 6 && (
              <div className="interactive-step-content">
                <p className="step-desc-text"><strong>Утверждение Акта приёмки объекта в эксплуатацию.</strong> Финальный документ, подтверждающий успешное окончание строительных работ.</p>
                <div className="status-banner-success">
                  📢 <strong>Инфо:</strong> Акт формируется инженером в личном кабинете. После завершения проверки статус обновится автоматически через команду <code>approve-stage</code>.
                </div>
              </div>
            )}

            {/* ШАГ 7: ЕГКН / РОСРЕЕСТР */}
            {order.current_step === 7 && (
              <div className="interactive-step-content">
                <p className="step-desc-text"><strong>Внесение изменений в Единый государственный кадастр недвижимости (ЕГКН).</strong> Регистрация вашего права собственности на реконструированный таунхаус с новой площадью.</p>
                <div className="final-step-box">
                  🎯 Вы находитесь на финальной стадии! Документы переданы на регистрацию в юстицию/Росреестр.
                </div>
              </div>
            )}

          </section>
        </div>

        {/* ПРАВАЯ КОЛОНКА: PROGRESS SIDEBAR */}
        <div className="tracker-sidebar-column">
          <ProgressSidebar 
            currentStep={order.current_step}
            isStepCompleted={isStepReadyForNext}
            onNextStep={handleNextStepLocal}
          />
        </div>

      </div>
    </div>
  );

  function handleNextStepLocal() {
    alert("Запрос на утверждение этапа отправлен инженеру.");
  }
}


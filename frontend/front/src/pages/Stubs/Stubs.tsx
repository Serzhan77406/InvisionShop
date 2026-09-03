import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './Stubs.css';
import './LegalPage.css';
import './FAQPage.css';

/* =========================================================
   НОРМАТИВНО-ПРАВОВАЯ БАЗА
   ========================================================= */

interface LegalDocument {
  id: number;
  title: string;
  type: string;
  number: string;
  date: string;
  description: string;
  keywords: string[];
  url: string;
}

const legalDocuments: LegalDocument[] = [
  {
    id: 1,
    title: 'Строительный кодекс Республики Казахстан',
    type: 'Кодекс',
    number: '№ 253-VIII ЗРК',
    date: '09.01.2026',
    description:
      'Основной нормативный акт, регулирующий отношения в сфере строительства, архитектуры, градостроительства и реконструкции объектов.',
    keywords: [
      'строительство',
      'реконструкция',
      'архитектура',
      'градостроительство',
      'объект недвижимости',
    ],
    url: 'https://www.adilet.zan.kz/rus/docs/K2600000253',
  },
  {
    id: 2,
    title:
      'Правила организации застройки и прохождения разрешительных процедур в сфере строительства',
    type: 'Правила',
    number: 'Приказ № 265',
    date: '29.05.2026',
    description:
      'Устанавливают порядок прохождения разрешительных процедур, оформления документов при строительстве и изменении существующих объектов, а также реконструкции, перепланировке и переоборудовании.',
    keywords: [
      'разрешение',
      'реконструкция',
      'перепланировка',
      'переоборудование',
      'эскизный проект',
      'исходные материалы',
    ],
    url: 'https://www.adilet.zan.kz/rus/docs/V2600038830',
  },
  {
    id: 3,
    title: 'Гражданский кодекс Республики Казахстан',
    type: 'Кодекс',
    number: 'Общие положения',
    date: '',
    description:
      'Регулирует гражданско-правовые отношения, включая вопросы собственности, владения, пользования и распоряжения недвижимым имуществом.',
    keywords: [
      'собственность',
      'недвижимость',
      'имущество',
      'право собственности',
    ],
    url: 'https://adilet.zan.kz/',
  },
];

/* =========================================================
   FAQ
   ========================================================= */

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  keywords: string[];
}

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: 'Что такое перепланировка?',
    answer:
      'Перепланировка — это изменение планировочного решения помещения. В зависимости от характера работ могут потребоваться согласования и оформление соответствующей документации.',
    keywords: ['перепланировка', 'планировка', 'помещение'],
  },
  {
    id: 2,
    question: 'Что такое реконструкция?',
    answer:
      'Реконструкция связана с изменением существующего объекта. В зависимости от конкретных работ может изменяться объем, конструктивные элементы, фасад или другие характеристики объекта.',
    keywords: ['реконструкция', 'объект', 'фасад', 'конструкция'],
  },
  {
    id: 3,
    question: 'Нужно ли оформлять документы перед началом реконструкции?',
    answer:
      'Да. До начала работ необходимо определить вид планируемых изменений и проверить, какие исходные материалы, согласования и разрешительные процедуры требуются для конкретного объекта.',
    keywords: ['документы', 'реконструкция', 'разрешение', 'согласование'],
  },
  {
    id: 4,
    question: 'Можно ли сделать пристройку к существующему дому?',
    answer:
      'Возможность устройства пристройки зависит от характеристик земельного участка, существующего объекта, градостроительных требований и планируемых конструктивных изменений. Перед началом работ необходимо проверить требования законодательства и получить необходимые документы.',
    keywords: ['пристройка', 'дом', 'земельный участок', 'реконструкция'],
  },
  {
    id: 5,
    question: 'Что делать, если я хочу изменить фасад дома?',
    answer:
      'Изменение фасада относится к изменениям внешнего вида объекта и может требовать соответствующего согласования. Необходимо определить характер изменений и проверить применимые требования.',
    keywords: ['фасад', 'дом', 'изменение', 'согласование'],
  },
  {
    id: 6,
    question: 'Где посмотреть нормативные документы?',
    answer:
      'В разделе «Законы» приложения собраны основные нормативные документы, используемые для ориентирования пользователя. Для проверки официальной редакции рекомендуется переходить на информационно-правовую систему «Әділет».',
    keywords: ['законы', 'нормативные документы', 'әдiлет', 'нпа'],
  },
];

/* =========================================================
   FAQ PAGE
   ========================================================= */

export const FAQPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);

  const filteredFAQ = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return faqItems;
    }

    return faqItems.filter((item) => {
      const text = [
        item.question,
        item.answer,
        ...item.keywords,
      ]
        .join(' ')
        .toLowerCase();

      return text.includes(query);
    });
  }, [search]);

  return (
    <div className="faq-page">

      <div className="faq-card">

        <div className="faq-icon">❓</div>

        <h1>Часто задаваемые вопросы</h1>

        <p className="faq-intro">
          Найдите ответ на вопрос о перепланировке,
          реконструкции и оформлении строительных работ.
        </p>

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск по вопросам..."
          className="faq-search"
        />

        <div className="faq-list">

          {filteredFAQ.length === 0 ? (
            <div className="faq-empty">
              <strong>Ответ не найден</strong>
              <p>
                Попробуйте изменить формулировку вопроса
                или использовать другое ключевое слово.
              </p>
            </div>
          ) : (
            filteredFAQ.map((item) => (
              <div
                key={item.id}
                className={`faq-item ${
                  openId === item.id ? 'faq-item-open' : ''
                }`}
              >

                <button
                  type="button"
                  className="faq-question"
                  onClick={() =>
                    setOpenId(
                      openId === item.id ? null : item.id
                    )
                  }
                >
                  <span>{item.question}</span>

                  <span className="faq-arrow">
                    {openId === item.id ? '−' : '+'}
                  </span>
                </button>

                {openId === item.id && (
                  <div className="faq-answer">
                    {item.answer}
                  </div>
                )}

              </div>
            ))
          )}

        </div>

        <Link to="/" className="btn-back-home">
          ← Вернуться на главную
        </Link>

      </div>

    </div>
  );
};

/* =========================================================
   LEGAL PAGE
   ========================================================= */

export const LegalPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return legalDocuments;
    }

    return legalDocuments.filter((document) => {
      const text = [
        document.title,
        document.type,
        document.number,
        document.date,
        document.description,
        ...document.keywords,
      ]
        .join(' ')
        .toLowerCase();

      return text.includes(query);
    });
  }, [search]);

  return (
    <div className="legal-page">

      <div className="legal-header">

        <div className="legal-icon">⚖️</div>

        <h1>Нормативно-правовая база</h1>

        <p>
          Основные нормативные документы Республики Казахстан,
          связанные со строительством, реконструкцией,
          перепланировкой и недвижимостью.
        </p>

      </div>

      <div className="legal-search-wrapper">

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск по нормативным документам..."
          className="legal-search"
        />

      </div>

      <div className="legal-list">

        {filteredDocuments.length === 0 ? (
          <div className="legal-empty">
            По вашему запросу документы не найдены.
          </div>
        ) : (
          filteredDocuments.map((document) => (
            <article
              key={document.id}
              className="legal-card"
            >

              <div className="legal-card-top">

                <span className="legal-type">
                  {document.type}
                </span>

                {document.date && (
                  <span className="legal-date">
                    {document.date}
                  </span>
                )}

              </div>

              <h2>{document.title}</h2>

              <div className="legal-number">
                {document.number}
              </div>

              <p>{document.description}</p>

              <div className="legal-keywords">

                {document.keywords.map((keyword) => (
                  <span key={keyword}>
                    {keyword}
                  </span>
                ))}

              </div>

              <a
                href={document.url}
                target="_blank"
                rel="noopener noreferrer"
                className="legal-open-button"
              >
                Открыть документ ↗
              </a>

            </article>
          ))
        )}

      </div>

      <Link to="/" className="btn-back-home">
        ← Вернуться на главную
      </Link>

    </div>
  );
};

/* =========================================================
   REGISTER PAGE
   ========================================================= */

export const RegisterPage: React.FC = () => (
  <div className="stub-container">

    <div className="stub-card">

      <div className="stub-icon">👤</div>

      <h1 className="stub-title">
        Создание аккаунта
      </h1>

      <p className="stub-subtitle">
        Для регистрации перейдите на страницу
        создания аккаунта.
      </p>

      <Link to="/register" className="btn-back-home">
        Перейти к регистрации
      </Link>

    </div>

  </div>
);
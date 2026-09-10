import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TechnicalAssignment.css';

interface FormData {
  objectName: string;
  location: string;
  basis: string;
  constructionType: string;
  designStage: string;
  variantRequirements: string;
  specialConditions: string;
  technicalEconomicIndicators: string;
  builtInObjects: string;
  architecturalPlanning: string;
  technologicalEquipment: string;
  engineeringEquipment: string;
  constructionOrganization: string;
  stages: string;
  accessibility: string;
  landscaping: string;
  civilDefense: string;
  additionalRequirements: string;
}

const initialForm: FormData = {
  objectName: '',
  location: '',
  basis: '',
  constructionType: 'Реконструкция',
  designStage: '',
  variantRequirements: '',
  specialConditions: '',
  technicalEconomicIndicators: '',
  builtInObjects: '',
  architecturalPlanning: '',
  technologicalEquipment: '',
  engineeringEquipment: '',
  constructionOrganization: '',
  stages: '',
  accessibility: '',
  landscaping: '',
  civilDefense: '',
  additionalRequirements: '',
};

export default function TechnicalAssignment() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>(initialForm);
  const [saved, setSaved] = useState(false);

  const handleChange = (
    field: keyof FormData,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(
      'technical_assignment',
      JSON.stringify(form)
    );

    setSaved(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="technical-assignment-page">

      <div className="technical-assignment-container">

        {/* Кнопка назад */}

        <button
          className="back-button no-print"
          onClick={() => navigate('/cabinet')}
        >
          ← Вернуться в личный кабинет
        </button>

        {/* Заголовок */}

        <div className="document-header">

          <div className="document-requisites">
            <p>
              УТВЕРЖДАЮ
            </p>

            <p>
              Заказчик: __________________________
            </p>

            <p>
              Ф.И.О.: _____________________________
            </p>

            <p>
              «___» ______________ 20___ г.
            </p>
          </div>

          <div className="document-title">

            <h1>
              ЗАДАНИЕ НА ПРОЕКТИРОВАНИЕ
            </h1>

            <h2>
              объектов жилищно-гражданского назначения
            </h2>

            <p>
              СН РК 1.02-03-2022
            </p>

          </div>

        </div>

        {/* Наименование объекта */}

        <div className="object-title-block">

          <label>
            Наименование и месторасположение объекта
          </label>

          <input
            type="text"
            value={form.objectName}
            onChange={(e) =>
              handleChange(
                'objectName',
                e.target.value
              )
            }
            placeholder="Например: Реконструкция таунхауса"
          />

          <input
            type="text"
            value={form.location}
            onChange={(e) =>
              handleChange(
                'location',
                e.target.value
              )
            }
            placeholder="Адрес объекта"
          />

        </div>

        {/* Основная таблица */}

        <div className="assignment-table-wrapper">

          <table className="assignment-table">

            <thead>
              <tr>
                <th className="number-column">
                  № п/п
                </th>

                <th>
                  Перечень основных данных и требований
                </th>

                <th>
                  Требуемые параметры и характеристики
                </th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>1</td>

                <td>
                  Основание для проектирования
                </td>

                <td>
                  <textarea
                    value={form.basis}
                    onChange={(e) =>
                      handleChange(
                        'basis',
                        e.target.value
                      )
                    }
                    placeholder="Укажите основание для проектирования"
                  />
                </td>
              </tr>

              <tr>
                <td>2</td>

                <td>
                  Вид строительства
                </td>

                <td>
                  <select
                    value={form.constructionType}
                    onChange={(e) =>
                      handleChange(
                        'constructionType',
                        e.target.value
                      )
                    }
                  >
                    <option value="Реконструкция">
                      Реконструкция
                    </option>

                    <option value="Новое строительство">
                      Новое строительство
                    </option>

                    <option value="Расширение">
                      Расширение
                    </option>

                    <option value="Модернизация">
                      Модернизация
                    </option>

                    <option value="Перепланировка">
                      Перепланировка
                    </option>
                  </select>
                </td>
              </tr>

              <tr>
                <td>3</td>

                <td>
                  Стадийность проектирования
                </td>

                <td>
                  <textarea
                    value={form.designStage}
                    onChange={(e) =>
                      handleChange(
                        'designStage',
                        e.target.value
                      )
                    }
                    placeholder="Укажите стадию проектирования"
                  />
                </td>
              </tr>

              <tr>
                <td>4</td>

                <td>
                  Требования по вариантной и конкурсной разработке
                </td>

                <td>
                  <textarea
                    value={form.variantRequirements}
                    onChange={(e) =>
                      handleChange(
                        'variantRequirements',
                        e.target.value
                      )
                    }
                  />
                </td>
              </tr>

              <tr>
                <td>5</td>

                <td>
                  Особые условия строительства
                </td>

                <td>
                  <textarea
                    value={form.specialConditions}
                    onChange={(e) =>
                      handleChange(
                        'specialConditions',
                        e.target.value
                      )
                    }
                  />
                </td>
              </tr>

              <tr>
                <td>6</td>

                <td>
                  Основные технико-экономические показатели
                </td>

                <td>
                  <textarea
                    value={form.technicalEconomicIndicators}
                    onChange={(e) =>
                      handleChange(
                        'technicalEconomicIndicators',
                        e.target.value
                      )
                    }
                    placeholder="Площадь, этажность, количество помещений и другие показатели"
                  />
                </td>
              </tr>

              <tr>
                <td>7</td>

                <td>
                  Назначение и типы встроенных объектов
                </td>

                <td>
                  <textarea
                    value={form.builtInObjects}
                    onChange={(e) =>
                      handleChange(
                        'builtInObjects',
                        e.target.value
                      )
                    }
                  />
                </td>
              </tr>

              <tr>
                <td>8</td>

                <td>
                  Основные требования к объемно-планировочному решению здания
                </td>

                <td>
                  <textarea
                    value={form.architecturalPlanning}
                    onChange={(e) =>
                      handleChange(
                        'architecturalPlanning',
                        e.target.value
                      )
                    }
                    placeholder="Планировка, помещения, фасад, отделка и т.д."
                  />
                </td>
              </tr>

              <tr>
                <td>9</td>

                <td>
                  Основные требования к технологическому оборудованию
                </td>

                <td>
                  <textarea
                    value={form.technologicalEquipment}
                    onChange={(e) =>
                      handleChange(
                        'technologicalEquipment',
                        e.target.value
                      )
                    }
                  />
                </td>
              </tr>

              <tr>
                <td>10</td>

                <td>
                  Основные требования к инженерному оборудованию
                </td>

                <td>
                  <textarea
                    value={form.engineeringEquipment}
                    onChange={(e) =>
                      handleChange(
                        'engineeringEquipment',
                        e.target.value
                      )
                    }
                    placeholder="Электроснабжение, водоснабжение, отопление, канализация и т.д."
                  />
                </td>
              </tr>

              <tr>
                <td>11</td>

                <td>
                  Требования и объем разработки организации строительства
                </td>

                <td>
                  <textarea
                    value={form.constructionOrganization}
                    onChange={(e) =>
                      handleChange(
                        'constructionOrganization',
                        e.target.value
                      )
                    }
                  />
                </td>
              </tr>

              <tr>
                <td>12</td>

                <td>
                  Выделение очередей, пусковых комплексов и этапов
                </td>

                <td>
                  <textarea
                    value={form.stages}
                    onChange={(e) =>
                      handleChange(
                        'stages',
                        e.target.value
                      )
                    }
                  />
                </td>
              </tr>

              <tr>
                <td>13</td>

                <td>
                  Требования по обеспечению условий жизнедеятельности маломобильных групп населения
                </td>

                <td>
                  <textarea
                    value={form.accessibility}
                    onChange={(e) =>
                      handleChange(
                        'accessibility',
                        e.target.value
                      )
                    }
                  />
                </td>
              </tr>

              <tr>
                <td>14</td>

                <td>
                  Требования к благоустройству площадки и малым архитектурным формам
                </td>

                <td>
                  <textarea
                    value={form.landscaping}
                    onChange={(e) =>
                      handleChange(
                        'landscaping',
                        e.target.value
                      )
                    }
                  />
                </td>
              </tr>

              <tr>
                <td>15</td>

                <td>
                  Требования по гражданской обороне и предупреждению чрезвычайных ситуаций
                </td>

                <td>
                  <textarea
                    value={form.civilDefense}
                    onChange={(e) =>
                      handleChange(
                        'civilDefense',
                        e.target.value
                      )
                    }
                  />
                </td>
              </tr>

              <tr>
                <td>16</td>

                <td>
                  Дополнительные требования
                </td>

                <td>
                  <textarea
                    value={form.additionalRequirements}
                    onChange={(e) =>
                      handleChange(
                        'additionalRequirements',
                        e.target.value
                      )
                    }
                    placeholder="Дополнительные требования заказчика"
                  />
                </td>
              </tr>

            </tbody>

          </table>

        </div>

        {/* Подписи */}

        <div className="signature-block">

          <div>
            <strong>
              Заказчик:
            </strong>

            <span>
              ______________________________
            </span>
          </div>

          <div>
            <strong>
              Ф.И.О.:
            </strong>

            <span>
              ______________________________
            </span>
          </div>

          <div>
            <strong>
              Дата:
            </strong>

            <span>
              «___» ______________ 20___ г.
            </span>
          </div>

        </div>

        {/* Кнопки */}

        <div className="assignment-actions no-print">

          <button
            className="save-assignment-button"
            onClick={handleSave}
          >
            💾 Сохранить задание
          </button>

          <button
            className="print-assignment-button"
            onClick={handlePrint}
          >
            🖨️ Печать / PDF
          </button>

        </div>

        {saved && (
          <div className="save-success no-print">
            ✅ Задание сохранено.
          </div>
        )}

      </div>

    </div>
  );
}
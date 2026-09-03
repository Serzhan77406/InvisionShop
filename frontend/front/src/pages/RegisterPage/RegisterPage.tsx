import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// Сохраняем токены в едином формате для всего приложения
function saveTokens(access: string, refresh: string) {
  try {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  } catch (e) {
    // игнорируем ошибки хранилища
  }
}

// ИСПРАВЛЕНО: Указан верный путь к вашему Django-приложению accounts
const API_URL = "http://localhost:8001/api/accounts/auth/register/";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      const response = await axios.post(API_URL, {
        username,
        email,
        password,
        password_confirm: passwordConfirm,
        role: "client" // Принудительно передаем роль client по ТЗ
      });

      if (response.data.access && response.data.refresh) {
        saveTokens(response.data.access, response.data.refresh);
      }

      // ИСПРАВЛЕНО: Перенаправляем на логин по условию Шага 2.3
      navigate("/login");
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const serverErrors = err.response.data;

        // Преобразуем объект ошибок в понятный текст
        if (typeof serverErrors === 'object') {
          const errorMessages = Object.entries(serverErrors)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' | ');
          setError(errorMessages);
        } else {
          setError("Ошибка регистрации. Проверьте введенные данные.");
        }
      } else {
        setError("Не удалось связаться с сервером.");
      }
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", fontFamily: "sans-serif", padding: "20px" }}>
      <h1>Регистрация</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <input
            style={{ width: "100%", padding: "10px", boxSizing: "border-box" }}
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            style={{ width: "100%", padding: "10px", boxSizing: "border-box" }}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            style={{ width: "100%", padding: "10px", boxSizing: "border-box" }}
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            style={{ width: "100%", padding: "10px", boxSizing: "border-box" }}
            type="password"
            placeholder="Повтор пароля"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          style={{ width: "100%", padding: "12px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
        >
          Зарегистрироваться
        </button>
      </form>

      {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}

      <p style={{ marginTop: 15 }}>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </main>
  );
}

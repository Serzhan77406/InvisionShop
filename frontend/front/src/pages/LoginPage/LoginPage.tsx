import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// Убедитесь, что этот адрес совпадает с вашим urls.py
const API_URL = "http://localhost:8001/api/accounts/auth/login/";

function saveTokens(accessToken: string, refreshToken: string) {
  // ИСПРАВЛЕНО: Ключи приведены к единому стандарту со змейкой_
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
}

export default function LoginPage() {
  const navigate = useNavigate();
  
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post(API_URL, { username, password });
      
      // Сохраняем токены
      saveTokens(response.data.access, response.data.refresh);
      
      // ИСПРАВЛЕНО: Перенаправляем в кабинет, а не в несуществующие заметки
      navigate("/cabinet");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Неверное имя пользователя или пароль");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", fontFamily: "sans-serif", padding: "20px" }}>
      <h1>Вход в систему</h1>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <input
            style={{ width: "100%", padding: "10px", boxSizing: "border-box" }}
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
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
            disabled={isLoading}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ width: "100%", padding: "12px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          {isLoading ? "Вход..." : "Войти"}
        </button>
      </form>

      {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}
      
      <p style={{ marginTop: 15 }}>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </main>
  );
}

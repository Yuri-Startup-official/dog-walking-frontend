import { useState } from 'react';
import apiClient, { setAccessToken } from '../api/client';

export default function Login({ onAuthenticated }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Owner');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setIsLoading(true);
    try {
      if (isRegister) {
        const response = await apiClient.post('/Users/register', { name, email, password, role });
        setMessage(response.data.message || 'Аккаунт создан. Теперь можно войти.');
        setIsRegister(false);
      } else {
        const response = await apiClient.post('/Users/login', { email, password });
        setAccessToken(response.data.accessToken);
        onAuthenticated?.(response.data.user);
      }
    } catch (error) {
      const serverMessage = error.response?.data;
      setMessage(typeof serverMessage === 'string' ? serverMessage : 'Не удалось связаться с сервером. Попробуйте ещё раз.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-story">
        <a className="auth-brand" href="#home"><span className="auth-brand-mark">🐾</span><span>dogwalking</span></a>
        <div className="auth-story-content">
          <p className="auth-kicker">ЗАБОТА РЯДОМ</p>
          <h1>Хорошая прогулка<br />начинается с доверия.</h1>
          <p>Находите заботливых исполнителей для выгула и передержки. Всё важное о заказе — в одном месте.</p>
          <div className="auth-trust"><span>✓</span><div><strong>Ваши данные под защитой</strong><small>Безопасный вход и личные профили</small></div></div>
        </div>
        <div className="auth-decoration"><span>🐕</span><i /><i /><i /></div>
        <small className="auth-footer">© DogWalking · Сервис заботы о питомцах</small>
      </section>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <p className="auth-kicker">{isRegister ? 'СОЗДАТЬ АККАУНТ' : 'С ВОЗВРАЩЕНИЕМ'}</p>
          <h2>{isRegister ? 'Присоединяйтесь' : 'Войти в аккаунт'}</h2>
          <p className="auth-intro">{isRegister ? 'Создайте защищённый профиль, чтобы начать.' : 'Введите данные, чтобы продолжить.'}</p>
          {message && <div className={`auth-message ${/не удалось|ошибка|неверный|уже существует/i.test(message) ? 'error' : ''}`} role="status">{message}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            {isRegister && <label>Ваше имя<input type="text" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Например, Анна" required /></label>}
            <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" required /></label>
            <label>Пароль<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={isRegister ? 8 : undefined} placeholder={isRegister ? 'Не менее 8 символов' : 'Введите пароль'} required /></label>
            {isRegister && <label>Как вы будете пользоваться сервисом?<select value={role} onChange={(event) => setRole(event.target.value)}><option value="Owner">Я владелец собаки</option><option value="Walker">Я исполнитель</option></select></label>}
            <button className="auth-submit" type="submit" disabled={isLoading}>{isLoading ? 'Подождите…' : isRegister ? 'Создать аккаунт' : 'Войти'}<span>→</span></button>
          </form>
          <div className="auth-switch">{isRegister ? 'Уже есть аккаунт?' : 'Впервые здесь?'} <button onClick={() => { setIsRegister(!isRegister); setMessage(''); }}>{isRegister ? 'Войти' : 'Создать аккаунт'}</button></div>
          <p className="auth-legal">Продолжая, вы соглашаетесь с правилами сервиса и политикой конфиденциальности.</p>
        </div>
      </section>
    </main>
  );
}

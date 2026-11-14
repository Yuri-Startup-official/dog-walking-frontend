import { useState } from 'react';
import apiClient from '../api/client'; // Подключаем API-клиент

export default function Login() {
    const [isRegister, setIsRegister] = useState(false);

    // Состояния для полей ввода
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Owner');
    const [message, setMessage] = useState(''); // Для вывода сообщений

    const handleSubmit = async (e) => {
        e.preventDefault(); // Чтобы страница не перезагружалась
        setMessage(''); // Очищаем прошлые сообщения

        try {
            if (isRegister) {
                // Отправка на регистрацию
                const response = await apiClient.post('/Users/register', {
                    name, email, password, role
                });
                setMessage(`Успех: ${response.data.message}! Теперь можете войти.`);
                setIsRegister(false); // Переключаем на форму входа
            } else {
                // Отправка на вход
                const response = await apiClient.post('/Users/login', {
                    email, password
                });
                setMessage(`Успех: ${response.data.message}!`);
                // Позже здесь мы сохраним токен и перейдем на главную страницу
            }
        } catch (error) {
            // Обработка ошибок от сервера
            if (error.response && error.response.data) {
                setMessage(`Ошибка: ${error.response.data}`);
            } else {
                setMessage('Ошибка: Сервер недоступен. Проверьте, запущен ли C# проект.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">

                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                    {isRegister ? 'Регистрация' : 'Вход в DogWalking'}
                </h2>

                {/* Блок для вывода сообщений об ошибках или успехе */}
                {message && (
                    <div className={`p-4 mb-4 rounded-lg text-sm ${message.includes('Ошибка') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {isRegister && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Имя</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Ваше имя"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="••••••••"
                        />
                    </div>

                    {isRegister && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Роль</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="Owner">Я хозяин собаки</option>
                                <option value="Walker">Я выгульщик</option>
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        {isRegister ? 'Зарегистрироваться' : 'Войти'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setMessage('');
                        }}
                        className="text-sm text-blue-600 hover:text-blue-500"
                    >
                        {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
                    </button>
                </div>
            </div>
        </div>
    );
}
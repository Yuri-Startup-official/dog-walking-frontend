import { useNavigate } from 'react-router-dom';
import { useAuth } from '../api/context/AuthContext';
import SupportCenter from './SupportCenter';

export default function SupportDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <main className="support-staff-shell">
      <header className="support-staff-topbar">
        <div><strong>DogWalking · Support</strong><span>{user?.name || 'Сотрудник поддержки'}</span></div>
        <button onClick={() => { logout(); navigate('/login', { replace: true }); }}>Выйти</button>
      </header>
      <SupportCenter manager />
    </main>
  );
}

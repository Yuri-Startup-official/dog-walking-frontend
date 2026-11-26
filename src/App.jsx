import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './api/context/AuthContext';
import Login from './pages/Login';
import OwnerDashboard from './pages/OwnerDashboard';
import WalkerDashboard from './pages/WalkerDashboard';
import SupportDashboard from './pages/SupportDashboard';

function normalizedRole(role) {
  const value = String(role || '').toLowerCase();
  if (value === 'walker') return 'sitter';
  return value;
}

function RequireAuth({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(normalizedRole(user.role))) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  const role = normalizedRole(user?.role);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Login initialMode="register" />} />
      <Route
        path="/owner"
        element={(
          <RequireAuth allowedRoles={['owner', 'both']}>
            <OwnerDashboard />
          </RequireAuth>
        )}
      />
      <Route
        path="/walker"
        element={(
          <RequireAuth allowedRoles={['sitter', 'both']}>
            <WalkerDashboard />
          </RequireAuth>
        )}
      />
      <Route
        path="/support"
        element={(
          <RequireAuth allowedRoles={['support']}>
            <SupportDashboard />
          </RequireAuth>
        )}
      />
      <Route
        path="/"
        element={user
          ? <Navigate to={role === 'support' ? '/support' : role === 'sitter' ? '/walker' : '/owner'} replace />
          : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerDashboard from './pages/OwnerDashboard';
import WalkerDashboard from './pages/WalkerDashboard';
import { useAuth } from './context/AuthContext';

function RequireAuth({ children, role }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/owner"
        element={
          <RequireAuth role="Owner">
            <OwnerDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/walker"
        element={
          <RequireAuth role="Walker">
            <WalkerDashboard />
          </RequireAuth>
        }
      />

      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to={user.role === 'Owner' ? '/owner' : '/walker'} replace />
            : <Navigate to="/login" replace />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
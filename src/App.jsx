import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SchoolsPage from './pages/SchoolsPage';
import SchoolDetailPage from './pages/SchoolDetailPage';
import AdminsPage from './pages/AdminsPage';
import TripsPage from './pages/TripsPage';
import AlertsPage from './pages/AlertsPage';
import AuditPage from './pages/AuditPage';
import SubscriptionsPage from './pages/SubscriptionsPage';

function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="d-flex align-items-center justify-content-center vh-100"><div className="spinner-border" /></div>;
  return user ? <Layout /> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<DashboardPage />} />
            <Route path="schools" element={<SchoolsPage />} />
            <Route path="schools/:id" element={<SchoolDetailPage />} />
            <Route path="admins" element={<AdminsPage />} />
            <Route path="trips" element={<TripsPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

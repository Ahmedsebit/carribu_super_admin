import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiGrid, FiBook, FiUsers, FiActivity, FiAlertTriangle, FiCreditCard, FiLogOut, FiClock } from 'react-icons/fi';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = [
    { to: '/', icon: <FiGrid />, label: 'Dashboard' },
    { to: '/schools', icon: <FiBook />, label: 'Schools' },
    { to: '/admins', icon: <FiUsers />, label: 'School Admins' },
    { to: '/trips', icon: <FiActivity />, label: 'Trips' },
    { to: '/alerts', icon: <FiAlertTriangle />, label: 'Alerts' },
    { to: '/audit', icon: <FiClock />, label: 'Audit Logs' },
    { to: '/subscriptions', icon: <FiCreditCard />, label: 'Subscriptions' },
  ];

  return (
    <div className="d-flex flex-column vh-100 bg-dark text-white p-3" style={{ width: 250 }}>
      <h5 className="text-center mb-1">🚌 Carribu</h5>
      <small className="text-center text-muted d-block mb-4">Super Admin</small>
      <nav className="flex-grow-1">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `d-flex align-items-center gap-2 px-3 py-2 rounded text-decoration-none mb-1 ${isActive ? 'bg-primary text-white' : 'text-white-50'}`}>
            {l.icon} {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-top border-secondary pt-3">
        <small className="text-muted">{user?.firstName} {user?.lastName}</small>
        <button className="btn btn-outline-light btn-sm w-100 mt-2 d-flex align-items-center justify-content-center gap-2" onClick={handleLogout}>
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  );
}

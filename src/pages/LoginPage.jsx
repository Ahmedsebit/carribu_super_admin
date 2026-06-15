import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-dark">
      <div className="card shadow" style={{ width: 400 }}>
        <div className="card-body p-4">
          <h4 className="text-center mb-1">🚌 Carribu</h4>
          <p className="text-center text-muted mb-4">Super Admin Portal</p>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" placeholder="superadmin@carribu.io" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-muted text-center small mt-3 mb-0">
            <strong>Demo:</strong> superadmin@carribu.io / super123
          </p>
        </div>
      </div>
    </div>
  );
}

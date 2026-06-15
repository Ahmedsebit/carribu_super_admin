import { useState, useEffect } from 'react';
import { getSubscriptions, createSubscription, getUsage, getSchools } from '../services/superAdminService';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [usage, setUsage] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('subscriptions');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ schoolId: '', plan: 'basic', maxStudents: 50, maxVehicles: 5, startDate: '', endDate: '', amount: '', currency: 'KES' });
  const [error, setError] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([getSubscriptions(), getUsage(), getSchools()])
      .then(([s, u, sc]) => { setSubscriptions(s.data.subscriptions); setUsage(u.data.usage); setSchools(sc.data.schools); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createSubscription({ ...form, schoolId: parseInt(form.schoolId), maxStudents: parseInt(form.maxStudents), maxVehicles: parseInt(form.maxVehicles), amount: parseFloat(form.amount) || 0 });
      setShowCreate(false);
      fetchData();
    } catch (err) { setError(err.response?.data?.error || 'Failed.'); }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Subscriptions & Usage</h4>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>+ Add Subscription</button>
      </div>

      {showCreate && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h6>Create / Update Subscription</h6>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleCreate} className="row g-2">
              <div className="col-md-3">
                <select className="form-select" value={form.schoolId} onChange={e => setForm({ ...form, schoolId: e.target.value })} required>
                  <option value="">Select School *</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <select className="form-select" value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}>
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="col-md-2"><input className="form-control" type="number" placeholder="Max Students" value={form.maxStudents} onChange={e => setForm({ ...form, maxStudents: e.target.value })} /></div>
              <div className="col-md-2"><input className="form-control" type="number" placeholder="Max Vehicles" value={form.maxVehicles} onChange={e => setForm({ ...form, maxVehicles: e.target.value })} /></div>
              <div className="col-md-2"><input className="form-control" type="number" placeholder="Amount" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
              <div className="col-md-2"><input className="form-control" type="date" placeholder="Start" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
              <div className="col-md-2"><input className="form-control" type="date" placeholder="End" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
              <div className="col-md-2"><button type="submit" className="btn btn-success w-100">Save</button></div>
            </form>
          </div>
        </div>
      )}

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item"><button className={`nav-link ${tab === 'subscriptions' ? 'active' : ''}`} onClick={() => setTab('subscriptions')}>Subscriptions</button></li>
        <li className="nav-item"><button className={`nav-link ${tab === 'usage' ? 'active' : ''}`} onClick={() => setTab('usage')}>Usage</button></li>
      </ul>

      {tab === 'subscriptions' && (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light"><tr><th>School</th><th>Plan</th><th>Status</th><th>Students Limit</th><th>Vehicles Limit</th><th>Amount</th><th>End Date</th></tr></thead>
              <tbody>
                {subscriptions.map(s => (
                  <tr key={s.id}>
                    <td>{s.school?.name}</td>
                    <td><span className="badge bg-primary text-capitalize">{s.plan}</span></td>
                    <td><span className={`badge bg-${s.status === 'active' ? 'success' : s.status === 'trial' ? 'info' : 'danger'}`}>{s.status}</span></td>
                    <td>{s.maxStudents}</td>
                    <td>{s.maxVehicles}</td>
                    <td>{s.currency} {s.amount}</td>
                    <td>{s.endDate || '-'}</td>
                  </tr>
                ))}
                {subscriptions.length === 0 && <tr><td colSpan="7" className="text-center text-muted py-3">No subscriptions yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'usage' && (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light"><tr><th>School</th><th>Students</th><th>Vehicles</th><th>Plan</th><th>Status</th></tr></thead>
              <tbody>
                {usage.map(u => (
                  <tr key={u.schoolId}>
                    <td>{u.schoolName}</td>
                    <td>
                      {u.students.current}{u.students.max ? `/${u.students.max}` : ''}
                      {u.students.utilization !== null && <div className="progress mt-1" style={{ height: 4 }}><div className={`progress-bar bg-${u.students.utilization > 90 ? 'danger' : 'success'}`} style={{ width: `${u.students.utilization}%` }} /></div>}
                    </td>
                    <td>
                      {u.vehicles.current}{u.vehicles.max ? `/${u.vehicles.max}` : ''}
                      {u.vehicles.utilization !== null && <div className="progress mt-1" style={{ height: 4 }}><div className={`progress-bar bg-${u.vehicles.utilization > 90 ? 'danger' : 'success'}`} style={{ width: `${u.vehicles.utilization}%` }} /></div>}
                    </td>
                    <td>{u.subscription?.plan || <span className="text-muted">None</span>}</td>
                    <td>{u.subscription ? <span className={`badge bg-${u.subscription.status === 'active' ? 'success' : 'warning'}`}>{u.subscription.status}</span> : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

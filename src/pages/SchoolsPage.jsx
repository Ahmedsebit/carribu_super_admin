import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSchools, createSchool, deactivateSchool, activateSchool } from '../services/superAdminService';

export default function SchoolsPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', city: '', phone: '', email: '' });
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchSchools = () => {
    setLoading(true);
    getSchools({ search: search || undefined }).then(res => setSchools(res.data.schools)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchSchools(); }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createSchool(form);
      setShowCreate(false);
      setForm({ name: '', address: '', city: '', phone: '', email: '' });
      fetchSchools();
    } catch (err) { setError(err.response?.data?.error || 'Failed to create school.'); }
  };

  const handleToggle = async (school) => {
    if (school.isActive) {
      if (!confirm(`Deactivate "${school.name}" and all its users?`)) return;
      await deactivateSchool(school.id);
    } else {
      await activateSchool(school.id);
    }
    fetchSchools();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Schools</h4>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>+ Add School</button>
      </div>

      {showCreate && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h6>Create School</h6>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleCreate} className="row g-2">
              <div className="col-md-4"><input className="form-control" placeholder="School Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="col-md-4"><input className="form-control" placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="col-md-4"><input className="form-control" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="col-md-6"><input className="form-control" placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              <div className="col-md-3"><input className="form-control" placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
              <div className="col-md-3"><button type="submit" className="btn btn-success w-100">Create</button></div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-3">
        <input className="form-control" placeholder="Search schools..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? <div className="text-center py-5"><div className="spinner-border" /></div> : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr><th>Name</th><th>City</th><th>Manager</th><th>Admins</th><th>Students</th><th>Vehicles</th><th>Routes</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {schools.map(s => (
                  <tr key={s.id}>
                    <td><a href="#" onClick={(e) => { e.preventDefault(); navigate(`/schools/${s.id}`); }} className="text-decoration-none fw-bold">{s.name}</a></td>
                    <td>{s.city || '-'}</td>
                    <td>{s.manager ? `${s.manager.firstName} ${s.manager.lastName}` : <span className="text-muted">—</span>}</td>
                    <td>{s.adminCount}</td>
                    <td>{s.studentCount}</td>
                    <td>{s.vehicleCount}</td>
                    <td>{s.routeCount}</td>
                    <td><span className={`badge bg-${s.isActive ? 'success' : 'secondary'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <button className={`btn btn-sm btn-outline-${s.isActive ? 'danger' : 'success'}`} onClick={() => handleToggle(s)}>
                        {s.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
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

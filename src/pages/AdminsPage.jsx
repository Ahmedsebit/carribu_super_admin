import { useState, useEffect } from 'react';
import { getAdmins, createAdmin, removeAdmin, resetAdminPassword, getSchools } from '../services/superAdminService';

export default function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ schoolId: '', email: '', password: '', firstName: '', lastName: '', phone: '' });
  const [error, setError] = useState('');
  const [filterSchool, setFilterSchool] = useState('');

  const [success, setSuccess] = useState('');

  const fetchAdmins = () => {
    setLoading(true);
    getAdmins({ schoolId: filterSchool || undefined }).then(res => setAdmins(res.data.admins)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAdmins(); }, [filterSchool]);
  useEffect(() => { getSchools().then(res => setSchools(res.data.schools)).catch(() => {}); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createAdmin({ ...form, schoolId: parseInt(form.schoolId) });
      setShowCreate(false);
      setForm({ schoolId: '', email: '', password: '', firstName: '', lastName: '', phone: '' });
      fetchAdmins();
    } catch (err) { setError(err.response?.data?.error || 'Failed to create admin.'); }
  };

  const handleRemove = async (admin) => {
    if (!confirm(`Deactivate admin "${admin.firstName} ${admin.lastName}"?`)) return;
    await removeAdmin(admin.id);
    fetchAdmins();
  };

  const handleResetPassword = async (admin) => {
    if (!confirm(`Reset password for "${admin.firstName} ${admin.lastName}"? A new password will be generated and emailed to them.`)) return;
    try {
      const res = await resetAdminPassword(admin.id);
      const msg = res.data.emailSent
        ? `Password reset! New password emailed to ${admin.email}.`
        : `Password reset! Temp password: ${res.data.tempPassword} (email delivery not confirmed)`;
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 8000);
    } catch (err) { setError(err.response?.data?.error || 'Failed to reset password.'); setTimeout(() => setError(''), 5000); }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">School Admins</h4>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>+ Add Admin</button>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && <div className="alert alert-success py-2">{success}</div>}

      {showCreate && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h6>Create School Admin</h6>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleCreate} className="row g-2">
              <div className="col-md-4">
                <select className="form-select" value={form.schoolId} onChange={e => setForm({ ...form, schoolId: e.target.value })} required>
                  <option value="">Select School *</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="col-md-4"><input className="form-control" placeholder="First Name *" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required /></div>
              <div className="col-md-4"><input className="form-control" placeholder="Last Name *" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required /></div>
              <div className="col-md-4"><input className="form-control" placeholder="Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
              <div className="col-md-3"><input className="form-control" placeholder="Password *" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></div>
              <div className="col-md-3"><input className="form-control" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="col-md-2"><button type="submit" className="btn btn-success w-100">Create</button></div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-3">
        <select className="form-select" style={{ maxWidth: 300 }} value={filterSchool} onChange={e => setFilterSchool(e.target.value)}>
          <option value="">All Schools</option>
          {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {loading ? <div className="text-center py-5"><div className="spinner-border" /></div> : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>School</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {admins.map(a => (
                  <tr key={a.id}>
                    <td>{a.firstName} {a.lastName}</td>
                    <td>{a.email}</td>
                    <td>{a.phone || '-'}</td>
                    <td>{a.school?.name}</td>
                    <td><span className={`badge bg-${a.isActive ? 'success' : 'secondary'}`}>{a.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      {a.isActive && (
                        <>
                          <button className="btn btn-sm btn-outline-warning me-1" onClick={() => handleResetPassword(a)}>Reset Password</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(a)}>Deactivate</button>
                        </>
                      )}
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

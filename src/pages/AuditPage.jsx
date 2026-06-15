import { useState, useEffect } from 'react';
import { getAuditLogs, getRecentLogins } from '../services/superAdminService';

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [logins, setLogins] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('logs');
  const [filters, setFilters] = useState({ action: '', limit: 50 });

  useEffect(() => {
    setLoading(true);
    if (tab === 'logs') {
      getAuditLogs(filters).then(res => { setLogs(res.data.logs); setTotal(res.data.total); }).catch(() => {}).finally(() => setLoading(false));
    } else {
      getRecentLogins({ limit: 50 }).then(res => setLogins(res.data.logins)).catch(() => {}).finally(() => setLoading(false));
    }
  }, [tab, filters]);

  return (
    <div>
      <h4 className="mb-4">Audit & Activity</h4>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item"><button className={`nav-link ${tab === 'logs' ? 'active' : ''}`} onClick={() => setTab('logs')}>Audit Logs</button></li>
        <li className="nav-item"><button className={`nav-link ${tab === 'logins' ? 'active' : ''}`} onClick={() => setTab('logins')}>Login Activity</button></li>
      </ul>

      {tab === 'logs' && (
        <>
          <div className="mb-3">
            <input className="form-control" style={{ maxWidth: 300 }} placeholder="Filter by action..." value={filters.action} onChange={e => setFilters({ ...filters, action: e.target.value })} />
          </div>
          {loading ? <div className="text-center py-5"><div className="spinner-border" /></div> : (
            <div className="card border-0 shadow-sm">
              <div className="table-responsive">
                <table className="table table-sm table-hover mb-0">
                  <thead className="table-light"><tr><th>Time</th><th>User</th><th>Action</th><th>Resource</th><th>IP</th></tr></thead>
                  <tbody>
                    {logs.map(l => (
                      <tr key={l.id}>
                        <td><small>{new Date(l.createdAt).toLocaleString()}</small></td>
                        <td>{l.user ? `${l.user.firstName} ${l.user.lastName}` : '-'}</td>
                        <td><span className="badge bg-secondary">{l.action}</span></td>
                        <td>{l.resource || '-'}</td>
                        <td><small className="text-muted">{l.ipAddress || '-'}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card-footer text-muted small">Showing {logs.length} of {total}</div>
            </div>
          )}
        </>
      )}

      {tab === 'logins' && (
        loading ? <div className="text-center py-5"><div className="spinner-border" /></div> : (
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-sm table-hover mb-0">
                <thead className="table-light"><tr><th>Time</th><th>User</th><th>Status</th><th>IP</th></tr></thead>
                <tbody>
                  {logins.map(l => (
                    <tr key={l.id}>
                      <td><small>{new Date(l.createdAt).toLocaleString()}</small></td>
                      <td>{l.user ? `${l.user.firstName} ${l.user.lastName} (${l.user.email})` : JSON.parse(l.details || '{}').email || '-'}</td>
                      <td><span className={`badge bg-${l.action === 'login_success' ? 'success' : 'danger'}`}>{l.action === 'login_success' ? 'Success' : 'Failed'}</span></td>
                      <td><small className="text-muted">{l.ipAddress || '-'}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}

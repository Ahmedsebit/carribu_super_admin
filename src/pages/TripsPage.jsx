import { useState, useEffect } from 'react';
import { getActiveTrips, getTripHistory, getSchools } from '../services/superAdminService';
import StatCard from '../components/StatCard';
import { FiActivity } from 'react-icons/fi';

export default function TripsPage() {
  const [activeCount, setActiveCount] = useState(0);
  const [perSchool, setPerSchool] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [filters, setFilters] = useState({ schoolId: '', startDate: '', endDate: '' });

  useEffect(() => { getSchools().then(res => setSchools(res.data.schools)).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.schoolId) params.schoolId = filters.schoolId;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    Promise.all([getActiveTrips(), getTripHistory(params)])
      .then(([at, th]) => {
        setActiveCount(at.data.activeTrips);
        setPerSchool(at.data.perSchool || []);
        setStatusBreakdown(th.data.statusBreakdown || []);
        setTotal(th.data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'cancelled': return 'danger';
      case 'missed': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div>
      <h4 className="mb-4">Trip Overview</h4>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <StatCard title="Active Trips Now" value={activeCount} color="success" icon={<FiActivity />} />
        </div>
        <div className="col-md-3">
          <StatCard title="Total Trips" value={total} color="primary" icon={<FiActivity />} />
        </div>
        {statusBreakdown.map(s => (
          <div className="col-md-3" key={s.status}>
            <StatCard title={s.status?.replace('_', ' ')} value={s.count} color={getStatusColor(s.status)} />
          </div>
        ))}
      </div>

      {perSchool.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h6>Active Trips by School</h6>
            <div className="table-responsive">
              <table className="table table-sm mb-0">
                <thead><tr><th>School</th><th>Active Trips</th></tr></thead>
                <tbody>
                  {perSchool.map((s, i) => (
                    <tr key={i}>
                      <td>{s['route.school.name'] || 'Unknown'}</td>
                      <td><span className="badge bg-success">{s.count}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h6>Filter Trip Stats</h6>
          <div className="row g-2 mb-3">
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={filters.schoolId} onChange={e => setFilters({ ...filters, schoolId: e.target.value })}>
                <option value="">All Schools</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-md-3"><input type="date" className="form-control form-control-sm" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} placeholder="Start" /></div>
            <div className="col-md-3"><input type="date" className="form-control form-control-sm" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} placeholder="End" /></div>
            <div className="col-md-2"><button className="btn btn-sm btn-outline-secondary w-100" onClick={() => setFilters({ schoolId: '', startDate: '', endDate: '' })}>Clear</button></div>
          </div>

          {loading ? <div className="text-center py-3"><div className="spinner-border spinner-border-sm" /></div> : (
            <div className="table-responsive">
              <table className="table table-sm mb-0">
                <thead className="table-light"><tr><th>Status</th><th>Count</th></tr></thead>
                <tbody>
                  {statusBreakdown.map(s => (
                    <tr key={s.status}>
                      <td><span className={`badge bg-${getStatusColor(s.status)} text-capitalize`}>{s.status?.replace('_', ' ')}</span></td>
                      <td>{s.count}</td>
                    </tr>
                  ))}
                  {statusBreakdown.length === 0 && <tr><td colSpan="2" className="text-muted text-center">No trips found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="alert alert-info mt-4 small">
        <strong>Note:</strong> Trip details (driver names, routes, student info) are confidential and managed by school admins.
      </div>
    </div>
  );
}

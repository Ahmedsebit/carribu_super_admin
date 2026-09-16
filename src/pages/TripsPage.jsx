import { useState, useEffect } from 'react';
import {
  getActiveTrips,
  getTripHistory,
  getSchools,
  permanentlyDeleteSchoolResource,
  endSchoolTrip,
} from '../services/superAdminService';
import StatCard from '../components/StatCard';
import { FiActivity } from 'react-icons/fi';

const normalizeConfirmation = value => value.trim().replace(/\s+/g, ' ');

export default function TripsPage() {
  const [activeCount, setActiveCount] = useState(0);
  const [perSchool, setPerSchool] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [trips, setTrips] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [filters, setFilters] = useState({ schoolId: '', startDate: '', endDate: '' });
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleting, setDeleting] = useState(null);
  const [ending, setEnding] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getSchools()
      .then(res => setSchools(res.data.schools))
      .catch(err => setError(err.response?.data?.error || 'Failed to load schools.'));
  }, []);

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
        setTrips(th.data.trips || []);
        setTotal(th.data.total);
        setError('');
      })
      .catch(err => setError(err.response?.data?.error || 'Failed to load trips.'))
      .finally(() => setLoading(false));
  }, [filters, refreshKey]);

  const handleDeleteTrip = async (trip) => {
    if (trip.status === 'in_progress') {
      setError('An in-progress trip cannot be deleted until it has ended.');
      return;
    }

    const label = `Trip #${trip.id}`;
    const confirmation = window.prompt(
      `Permanently delete "${label}" and its logs, locations, and messages?\n\nType exactly: ${label}`
    );
    if (confirmation === null) return;
    if (normalizeConfirmation(confirmation) !== label) {
      setError(`Confirmation did not match "${label}". Nothing was deleted.`);
      return;
    }

    const schoolId = trip.route?.school?.id || trip.route?.schoolId || trip.route?.school_id;
    if (!schoolId) {
      setError('The trip school could not be determined.');
      return;
    }

    setDeleting(trip.id);
    setError('');
    try {
      await permanentlyDeleteSchoolResource(schoolId, 'trip', trip.id, label);
      setRefreshKey(key => key + 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete trip.');
    } finally {
      setDeleting(null);
    }
  };

  const handleEndTrip = async (trip) => {
    const schoolId = trip.route?.school?.id || trip.route?.schoolId || trip.route?.school_id;
    if (!schoolId) {
      setError('The trip school could not be determined.');
      return;
    }
    if (!window.confirm(`End Trip #${trip.id} now? This marks the trip as completed.`)) return;

    setEnding(trip.id);
    setError('');
    try {
      await endSchoolTrip(schoolId, trip.id);
      setRefreshKey(key => key + 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to end trip.');
    } finally {
      setEnding(null);
    }
  };

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
      {error && <div className="alert alert-danger">{error}</div>}

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

      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Trips</h6>
            <span className="badge bg-secondary">{total}</span>
          </div>
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Trip</th>
                  <th>School</th>
                  <th>Route</th>
                  <th>Driver</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {trips.map(trip => (
                  <tr key={trip.id}>
                    <td>Trip #{trip.id}</td>
                    <td>{trip.route?.school?.name || '-'}</td>
                    <td>{trip.route?.name || '-'}</td>
                    <td>
                      {trip.driver
                        ? `${trip.driver.firstName} ${trip.driver.lastName}`.trim()
                        : '-'}
                    </td>
                    <td>{trip.scheduledDate || '-'}</td>
                    <td>
                      <span className={`badge bg-${getStatusColor(trip.status)} text-capitalize`}>
                        {trip.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-end">
                      {trip.status === 'in_progress' ? (
                        <button
                          className="btn btn-sm btn-warning"
                          disabled={ending === trip.id}
                          onClick={() => handleEndTrip(trip)}
                        >
                          {ending === trip.id ? 'Ending...' : 'End trip'}
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          disabled={deleting === trip.id}
                          onClick={() => handleDeleteTrip(trip)}
                        >
                          {deleting === trip.id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && trips.length === 0 && (
                  <tr><td colSpan="7" className="text-muted text-center">No trips found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="alert alert-info mt-4 small">
        <strong>Note:</strong> Deleting a trip also permanently removes its logs, locations, and linked messages.
      </div>
    </div>
  );
}

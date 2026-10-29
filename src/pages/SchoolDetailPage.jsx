import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getSchool,
  getSchoolStats,
  getSchoolResources,
  permanentlyDeleteSchool,
  permanentlyDeleteSchoolResource,
  updateVehicleTracker,
} from '../services/superAdminService';
import StatCard from '../components/StatCard';

const resourceConfig = {
  drivers: {
    type: 'driver',
    title: 'Drivers',
    columns: ['Name', 'Email', 'Status'],
    label: item => `${item.firstName} ${item.lastName}`.trim(),
    cells: item => [
      `${item.firstName} ${item.lastName}`,
      item.email,
      item.isActive ? 'Active' : 'Inactive',
    ],
  },
  parents: {
    type: 'parent',
    title: 'Parents',
    columns: ['Name', 'Email', 'Children', 'School access'],
    label: item => `${item.firstName} ${item.lastName}`.trim(),
    cells: item => [
      `${item.firstName} ${item.lastName}`,
      item.email,
      item.childCount,
      item.schoolAccessActive ? 'Active' : 'Inactive',
    ],
  },
  students: {
    type: 'student',
    title: 'Students',
    columns: ['Name', 'Admission number', 'Grade'],
    label: item => `${item.firstName} ${item.lastName}`.trim(),
    cells: item => [
      `${item.firstName} ${item.lastName}`,
      item.admissionNumber || '-',
      item.grade || '-',
    ],
  },
  vehicles: {
    type: 'vehicle',
    title: 'Vehicles',
    columns: ['Plate number', 'Vehicle', 'Status', 'Tracker identifier'],
    label: item => item.plateNumber,
    cells: item => [
      item.plateNumber,
      `${item.make || ''} ${item.model || ''}`.trim() || '-',
      item.status,
      item.trackerUniqueId || 'Not linked',
    ],
  },
  routes: {
    type: 'route',
    title: 'Routes',
    columns: ['Name', 'Type', 'Status'],
    label: item => item.name,
    cells: item => [item.name, item.type, item.isActive ? 'Active' : 'Inactive'],
  },
  trips: {
    type: 'trip',
    title: 'Trips',
    columns: ['Trip', 'Route', 'Date', 'Status'],
    label: item => `Trip #${item.id}`,
    cells: item => [
      `Trip #${item.id}`,
      item.route?.name || '-',
      item.scheduledDate || '-',
      item.status,
    ],
  },
};

const normalizeConfirmation = value => value.trim().replace(/\s+/g, ' ');

export default function SchoolDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [stats, setStats] = useState(null);
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState('');
  const [error, setError] = useState('');
  const [trackerVehicle, setTrackerVehicle] = useState(null);
  const [trackerIdentifier, setTrackerIdentifier] = useState('');
  const [trackerError, setTrackerError] = useState('');
  const [trackerSaving, setTrackerSaving] = useState(false);
  const [trackerSuccess, setTrackerSuccess] = useState('');

  const load = () => {
    Promise.all([getSchool(id), getSchoolStats(id), getSchoolResources(id)])
      .then(([s, st, resourceResponse]) => {
        setSchool(s.data.school);
        setStats(st.data.stats);
        setResources(resourceResponse.data.resources);
        setError('');
      })
      .catch(err => setError(err.response?.data?.error || 'Failed to load school data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const typedConfirmation = (label) => {
    const confirmation = window.prompt(
      `This permanently deletes "${label}" and related data. This cannot be undone.\n\nType exactly: ${label}`
    );
    if (
      confirmation !== null
      && normalizeConfirmation(confirmation) !== normalizeConfirmation(label)
    ) {
      setError(`Confirmation did not match "${label}". Nothing was deleted.`);
    }
    return confirmation !== null
      && normalizeConfirmation(confirmation) === normalizeConfirmation(label)
      ? label
      : null;
  };

  const deleteResource = async (config, item) => {
    const label = config.label(item);
    const confirmation = typedConfirmation(label);
    if (!confirmation) return;
    setDeleting(`${config.type}-${item.id}`);
    setError('');
    try {
      await permanentlyDeleteSchoolResource(id, config.type, item.id, confirmation);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to delete ${config.type}.`);
    } finally {
      setDeleting('');
    }
  };

  const deleteCurrentSchool = async () => {
    const confirmation = typedConfirmation(school.name);
    if (!confirmation) return;
    setDeleting('school');
    setError('');
    try {
      await permanentlyDeleteSchool(school.id, confirmation);
      navigate('/schools');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete school.');
      setDeleting('');
    }
  };

  const editTracker = vehicle => {
    setTrackerVehicle(vehicle);
    setTrackerIdentifier(vehicle.trackerUniqueId || '');
    setTrackerError('');
    setTrackerSuccess('');
  };

  const saveTracker = async trackerUniqueId => {
    if (trackerSaving) return;
    setTrackerError('');
    setTrackerSaving(true);
    try {
      const { data } = await updateVehicleTracker(id, trackerVehicle.id, trackerUniqueId);
      setResources(previous => ({
        ...previous,
        vehicles: previous.vehicles.map(vehicle =>
          vehicle.id === data.vehicle.id ? { ...vehicle, ...data.vehicle } : vehicle),
      }));
      setTrackerVehicle(null);
      setTrackerSuccess(trackerUniqueId ? 'GPS tracker linked.' : 'GPS tracker unlinked.');
    } catch (err) {
      setTrackerError(err.response?.data?.error || 'The tracker assignment could not be saved. Please try again.');
    } finally {
      setTrackerSaving(false);
    }
  };

  const submitTracker = event => {
    event.preventDefault();
    const identifier = trackerIdentifier.trim();
    if (!identifier || identifier.length > 128) {
      setTrackerError('Enter a Traccar identifier between 1 and 128 characters. Use Unlink tracker to remove a link.');
      return;
    }
    saveTracker(identifier);
  };

  const unlinkTracker = () => {
    if (window.confirm(`Unlink the GPS tracker from ${trackerVehicle.plateNumber}? New tracker locations will no longer be saved for this vehicle.`)) {
      saveTracker(null);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;
  if (!school) return <div className="alert alert-danger">School not found.</div>;

  const summary = school.summary || {};

  return (
    <div>
      <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => navigate('/schools')}>&#8592; Back to Schools</button>
      <h4 className="mb-1">{school.name}</h4>
      <p className="text-muted">{school.address}{school.city ? `, ${school.city}` : ''} | {school.phone || 'No phone'} | {school.email || 'No email'}</p>
      {school.manager && <p className="text-muted mb-1"><strong>Manager:</strong> {school.manager.firstName} {school.manager.lastName} ({school.manager.email})</p>}
      <span className={`badge bg-${school.isActive ? 'success' : 'secondary'} mb-3`}>{school.isActive ? 'Active' : 'Inactive'}</span>
      {error && <div className="alert alert-danger">{error}</div>}
      {trackerSuccess && <div className="alert alert-success" role="status">{trackerSuccess}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-2"><StatCard title="Total Users" value={summary.userCount} /></div>
        <div className="col-md-2"><StatCard title="Students" value={summary.studentCount} color="info" subtitle={`${summary.activeStudents} active`} /></div>
        <div className="col-md-2"><StatCard title="Vehicles" value={summary.vehicleCount} color="success" subtitle={`${summary.activeVehicles} active`} /></div>
        <div className="col-md-2"><StatCard title="Routes" value={summary.routeCount} color="primary" subtitle={`${summary.activeRoutes} active`} /></div>
        <div className="col-md-2"><StatCard title="Trips" value={stats?.tripCount} color="warning" /></div>
        <div className="col-md-2"><StatCard title="Active Trips" value={stats?.activeTrips} color="danger" /></div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6>User Breakdown</h6>
              <table className="table table-sm mb-0">
                <tbody>
                  <tr><td>School Admins</td><td><span className="badge bg-warning">{summary.adminCount}</span></td></tr>
                  <tr><td>Coordinators</td><td><span className="badge bg-info">{summary.coordinatorCount}</span></td></tr>
                  <tr><td>Drivers</td><td><span className="badge bg-primary">{summary.driverCount}</span></td></tr>
                  <tr><td>Parents</td><td><span className="badge bg-secondary">{summary.parentCount}</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6>School Info</h6>
              <table className="table table-sm mb-0">
                <tbody>
                  <tr><td>Created</td><td>{new Date(school.createdAt).toLocaleDateString()}</td></tr>
                  <tr><td>Phone</td><td>{school.phone || '-'}</td></tr>
                  <tr><td>Email</td><td>{school.email || '-'}</td></tr>
                  <tr><td>City</td><td>{school.city || '-'}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h5>School Resource Management</h5>
        <p className="text-muted small">
          Super admins manage tracker assignments in Vehicles below. Deletion removes the selected record and dependent data. Resources connected to an in-progress trip cannot be deleted until the trip ends.
        </p>
        {resources && Object.entries(resourceConfig).map(([key, config]) => {
          const items = resources[key] || [];
          return (
            <div className="card border-0 shadow-sm mb-3" key={key}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">{config.title}</h6>
                  <span className="badge bg-secondary">{items.length}</span>
                </div>
                {key === 'vehicles' && trackerVehicle && (
                  <form onSubmit={submitTracker} className="border rounded p-3 mb-3">
                    <h6>{trackerVehicle.trackerUniqueId ? 'Change' : 'Link'} GPS tracker - {trackerVehicle.plateNumber}</h6>
                    {trackerError && <div className="alert alert-danger" role="alert">{trackerError}</div>}
                    {trackerVehicle.status !== 'active' && (
                      <div className="alert alert-warning">This vehicle is not active. Linking does not activate it; positions will be ignored until it is active.</div>
                    )}
                    <label className="form-label" htmlFor="tracker-identifier">Tracker IMEI / device identifier</label>
                    <input
                      id="tracker-identifier"
                      className="form-control"
                      value={trackerIdentifier}
                      onChange={event => setTrackerIdentifier(event.target.value)}
                      maxLength={128}
                      disabled={trackerSaving}
                      autoFocus
                      aria-describedby="tracker-help"
                    />
                    <p id="tracker-help" className="text-muted small mt-2">
                      Copy the Identifier from this device in Traccar. Each tracker can be assigned to only one vehicle.
                      The next backend poll picks up the link without restarting. Saving locations requires an active vehicle,
                      an in-progress trip, and a GPS fix from after the trip started.
                    </p>
                    <div className="d-flex gap-2 flex-wrap">
                      <button type="submit" className="btn btn-primary" disabled={trackerSaving}>
                        {trackerSaving ? 'Saving...' : trackerVehicle.trackerUniqueId ? 'Save tracker' : 'Link tracker'}
                      </button>
                      {trackerVehicle.trackerUniqueId && (
                        <button type="button" className="btn btn-outline-danger" onClick={unlinkTracker} disabled={trackerSaving}>Unlink tracker</button>
                      )}
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setTrackerVehicle(null)} disabled={trackerSaving}>Cancel</button>
                    </div>
                  </form>
                )}
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead>
                      <tr>
                        {config.columns.map(column => <th key={column}>{column}</th>)}
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id}>
                          {config.cells(item).map((cell, index) => <td key={config.columns[index]}>{cell}</td>)}
                          <td className="text-end">
                            {key === 'vehicles' && (
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                disabled={trackerSaving || Boolean(deleting)}
                                onClick={() => editTracker(item)}
                              >
                                {item.trackerUniqueId ? 'Change tracker' : 'Link tracker'}
                              </button>
                            )}
                            <button
                              className="btn btn-sm btn-outline-danger"
                              disabled={trackerSaving || deleting === `${config.type}-${item.id}`}
                              onClick={() => deleteResource(config, item)}
                            >
                              {deleting === `${config.type}-${item.id}` ? 'Deleting...' : 'Delete permanently'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {items.length === 0 && (
                        <tr><td colSpan={config.columns.length + 1} className="text-muted text-center">No records.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card border-danger mt-4">
        <div className="card-body">
          <h5 className="text-danger">Delete Entire School</h5>
          <p className="mb-3">
            Permanently deletes the school, trips, routes, vehicles, students, staff, messages, locations, subscriptions, and audit records.
            Parents linked to other schools keep their accounts and other school data.
          </p>
          <button
            className="btn btn-danger"
            disabled={trackerSaving || deleting === 'school'}
            onClick={deleteCurrentSchool}
          >
            {deleting === 'school' ? 'Deleting school...' : 'Delete school permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}

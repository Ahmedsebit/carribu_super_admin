import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getSchool,
  getSchoolStats,
  getSchoolResources,
  permanentlyDeleteSchool,
  permanentlyDeleteSchoolResource,
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
    columns: ['Plate number', 'Vehicle', 'Status'],
    label: item => item.plateNumber,
    cells: item => [
      item.plateNumber,
      `${item.make || ''} ${item.model || ''}`.trim() || '-',
      item.status,
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
        <h5>Permanent Data Management</h5>
        <p className="text-muted small">
          Deletion removes the selected record and dependent data. Resources connected to an in-progress trip cannot be deleted until the trip ends.
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
                            <button
                              className="btn btn-sm btn-outline-danger"
                              disabled={deleting === `${config.type}-${item.id}`}
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
            disabled={deleting === 'school'}
            onClick={deleteCurrentSchool}
          >
            {deleting === 'school' ? 'Deleting school...' : 'Delete school permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}

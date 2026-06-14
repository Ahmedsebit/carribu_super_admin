import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSchool, getSchoolStats } from '../services/superAdminService';
import StatCard from '../components/StatCard';

export default function SchoolDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSchool(id), getSchoolStats(id)])
      .then(([s, st]) => { setSchool(s.data.school); setStats(st.data.stats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

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

      <div className="alert alert-info mt-4 small">
        <strong>Note:</strong> Individual user, vehicle, and student details are confidential and managed by school admins.
      </div>
    </div>
  );
}

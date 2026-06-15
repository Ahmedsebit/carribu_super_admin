import { useState, useEffect } from 'react';
import { getOverview, getActiveTrips, getAlerts, getGrowthMetrics } from '../services/superAdminService';
import StatCard from '../components/StatCard';
import { FiBook, FiUsers, FiTruck, FiMapPin, FiActivity, FiAlertTriangle } from 'react-icons/fi';

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [activeTripsCount, setActiveTripsCount] = useState(0);
  const [alerts, setAlerts] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOverview(), getActiveTrips(), getAlerts(), getGrowthMetrics()])
      .then(([ov, at, al, gr]) => {
        setOverview(ov.data?.overview || null);
        setActiveTripsCount(at.data?.count || at.data?.activeTrips?.length || 0);
        setAlerts(al.data?.alerts || null);
        setGrowth(gr.data || null);
      })
      .catch((err) => { console.error('Dashboard load error:', err); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;

  const totalAlerts = alerts ? ((alerts.idleSchools?.count || 0) + (alerts.expiredInsurance?.count || 0) + (alerts.schoolsWithoutAdmin?.count || 0)) : 0;

  return (
    <div>
      <h4 className="mb-4">Platform Dashboard</h4>
      <div className="row g-3 mb-4">
        <div className="col-md-3"><StatCard title="Schools" value={overview?.schoolCount} subtitle={`${overview?.activeSchools} active`} icon={<FiBook />} /></div>
        <div className="col-md-3"><StatCard title="Total Users" value={overview?.totalUsers} color="success" icon={<FiUsers />} /></div>
        <div className="col-md-3"><StatCard title="Students" value={overview?.totalStudents} color="info" icon={<FiUsers />} /></div>
        <div className="col-md-3"><StatCard title="Vehicles" value={overview?.totalVehicles} color="warning" icon={<FiTruck />} /></div>
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-3"><StatCard title="Total Routes" value={overview?.totalRoutes} icon={<FiMapPin />} /></div>
        <div className="col-md-3"><StatCard title="Total Trips" value={overview?.totalTrips} color="success" icon={<FiActivity />} /></div>
        <div className="col-md-3"><StatCard title="Active Trips Now" value={activeTripsCount} color="info" icon={<FiActivity />} /></div>
        <div className="col-md-3"><StatCard title="Alerts" value={totalAlerts} color={totalAlerts > 0 ? 'danger' : 'success'} icon={<FiAlertTriangle />} /></div>
      </div>

      {growth && growth.growth && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h6>Growth (Last {growth.period})</h6>
            <div className="row g-3">
              {Object.entries(growth.growth).map(([key, val]) => (
                <div className="col-md-3" key={key}>
                  <div className="text-capitalize text-muted small">{key}</div>
                  <span className={`fw-bold ${val >= 0 ? 'text-success' : 'text-danger'}`}>{val >= 0 ? '+' : ''}{val}%</span>
                  <small className="text-muted ms-2">({growth.current[`new${key.charAt(0).toUpperCase() + key.slice(1)}`]} new)</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

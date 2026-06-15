import { useState, useEffect } from 'react';
import { getAlerts } from '../services/superAdminService';
import { FiAlertTriangle, FiAlertCircle, FiInfo } from 'react-icons/fi';
import StatCard from '../components/StatCard';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAlerts().then(res => setAlerts(res.data.alerts)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;

  return (
    <div>
      <h4 className="mb-4">Platform Alerts</h4>

      <div className="row g-3 mb-4">
        <div className="col-md-3"><StatCard title="Expired Insurance" value={alerts?.expiredInsurance?.count || 0} color="danger" icon={<FiAlertTriangle />} /></div>
        <div className="col-md-3"><StatCard title="Expiring (30 days)" value={alerts?.expiringInsurance?.count || 0} color="warning" icon={<FiAlertCircle />} /></div>
        <div className="col-md-3"><StatCard title="Idle Schools" value={alerts?.idleSchools?.count || 0} color="info" icon={<FiInfo />} /></div>
        <div className="col-md-3"><StatCard title="Schools Without Admin" value={alerts?.schoolsWithoutAdmin?.count || 0} color="danger" icon={<FiAlertTriangle />} /></div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h6 className="text-info"><FiInfo className="me-2" />Idle Schools - No trips in 7 days ({alerts?.idleSchools?.count || 0})</h6>
          {alerts?.idleSchools?.count > 0 ? (
            <ul className="list-group list-group-flush">
              {alerts.idleSchools.schools.map(s => <li key={s.id} className="list-group-item">{s.name}</li>)}
            </ul>
          ) : <p className="text-muted mb-0">All schools are active.</p>}
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h6 className="text-danger"><FiAlertTriangle className="me-2" />Schools Without Admin ({alerts?.schoolsWithoutAdmin?.count || 0})</h6>
          {alerts?.schoolsWithoutAdmin?.count > 0 ? (
            <ul className="list-group list-group-flush">
              {alerts.schoolsWithoutAdmin.schools.map(s => <li key={s.id} className="list-group-item">{s.name}</li>)}
            </ul>
          ) : <p className="text-muted mb-0">All schools have admins.</p>}
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h6 className="text-warning"><FiAlertCircle className="me-2" />Vehicle Insurance Alerts</h6>
          <p className="mb-1"><strong className="text-danger">{alerts?.expiredInsurance?.count || 0}</strong> vehicles with expired insurance</p>
          <p className="mb-0"><strong className="text-warning">{alerts?.expiringInsurance?.count || 0}</strong> vehicles expiring within 30 days</p>
          <small className="text-muted">Vehicle details are managed by school admins.</small>
        </div>
      </div>
    </div>
  );
}

export default function StatCard({ title, value, subtitle, color = 'primary', icon }) {
  const displayValue = (value !== null && typeof value === 'object') ? JSON.stringify(value) : (value ?? '-');
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="text-muted small mb-1">{title}</p>
            <h3 className={`text-${color} mb-0`}>{displayValue}</h3>
            {subtitle && <small className="text-muted">{subtitle}</small>}
          </div>
          {icon && <span className={`text-${color} fs-3`}>{icon}</span>}
        </div>
      </div>
    </div>
  );
}

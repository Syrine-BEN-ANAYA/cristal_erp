import React from 'react';

export default function KpiCard({ icon, title, value }) {
  return (
    <div className="kpi-card">
      {icon}
      <div>
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
    </div>
  );
}
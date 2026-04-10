// components/KPICard.jsx (amélioré)
import React from 'react';

const KPICard = ({ icon: Icon, title, value, subtitle }) => {
  return (
    <div className="kpi-card">
      <Icon className="kpi-icon" />
      <div>
        <h3>{title}</h3>
        <p>{value}</p>
        {subtitle && <div className="kpi-sub">{subtitle}</div>}
      </div>
    </div>
  );
};

export default KPICard;
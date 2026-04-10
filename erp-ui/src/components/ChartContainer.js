// components/ChartContainer.jsx
import React from 'react';

const ChartContainer = ({ title, icon: Icon, children }) => {
  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3><Icon /> {title}</h3>
      </div>
      {children}
    </div>
  );
};

export default ChartContainer;
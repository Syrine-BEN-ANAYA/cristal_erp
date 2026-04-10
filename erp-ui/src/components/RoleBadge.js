// components/RoleBadge.jsx
import React from 'react';

const RoleBadge = ({ role }) => {
  return (
    <span className={`role-badge role-${role.toLowerCase()}`}>
      {role}
    </span>
  );
};

export default RoleBadge;
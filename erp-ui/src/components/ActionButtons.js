// components/ActionButtons.jsx
import React from 'react';
import { FiEdit2, FiTrash2, FiLock } from 'react-icons/fi';

const ActionButtons = ({ onEdit, onDelete, onPassword, showPassword = true }) => {
  return (
    <td className="actions-cell">
      <button className="icon-btn edit-btn" onClick={onEdit} title="Edit">
        <FiEdit2 />
      </button>
      <button className="icon-btn delete-btn" onClick={onDelete} title="Delete">
        <FiTrash2 />
      </button>
      {showPassword && (
        <button className="icon-btn password-btn" onClick={onPassword} title="Change password">
          <FiLock />
        </button>
      )}
    </td>
  );
};

export default ActionButtons;
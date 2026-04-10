// components/SuppliersTable.jsx
import React from 'react';
import ActionButtons from './ActionButtons';

const SuppliersTable = ({ suppliers, onEdit, onDelete }) => {
  return (
    <div className="table-container">
      <h3 className="table-title">Suppliers List</h3>
      <table className="suppliers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((s) => (
            <tr key={s._id}>
              <td>{s.name}</td>
              <td>{s.email || '—'}</td>
              <td>{s.phone || '—'}</td>
              <td>{s.address || '—'}</td>
              <td className="actions-cell">
                <ActionButtons
                  onEdit={() => onEdit(s)}
                  onDelete={() => onDelete(s._id)}
                  showPassword={false}
                />
              </td>
            </tr>
          ))}
          {suppliers.length === 0 && (
            <tr>
              <td colSpan="5" className="empty-message">
                No suppliers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SuppliersTable;
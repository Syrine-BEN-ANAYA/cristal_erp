// components/UserTable.jsx
import React from 'react';
import RoleBadge from './RoleBadge';
import ActionButtons from './ActionButtons';

const UserTable = ({ users, onEdit, onDelete, onPassword }) => {
  return (
    <div className="table-container">
      <h3 className="table-title">User List</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="4" className="empty-message">No users found.</td>
            </tr>
          ) : (
            users.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td><RoleBadge role={user.role} /></td>
                <ActionButtons
                  onEdit={() => onEdit(user)}
                  onDelete={() => onDelete(user.id)}
                  onPassword={() => onPassword(user)}
                />
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
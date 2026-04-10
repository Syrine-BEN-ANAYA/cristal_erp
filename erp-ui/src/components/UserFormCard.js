// components/UserFormCard.jsx
import React from 'react';
import { FiPlus, FiUser, FiMail, FiLock, FiShield } from 'react-icons/fi';
import FormInput from './FormInput';
import SelectInput from './SelectInput';

const UserFormCard = ({ 
  onSubmit, 
  username, setUsername,
  email, setEmail,
  password, setPassword,
  role, setRole,
  roleOptions,
  currentUserRole
}) => {
  return (
    <div className="form-card">
      <h3 className="form-title"><FiPlus /> Create New User</h3>
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <FormInput
            label="Username"
            icon={FiUser}
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <FormInput
            label="Email"
            icon={FiMail}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <FormInput
            label="Password"
            icon={FiLock}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <SelectInput
            label="Role"
            icon={FiShield}
            value={role}
            onChange={e => setRole(e.target.value)}
            options={roleOptions}
            disabledOptions={currentUserRole === 'ADMIN' ? ['ADMIN'] : []}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            <FiPlus /> Create User
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserFormCard;
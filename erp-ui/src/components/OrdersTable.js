// components/OrdersTable.jsx
import React from 'react';
import { FiShoppingCart, FiDownload } from 'react-icons/fi';
import ActionButtons from './ActionButtons';

const OrdersTable = ({ orders, customers, products, onEdit, onDelete, onDownload, formatMoney, calculateOrderTotal }) => {
  return (
    <div className="table-container">
      <h3><FiShoppingCart /> Order List</h3>
      <table className="orders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Date</th>
            <th>Actions</th>
           </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr><td colSpan="6" className="empty-message">No orders found.</td></tr>
          ) : (
            orders.map(order => {
              const customer = customers.find(c => c._id === (order.customerId?._id || order.customerId));
              const total = order.totalAmount || calculateOrderTotal(order.items, products);
              return (
                <tr key={order._id}>
                  <td>{order._id.slice(-6)}</td>
                  <td>{customer?.name || '—'}</td>
                  <td>{order.items?.length || 0}</td>
                  <td>{formatMoney(total)}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="actions">
                    <ActionButtons
                      onEdit={() => onEdit(order)}
                      onDelete={() => onDelete(order._id)}
                      showPassword={false}
                    />
                    <button className="icon-btn" onClick={() => onDownload(order)} title="Download PDF">
                      <FiDownload />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
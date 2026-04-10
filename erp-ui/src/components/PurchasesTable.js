// components/PurchasesTable.jsx
import React from 'react';
import { FiDownload } from 'react-icons/fi';
import ActionButtons from './ActionButtons';

const PurchasesTable = ({ 
  purchases, 
  suppliers, 
  products, 
  onEdit, 
  onDelete, 
  onDownload 
}) => {
  return (
    <div className="table-container">
      <h3>Purchase List</h3>
      <table>
        <thead>
          <tr>
            <th>Supplier</th>
            <th>Products</th>
            <th>Total Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map(p => {
            const supplier = suppliers.find(s => s._id === (p.supplierId?._id || p.supplierId));
            return (
              <tr key={p._id}>
                <td>{supplier?.name || 'Unknown'}</td>
                <td className="products-cell">
                  {p.items.map(item => {
                    const product = products.find(pr => pr._id === (item.productId?._id || item.productId));
                    return (
                      <div key={item.productId?._id || item.productId} className="product-line">
                        • {product?.name}
                      </div>
                    );
                  })}
                  {p.items.length === 0 && '—'}
                </td>
                <td>${p.totalAmount?.toFixed(2) ?? '0.00'}</td>
                <td className="actions">
                  <ActionButtons
                    onEdit={() => onEdit(p)}
                    onDelete={() => onDelete(p._id)}
                    showPassword={false}
                  />
                  <button className="icon-btn" onClick={() => onDownload(p)} aria-label="Download PDF">
                    <FiDownload />
                  </button>
                 </td>
               </tr>
            );
          })}
          {purchases.length === 0 && <tr><td colSpan="4" className="empty-message">No purchases found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default PurchasesTable;
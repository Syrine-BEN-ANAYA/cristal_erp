// components/ProductsTable.jsx
import React from 'react';
import { FiPackage } from 'react-icons/fi';
import StockControl from './StockControl';
import ActionButtons from './ActionButtons';

const ProductsTable = ({ 
  products, 
  suppliers, 
  onEdit, 
  onDelete, 
  onAddStock, 
  onRemoveStock 
}) => {
  return (
    <div className="table-container">
      <h3><FiPackage /> Product List</h3>
      <table className="products-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Threshold</th>
            <th>Supplier</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="6" className="empty-message">No products found.</td>
            </tr>
          ) : (
            products.map(p => {
              const supplier = suppliers.find(s => s._id === p.supplierId);
              return (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>${p.price?.toFixed(2) ?? '0.00'}</td>
                  <td>
                    <StockControl
                      stock={p.stock ?? 0}
                      threshold={p.threshold ?? 0}
                      productId={p._id}
                      onAddStock={onAddStock}
                      onRemoveStock={onRemoveStock}
                    />
                  </td>
                  <td>{p.threshold ?? 0}</td>
                  <td>{supplier?.name || '—'}</td>
                  <td className="actions">
                    <ActionButtons
                      onEdit={() => onEdit(p)}
                      onDelete={() => onDelete(p._id)}
                      showPassword={false}
                    />
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

export default ProductsTable;
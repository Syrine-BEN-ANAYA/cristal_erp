// src/pages/PurchasesPage.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  getPurchases,
  createPurchase,
  updatePurchase, // 👈 NOUVEL IMPORT
  deletePurchase,
  getTotalPurchaseAmount
} from '../api/purchasesService';
import { getProducts } from '../api/productsService';
import { getSuppliers } from '../api/suppliersService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/logo.png';
import { FiTrash2, FiDownload, FiPlus, FiX, FiDollarSign, FiShoppingBag, FiEdit } from 'react-icons/fi'; // 👈 AJOUT FiEdit
import '../styles/PurchasesPage.css';

export default function PurchasesPage({ token }) {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [totalPurchaseAmount, setTotalPurchaseAmount] = useState(0);

  // États pour le formulaire d'ajout
  const [form, setForm] = useState({
    supplierId: '',
    items: [{ productId: '', quantity: 1, price: 0 }]
  });

  // États pour le modal d'édition
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPurchaseId, setEditingPurchaseId] = useState(null);
  const [editForm, setEditForm] = useState({
    supplierId: '',
    items: [{ productId: '', quantity: 1, price: 0 }]
  });

  // ---------------- Load Data ----------------
  const loadPurchases = useCallback(async () => {
    try {
      const data = await getPurchases(token);
      setPurchases(data);
    } catch (err) {
      console.error('Failed to load purchases:', err.message);
    }
  }, [token]);

  const loadProducts = useCallback(async () => {
    try {
      const data = await getProducts(token);
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err.message);
    }
  }, [token]);

  const loadSuppliers = useCallback(async () => {
    try {
      const data = await getSuppliers(token);
      setSuppliers(data);
    } catch (err) {
      console.error('Failed to load suppliers:', err.message);
    }
  }, [token]);

  const loadTotalAmount = useCallback(async () => {
    try {
      const data = await getTotalPurchaseAmount(token);
      setTotalPurchaseAmount(data.totalPurchaseAmount || 0);
    } catch (err) {
      console.error('Failed to load total purchase amount:', err.message);
    }
  }, [token]);

  useEffect(() => {
    loadPurchases();
    loadProducts();
    loadSuppliers();
    loadTotalAmount();
  }, [loadPurchases, loadProducts, loadSuppliers, loadTotalAmount]);

  // ---------------- Form Handlers (Add) ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    if (field === 'quantity' || field === 'price') {
      newItems[index][field] = parseFloat(value) || 0;
    } else {
      newItems[index][field] = value;
    }
    setForm(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, price: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (form.items.length <= 1) return;
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setForm({
      supplierId: '',
      items: [{ productId: '', quantity: 1, price: 0 }]
    });
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleSubmit = async () => {
    if (!form.supplierId) {
      alert('Supplier is required');
      return;
    }
    if (form.items.some(item => !item.productId || item.quantity < 1 || item.price < 0)) {
      alert('All items must have a product, positive quantity, and non-negative price');
      return;
    }

    const payload = {
      supplierId: form.supplierId,
      items: form.items.map(item => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        price: Number(item.price)
      })),
    };

    try {
      await createPurchase(payload, token);
      resetForm();
      loadPurchases();
      loadTotalAmount();
    } catch (err) {
      console.error('Failed to save purchase:', err.message);
      alert(err.response?.data?.message || err.message || 'Error saving purchase');
    }
  };

  // ---------------- Update Handlers ----------------
  const openEditModal = (purchase) => {
    // Extraire les IDs des objets imbriqués
    const supplierId = purchase.supplierId?._id || purchase.supplierId;
    const items = purchase.items.map(item => ({
      productId: item.productId?._id || item.productId,
      quantity: item.quantity,
      price: item.price
    }));
    setEditForm({
      supplierId,
      items
    });
    setEditingPurchaseId(purchase._id);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingPurchaseId(null);
    setEditForm({ supplierId: '', items: [{ productId: '', quantity: 1, price: 0 }] });
  };

  const handleEditItemChange = (index, field, value) => {
    const newItems = [...editForm.items];
    if (field === 'quantity' || field === 'price') {
      newItems[index][field] = parseFloat(value) || 0;
    } else {
      newItems[index][field] = value;
    }
    setEditForm(prev => ({ ...prev, items: newItems }));
  };

  const addEditItem = () => {
    setEditForm(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, price: 0 }]
    }));
  };

  const removeEditItem = (index) => {
    if (editForm.items.length <= 1) return;
    setEditForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateSubmit = async () => {
    if (!editForm.supplierId) {
      alert('Supplier is required');
      return;
    }
    if (editForm.items.some(item => !item.productId || item.quantity < 1 || item.price < 0)) {
      alert('All items must have a product, positive quantity, and non-negative price');
      return;
    }

    const payload = {
      supplierId: editForm.supplierId,
      items: editForm.items.map(item => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        price: Number(item.price)
      })),
    };

    try {
      await updatePurchase(editingPurchaseId, payload, token);
      closeEditModal();
      loadPurchases();
      loadTotalAmount();
    } catch (err) {
      console.error('Failed to update purchase:', err.message);
      alert(err.response?.data?.message || err.message || 'Error updating purchase');
    }
  };

  // ---------------- Delete ----------------
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this purchase?')) return;
    try {
      await deletePurchase(id, token);
      loadPurchases();
      loadTotalAmount();
    } catch (err) {
      console.error('Failed to delete purchase:', err.message);
      alert(err.response?.data?.message || err.message || 'Error deleting purchase');
    }
  };

  // ---------------- Generate Invoice PDF ----------------
  const generateInvoicePDF = (purchase) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    try {
      doc.addImage(logo, 'PNG', margin, y, 40, 20);
    } catch (e) {
      console.warn('Logo could not be loaded', e);
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 43, 78);
    doc.text('UNITED AL RUBAI AL CRISTAL', pageWidth / 2, y + 10, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text('Muscat, Oman', pageWidth - margin, y + 18, { align: 'right' });
    doc.text('Email: info@cristal.om', pageWidth - margin, y + 23, { align: 'right' });

    y += 30;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PURCHASE INVOICE', margin, y);

    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');

    const invoiceNumber = `PUR-${purchase._id.slice(-8)}`;
    doc.text(`Invoice #: ${invoiceNumber}`, margin, y);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString('en-GB')}`, margin, y + 5);

    // Supplier Info
    const supplier = suppliers.find(s => s._id === (purchase.supplierId?._id || purchase.supplierId));
    if (supplier) {
      doc.text('Supplier:', pageWidth - margin - 60, y);
      doc.setFont('helvetica', 'bold');
      doc.text(supplier.name || 'N/A', pageWidth - margin - 60, y + 5);
      doc.setFont('helvetica', 'normal');
      if (supplier.address) doc.text(supplier.address, pageWidth - margin - 60, y + 10);
      if (supplier.phone) doc.text(`Phone: ${supplier.phone}`, pageWidth - margin - 60, y + 15);
    }

    y += 25;

    const tableColumn = ['Product', 'Quantity', 'Unit Price (USD)', 'Total (USD)'];
    const tableRows = purchase.items.map(item => {
      const product = products.find(p => p._id === (item.productId?._id || item.productId));
      const productName = product?.name || 'Unknown';
      const quantity = item.quantity;
      const price = item.price;
      const total = price * quantity;
      return [productName, quantity, price.toFixed(2), total.toFixed(2)];
    });

    autoTable(doc, {
      startY: y,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [10, 43, 78], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: margin, right: margin },
      columnStyles: { 0: { cellWidth: 'auto' }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    const total = purchase.totalAmount || tableRows.reduce((sum, row) => sum + parseFloat(row[3]), 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Amount: $${total.toFixed(2)}`, pageWidth - margin - 50, finalY);

    const bankY = finalY + 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('Bank Muscat', margin, bankY + 5);
    doc.text('Account Number: 0123 4567 8901 2345', margin, bankY + 10);
    doc.text('IBAN: OM12 3456 7890 1234 5678 9012', margin, bankY + 15);

    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });

    doc.save(`purchase_invoice_${purchase._id}.pdf`);
  };

  return (
    <div className="purchases-page">
      <div className="page-header">
        <h1>Purchases</h1>
        <p>Manage all purchases</p>
      </div>

      {/* KPI */}
      <div className="kpi-grid" style={{ marginBottom: '2rem' }}>
        <div className="kpi-card">
          <FiShoppingBag className="kpi-icon" />
          <div>
            <h3>Total Purchases</h3>
            <p>{purchases.length}</p>
          </div>
        </div>
        <div className="kpi-card">
          <FiDollarSign className="kpi-icon" />
          <div>
            <h3>Total Amount</h3>
            <p>${totalPurchaseAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      <div className="form-card">
        <h3>Add New Purchase</h3>
        <div className="form-grid">
          <div className="input-group">
            <label>Supplier</label>
            <select name="supplierId" value={form.supplierId} onChange={handleChange}>
              <option value="">Select supplier</option>
              {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="items-section">
          <label>Products</label>
          <div className="item-row-header">
            <span>Product</span>
            <span>Quantity</span>
            <span>Unit Price</span>
            <span></span>
          </div>
          {form.items.map((item, index) => (
            <div key={index} className="item-row">
              <select
                value={item.productId}
                onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
              >
                <option value="">Select product</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} (Stock: {p.stock ?? 0})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Price"
                value={item.price}
                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
              />
              {form.items.length > 1 && (
                <button className="icon-btn remove-btn" onClick={() => removeItem(index)}>
                  <FiX />
                </button>
              )}
            </div>
          ))}
          <button type="button" className="add-item-btn" onClick={addItem}>
            <FiPlus /> Add Product
          </button>
          <div className="total-preview">
            Total: ${calculateTotal(form.items).toFixed(2)}
          </div>
        </div>

        <div className="form-actions">
          <button onClick={handleSubmit}>
            <FiPlus /> Add Purchase
          </button>
        </div>
      </div>

      {/* Tableau des achats */}
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
                    <button className="icon-btn" onClick={() => openEditModal(p)} aria-label="Edit">
                      <FiEdit />
                    </button>
                    <button className="icon-btn delete-btn" onClick={() => handleDelete(p._id)} aria-label="Delete">
                      <FiTrash2 />
                    </button>
                    <button className="icon-btn" onClick={() => generateInvoicePDF(p)} aria-label="Download PDF">
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

      {/* Modal d'édition */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Purchase</h2>
              <button className="close-btn" onClick={closeEditModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="input-group">
                  <label>Supplier</label>
                  <select
                    value={editForm.supplierId}
                    onChange={(e) => setEditForm(prev => ({ ...prev, supplierId: e.target.value }))}
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="items-section">
                <label>Products</label>
                <div className="item-row-header">
                  <span>Product</span>
                  <span>Quantity</span>
                  <span>Unit Price</span>
                  <span></span>
                </div>
                {editForm.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <select
                      value={item.productId}
                      onChange={(e) => handleEditItemChange(index, 'productId', e.target.value)}
                    >
                      <option value="">Select product</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.name} (Stock: {p.stock ?? 0})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleEditItemChange(index, 'quantity', e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => handleEditItemChange(index, 'price', e.target.value)}
                    />
                    {editForm.items.length > 1 && (
                      <button className="icon-btn remove-btn" onClick={() => removeEditItem(index)}>
                        <FiX />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="add-item-btn" onClick={addEditItem}>
                  <FiPlus /> Add Product
                </button>
                <div className="total-preview">
                  Total: ${calculateTotal(editForm.items).toFixed(2)}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeEditModal}>Cancel</button>
              <button className="save-btn" onClick={handleUpdateSubmit}>Update Purchase</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
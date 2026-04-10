// src/pages/PurchasesPage.js (version finale)
import React, { useState, useEffect, useCallback } from 'react';
import {
  getPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase,
  getTotalPurchaseAmount
} from '../api/purchasesService';
import { getProducts } from '../api/productsService';
import { getSuppliers } from '../api/suppliersService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FiDollarSign, FiShoppingBag } from 'react-icons/fi';
import KPICard from '../components/KPICard';
import SuccessPopup from '../components/SuccessPopup';
import EditPurchaseModal from '../components/EditPurchaseModal';
import PurchaseForm from '../components/PurchaseForm';
import PurchasesTable from '../components/PurchasesTable';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/PurchasesPage.css';

export default function PurchasesPage({ token }) {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [totalPurchaseAmount, setTotalPurchaseAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    supplierId: '',
    items: [{ productId: '', quantity: 1, price: 0 }]
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPurchaseId, setEditingPurchaseId] = useState(null);
  const [editForm, setEditForm] = useState({
    supplierId: '',
    items: [{ productId: '', quantity: 1, price: 0 }]
  });

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => setShowSuccessPopup(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

  // Load Data
  const loadPurchases = useCallback(async () => {
    try {
      const data = await getPurchases(token);
      setPurchases(data);
    } catch (err) {
      setError(err.message || 'Failed to load purchases');
    }
  }, [token]);

  const loadProducts = useCallback(async () => {
    try {
      const data = await getProducts(token);
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    }
  }, [token]);

  const loadSuppliers = useCallback(async () => {
    try {
      const data = await getSuppliers(token);
      setSuppliers(data);
    } catch (err) {
      setError(err.message || 'Failed to load suppliers');
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

  const loadAllData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    await Promise.all([
      loadPurchases(),
      loadProducts(),
      loadSuppliers(),
      loadTotalAmount()
    ]);
    setLoading(false);
  }, [token, loadPurchases, loadProducts, loadSuppliers, loadTotalAmount]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Form Handlers (Add)
  const handleSupplierChange = (e) => {
    setForm(prev => ({ ...prev, supplierId: e.target.value }));
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
      setError('Supplier is required');
      return;
    }
    if (form.items.some(item => !item.productId || item.quantity < 1 || item.price < 0)) {
      setError('All items must have a product, positive quantity, and non-negative price');
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
      setShowSuccessPopup(true);
      resetForm();
      loadAllData();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error saving purchase');
    }
  };

  // Edit Handlers
  const openEditModal = (purchase) => {
    const supplierId = purchase.supplierId?._id || purchase.supplierId;
    const items = purchase.items.map(item => ({
      productId: item.productId?._id || item.productId,
      quantity: item.quantity,
      price: item.price
    }));
    setEditForm({ supplierId, items });
    setEditingPurchaseId(purchase._id);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingPurchaseId(null);
    setEditForm({ supplierId: '', items: [{ productId: '', quantity: 1, price: 0 }] });
  };

  const handleEditSupplierChange = (e) => {
    setEditForm(prev => ({ ...prev, supplierId: e.target.value }));
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
      setError('Supplier is required');
      return;
    }
    if (editForm.items.some(item => !item.productId || item.quantity < 1 || item.price < 0)) {
      setError('All items must have a product, positive quantity, and non-negative price');
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
      loadAllData();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error updating purchase');
    }
  };

  // Delete Handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this purchase?')) return;
    try {
      await deletePurchase(id, token);
      loadAllData();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error deleting purchase');
    }
  };

  // PDF Generation
  const generateInvoicePDF = (purchase) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

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

  if (loading) return <LoadingSpinner message="Loading purchases..." />;

  return (
    <div className="purchases-page">
      <SuccessPopup 
        show={showSuccessPopup} 
        message="Invoice sent by email to the supplier." 
        onClose={() => setShowSuccessPopup(false)} 
      />

      <div className="page-header">
        <h1>Purchases</h1>
        <p>Manage all purchases</p>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      <div className="kpi-grid">
        <KPICard icon={FiShoppingBag} title="Total Purchases" value={purchases.length} />
        <KPICard icon={FiDollarSign} title="Total Amount" value={`$${totalPurchaseAmount.toFixed(2)}`} />
      </div>

      <PurchaseForm
        form={form}
        suppliers={suppliers}
        products={products}
        onSupplierChange={handleSupplierChange}
        onItemChange={handleItemChange}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onSubmit={handleSubmit}
        calculateTotal={calculateTotal}
      />

      <PurchasesTable
        purchases={purchases}
        suppliers={suppliers}
        products={products}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onDownload={generateInvoicePDF}
      />

      <EditPurchaseModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        editForm={editForm}
        suppliers={suppliers}
        products={products}
        onSupplierChange={handleEditSupplierChange}
        onItemChange={handleEditItemChange}
        onAddItem={addEditItem}
        onRemoveItem={removeEditItem}
        onSubmit={handleUpdateSubmit}
        calculateTotal={calculateTotal}
      />
    </div>
  );
}
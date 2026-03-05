// src/utils/invoiceService.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Génère un PDF de facture pour une commande
 * @param {Object} order - La commande (doit contenir _id, customer, items, total, createdAt...)
 * @param {Array} products - Liste des produits (pour avoir les noms)
 * @param {Object} customer - Le client (pour nom, email, adresse)
 */
export const generateInvoice = (order, products, customer) => {
  const doc = new jsPDF();

  // Titre
  doc.setFontSize(20);
  doc.text('INVOICE', 14, 22);
  doc.setFontSize(10);
  doc.text(`Order #: ${order._id.slice(-8).toUpperCase()}`, 14, 32);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 38);

  // Informations client
  doc.setFontSize(12);
  doc.text('Bill To:', 14, 50);
  doc.setFontSize(10);
  doc.text(customer?.name || 'N/A', 14, 58);
  doc.text(customer?.email || '', 14, 64);
  doc.text(customer?.address || '', 14, 70);

  // Tableau des articles
  const tableColumn = ['Product', 'Quantity', 'Unit Price', 'Total'];
  const tableRows = [];

  // On suppose que order.items est un tableau d'objets { productId, quantity, price }
  // Si l'API renvoie directement les noms, tant mieux. Sinon on les cherche dans products
  const items = order.items || []; // adapter selon la structure réelle

  items.forEach(item => {
    const product = products.find(p => p._id === item.productId);
    const productName = product?.name || item.productId;
    const unitPrice = item.price || 0;
    const total = item.quantity * unitPrice;
    tableRows.push([
      productName,
      item.quantity,
      `$${unitPrice.toFixed(2)}`,
      `$${total.toFixed(2)}`
    ]);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 80,
    theme: 'striped',
    headStyles: { fillColor: [26, 75, 122] } // bleu principal
  });

  // Total général
  const finalY = doc.lastAutoTable.finalY || 150;
  doc.setFontSize(12);
  doc.text(`Total: $${order.total?.toFixed(2) || '0.00'}`, 14, finalY + 10);

  // Sauvegarde
  doc.save(`invoice_${order._id.slice(-8)}.pdf`);
};
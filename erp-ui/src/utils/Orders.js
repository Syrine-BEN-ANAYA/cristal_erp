export const normalizeId = (objOrId) => (typeof objOrId === 'string' ? objOrId : objOrId?._id);

export const calculateTotal = (items, products) =>
  items.reduce((acc, item) => {
    const product = products.find(p => p._id === normalizeId(item.productId));
    return acc + (product?.price || 0) * (item.quantity || 0);
  }, 0);

export const formatMoney = (value) => `$${(Number(value) || 0).toFixed(2)}`;
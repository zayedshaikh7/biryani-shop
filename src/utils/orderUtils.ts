export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
};

export const calculatePrice = (unitPrice: number, quantity: number): number => {
  return Number(unitPrice || 0) * Number(quantity || 0);
};

export const calculatePaymentStatus = (totalPrice: number, advancePayment: number): string => {
  if (advancePayment === 0) return 'Unpaid';
  if (advancePayment >= totalPrice) return 'Paid';
  return 'Partially Paid';
};

export const formatCurrency = (amount: number): string => {
  // Switched to 'en-IN' to properly format Indian Rupees without extra decimals if not needed
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0, // Cleans up .00 from the dashboard and receipt
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const sumItemsTotal = (items: Array<{ quantity: number; unit_price: number }>): number => {
  return items.reduce((sum, item) => sum + calculatePrice(item.unit_price, item.quantity), 0);
};
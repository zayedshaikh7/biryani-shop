export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
};

export const BIRYANI_MENU = [
  { name: 'Chicken Biryani', price: 180 }, // Price per KG
  { name: 'Mutton Biryani', price: 250 },
  { name: 'Veg Biryani', price: 150 },
  { name: 'Egg Biryani', price: 130 },
  { name: 'Prawns Biryani', price: 280 },
  { name: 'Fish Biryani', price: 200 },
];

export const calculatePrice = (biryaniType: string, quantity: number): number => {
  const item = BIRYANI_MENU.find(b => b.name === biryaniType);
  // FEATURE: Handles decimal quantity (e.g., 1.5 * 180 = 270)
  // Math.round ensures we have clean whole numbers for the currency
  return item ? Math.round(item.price * quantity) : 0;
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
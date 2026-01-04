import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { OrderStatus, PaymentMode } from '../types/order';
import { 
  generateOrderNumber, 
  BIRYANI_MENU, 
  calculatePrice, 
  calculatePaymentStatus, 
  formatCurrency 
} from '../utils/orderUtils';
import { Save, ArrowLeft } from 'lucide-react';

interface NewOrderProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function NewOrder({ onBack, onSuccess }: NewOrderProps) {
  const [formData, setFormData] = useState({
    customer_name: '',
    mobile_number: '',
    biryani_type: BIRYANI_MENU[0].name,
    quantity: 1.0, // Initialized as a float
    order_status: 'Pending' as OrderStatus,
    payment_mode: null as PaymentMode | null,
    advance_payment: 0,
  });
  const [loading, setLoading] = useState(false);

  const totalPrice = calculatePrice(formData.biryani_type, formData.quantity);
  const remainingAmount = totalPrice - formData.advance_payment;
  const paymentStatus = calculatePaymentStatus(totalPrice, formData.advance_payment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderNumber = generateOrderNumber();

      const { error } = await supabase.from('orders').insert([
        {
          order_number: orderNumber,
          customer_name: formData.customer_name,
          mobile_number: formData.mobile_number,
          biryani_type: formData.biryani_type,
          quantity: formData.quantity, // Saves decimal value to DB
          price: totalPrice,
          order_status: formData.order_status,
          payment_mode: formData.payment_mode,
          advance_payment: formData.advance_payment,
          remaining_amount: remainingAmount,
          payment_status: paymentStatus,
        },
      ]);

      if (error) throw error;

      alert(`Order created successfully! Order #${orderNumber}`);
      onSuccess();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tight">New Order</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
        {/* Customer Name */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
            Customer Name *
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            placeholder="Enter customer name"
          />
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
            Mobile Number *
          </label>
          <input
            type="tel"
            required
            pattern="[0-9]{10}"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            value={formData.mobile_number}
            onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
            placeholder="10 digit mobile number"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Biryani Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
              Biryani Type *
            </label>
            <select
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg bg-white"
              value={formData.biryani_type}
              onChange={(e) => setFormData({ ...formData, biryani_type: e.target.value })}
            >
              {BIRYANI_MENU.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name} (₹{item.price}/kg)
                </option>
              ))}
            </select>
          </div>

          {/* Quantity - UPDATED FOR FRACTIONS */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
              Quantity (KG) *
            </label>
            <input
              type="number"
              required
              step="0.05" // Allows for very precise weight like 1.25kg
              min="0.1"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-100">
          <div className="text-sm font-bold uppercase opacity-80 mb-1">Estimated Total</div>
          <div className="text-4xl font-black">
            {formatCurrency(totalPrice)}
          </div>
        </div>

        {/* Order Status */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
            Initial Status
          </label>
          <select
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg bg-white"
            value={formData.order_status}
            onChange={(e) => setFormData({ ...formData, order_status: e.target.value as OrderStatus })}
          >
            <option value="Pending">Pending</option>
            <option value="Cooking">Cooking</option>
          </select>
        </div>

        {/* Payment Mode Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
            Payment Mode
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['Cash', 'UPI', 'Card'] as PaymentMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                className={`py-3 px-4 rounded-xl font-bold text-sm uppercase transition ${
                  formData.payment_mode === mode
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setFormData({ ...formData, payment_mode: mode })}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Advance Payment */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
            Advance Amount Received
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
            <input
              type="number"
              min="0"
              max={totalPrice}
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              value={formData.advance_payment || ''}
              onChange={(e) => setFormData({ ...formData, advance_payment: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Summary Box */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3">
          <div className="flex justify-between items-center text-gray-600">
            <span className="font-bold uppercase text-xs">Remaining Balance:</span>
            <span className="font-black text-xl text-red-600">{formatCurrency(remainingAmount)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span className="font-bold uppercase text-xs">Payment Status:</span>
            <span className={`font-black uppercase text-sm ${
              paymentStatus === 'Paid' ? 'text-green-600' :
              paymentStatus === 'Partially Paid' ? 'text-orange-600' :
              'text-red-600'
            }`}>
              {paymentStatus}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-5 px-6 rounded-2xl font-black text-xl hover:bg-black transition disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
        >
          <Save size={24} />
          {loading ? 'PROCESSING...' : 'CREATE ORDER'}
        </button>
      </form>
    </div>
  );
}
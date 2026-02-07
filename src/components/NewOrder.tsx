import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { OrderStatus, PaymentMode } from '../types/order';
import { 
  sumItemsTotal, 
  generateOrderNumber, 
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
  const [items, setItems] = useState<Array<{ product_name: string; quantity: number; unit_price: number }>>([
    { product_name: '', quantity: 1, unit_price: 0 }
  ]);
  const [formData, setFormData] = useState({
    customer_name: '',
    mobile_number: '',
    order_status: 'Pending' as OrderStatus,
    payment_mode: null as PaymentMode | null,
    advance_payment: 0,
  });
  const [loading, setLoading] = useState(false);

  const totalPrice = sumItemsTotal(items);
  const remainingAmount = totalPrice - formData.advance_payment;
  const paymentStatus = calculatePaymentStatus(totalPrice, formData.advance_payment);

  const handleAddItem = () => {
    setItems([...items, { product_name: '', quantity: 1, unit_price: 0 }]);
  };

  const handleItemChange = (index: number, field: 'product_name' | 'quantity' | 'unit_price', value: string | number) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: field === 'product_name' ? String(value) : Number(value)
    };
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated.length ? updated : [{ product_name: '', quantity: 1, unit_price: 0 }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderNumber = generateOrderNumber();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1) Create order
      const { data: insertedOrder, error: orderError } = await supabase.from('orders').insert([
        {
          order_number: orderNumber,
          customer_name: formData.customer_name,
          mobile_number: formData.mobile_number,
          price: totalPrice,
          order_status: formData.order_status,
          payment_mode: formData.payment_mode,
          advance_payment: formData.advance_payment,
          remaining_amount: remainingAmount,
          payment_status: paymentStatus,
          shop_id: user.id,
        },
      ]).select('*').single();

      if (orderError) throw orderError;
      const orderId = insertedOrder.id as string;

      // 2) Insert items
      const itemsPayload = items
        .filter(i => i.product_name.trim() && i.quantity > 0)
        .map(i => ({
          order_id: orderId,
          shop_id: user.id,
          product_name: i.product_name,
          quantity: i.quantity,
          unit_price: i.unit_price,
          line_total: calculatePrice(i.unit_price, i.quantity)
        }));

      if (itemsPayload.length === 0) throw new Error('Please add at least one item');

      const { error: itemsError } = await supabase.from('order_items').insert(itemsPayload);
      if (itemsError) throw itemsError;

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

        {/* Dynamic Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700 uppercase">Items</span>
            <button type="button" onClick={handleAddItem} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-black uppercase">Add Item</button>
          </div>

          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="md:col-span-6">
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Product Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={item.product_name}
                  onChange={(e) => handleItemChange(idx, 'product_name', e.target.value)}
                  placeholder="e.g., Chicken Biryani"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Quantity *</label>
                <input
                  type="number"
                  required
                  step="0.05"
                  min="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={item.quantity === 0 ? '' : item.quantity}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) => {
                    const n = parseFloat(e.target.value);
                    if (!isNaN(n)) {
                      handleItemChange(idx, 'quantity', n);
                    } else {
                      handleItemChange(idx, 'quantity', 0);
                    }
                  }}
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Unit Price *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={item.unit_price === 0 ? '' : item.unit_price}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) => {
                    const n = parseFloat(e.target.value);
                    if (!isNaN(n)) {
                      handleItemChange(idx, 'unit_price', n);
                    } else {
                      handleItemChange(idx, 'unit_price', 0);
                    }
                  }}
                />
              </div>
              <div className="md:col-span-12 flex justify-end">
                <button type="button" onClick={() => handleRemoveItem(idx)} className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* Estimated Total */}
        <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-100">
          <div className="text-sm font-bold uppercase opacity-80 mb-1">Estimated Total</div>
          <div className="text-4xl font-black">{formatCurrency(totalPrice)}</div>
        </div>

        {/* Initial Status removed as per request */}

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Payment Mode</label>
          <div className="grid grid-cols-3 gap-3">
            {(['Cash', 'UPI', 'Card'] as PaymentMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                className={`py-3 px-4 rounded-xl font-bold text-sm uppercase transition ${
                  formData.payment_mode === mode ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setFormData({ ...formData, payment_mode: mode })}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Advance Amount Received</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
            <input
              type="number"
              min="0"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              value={formData.advance_payment || ''}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => setFormData({ ...formData, advance_payment: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700">
          {loading ? 'PROCESSING...' : 'CREATE ORDER'}
        </button>
      </form>
    </div>
  );
}
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Order, OrderItem, OrderStatus, PaymentMode } from '../types/order';
import { formatCurrency, formatDate, calculatePaymentStatus } from '../utils/orderUtils';
import { 
  Phone, 
  Edit, 
  MessageCircle, 
  Trash2, 
  ChevronLeft,
  Calendar,
  User,
  Hash,
  CheckCircle,
  RotateCcw
} from 'lucide-react';

interface OrderDetailsProps {
  order: Order;
  onBack: () => void;
  onUpdate: () => void;
}

export default function OrderDetails({ order, onBack, onUpdate }: OrderDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    order_status: order.order_status,
    payment_mode: order.payment_mode,
    advance_payment: order.advance_payment,
    mobile_number: order.mobile_number,
  });

  const newRemainingAmount = order.price - formData.advance_payment;
  const newPaymentStatus = calculatePaymentStatus(order.price, formData.advance_payment);

  const handleCall = () => {
    window.location.href = `tel:${formData.mobile_number}`;
  };

  const sendWhatsAppSlip = () => {
    const itemsLines = Array.isArray(order.order_items) && order.order_items.length > 0
      ? order.order_items.map(i => `- ${i.product_name} x${i.quantity} @ ${formatCurrency(i.unit_price)} = ${formatCurrency(i.line_total)}`).join('\n')
      : `${order.biryani_type} x${order.quantity} @ ${formatCurrency(order.unit_price)} = ${formatCurrency(order.price)}`;
    const message = `*--- ORDERTRACK RECEIPT ---*\n*Order #:* ${order.order_number}\n--------------------------------\n*Customer:* ${order.customer_name}\n${itemsLines}\n--------------------------------\n*Total Bill:* ${formatCurrency(order.price)}\n*Status:* ${formData.order_status}\n*Paid:* ${formatCurrency(formData.advance_payment)}\n*BALANCE DUE:* ${formatCurrency(newRemainingAmount)}\n--------------------------------\n_Thank you!_`;
    window.open(`https://wa.me/91${formData.mobile_number}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleStatusQuickUpdate = async (nextStatus: OrderStatus) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('orders')
        .update({
          order_status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
        .eq('shop_id', user.id);

      if (error) throw error;
      setFormData(prev => ({ ...prev, order_status: nextStatus }));
      onUpdate();
    } catch (error) {
      console.error(error);
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('orders')
        .update({
          order_status: formData.order_status,
          payment_mode: formData.payment_mode,
          advance_payment: formData.advance_payment,
          mobile_number: formData.mobile_number,
          remaining_amount: newRemainingAmount,
          payment_status: newPaymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
        .eq('shop_id', user.id);

      if (error) throw error;
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error(error);
      alert('Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("ARE YOU SURE? This will permanently delete this record from the vault.")) {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', order.id)
          .eq('shop_id', user.id);
        if (error) throw error;
        onUpdate();
        onBack();
      } catch (error) {
        console.error(error);
        alert("Deletion failed");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        
        {/* TOP NAVIGATION */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-slate-500 font-black text-xs uppercase tracking-widest hover:text-blue-600 transition-colors"
          >
            <ChevronLeft size={18} /> Back to Records
          </button>
          
          {!isEditing && (
            <button 
              onClick={handleDelete}
              className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
          {/* DIGITAL HEADER */}
          <div className="bg-slate-900 p-8 md:p-10 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Hash size={16} className="text-blue-500" />
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Order Reference</span>
                </div>
                <h2 className="text-4xl font-black tracking-tighter">{order.order_number}</h2>
              </div>
              <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 bg-white/5 backdrop-blur-md">
                {formData.order_status}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/5 rounded-xl text-blue-400"><User size={18} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Customer</p>
                  <p className="font-bold text-slate-200">{order.customer_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/5 rounded-xl text-blue-400"><Calendar size={18} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Placed On</p>
                  <p className="font-bold text-slate-200">{formatDate(order.created_at).split(',')[0]}</p>
                </div>
              </div>
            </div>
          </div>

          {/* CONTENT SECTION */}
          <div className="p-8 md:p-10">
            {isEditing ? (
              <div className="space-y-6">
                <EditInput label="Customer Mobile" value={formData.mobile_number} onChange={(v: string) => setFormData({...formData, mobile_number: v})} />
                <div className="grid grid-cols-2 gap-4">
                   <EditSelect label="Order Status" value={formData.order_status} options={['Pending', 'Cooking', 'Ready', 'Completed']} onChange={(v: string) => setFormData({...formData, order_status: v as OrderStatus})} />
                   <EditSelect label="Payment" value={formData.payment_mode || ''} options={['Cash', 'UPI', 'Card']} onChange={(v: string) => setFormData({...formData, payment_mode: v as PaymentMode})} />
                </div>
                <EditInput label="Advance Payment (₹)" type="number" value={formData.advance_payment} onChange={(v: string) => setFormData({...formData, advance_payment: Number(v)})} />

                <div className="flex gap-4 pt-6">
                  <button onClick={() => setIsEditing(false)} className="flex-1 py-4 font-black text-xs uppercase tracking-widest text-slate-400">Discard</button>
                  <button onClick={handleUpdate} disabled={loading} className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 transition-transform active:scale-95">
                    {loading ? 'Saving...' : 'Update Record'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-slate-50 rounded-3xl p-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Items</p>
                  {Array.isArray(order.order_items) && order.order_items.length > 0 ? (
                    <div className="space-y-2">
                      {order.order_items.map((i, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="font-bold text-slate-800">{i.product_name}</span>
                          <span className="text-slate-600">x{i.quantity} • {formatCurrency(i.unit_price)} <span className="text-slate-400">= {formatCurrency(i.line_total)}</span></span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-500">No items for this order</div>
                  )}
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 font-black text-blue-600">
                  Total Items: {Array.isArray(order.order_items) ? order.order_items.reduce((acc, i) => acc + Number(i.quantity || 0), 0) : order.quantity}
                </div>
                {/* FINANCIAL SUMMARY */}
                <div className="grid grid-cols-2 gap-6 mt-6">
                  <FinancialItem label="Total Bill" value={formatCurrency(order.price)} />
                  <FinancialItem label="Advance Paid" value={formatCurrency(formData.advance_payment)} color="text-emerald-600" />
                  <FinancialItem label="Payment Status" value={newPaymentStatus} />
                  <FinancialItem label="Balance Due" value={formatCurrency(newRemainingAmount)} color="text-rose-600" />
                </div>
              </>
            )}
          </div>
        </div>
        {/* ACTION BAR */}
        {!isEditing && (
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={() => handleStatusQuickUpdate(formData.order_status === 'Completed' ? 'Pending' as OrderStatus : 'Completed' as OrderStatus)}
              disabled={loading}
              className={`flex-[2] py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 ${formData.order_status === 'Completed' ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'}`}
            >
              {formData.order_status === 'Completed' ? (<><RotateCcw size={16} /> Mark Pending</>) : (<><CheckCircle size={16} /> Mark Completed</>)}
            </button>
            <button onClick={() => setIsEditing(true)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
              <Edit size={16} /> Edit
            </button>
            <button onClick={sendWhatsAppSlip} className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 flex items-center justify-center gap-2">
              <MessageCircle size={16} /> Send Digital Receipt
            </button>
            <button onClick={handleCall} className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-200">
              <Phone size={20} />
            </button>
          </div>
        )}
        <p className="text-center text-slate-300 font-black text-[10px] uppercase tracking-[0.3em] mt-8">
          System Sync • {formatDate(order.updated_at)}
        </p>
      </div>
    </div>
  );
}

function FinancialItem({ label, value, color = "text-slate-800" }: any) {
  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function EditInput({ label, value, onChange, type = "text" }: any) {
  return (
    <div>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">{label}</label>
      <input 
        type={type}
        className="w-full p-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 transition-all" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
      />
    </div>
  );
}

function EditSelect({ label, value, options, onChange }: any) {
  return (
    <div className="flex-1">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">{label}</label>
      <select 
        className="w-full p-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 transition-all appearance-none cursor-pointer" 
        value={value} 
        onChange={e => onChange(e.target.value)}
      >
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}
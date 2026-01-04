import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Order, OrderStatus, PaymentMode } from '../types/order';
import { formatCurrency, formatDate, calculatePaymentStatus } from '../utils/orderUtils';
import { 
  Phone, 
  Save, 
  Edit, 
  MessageCircle, 
  Trash2, 
  ChevronLeft,
  Calendar,
  User,
  Hash
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
    const message = `*--- BIRYANI SHOP RECEIPT ---*\n*Order #:* ${order.order_number}\n--------------------------------\n*Customer:* ${order.customer_name}\n*Item:* ${order.biryani_type}\n*Weight:* ${order.quantity} KG\n*Total Bill:* ${formatCurrency(order.price)}\n--------------------------------\n*Status:* ${formData.order_status}\n*Paid:* ${formatCurrency(formData.advance_payment)}\n*BALANCE DUE:* ${formatCurrency(newRemainingAmount)}\n--------------------------------\n_Thank you!_`;
    window.open(`https://wa.me/91${formData.mobile_number}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
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
        .eq('id', order.id);

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
        const { error } = await supabase.from('orders').delete().eq('id', order.id);
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
                {order.order_status}
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
              <div className="space-y-8">
                <div className="bg-slate-50 rounded-3xl p-6 flex items-center justify-between">
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kitchen Preparation</p>
                     <p className="text-xl font-black text-slate-800">{order.biryani_type}</p>
                   </div>
                   <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 font-black text-blue-600">
                     {order.quantity} KG
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                  <FinancialItem label="Total Bill" value={formatCurrency(order.price)} />
                  <FinancialItem label="Advance Paid" value={formatCurrency(order.advance_payment)} color="text-emerald-600" />
                  <FinancialItem label="Payment Status" value={order.payment_status} />
                  <FinancialItem label="Balance Due" value={formatCurrency(order.remaining_amount)} color="text-rose-600" />
                </div>

                <div className="flex flex-wrap gap-4 pt-8">
                  <button onClick={() => setIsEditing(true)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-slate-200 transition-all">
                    <Edit size={16}/> Edit
                  </button>
                  <button onClick={sendWhatsAppSlip} className="flex-[2] bg-green-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex justify-center items-center gap-2 shadow-xl shadow-green-100 hover:scale-[1.02] transition-all active:scale-95">
                    <MessageCircle size={18}/> Send Digital Receipt
                  </button>
                  <button onClick={handleCall} className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-100 hover:rotate-12 transition-transform">
                    <Phone size={22}/>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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
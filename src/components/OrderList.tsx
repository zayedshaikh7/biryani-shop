import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Order, OrderItem } from '../types/order';
import { formatCurrency, formatDate } from '../utils/orderUtils';
import { Search, Filter, Eye, Calendar, User, Phone, Package } from 'lucide-react';

interface OrderListProps {
  onViewOrder: (order: Order) => void;
}

export default function OrderList({ onViewOrder }: OrderListProps) {
  const [orders, setOrders] = useState<(Order & { order_items?: OrderItem[] })[]>([]);
const [filteredOrders, setFilteredOrders] = useState<(Order & { order_items?: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, /* statusFilter, */ dateFilter]);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(product_name, quantity, unit_price, line_total)')
        .eq('shop_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.mobile_number.includes(searchTerm) ||
          order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (dateFilter) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        return orderDate === dateFilter;
      });
    }
    setFilteredOrders(filtered);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      // case 'Cooking': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Ready': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Completed': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-black text-slate-400 uppercase tracking-widest text-xs">Loading Archive</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Order <span className="text-blue-600">Vault</span></h1>
          <p className="text-slate-500 font-medium">Search and manage historical records</p>
        </div>
        <div className="bg-blue-600 text-white px-5 py-2 rounded-2xl font-black text-sm shadow-xl shadow-blue-200">
          {filteredOrders.length} ORDERS FOUND
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Name, Phone or ID..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status filter removed as per request */}

          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="date"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 cursor-pointer"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-20 text-center">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Package size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase">No Matches Found</h3>
            <p className="text-slate-400 font-medium">Try adjusting your filters or search term</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="group bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">#{order.order_number}</span>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(order.order_status)}`}>
                    {order.order_status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><User size={18} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Customer</p>
                      <p className="font-bold text-slate-700">{order.customer_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Phone size={18} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Mobile</p>
                      <p className="font-bold text-slate-700">{order.mobile_number}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Package size={18} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Items</p>
                      <p className="font-bold text-slate-700">
                        {order.order_items && order.order_items.length > 0
                          ? order.order_items.slice(0, 3).map(i => `${i.product_name} (x${i.quantity})`).join(', ') + (order.order_items.length > 3 ? ` +${order.order_items.length - 3} more` : '')
                          : 'No items'}
                        <span className="text-blue-600"> ({order.order_items ? order.order_items.length : 0} items)</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                   {formatDate(order.created_at)}
                </div>
              </div>

              <div className="w-full lg:w-auto flex items-center justify-between lg:justify-end gap-8 pt-6 lg:pt-0 border-t lg:border-0 border-slate-50">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Bill</p>
                  <p className="text-2xl font-black text-slate-900 leading-none">{formatCurrency(order.price)}</p>
                </div>
                
                <button
                  onClick={() => onViewOrder(order)}
                  className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 transition-all flex items-center gap-3 group-hover:scale-105"
                >
                  <Eye size={18} />
                  View Record
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
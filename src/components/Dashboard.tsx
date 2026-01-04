import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../utils/orderUtils';
import { 
  IndianRupee, 
  ShoppingBag, 
  CreditCard, 
  TrendingUp, 
  ClipboardList,
  Calendar,
  ChevronRight
} from 'lucide-react';

type TimeRange = 'today' | 'monthly' | 'total';

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    balanceOwed: 0,
    mostSoldBiryani: '',
    remainingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, [timeRange]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      let query = supabase.from('orders').select('*');
      const now = new Date();
      if (timeRange === 'today') {
        const today = new Date(now.setHours(0, 0, 0, 0));
        query = query.gte('created_at', today.toISOString());
      } else if (timeRange === 'monthly') {
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        query = query.gte('created_at', firstDayOfMonth.toISOString());
      }

      const { data: orders } = await query;

      if (orders) {
        const totalOrders = orders.length;
        const revenue = orders.reduce((sum, order) => sum + Number(order.price), 0);
        const balanceOwed = orders.reduce((sum, order) => sum + Number(order.remaining_amount), 0);
        const remainingOrders = orders.filter(o => o.order_status !== 'Completed').length;

        const biryaniCount: { [key: string]: number } = {};
        orders.forEach(order => {
          biryaniCount[order.biryani_type] = (biryaniCount[order.biryani_type] || 0) + order.quantity;
        });

        const mostSoldBiryani = Object.entries(biryaniCount).reduce(
          (a, b) => (a[1] > b[1] ? a : b),
          ['None', 0]
        )[0];

        setStats({ totalOrders, revenue, balanceOwed, mostSoldBiryani, remainingOrders });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      <div className="container mx-auto px-4 py-10">
        
        {/* TOP HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold text-sm uppercase tracking-[0.2em]">
              <div className="w-8 h-[2px] bg-blue-600"></div>
              Live Overview
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Shop <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Analytics</span>
            </h1>
          </div>

          {/* ELEGANT TOGGLE */}
          <div className="flex bg-slate-200/50 backdrop-blur-md p-1.5 rounded-2xl w-fit border border-slate-200">
            {(['today', 'monthly', 'total'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  timeRange === range 
                  ? 'bg-white text-blue-600 shadow-xl shadow-blue-500/10 scale-105' 
                  : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 font-bold text-slate-400 uppercase tracking-widest animate-pulse">Fetching Data</p>
          </div>
        ) : (
          <>
            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <StatCard 
                icon={<ShoppingBag size={24} />} 
                label="Orders" 
                value={stats.totalOrders} 
                range={timeRange}
                accent="blue"
              />
              <StatCard 
                icon={<IndianRupee size={24} />} 
                label="Revenue" 
                value={formatCurrency(stats.revenue)} 
                range={timeRange}
                accent="emerald"
              />
              <StatCard 
                icon={<CreditCard size={24} />} 
                label="Balance Owed" 
                value={formatCurrency(stats.balanceOwed)} 
                range={timeRange}
                accent="rose"
                isAlert={stats.balanceOwed > 0}
              />
              <StatCard 
                icon={<TrendingUp size={24} />} 
                label="Best Seller" 
                value={stats.mostSoldBiryani} 
                range={timeRange}
                accent="amber"
              />
            </div>

            {/* ACTION CARD: Remaining Orders */}
            <div className="relative group overflow-hidden bg-slate-900 rounded-[2.5rem] p-1 shadow-2xl transition-transform duration-500 hover:scale-[1.01]">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-50"></div>
              <div className="relative bg-slate-900 rounded-[2.3rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-3xl text-white shadow-2xl shadow-blue-500/40">
                    <ClipboardList size={40} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Active Queue</h3>
                    <p className="text-slate-400 font-medium text-lg">
                      Kitchen is currently processing <span className="text-blue-400">{stats.remainingOrders} orders</span>.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center md:text-right">
                    <div className="text-7xl font-black text-white leading-none">
                      {stats.remainingOrders.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 mt-2">To Be Finished</div>
                  </div>
                  <div className="hidden md:block h-16 w-[1px] bg-slate-700 mx-4"></div>
                  <button className="bg-white hover:bg-blue-50 text-slate-900 p-4 rounded-full transition-colors group-hover:translate-x-2 duration-300">
                    <ChevronRight size={32} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* HELPER COMPONENT FOR CARDS */
function StatCard({ icon, label, value, range, accent, isAlert }: any) {
  const themes: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100"
  };

  return (
    <div className="group bg-white border border-slate-200 rounded-[2rem] p-7 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-6">
        <div className={`p-3 rounded-2xl border ${themes[accent]}`}>
          {icon}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{range}</span>
          {isAlert && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping mt-1"></div>}
        </div>
      </div>
      <div className={`text-3xl font-black text-slate-800 tracking-tight group-hover:scale-105 transition-transform origin-left duration-300 ${accent === 'rose' && isAlert ? 'text-rose-600' : ''}`}>
        {value}
      </div>
      <div className="text-xs font-black text-slate-400 uppercase mt-2 tracking-wider">{label}</div>
    </div>
  );
}
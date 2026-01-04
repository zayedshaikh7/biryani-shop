import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Dashboard from './components/Dashboard';
import NewOrder from './components/NewOrder';
import OrderList from './components/OrderList';
import OrderDetails from './components/OrderDetails';
import Login from './components/Login';
import { Order } from './types/order';
import { Home, Plus, List, LogOut } from 'lucide-react';

type Page = 'dashboard' | 'new-order' | 'order-list' | 'order-details';

function App() {
  const [session, setSession] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Auth Listener to check login status
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setCurrentPage('order-details');
  };

  const handleOrderUpdate = () => {
    setCurrentPage('order-list');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // If user is not logged in, show ONLY the login page
  if (!session) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'new-order':
        return (
          <NewOrder
            onBack={() => setCurrentPage('dashboard')}
            onSuccess={() => setCurrentPage('order-list')}
          />
        );
      case 'order-list':
        return <OrderList onViewOrder={handleViewOrder} />;
      case 'order-details':
        return selectedOrder ? (
          <OrderDetails
            order={selectedOrder}
            onBack={() => setCurrentPage('order-list')}
            onUpdate={handleOrderUpdate}
          />
        ) : null;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-blue-600">Biryani Shop</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                  currentPage === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Home size={20} />
                <span className="hidden sm:inline">Dashboard</span>
              </button>

              <button
                onClick={() => setCurrentPage('new-order')}
                className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                  currentPage === 'new-order'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Plus size={20} />
                <span className="hidden sm:inline">New Order</span>
              </button>

              <button
                onClick={() => setCurrentPage('order-list')}
                className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                  currentPage === 'order-list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List size={20} />
                <span className="hidden sm:inline">Orders</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center gap-2"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>{renderPage()}</main>
    </div>
  );
}

export default App;
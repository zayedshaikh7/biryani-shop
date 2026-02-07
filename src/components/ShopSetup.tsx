import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, CheckCircle } from 'lucide-react';

interface ShopSetupProps {
  onComplete: (name: string) => void;
}

export default function ShopSetup({ onComplete }: ShopSetupProps) {
  const [shopName, setShopName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const name = shopName.trim();
    if (!name) {
      setError('Please enter your shop name');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated. Please log in again.');
        return;
      }

      // Save or update shop name in profiles table
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({ user_id: user.id, shop_name: name }, { onConflict: 'user_id' });

      if (upsertError) {
        setError(upsertError.message);
        return;
      }

      setSuccess(true);
      // Notify parent to proceed
      onComplete(name);
    } catch (err: any) {
      setError(err?.message || 'Unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
            <Building2 size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Let's set up your shop</h1>
            <p className="text-slate-500 font-medium">Tell us your shop name to personalize your dashboard</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-600 uppercase tracking-widest mb-2">
              Shop Name
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g., Sunrise Bakery, Elite Electronics"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50"
            />
          </div>

          {error && (
            <div className="text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm font-semibold">
              <CheckCircle size={18} />
              Saved! Redirecting to your dashboard…
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className={`w-full px-6 py-3 rounded-xl font-bold uppercase tracking-widest transition-all ${
              saving ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {saving ? 'Saving…' : 'Save and Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
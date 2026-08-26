import { useState } from 'react';
import api from '../lib/api';
import { X, Plus, Package } from 'lucide-react';

interface NewProductModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

export function NewProductModal({ onClose, onRefresh }: NewProductModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('Packaging & Bottles');
  const [unitWeightKg, setUnitWeightKg] = useState(0.85);
  const [manufacturingLocation, setManufacturingLocation] = useState('Mumbai, Maharashtra');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const vendorUserStr = localStorage.getItem('vendor_user');
      const vendorUser = vendorUserStr ? JSON.parse(vendorUserStr) : null;
      const organizationId = vendorUser?.organizationId || vendorUser?.organization;

      // 1. Create Product
      const prodRes = await api.post('/products', {
        name,
        code: code || name.slice(0, 4).toUpperCase(),
        category,
        unitWeightKg,
        functionalUnit: '1 Unit',
        manufacturingLocation,
        organizationId,
      });

      if (prodRes.data.success) {
        const product = prodRes.data.data;
        // 2. Create Initial LCA Project for Product
        await api.post('/lca', {
          title: `LCA Study — ${product.name}`,
          productId: product._id,
          vendorId: organizationId || product.organizationId,
          functionalUnit: '1 Unit',
          systemBoundary: 'CRADLE_TO_GATE',
        });

        onRefresh();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create product and study');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Add New Product for LCA</h2>
              <p className="text-xs text-slate-400">Register product catalog item</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block text-slate-300 font-semibold">Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Stainless Steel Thermal Bottle 750ml"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-slate-300 font-semibold">Product Code</label>
              <input
                type="text"
                placeholder="PROD-001"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-semibold">Unit Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                value={unitWeightKg}
                onChange={(e) => setUnitWeightKg(parseFloat(e.target.value) || 0)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-slate-300 font-semibold">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-slate-300 font-semibold">Manufacturing Factory Location</label>
            <input
              type="text"
              value={manufacturingLocation}
              onChange={(e) => setManufacturingLocation(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50 mt-2"
          >
            <Plus className="w-4 h-4" />
            {loading ? 'Creating Product...' : 'Create Product & Initialize LCA Study'}
          </button>
        </form>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { productApi } from '../api/services';
import { Product, StockMovement } from '../types';
import { LoadingSpinner, Badge, Modal } from '../components/UIComponents';
import { useAuth } from '../context/AuthContext';
import { ArrowDownLeft, ArrowUpRight, History, AlertCircle } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stock Adjustment Modal
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockForm, setStockForm] = useState({
    quantity: '1',
    movementType: 'IN' as 'IN' | 'OUT',
    reason: '',
  });
  const [stockError, setStockError] = useState('');

  // Audit History Modal
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const canAdjustStock = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const fetchInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await productApi.getProducts({ limit: 100 });
      setProducts(res.products);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load inventory details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenStockModal = (prod: Product, defaultType: 'IN' | 'OUT' = 'IN') => {
    setSelectedProduct(prod);
    setStockForm({
      quantity: '1',
      movementType: defaultType,
      reason: defaultType === 'IN' ? 'Restock / Vendor Receipt' : 'Manual Audit Correction',
    });
    setStockError('');
    setIsStockModalOpen(true);
  };

  const handleOpenHistoryModal = async (prod: Product) => {
    setSelectedProduct(prod);
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const data = await productApi.getStockMovements(prod.id);
      setMovements(data);
    } catch (err) {
      console.error('Failed to load stock movements:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setStockError('');
    try {
      await productApi.adjustStock(selectedProduct.id, {
        quantity: parseInt(stockForm.quantity, 10),
        movementType: stockForm.movementType,
        reason: stockForm.reason,
      });
      setIsStockModalOpen(false);
      fetchInventory();
    } catch (err: any) {
      setStockError(err.response?.data?.message || 'Failed to record stock movement.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white">Stock & Inventory Operations</h2>
        <p className="text-xs text-[#9aa0ac]">Perform Stock IN/OUT adjustments and inspect movement audit logs</p>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching stock levels..." />
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-400">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#e8eaed]">
              <thead className="bg-[#0f1117] text-[#9aa0ac] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Item Name</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 text-center">Current Stock</th>
                  <th className="p-4 text-center">Min Threshold</th>
                  <th className="p-4 text-right">Inventory Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2e3a]">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#22262f]/50 transition">
                    <td className="p-4 font-mono font-bold text-[#6c63ff]">{prod.sku}</td>
                    <td className="p-4">
                      <p className="font-semibold text-white">{prod.name}</p>
                      <p className="text-[11px] text-[#9aa0ac]">{prod.category}</p>
                    </td>
                    <td className="p-4 text-[#9aa0ac]">{prod.warehouseLocation || 'Rack Unassigned'}</td>
                    <td className="p-4 text-center">
                      <span className={`text-sm font-bold ${prod.isLowStock ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {prod.currentStock}
                      </span>
                    </td>
                    <td className="p-4 text-center text-[#9aa0ac]">{prod.minStockQuantity}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenHistoryModal(prod)}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#22262f] px-2.5 py-1.5 text-xs text-[#9aa0ac] hover:text-white transition"
                        title="View audit logs"
                      >
                        <History className="h-3.5 w-3.5" /> Movements
                      </button>

                      {canAdjustStock && (
                        <>
                          <button
                            onClick={() => handleOpenStockModal(prod, 'IN')}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-400 hover:bg-emerald-500/20 transition"
                          >
                            <ArrowDownLeft className="h-3.5 w-3.5" /> Stock IN
                          </button>

                          <button
                            onClick={() => handleOpenStockModal(prod, 'OUT')}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/20 transition"
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" /> Stock OUT
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={`Stock ${stockForm.movementType} — ${selectedProduct?.name}`}
      >
        <form onSubmit={handleStockSubmit} className="space-y-4 text-xs">
          {stockError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-rose-400">
              <AlertCircle className="h-4 w-4" />
              {stockError}
            </div>
          )}

          <div className="rounded-xl bg-[#0f1117] p-3 text-xs flex justify-between">
            <span className="text-[#9aa0ac]">Current Inventory:</span>
            <span className="font-bold text-white">{selectedProduct?.currentStock} units</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#9aa0ac] mb-1 font-semibold">Movement Type *</label>
              <select
                value={stockForm.movementType}
                onChange={(e) => setStockForm({ ...stockForm, movementType: e.target.value as any })}
                className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2.5 text-white focus:border-[#6c63ff]"
              >
                <option value="IN">Stock IN (+)</option>
                <option value="OUT">Stock OUT (-)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#9aa0ac] mb-1 font-semibold">Quantity *</label>
              <input
                type="number"
                min="1"
                required
                value={stockForm.quantity}
                onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2.5 text-white focus:border-[#6c63ff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#9aa0ac] mb-1 font-semibold">Audit Reason / Reference *</label>
            <input
              type="text"
              required
              value={stockForm.reason}
              onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
              placeholder="e.g. Stock IN from Purchase Order #PO-902"
              className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2.5 text-white focus:border-[#6c63ff]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsStockModalOpen(false)}
              className="rounded-xl bg-[#22262f] px-4 py-2 text-white hover:bg-[#2a2e3a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#6c63ff] px-5 py-2 font-semibold text-white hover:bg-[#5a52e0]"
            >
              Confirm Movement
            </button>
          </div>
        </form>
      </Modal>

      {/* Movement Audit History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Stock Movement History — ${selectedProduct?.sku}`}
      >
        {historyLoading ? (
          <LoadingSpinner message="Fetching stock logs..." />
        ) : movements.length === 0 ? (
          <p className="text-center text-xs text-[#9aa0ac] py-6">No stock movements recorded for this product.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {movements.map((m) => (
              <div key={m.id} className="rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <Badge variant={m.movementType === 'IN' ? 'success' : 'danger'}>
                    {m.movementType === 'IN' ? '+' : '-'}{m.quantity} Units ({m.movementType})
                  </Badge>
                  <span className="text-[#9aa0ac]">{new Date(m.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-white font-medium">{m.reason}</p>
                <p className="text-[11px] text-[#9aa0ac]">Logged by: {m.createdBy?.name || 'System'}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { productApi } from '../api/services';
import { Product } from '../types';
import { LoadingSpinner, Badge, Modal } from '../components/UIComponents';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Edit, AlertTriangle } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: '',
    currentStock: '0',
    minStockQuantity: '10',
    warehouseLocation: '',
  });
  const [formError, setFormError] = useState('');

  const canManage = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const [prodRes, catRes] = await Promise.all([
        productApi.getProducts({
          page,
          limit: 8,
          search,
          category: categoryFilter || undefined,
          lowStock: lowStockFilter || undefined,
        }),
        productApi.getCategories(),
      ]);
      setProducts(prodRes.products);
      setTotalPages(prodRes.pagination.totalPages);
      setCategories(catRes);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch catalog items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, categoryFilter, lowStockFilter]);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      category: '',
      unitPrice: '',
      currentStock: '0',
      minStockQuantity: '10',
      warehouseLocation: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      unitPrice: String(prod.unitPrice),
      currentStock: String(prod.currentStock),
      minStockQuantity: String(prod.minStockQuantity),
      warehouseLocation: prod.warehouseLocation || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingProduct) {
        await productApi.updateProduct(editingProduct.id, {
          name: formData.name,
          category: formData.category,
          unitPrice: parseFloat(formData.unitPrice),
          minStockQuantity: parseInt(formData.minStockQuantity, 10),
          warehouseLocation: formData.warehouseLocation,
        });
      } else {
        await productApi.createProduct({
          name: formData.name,
          sku: formData.sku,
          category: formData.category,
          unitPrice: parseFloat(formData.unitPrice),
          currentStock: parseInt(formData.currentStock, 10),
          minStockQuantity: parseInt(formData.minStockQuantity, 10),
          warehouseLocation: formData.warehouseLocation,
        });
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save product record.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Product Catalog Management</h2>
          <p className="text-xs text-[#9aa0ac]">Manage SKU details, pricing, and warehouse locations</p>
        </div>
        {canManage && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6c63ff] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#6c63ff]/20 hover:bg-[#5a52e0] transition"
          >
            <Plus className="h-4 w-4" /> Add Catalog Product
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#9aa0ac]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, SKU, category, or location..."
            className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] py-2 pl-10 pr-4 text-xs text-white placeholder-[#9aa0ac]/50 focus:border-[#6c63ff] focus:outline-none"
          />
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl bg-[#0f1117] border border-[#2a2e3a] px-3 py-2 text-xs text-white focus:border-[#6c63ff] focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 rounded-xl bg-[#0f1117] border border-[#2a2e3a] px-3 py-2 text-xs text-[#9aa0ac] cursor-pointer">
            <input
              type="checkbox"
              checked={lowStockFilter}
              onChange={(e) => setLowStockFilter(e.target.checked)}
              className="accent-[#6c63ff]"
            />
            <span className="text-amber-400 font-semibold">Low Stock Only</span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching catalog items..." />
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-400">{error}</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#9aa0ac]">No product catalog items matching filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#e8eaed]">
              <thead className="bg-[#0f1117] text-[#9aa0ac] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Unit Price</th>
                  <th className="p-4">Current Stock</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2e3a]">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#22262f]/50 transition">
                    <td className="p-4 font-mono font-bold text-[#6c63ff]">{prod.sku}</td>
                    <td className="p-4 font-semibold text-white">{prod.name}</td>
                    <td className="p-4">{prod.category}</td>
                    <td className="p-4 font-semibold text-emerald-400">₹{prod.unitPrice.toFixed(2)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${prod.isLowStock ? 'text-amber-400' : 'text-white'}`}>
                          {prod.currentStock}
                        </span>
                        {prod.isLowStock && (
                          <Badge variant="warning">
                            <AlertTriangle className="h-3 w-3" /> Low
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-[#9aa0ac]">{prod.warehouseLocation || 'Unassigned'}</td>
                    <td className="p-4 text-right">
                      {canManage && (
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#22262f] px-2.5 py-1.5 text-xs text-sky-400 hover:bg-sky-500/20 transition"
                        >
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2e3a] bg-[#14161f]">
            <span className="text-xs text-[#9aa0ac]">
              Page <span className="font-bold text-white">{page}</span> of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg bg-[#22262f] px-3 py-1.5 text-xs text-white disabled:opacity-40 transition"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg bg-[#22262f] px-3 py-1.5 text-xs text-white disabled:opacity-40 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit Product #${editingProduct.sku}` : 'Add Catalog Product'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          {formError && <p className="text-rose-400">{formError}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#9aa0ac] mb-1 font-semibold">SKU / Code *</label>
              <input
                type="text"
                required
                disabled={!!editingProduct}
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="SKU-ITEM-01"
                className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2.5 text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-[#9aa0ac] mb-1 font-semibold">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2.5 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#9aa0ac] mb-1 font-semibold">Category *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Safety Equipment"
                className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-[#9aa0ac] mb-1 font-semibold">Unit Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2.5 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {!editingProduct && (
              <div>
                <label className="block text-[#9aa0ac] mb-1 font-semibold">Initial Stock Qty</label>
                <input
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                  className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2.5 text-white"
                />
              </div>
            )}
            <div>
              <label className="block text-[#9aa0ac] mb-1 font-semibold">Min Stock Alert Qty *</label>
              <input
                type="number"
                required
                value={formData.minStockQuantity}
                onChange={(e) => setFormData({ ...formData, minStockQuantity: e.target.value })}
                className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2.5 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#9aa0ac] mb-1 font-semibold">Warehouse Location</label>
            <input
              type="text"
              value={formData.warehouseLocation}
              onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
              placeholder="Rack A-12"
              className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2.5 text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl bg-[#22262f] px-4 py-2 text-white hover:bg-[#2a2e3a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#6c63ff] px-5 py-2 font-semibold text-white hover:bg-[#5a52e0]"
            >
              {editingProduct ? 'Save Product' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { challanApi, customerApi, productApi } from '../api/services';
import { Challan, Customer, Product } from '../types';
import { LoadingSpinner, Badge, Modal } from '../components/UIComponents';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Trash2, AlertCircle } from 'lucide-react';

export const ChallansPage: React.FC = () => {
  const { user } = useAuth();
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State for New Challan DRAFT
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState<{ productId: number; quantity: number }[]>([
    { productId: 0, quantity: 1 },
  ]);
  const [formError, setFormError] = useState('');

  const canCreate = user?.role === 'ADMIN' || user?.role === 'SALES';

  const fetchChallans = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await challanApi.getChallans({
        page,
        limit: 8,
        search,
        status: statusFilter || undefined,
      });
      setChallans(res.challans);
      setTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch sales delivery challans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [page, search, statusFilter]);

  const handleOpenCreateModal = async () => {
    setFormError('');
    setIsModalOpen(true);
    try {
      const [cRes, pRes] = await Promise.all([
        customerApi.getCustomers({ limit: 100 }),
        productApi.getProducts({ limit: 100 }),
      ]);
      setCustomers(cRes.customers);
      setProducts(pRes.products);
      if (cRes.customers.length > 0) setSelectedCustomer(String(cRes.customers[0].id));
      if (pRes.products.length > 0) {
        setItems([{ productId: pRes.products[0].id, quantity: 1 }]);
      }
    } catch (err) {
      setFormError('Failed to load customers and products list.');
    }
  };

  const handleAddItemRow = () => {
    if (products.length > 0) {
      setItems([...items, { productId: products[0].id, quantity: 1 }]);
    }
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', val: number) => {
    const newItems = [...items];
    newItems[index][field] = val;
    setItems(newItems);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!selectedCustomer) {
      setFormError('Please select a customer.');
      return;
    }

    try {
      await challanApi.createChallan({
        customerId: parseInt(selectedCustomer, 10),
        items,
      });
      setIsModalOpen(false);
      fetchChallans();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create sales delivery challan.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Sales Delivery Challans</h2>
          <p className="text-xs text-[#9aa0ac]">Issue draft sales delivery challans and execute inventory confirmation</p>
        </div>
        {canCreate && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6c63ff] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#6c63ff]/20 hover:bg-[#5a52e0] transition"
          >
            <Plus className="h-4 w-4" /> Create DRAFT Challan
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3 rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#9aa0ac]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by challan number, customer name..."
            className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] py-2 pl-10 pr-4 text-xs text-white placeholder-[#9aa0ac]/50 focus:border-[#6c63ff] focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl bg-[#0f1117] border border-[#2a2e3a] px-3 py-2 text-xs text-white focus:border-[#6c63ff]"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">DRAFT</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching sales delivery challans..." />
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-400">{error}</div>
        ) : challans.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#9aa0ac]">No delivery challans found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#e8eaed]">
              <thead className="bg-[#0f1117] text-[#9aa0ac] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Challan #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4 text-center">Total Quantity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date Issued</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2e3a]">
                {challans.map((ch) => (
                  <tr key={ch.id} className="hover:bg-[#22262f]/50 transition">
                    <td className="p-4 font-mono font-bold text-white">{ch.challanNumber}</td>
                    <td className="p-4">
                      <p className="font-semibold text-white">{ch.customer?.name}</p>
                      <p className="text-[11px] text-[#9aa0ac]">{ch.customer?.businessName || 'Individual'}</p>
                    </td>
                    <td className="p-4 text-center font-bold text-white">{ch.totalQuantity} units</td>
                    <td className="p-4">
                      <Badge
                        variant={
                          ch.status === 'CONFIRMED'
                            ? 'success'
                            : ch.status === 'DRAFT'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {ch.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-[#9aa0ac]">{new Date(ch.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/challans/${ch.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#22262f] px-3 py-1.5 text-xs text-white hover:bg-[#6c63ff] transition"
                      >
                        <Eye className="h-3.5 w-3.5" /> Inspect Workflow
                      </Link>
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create DRAFT Delivery Challan">
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-rose-400">
              <AlertCircle className="h-4 w-4" />
              {formError}
            </div>
          )}

          <div>
            <label className="block text-[#9aa0ac] mb-1 font-semibold">Select Customer *</label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2.5 text-white focus:border-[#6c63ff]"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.businessName ? `(${c.businessName})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-[#9aa0ac] font-semibold">Challan Line Items *</label>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <select
                  value={item.productId}
                  onChange={(e) => handleItemChange(idx, 'productId', parseInt(e.target.value, 10))}
                  className="flex-1 rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2 text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — Avail: {p.currentStock}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value, 10))}
                  className="w-20 rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2 text-white"
                />

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItemRow(idx)}
                    className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddItemRow}
              className="mt-1 text-xs text-[#6c63ff] font-semibold hover:underline"
            >
              + Add Product Line Item
            </button>
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
              Issue DRAFT Challan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

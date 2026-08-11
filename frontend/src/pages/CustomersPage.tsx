import React, { useEffect, useState } from 'react';
import { customerApi } from '../api/services';
import { Customer } from '../types';
import { LoadingSpinner, Badge, Modal } from '../components/UIComponents';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Plus, Eye, Edit, Trash2, AlertCircle } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'RETAIL',
    address: '',
    status: 'LEAD',
    notes: '',
  });
  const [formError, setFormError] = useState('');

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SALES';
  const canDelete = user?.role === 'ADMIN';

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await customerApi.getCustomers({
        page,
        limit: 8,
        search,
        status: statusFilter || undefined,
        customerType: typeFilter || undefined,
      });
      setCustomers(res.customers);
      setTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch customer directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search, statusFilter, typeFilter]);

  const handleOpenCreateModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      mobile: '',
      email: '',
      businessName: '',
      gstNumber: '',
      customerType: 'RETAIL',
      address: '',
      status: 'LEAD',
      notes: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name,
      mobile: cust.mobile,
      email: cust.email || '',
      businessName: cust.businessName || '',
      gstNumber: cust.gstNumber || '',
      customerType: cust.customerType,
      address: cust.address || '',
      status: cust.status,
      notes: cust.notes || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingCustomer) {
        await customerApi.updateCustomer(editingCustomer.id, formData as any);
      } else {
        await customerApi.createCustomer(formData as any);
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Operation failed. Check input data.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this customer record?')) return;
    try {
      await customerApi.deleteCustomer(id);
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Customer CRM Directory</h2>
          <p className="text-xs text-[#9aa0ac]">Manage leads, wholesale partners, and customer contact histories</p>
        </div>
        {canEdit && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6c63ff] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#6c63ff]/20 hover:bg-[#5a52e0] transition"
          >
            <Plus className="h-4 w-4" /> Add New Customer
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
            placeholder="Search by name, mobile, email, business name..."
            className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] py-2 pl-10 pr-4 text-xs text-white placeholder-[#9aa0ac]/50 focus:border-[#6c63ff] focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl bg-[#0f1117] border border-[#2a2e3a] px-3 py-2 text-xs text-white focus:border-[#6c63ff] focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="LEAD">LEAD</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl bg-[#0f1117] border border-[#2a2e3a] px-3 py-2 text-xs text-white focus:border-[#6c63ff] focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="RETAIL">RETAIL</option>
            <option value="WHOLESALE">WHOLESALE</option>
            <option value="DISTRIBUTOR">DISTRIBUTOR</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching customer records..." />
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-400">{error}</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#9aa0ac]">No customer records found matching filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#e8eaed]">
              <thead className="bg-[#0f1117] text-[#9aa0ac] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Mobile & Email</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Follow-ups</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2e3a]">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-[#22262f]/50 transition">
                    <td className="p-4">
                      <p className="font-bold text-white">{cust.name}</p>
                      <p className="text-[11px] text-[#9aa0ac]">{cust.businessName || 'Individual'}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-mono text-white">{cust.mobile}</p>
                      <p className="text-[11px] text-[#9aa0ac]">{cust.email || '—'}</p>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">{cust.customerType}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          cust.status === 'ACTIVE'
                            ? 'success'
                            : cust.status === 'LEAD'
                            ? 'warning'
                            : 'secondary'
                        }
                      >
                        {cust.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-center font-bold text-white">{cust._count?.followUps || 0}</td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        to={`/customers/${cust.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#22262f] px-2.5 py-1.5 text-xs text-white hover:bg-[#6c63ff] transition"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>

                      {canEdit && (
                        <button
                          onClick={() => handleOpenEditModal(cust)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#22262f] px-2.5 py-1.5 text-xs text-sky-400 hover:bg-sky-500/20 transition"
                        >
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => handleDelete(cust.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
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

      {/* Create/Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? `Edit Customer #${editingCustomer.id}` : 'Create New Customer'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-rose-400">
              <AlertCircle className="h-4 w-4" />
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#9aa0ac] mb-1 font-semibold">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2.5 text-white focus:border-[#6c63ff] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#9aa0ac] mb-1 font-semibold">Mobile Number *</label>
              <input
                type="text"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="+919876543210"
                className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2.5 text-white focus:border-[#6c63ff] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#9aa0ac] mb-1 font-semibold">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2.5 text-white focus:border-[#6c63ff] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#9aa0ac] mb-1 font-semibold">Business Name</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2.5 text-white focus:border-[#6c63ff] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#9aa0ac] mb-1 font-semibold">Customer Type</label>
              <select
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value as any })}
                className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2.5 text-white focus:border-[#6c63ff] focus:outline-none"
              >
                <option value="RETAIL">RETAIL</option>
                <option value="WHOLESALE">WHOLESALE</option>
                <option value="DISTRIBUTOR">DISTRIBUTOR</option>
              </select>
            </div>
            <div>
              <label className="block text-[#9aa0ac] mb-1 font-semibold">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2.5 text-white focus:border-[#6c63ff] focus:outline-none"
              >
                <option value="LEAD">LEAD</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#9aa0ac] mb-1 font-semibold">GST Number</label>
            <input
              type="text"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              placeholder="07AAAAA9999A1Z1"
              className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2.5 text-white focus:border-[#6c63ff] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#9aa0ac] mb-1 font-semibold">Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2.5 text-white focus:border-[#6c63ff] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl bg-[#22262f] px-4 py-2 text-white hover:bg-[#2a2e3a] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#6c63ff] px-5 py-2 font-semibold text-white hover:bg-[#5a52e0] transition"
            >
              {editingCustomer ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

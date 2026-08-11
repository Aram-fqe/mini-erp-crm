import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customerApi } from '../api/services';
import { Customer, FollowUp } from '../types';
import { LoadingSpinner, Badge, Modal } from '../components/UIComponents';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Phone, Mail, Building, MapPin, Calendar, Plus, MessageSquare } from 'lucide-react';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Followup Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [formError, setFormError] = useState('');

  const canAddFollowUp = user?.role === 'ADMIN' || user?.role === 'SALES';

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [custData, fuData] = await Promise.all([
        customerApi.getCustomerById(parseInt(id, 10)),
        customerApi.getFollowUps(parseInt(id, 10)),
      ]);
      setCustomer(custData);
      setFollowUps(fuData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customer profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setFormError('');
    try {
      await customerApi.createFollowUp(parseInt(id, 10), {
        notes,
        followUpDate: followUpDate || undefined,
      });
      setIsModalOpen(false);
      setNotes('');
      setFollowUpDate('');
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to log follow-up activity.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading customer profile & timeline..." />;
  if (error || !customer) {
    return (
      <div className="space-y-4 text-center p-8">
        <p className="text-rose-400 text-sm">{error || 'Customer record not found.'}</p>
        <Link to="/customers" className="text-xs text-[#6c63ff] hover:underline">
          ← Back to Customer Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#9aa0ac] hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </Link>
        <Badge
          variant={
            customer.status === 'ACTIVE' ? 'success' : customer.status === 'LEAD' ? 'warning' : 'secondary'
          }
        >
          {customer.status}
        </Badge>
      </div>

      {/* Customer Header Card */}
      <div className="rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a2e3a] pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{customer.name}</h2>
            <p className="text-xs text-[#9aa0ac] mt-0.5">{customer.businessName || 'Individual Retail Account'}</p>
          </div>
          <Badge variant="primary">{customer.customerType}</Badge>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0f1117]">
            <Phone className="h-4 w-4 text-[#6c63ff]" />
            <div>
              <p className="text-[#9aa0ac]">Mobile</p>
              <p className="font-mono text-white font-semibold">{customer.mobile}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0f1117]">
            <Mail className="h-4 w-4 text-[#6c63ff]" />
            <div>
              <p className="text-[#9aa0ac]">Email</p>
              <p className="text-white font-semibold">{customer.email || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0f1117]">
            <Building className="h-4 w-4 text-[#6c63ff]" />
            <div>
              <p className="text-[#9aa0ac]">GST Number</p>
              <p className="font-mono text-white font-semibold">{customer.gstNumber || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0f1117]">
            <Calendar className="h-4 w-4 text-[#6c63ff]" />
            <div>
              <p className="text-[#9aa0ac]">Next Follow-up</p>
              <p className="text-white font-semibold">
                {customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString() : 'None scheduled'}
              </p>
            </div>
          </div>
        </div>

        {customer.address && (
          <div className="flex items-start gap-2 pt-2 text-xs text-[#9aa0ac]">
            <MapPin className="h-4 w-4 text-[#6c63ff] flex-shrink-0 mt-0.5" />
            <span>{customer.address}</span>
          </div>
        )}
      </div>

      {/* Follow-up History Timeline */}
      <div className="rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#6c63ff]" />
            <h3 className="text-base font-semibold text-white">Follow-up Notes & Interactions</h3>
          </div>
          {canAddFollowUp && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#6c63ff] px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-[#6c63ff]/20 hover:bg-[#5a52e0] transition"
            >
              <Plus className="h-4 w-4" /> Log New Activity
            </button>
          )}
        </div>

        {followUps.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#2a2e3a] p-8 text-center text-xs text-[#9aa0ac]">
            No interactions logged yet. Click "Log New Activity" to record client follow-ups.
          </div>
        ) : (
          <div className="space-y-3">
            {followUps.map((fu) => (
              <div key={fu.id} className="rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-4 text-xs space-y-2">
                <div className="flex items-center justify-between text-[#9aa0ac]">
                  <span className="font-semibold text-white">{fu.createdBy.name}</span>
                  <span>{new Date(fu.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-[#e8eaed] leading-relaxed">{fu.notes}</p>
                {fu.followUpDate && (
                  <div className="pt-1 text-[11px] text-[#6c63ff]">
                    Next Follow-up scheduled for: {new Date(fu.followUpDate).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Followup Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Follow-up Activity">
        <form onSubmit={handleAddFollowUp} className="space-y-4 text-xs">
          {formError && <p className="text-rose-400">{formError}</p>}
          <div>
            <label className="block text-[#9aa0ac] mb-1 font-semibold">Interaction Notes *</label>
            <textarea
              rows={4}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Called client regarding catalog pricing. Requested formal quotation."
              className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2.5 text-white focus:border-[#6c63ff] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#9aa0ac] mb-1 font-semibold">Next Follow-up Date (Optional)</label>
            <input
              type="datetime-local"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full rounded-xl bg-[#0f1117] border border-[#2a2e3a] p-2.5 text-white focus:border-[#6c63ff] focus:outline-none"
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
              Save Activity
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

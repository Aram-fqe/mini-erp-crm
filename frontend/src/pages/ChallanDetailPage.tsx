import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { challanApi } from '../api/services';
import { Challan } from '../types';
import { LoadingSpinner, Badge } from '../components/UIComponents';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle2, XCircle, FileText, Calendar, UserCheck, AlertCircle, Download } from 'lucide-react';

export const ChallanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const canConfirm = user?.role === 'ADMIN' || user?.role === 'SALES' || user?.role === 'WAREHOUSE';
  const canCancel = user?.role === 'ADMIN' || user?.role === 'SALES';

  const fetchChallan = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await challanApi.getChallanById(parseInt(id, 10));
      setChallan(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load delivery challan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const handleConfirm = async () => {
    if (!challan) return;
    if (!window.confirm(`Are you sure you want to CONFIRM Sales Challan ${challan.challanNumber}? This will deduct inventory.`)) return;

    setActionError('');
    setActionSuccess('');
    setActionLoading(true);

    try {
      const res = await challanApi.confirmChallan(challan.id);
      setActionSuccess(res.message || 'Challan confirmed successfully!');
      fetchChallan();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to confirm challan. Stock might be insufficient.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!challan) return;
    if (!window.confirm(`Are you sure you want to CANCEL Sales Challan ${challan.challanNumber}?`)) return;

    setActionError('');
    setActionSuccess('');
    setActionLoading(true);

    try {
      const res = await challanApi.cancelChallan(challan.id);
      setActionSuccess(res.message || 'Challan cancelled successfully!');
      fetchChallan();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to cancel challan.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!challan) return;
    setPdfLoading(true);
    try {
      await challanApi.downloadPdf(challan.id);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to generate PDF.');
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Inspecting delivery challan snapshot..." />;
  if (error || !challan) {
    return (
      <div className="space-y-4 text-center p-8">
        <p className="text-rose-400 text-sm">{error || 'Challan record not found.'}</p>
        <Link to="/challans" className="text-xs text-[#6c63ff] hover:underline">
          ← Back to Sales Challans
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Nav */}
      <div className="flex items-center justify-between">
        <Link
          to="/challans"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#9aa0ac] hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Challans
        </Link>
        <Badge
          variant={
            challan.status === 'CONFIRMED'
              ? 'success'
              : challan.status === 'DRAFT'
              ? 'warning'
              : 'danger'
          }
        >
          {challan.status}
        </Badge>
      </div>

      {/* Action Messages */}
      {actionError && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Challan Summary */}
      <div className="rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a2e3a] pb-6">
          <div>
            <h2 className="text-2xl font-mono font-bold text-white">{challan.challanNumber}</h2>
            <p className="text-xs text-[#9aa0ac] mt-1">
              Issued for: <span className="font-bold text-white">{challan.customer?.name}</span>{' '}
              {challan.customer?.businessName ? `(${challan.customer.businessName})` : ''}
            </p>
          </div>

          {/* Workflow Action Buttons */}
          <div className="flex gap-2">
            <button
              disabled={pdfLoading}
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6c63ff] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#6c63ff]/20 hover:bg-[#5a52e0] disabled:opacity-50 transition"
            >
              <Download className="h-4 w-4" /> {pdfLoading ? 'Generating...' : 'Download PDF'}
            </button>

            {challan.status === 'DRAFT' && canConfirm && (
              <button
                disabled={actionLoading}
                onClick={handleConfirm}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 disabled:opacity-50 transition"
              >
                <CheckCircle2 className="h-4 w-4" /> Confirm & Deduct Stock
              </button>
            )}

            {challan.status !== 'CANCELLED' && canCancel && (
              <button
                disabled={actionLoading}
                onClick={handleCancel}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 disabled:opacity-50 transition"
              >
                <XCircle className="h-4 w-4" /> Cancel Challan
              </button>
            )}
          </div>
        </div>

        {/* Metadata info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0f1117]">
            <Calendar className="h-4 w-4 text-[#6c63ff]" />
            <div>
              <p className="text-[#9aa0ac]">Date Created</p>
              <p className="text-white font-semibold">{new Date(challan.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0f1117]">
            <UserCheck className="h-4 w-4 text-[#6c63ff]" />
            <div>
              <p className="text-[#9aa0ac]">Created By</p>
              <p className="text-white font-semibold">{challan.createdBy?.name || 'System User'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0f1117]">
            <FileText className="h-4 w-4 text-[#6c63ff]" />
            <div>
              <p className="text-[#9aa0ac]">Total Dispatched Quantity</p>
              <p className="text-white font-bold text-sm">{challan.totalQuantity} units</p>
            </div>
          </div>
        </div>

        {/* Product Line Items Snapshot Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Line Items (Historical Product Snapshot)</h3>
          <div className="overflow-x-auto rounded-xl border border-[#2a2e3a]">
            <table className="w-full text-left text-xs text-[#e8eaed]">
              <thead className="bg-[#0f1117] text-[#9aa0ac] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">SKU Snapshot</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-center">Quantity</th>
                  <th className="p-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2e3a]">
                {challan.items?.map((item) => {
                  const lineTotal = Number(item.unitPrice) * item.quantity;
                  return (
                    <tr key={item.id} className="hover:bg-[#22262f]/50 transition">
                      <td className="p-3 font-mono font-bold text-[#6c63ff]">{item.productSku}</td>
                      <td className="p-3 font-semibold text-white">{item.productName}</td>
                      <td className="p-3 text-right text-[#9aa0ac]">₹{Number(item.unitPrice).toFixed(2)}</td>
                      <td className="p-3 text-center font-bold text-white">{item.quantity}</td>
                      <td className="p-3 text-right font-bold text-emerald-400">₹{lineTotal.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { customerApi, productApi, challanApi } from '../api/services';
import { LoadingSpinner, Badge } from '../components/UIComponents';
import { Users, Package, Boxes, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalChallans: 0,
    draftChallans: 0,
    confirmedChallans: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [custRes, prodRes, challanRes, lowStockRes] = await Promise.all([
          customerApi.getCustomers({ limit: 1 }),
          productApi.getProducts({ limit: 1 }),
          challanApi.getChallans({ limit: 1 }),
          productApi.getProducts({ lowStock: true, limit: 5 }),
        ]);

        const [activeCustRes, draftChallanRes, confChallanRes] = await Promise.all([
          customerApi.getCustomers({ status: 'ACTIVE', limit: 1 }),
          challanApi.getChallans({ status: 'DRAFT', limit: 1 }),
          challanApi.getChallans({ status: 'CONFIRMED', limit: 1 }),
        ]);

        setStats({
          totalCustomers: custRes.pagination.total,
          activeCustomers: activeCustRes.pagination.total,
          totalProducts: prodRes.pagination.total,
          lowStockCount: lowStockRes.pagination.total,
          totalChallans: challanRes.pagination.total,
          draftChallans: draftChallanRes.pagination.total,
          confirmedChallans: confChallanRes.pagination.total,
        });

        setLowStockProducts(lowStockRes.products);
      } catch (err) {
        console.error('Failed to fetch dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner message="Calculating real-time ERP metrics..." />;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#1a1d27] to-[#22262f] border border-[#2a2e3a] p-6">
        <div>
          <h2 className="text-xl font-bold text-white">Welcome back, {user?.name}!</h2>
          <p className="text-xs text-[#9aa0ac] mt-1">
            Logged in as <span className="font-semibold text-[#6c63ff]">{user?.role}</span> • System Operational
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/challans"
            className="rounded-xl bg-[#6c63ff] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-[#6c63ff]/20 hover:bg-[#5a52e0] transition"
          >
            Manage Sales Challans
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9aa0ac] uppercase tracking-wider">Total Customers</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6c63ff]/15 text-[#6c63ff]">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{stats.totalCustomers}</span>
            <span className="text-xs text-emerald-400 font-medium">{stats.activeCustomers} Active</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9aa0ac] uppercase tracking-wider">Catalog Products</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{stats.totalProducts}</span>
            <span className="text-xs text-[#9aa0ac]">Items listed</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9aa0ac] uppercase tracking-wider">Low Stock Alerts</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-400">{stats.lowStockCount}</span>
            <span className="text-xs text-amber-400 font-medium">Needs Reorder</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9aa0ac] uppercase tracking-wider">Sales Challans</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{stats.totalChallans}</span>
            <span className="text-xs text-emerald-400 font-medium">{stats.confirmedChallans} Confirmed</span>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Table */}
      <div className="rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-semibold text-white">Low Stock Inventory Alerts</h3>
          </div>
          <Link to="/inventory" className="text-xs font-semibold text-[#6c63ff] hover:underline">
            View All Inventory →
          </Link>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#2a2e3a] p-8 text-center text-xs text-[#9aa0ac]">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
            All products are sufficiently stocked above minimum levels.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#e8eaed]">
              <thead className="bg-[#0f1117] text-[#9aa0ac] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Current Stock</th>
                  <th className="p-3">Min Alert Qty</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2e3a]">
                {lowStockProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#22262f]/50 transition">
                    <td className="p-3 font-semibold text-white">{prod.name}</td>
                    <td className="p-3 font-mono text-[#9aa0ac]">{prod.sku}</td>
                    <td className="p-3">{prod.category}</td>
                    <td className="p-3 font-bold text-amber-400">{prod.currentStock}</td>
                    <td className="p-3 text-[#9aa0ac]">{prod.minStockQuantity}</td>
                    <td className="p-3 text-right">
                      <Badge variant="warning">Low Stock</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

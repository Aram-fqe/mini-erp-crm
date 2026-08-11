import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { customerApi, productApi, challanApi } from '../api/services';
import { LoadingSpinner, Badge } from '../components/UIComponents';
import { Users, Package, Boxes, FileText, AlertTriangle, Calendar, ArrowRight, Clock } from 'lucide-react';
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
    confirmedChallans: 0,
  });

  const [recentChallans, setRecentChallans] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [upcomingFollowUps, setUpcomingFollowUps] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [custRes, prodRes, challanRes, lowStockRes, recentChallanRes] = await Promise.all([
          customerApi.getCustomers({ limit: 100 }),
          productApi.getProducts({ limit: 1 }),
          challanApi.getChallans({ limit: 1 }),
          productApi.getProducts({ lowStock: true, limit: 5 }),
          challanApi.getChallans({ limit: 5 }),
        ]);

        const [activeCustRes, confChallanRes] = await Promise.all([
          customerApi.getCustomers({ status: 'ACTIVE', limit: 1 }),
          challanApi.getChallans({ status: 'CONFIRMED', limit: 1 }),
        ]);

        // Filter customers with upcoming follow-up dates
        const followUpList = custRes.customers
          .filter((c) => c.followUpDate)
          .sort((a, b) => new Date(a.followUpDate!).getTime() - new Date(b.followUpDate!).getTime())
          .slice(0, 5);

        setStats({
          totalCustomers: custRes.pagination.total,
          activeCustomers: activeCustRes.pagination.total,
          totalProducts: prodRes.pagination.total,
          lowStockCount: lowStockRes.pagination.total,
          totalChallans: challanRes.pagination.total,
          confirmedChallans: confChallanRes.pagination.total,
        });

        setRecentChallans(recentChallanRes.challans);
        setLowStockProducts(lowStockRes.products);
        setUpcomingFollowUps(followUpList);
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
          <h2 className="text-xl font-bold text-white">Operations Dashboard</h2>
          <p className="text-xs text-[#9aa0ac] mt-1">
            Welcome back, <span className="font-semibold text-white">{user?.name}</span> • Role:{' '}
            <span className="font-semibold text-[#6c63ff]">{user?.role}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/challans"
            className="rounded-xl bg-[#6c63ff] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-[#6c63ff]/20 hover:bg-[#5a52e0] transition"
          >
            Manage Delivery Challans
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid (4 Columns, Responsive) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9aa0ac] uppercase tracking-wider">Total Customers</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6c63ff]/15 text-[#6c63ff]">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{stats.totalCustomers}</span>
            <span className="text-xs text-emerald-400 font-semibold">{stats.activeCustomers} Active</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9aa0ac] uppercase tracking-wider">Total Products</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{stats.totalProducts}</span>
            <span className="text-xs text-[#9aa0ac]">Catalog SKUs</span>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9aa0ac] uppercase tracking-wider">Low Stock Alert</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-400">{stats.lowStockCount}</span>
            <span className="text-xs text-amber-400 font-semibold">Needs Reorder</span>
          </div>
        </div>

        {/* Total Delivery Challans */}
        <div className="rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9aa0ac] uppercase tracking-wider">Total Challans</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{stats.totalChallans}</span>
            <span className="text-xs text-emerald-400 font-semibold">{stats.confirmedChallans} Confirmed</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Section: 2 Columns (Recent Challans & Upcoming Follow-ups) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Delivery Challans */}
        <div className="rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#6c63ff]" />
              <h3 className="text-sm font-semibold text-white">Recent Delivery Challans</h3>
            </div>
            <Link to="/challans" className="text-xs text-[#6c63ff] font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentChallans.length === 0 ? (
            <p className="text-xs text-[#9aa0ac] py-6 text-center">No recent delivery challans.</p>
          ) : (
            <div className="space-y-2">
              {recentChallans.map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0f1117] border border-[#2a2e3a] text-xs hover:border-[#6c63ff]/50 transition"
                >
                  <div>
                    <span className="font-mono font-bold text-white block">{ch.challanNumber}</span>
                    <span className="text-[#9aa0ac] text-[11px]">{ch.customer?.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">{ch.totalQuantity} units</span>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Customer Follow-ups */}
        <div className="rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#6c63ff]" />
              <h3 className="text-sm font-semibold text-white">Upcoming Customer Follow-ups</h3>
            </div>
            <Link to="/customers" className="text-xs text-[#6c63ff] font-semibold hover:underline flex items-center gap-1">
              View Directory <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {upcomingFollowUps.length === 0 ? (
            <p className="text-xs text-[#9aa0ac] py-6 text-center">No upcoming customer follow-ups scheduled.</p>
          ) : (
            <div className="space-y-2">
              {upcomingFollowUps.map((cust) => (
                <div
                  key={cust.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0f1117] border border-[#2a2e3a] text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{cust.name}</span>
                    <span className="text-[#9aa0ac] text-[11px]">{cust.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-lg">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{new Date(cust.followUpDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Warning Section */}
      <div className="rounded-2xl bg-[#1a1d27] border border-[#2a2e3a] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Low Stock Inventory Alerts</h3>
          </div>
          <Link to="/inventory" className="text-xs text-[#6c63ff] font-semibold hover:underline flex items-center gap-1">
            Open Inventory Control <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {lowStockProducts.length === 0 ? (
          <p className="text-xs text-emerald-400 py-4 text-center font-medium">
            ✓ All catalog products are currently above minimum stock alert levels.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#e8eaed]">
              <thead className="bg-[#0f1117] text-[#9aa0ac] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-center">Current Stock</th>
                  <th className="p-3 text-center">Min Alert Qty</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2e3a]">
                {lowStockProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#22262f]/50 transition">
                    <td className="p-3 font-mono font-bold text-[#6c63ff]">{prod.sku}</td>
                    <td className="p-3 font-semibold text-white">{prod.name}</td>
                    <td className="p-3">{prod.category}</td>
                    <td className="p-3 text-center font-bold text-amber-400">{prod.currentStock}</td>
                    <td className="p-3 text-center text-[#9aa0ac]">{prod.minStockQuantity}</td>
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

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const { token, user } = useAuth();

  const [metrics, setMetrics] = useState(null);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('verification'); // 'verification', 'bookings', 'disputes', 'analytics'

  // Booking filters
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingServiceFilter, setBookingServiceFilter] = useState('all');

  // Action states
  const [processingId, setProcessingId] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch overview metrics
      const mRes = await fetch('http://localhost:5001/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (mRes.ok) {
        const mData = await mRes.json();
        setMetrics(mData.metrics);
      } else {
        const errData = await mRes.json();
        setError(errData.error || 'Access denied to Admin Dashboard');
        setLoading(false);
        return;
      }

      // Fetch pending providers
      const pRes = await fetch('http://localhost:5001/api/admin/providers/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (pRes.ok) setPendingProviders(await pRes.json());

      // Fetch bookings
      const bRes = await fetch('http://localhost:5001/api/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (bRes.ok) setBookings(await bRes.json());

      // Fetch disputes
      const dRes = await fetch('http://localhost:5001/api/admin/disputes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (dRes.ok) setDisputes(await dRes.json());

      // Fetch analytics
      const aRes = await fetch('http://localhost:5001/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (aRes.ok) setAnalytics(await aRes.json());

    } catch (err) {
      console.error('Admin fetch error:', err);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [token]);

  const handleVerifyProvider = async (providerId, verified) => {
    setProcessingId(providerId);
    try {
      const res = await fetch(`http://localhost:5001/api/admin/providers/${providerId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ verified }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Verify error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateDispute = async (disputeId, newStatus) => {
    setProcessingId(disputeId);
    try {
      const res = await fetch(`http://localhost:5001/api/admin/disputes/${disputeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Dispute update error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="pt-[72px] min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-on-surface-variant text-[14px]">Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-[72px] min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <span className="material-symbols-outlined text-[64px] text-error mb-2">gavel</span>
        <h2 className="text-[22px] font-bold text-on-background">{error}</h2>
        <p className="text-[14px] text-on-surface-variant mt-1">You must be logged in as an Admin to access this portal.</p>
      </div>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    const st = b.status === 'Booking Requested' ? 'requested' : b.status;
    if (bookingStatusFilter !== 'all' && st !== bookingStatusFilter) return false;
    if (bookingServiceFilter !== 'all' && !b.selectedService?.toLowerCase().includes(bookingServiceFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="pt-[72px] min-h-screen bg-background pb-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-8">
        
        {/* Header Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-md text-[11px] font-bold bg-tertiary-container text-on-tertiary">
                Admin Control Center
              </span>
            </div>
            <h1 className="text-[26px] md:text-[30px] font-bold text-on-background">System Administration</h1>
            <p className="text-on-surface-variant text-[14px] mt-0.5">
              Verify providers, monitor platform bookings, resolve customer disputes, and inspect system analytics.
            </p>
          </div>
          <button
            onClick={fetchAdminData}
            className="self-start md:self-center px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-[13px] font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Refresh Data
          </button>
        </div>

        {/* Overview Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">Total Users</span>
            <span className="text-[26px] font-bold text-on-background">{metrics?.totalUsers || 0}</span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">Verified Providers</span>
            <span className="text-[26px] font-bold text-emerald-600">{metrics?.verifiedProviders || 0}</span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">Pending Approval</span>
            <span className="text-[26px] font-bold text-amber-600">{metrics?.pendingProviders || 0}</span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">Active Bookings</span>
            <span className="text-[26px] font-bold text-primary">{metrics?.activeBookings || 0}</span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">Completed Jobs</span>
            <span className="text-[26px] font-bold text-tertiary">{metrics?.completedJobs || 0}</span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">Avg Rating</span>
            <div className="flex items-center gap-1">
              <span className="text-[26px] font-bold text-on-background">{metrics?.averageRating || 5.0}</span>
              <span className="text-amber-400 text-[18px]">★</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-outline-variant/30 gap-6 overflow-x-auto pb-1">
          {[
            { id: 'verification', label: `Provider Verification (${pendingProviders.length})`, icon: 'verified_user' },
            { id: 'bookings', label: `Booking Monitoring (${bookings.length})`, icon: 'receipt_long' },
            { id: 'disputes', label: `Disputes (${disputes.length})`, icon: 'gavel' },
            { id: 'analytics', label: 'Platform Analytics', icon: 'analytics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 px-1 text-[14px] font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Provider Verification */}
        {activeTab === 'verification' && (
          <div className="space-y-4">
            <h2 className="text-[18px] font-bold text-on-background">Pending Provider Applications</h2>
            {pendingProviders.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 text-center">
                <span className="material-symbols-outlined text-[48px] text-emerald-600 mb-2">verified</span>
                <h3 className="text-[16px] font-semibold text-on-surface">No pending verifications</h3>
                <p className="text-[13px] text-on-surface-variant mt-1">All service providers have been reviewed and verified.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pendingProviders.map((p) => (
                  <div
                    key={p._id}
                    className="bg-surface-container-lowest border border-amber-300/60 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-amber-100 text-amber-800">
                          Pending Verification
                        </span>
                        <span className="text-[13px] font-bold text-primary">{p.service}</span>
                      </div>
                      <h3 className="text-[18px] font-bold text-on-background">{p.name}</h3>
                      <p className="text-[13px] text-on-surface-variant">{p.about || 'Registered provider awaiting admin approval.'}</p>
                      
                      <div className="flex flex-wrap gap-4 text-[13px] text-on-surface-variant pt-1">
                        <span><strong>Experience:</strong> {p.experience || 0} years</span>
                        <span><strong>Location:</strong> {p.location || 'Pune'}</span>
                        <span><strong>Starting Price:</strong> ₹{p.startingPrice || p.pricing || 499}</span>
                        <span><strong>Skills:</strong> {Array.isArray(p.skills) ? p.skills.join(', ') : p.skills}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-outline-variant/30">
                      <button
                        onClick={() => handleVerifyProvider(p._id, false)}
                        disabled={processingId === p._id}
                        className="px-4 py-2.5 rounded-xl border border-error/40 text-error text-[13px] font-semibold hover:bg-error-container/20 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleVerifyProvider(p._id, true)}
                        disabled={processingId === p._id}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-[13px] font-semibold hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        Approve Provider
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Booking Monitoring */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-[18px] font-bold text-on-background">System Bookings</h2>

              {/* Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-outline-variant bg-surface text-[13px] font-semibold outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="requested">Requested</option>
                  <option value="accepted">Accepted</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={bookingServiceFilter}
                  onChange={(e) => setBookingServiceFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-outline-variant bg-surface text-[13px] font-semibold outline-none"
                >
                  <option value="all">All Services</option>
                  <option value="electrician">Electrician</option>
                  <option value="plumber">Plumber</option>
                  <option value="carpenter">Carpenter</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 text-center">
                <span className="material-symbols-outlined text-[48px] text-outline mb-2">inbox</span>
                <h3 className="text-[16px] font-semibold text-on-surface">No bookings found</h3>
                <p className="text-[13px] text-on-surface-variant mt-1">No system bookings match the selected filters.</p>
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className="bg-surface-container border-b border-outline-variant/30 text-on-surface-variant font-semibold">
                        <th className="p-4">Booking ID</th>
                        <th className="p-4">Service</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Date & Time</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {filteredBookings.map((b) => (
                        <tr key={b._id || b.bookingId} className="hover:bg-surface-container-low transition-colors">
                          <td className="p-4 font-mono font-bold text-primary">#{b.bookingId}</td>
                          <td className="p-4 font-bold text-on-background">{b.selectedService}</td>
                          <td className="p-4 text-on-surface-variant">{b.location?.city || 'Pune'}</td>
                          <td className="p-4 text-on-surface-variant">{b.date || 'Today'} • {b.timeSlot || 'Slot'}</td>
                          <td className="p-4 font-bold text-on-background">₹{b.estimatedPrice || 499}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              b.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                              b.status === 'cancelled' ? 'bg-error-container/40 text-error' :
                              'bg-primary-container/30 text-primary'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Dispute Management */}
        {activeTab === 'disputes' && (
          <div className="space-y-4">
            <h2 className="text-[18px] font-bold text-on-background">Customer Disputes</h2>
            {disputes.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 text-center">
                <span className="material-symbols-outlined text-[48px] text-emerald-600 mb-2">gavel</span>
                <h3 className="text-[16px] font-semibold text-on-surface">No open disputes</h3>
                <p className="text-[13px] text-on-surface-variant mt-1">Customer complaints and disputes will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {disputes.map((d) => (
                  <div
                    key={d._id || d.disputeId}
                    className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] font-mono text-outline font-bold">#{d.disputeId}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${
                          d.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                          d.status === 'Under Review' ? 'bg-amber-100 text-amber-800' :
                          'bg-error-container/40 text-error'
                        }`}>
                          {d.status}
                        </span>
                      </div>
                      <h3 className="text-[16px] font-bold text-on-background">Reason: {d.reason}</h3>
                      <p className="text-[13px] text-on-surface-variant leading-relaxed">{d.description}</p>
                      <p className="text-[12px] text-outline">Raised on {new Date(d.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-outline-variant/30">
                      {d.status !== 'Resolved' && (
                        <>
                          <button
                            onClick={() => handleUpdateDispute(d.disputeId || d._id, 'Under Review')}
                            disabled={processingId === (d.disputeId || d._id)}
                            className="px-3.5 py-2 rounded-xl bg-amber-100 text-amber-900 text-[13px] font-semibold hover:bg-amber-200 transition-colors cursor-pointer"
                          >
                            Under Review
                          </button>
                          <button
                            onClick={() => handleUpdateDispute(d.disputeId || d._id, 'Resolved')}
                            disabled={processingId === (d.disputeId || d._id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-[13px] font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                          >
                            Mark Resolved
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: System Analytics */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <h2 className="text-[18px] font-bold text-on-background">Platform Analytics & Metrics</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 shadow-sm">
                <h3 className="text-[16px] font-bold text-on-background mb-4">User Breakdown</h3>
                <div className="space-y-3 text-[14px]">
                  <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                    <span className="text-on-surface-variant font-medium">Total Registered Users</span>
                    <span className="font-bold text-on-background">{analytics.users?.total}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                    <span className="text-on-surface-variant font-medium">Customers</span>
                    <span className="font-bold text-primary">{analytics.users?.customers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-medium">Service Providers</span>
                    <span className="font-bold text-secondary">{analytics.users?.providers}</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 shadow-sm">
                <h3 className="text-[16px] font-bold text-on-background mb-4">Provider Verification</h3>
                <div className="space-y-3 text-[14px]">
                  <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                    <span className="text-on-surface-variant font-medium">Total Providers</span>
                    <span className="font-bold text-on-background">{analytics.providers?.total}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                    <span className="text-on-surface-variant font-medium">Verified (Active)</span>
                    <span className="font-bold text-emerald-600">{analytics.providers?.verified}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-medium">Pending Verification</span>
                    <span className="font-bold text-amber-600">{analytics.providers?.pending}</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 shadow-sm">
                <h3 className="text-[16px] font-bold text-on-background mb-4">Bookings & Commercial</h3>
                <div className="space-y-3 text-[14px]">
                  <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                    <span className="text-on-surface-variant font-medium">Total Home Bookings</span>
                    <span className="font-bold text-on-background">{analytics.bookings?.total}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                    <span className="text-on-surface-variant font-medium">Completed Home Jobs</span>
                    <span className="font-bold text-emerald-600">{analytics.bookings?.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-medium">Commercial Maintenance Jobs</span>
                    <span className="font-bold text-tertiary">{analytics.commercial?.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

export default AdminDashboard;

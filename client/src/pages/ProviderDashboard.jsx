import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Rating from '../components/Rating';

function ProviderDashboard() {
  const { token, user } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'active', 'completed', 'earnings', 'profile'

  // Availability toggle state
  const [availability, setAvailability] = useState('Available');
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    service: '',
    experience: '',
    startingPrice: '',
    location: '',
    skills: '',
    about: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5001/api/providers/me/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || 'Failed to load provider dashboard');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setDashboardData(data);
      setAvailability(data.metrics?.availability || 'Available');
      if (data.provider) {
        setProfileForm({
          name: data.provider.name || user?.name || '',
          phone: user?.phone || '',
          service: data.provider.service || '',
          experience: data.provider.experience || 2,
          startingPrice: data.provider.startingPrice || data.provider.pricing || 499,
          location: data.provider.location || '',
          skills: Array.isArray(data.provider.skills) ? data.provider.skills.join(', ') : '',
          about: data.provider.about || '',
        });
      }
    } catch (err) {
      console.error(err);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboard();
    }
  }, [token]);

  const handleToggleAvailability = async () => {
    const nextStatus = availability === 'Available' ? 'Unavailable' : 'Available';
    setTogglingAvailability(true);
    try {
      const res = await fetch('http://localhost:5001/api/providers/me/availability', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ availability: nextStatus }),
      });
      if (res.ok) {
        setAvailability(nextStatus);
      }
    } catch (err) {
      console.error('Failed to update availability', err);
    } finally {
      setTogglingAvailability(false);
    }
  };

  const handleUpdateJobStatus = async (bookingId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`http://localhost:5001/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update job status');
        setUpdatingStatus(false);
        return;
      }
      fetchDashboard();
    } catch (err) {
      console.error(err);
      alert('Unable to connect to server');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage('');
    try {
      const res = await fetch('http://localhost:5001/api/providers/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });
      if (res.ok) {
        setProfileMessage('Profile updated successfully!');
        fetchDashboard();
      } else {
        const errData = await res.json();
        setProfileMessage(errData.error || 'Failed to update profile');
      }
    } catch (err) {
      setProfileMessage('Unable to connect to server');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-[72px] min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-on-surface-variant text-[14px]">Loading provider portal...</p>
      </div>
    );
  }

  const { metrics, jobs = [], commercialJobs = [], provider } = dashboardData || {};

  const pendingJobs = jobs.filter((j) => (j.status === 'Booking Requested' ? 'requested' : j.status) === 'requested');
  const activeJobs = jobs.filter((j) => ['accepted', 'in-progress'].includes(j.status));
  const completedJobs = jobs.filter((j) => j.status === 'completed');

  const pendingCommercial = commercialJobs.filter((c) => c.status === 'Assigned');
  const activeCommercial = commercialJobs.filter((c) => c.status === 'In Progress');
  const completedCommercial = commercialJobs.filter((c) => c.status === 'Completed');

  const handleUpdateCommercialStatus = async (requestId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5001/api/maintenance/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="pt-[72px] min-h-screen bg-background pb-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-8">
        
        {/* Header Card with Availability Toggle */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-secondary-container text-on-secondary-container rounded-2xl flex items-center justify-center font-bold text-[24px] shrink-0">
              {provider?.name?.charAt(0) || user?.name?.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-0.5 rounded-md text-[11px] font-bold bg-secondary-container text-on-secondary-container">
                  Provider Portal
                </span>
                <span className="text-[13px] text-on-surface-variant font-medium">• {provider?.service || 'Service Provider'}</span>
              </div>
              <h1 className="text-[24px] md:text-[28px] font-bold text-on-background">{provider?.name || user?.name}</h1>
              <p className="text-[13px] text-on-surface-variant mt-0.5">{provider?.location || 'Pune'}</p>
            </div>
          </div>

          {/* Availability Switch */}
          <div className="flex items-center gap-3 bg-surface-container p-3 rounded-2xl border border-outline-variant/30 self-start md:self-center">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Status</span>
              <span className={`text-[13px] font-bold ${availability === 'Available' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {availability}
              </span>
            </div>
            <button
              onClick={handleToggleAvailability}
              disabled={togglingAvailability}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                availability === 'Available'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              {togglingAvailability ? 'Saving...' : availability === 'Available' ? 'Set Unavailable' : 'Set Available'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-error-container/50 border border-error/30 rounded-2xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="text-error text-[14px] font-medium">{error}</p>
          </div>
        )}

        {/* Core Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
            <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Today's Jobs</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-[28px] font-bold text-primary">{metrics?.todaysJobsCount || 0}</span>
              <span className="material-symbols-outlined text-primary/40 text-[24px]">today</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
            <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Pending Requests</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-[28px] font-bold text-amber-600">{metrics?.pendingRequestsCount || 0}</span>
              <span className="material-symbols-outlined text-amber-500/40 text-[24px]">pending</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
            <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Completed Jobs</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-[28px] font-bold text-emerald-600">{metrics?.completedJobsCount || 0}</span>
              <span className="material-symbols-outlined text-emerald-500/40 text-[24px]">task_alt</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
            <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Total Earnings</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-[28px] font-bold text-on-background">₹{metrics?.totalEarnings || 0}</span>
              <span className="material-symbols-outlined text-on-surface/40 text-[24px]">payments</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-2xs flex flex-col justify-between col-span-2 lg:col-span-1">
            <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Rating</span>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-[28px] font-bold text-on-background">{metrics?.averageRating || 5.0}</span>
                <span className="text-amber-400 text-[20px]">★</span>
              </div>
              <span className="text-[12px] text-on-surface-variant font-medium">({metrics?.reviewCount || 0})</span>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-outline-variant/30 gap-6 overflow-x-auto pb-1">
          {[
            { id: 'requests', label: `Pending Requests (${pendingJobs.length + pendingCommercial.length})`, icon: 'notifications' },
            { id: 'active', label: `Active Jobs (${activeJobs.length + activeCommercial.length})`, icon: 'engineering' },
            { id: 'completed', label: `Completed Jobs (${completedJobs.length + completedCommercial.length})`, icon: 'task_alt' },
            { id: 'earnings', label: 'Earnings Breakdown', icon: 'payments' },
            { id: 'profile', label: 'Profile Settings', icon: 'person' },
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

        {/* Tab 1: Pending Requests */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <h2 className="text-[18px] font-bold text-on-background">Incoming Service Requests</h2>
            {pendingJobs.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 text-center">
                <span className="material-symbols-outlined text-[48px] text-outline mb-2">notifications_off</span>
                <h3 className="text-[16px] font-semibold text-on-surface">No pending requests</h3>
                <p className="text-[13px] text-on-surface-variant mt-1">You're all caught up! New customer requests will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pendingJobs.map((job) => (
                  <div
                    key={job._id || job.bookingId}
                    className="bg-surface-container-lowest border border-amber-300/50 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] font-mono text-outline font-bold">#{job.bookingId}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-amber-100 text-amber-800">
                          Requested
                        </span>
                      </div>
                      <h3 className="text-[18px] font-bold text-on-background">{job.selectedService}</h3>
                      <p className="text-[14px] text-on-surface-variant leading-relaxed">{job.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-[13px] text-on-surface-variant pt-1">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
                          {job.date || 'Today'}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                          {job.timeSlot || 'As soon as possible'}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                          {[job.location?.address, job.location?.area, job.location?.city].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end justify-between gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-outline-variant/30">
                      <span className="text-[20px] font-bold text-primary">₹{job.estimatedPrice || 499}</span>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateJobStatus(job.bookingId || job._id, 'cancelled')}
                          disabled={updatingStatus}
                          className="px-4 py-2.5 rounded-xl border border-error/40 text-error text-[13px] font-semibold hover:bg-error-container/20 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleUpdateJobStatus(job.bookingId || job._id, 'accepted')}
                          disabled={updatingStatus}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-[13px] font-semibold hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          Accept Booking
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Active Jobs */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            <h2 className="text-[18px] font-bold text-on-background">Accepted & In-Progress Jobs</h2>
            {activeJobs.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 text-center">
                <span className="material-symbols-outlined text-[48px] text-outline mb-2">engineering</span>
                <h3 className="text-[16px] font-semibold text-on-surface">No active jobs</h3>
                <p className="text-[13px] text-on-surface-variant mt-1">Accept pending requests to start working on jobs.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {activeJobs.map((job) => (
                  <div
                    key={job._id || job.bookingId}
                    className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] font-mono text-outline font-bold">#{job.bookingId}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${
                          job.status === 'accepted' ? 'bg-primary-container/30 text-primary' : 'bg-tertiary-container/30 text-tertiary'
                        }`}>
                          {job.status === 'accepted' ? 'Accepted' : 'In Progress'}
                        </span>
                      </div>
                      <h3 className="text-[18px] font-bold text-on-background">{job.selectedService}</h3>
                      <p className="text-[14px] text-on-surface-variant leading-relaxed">{job.description}</p>

                      <div className="flex flex-wrap gap-4 text-[13px] text-on-surface-variant pt-1">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
                          {job.date || 'Today'}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                          {[job.location?.address, job.location?.area, job.location?.city].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end justify-between gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-outline-variant/30">
                      <span className="text-[20px] font-bold text-primary">₹{job.estimatedPrice || 499}</span>

                      {job.status === 'accepted' && (
                        <button
                          onClick={() => handleUpdateJobStatus(job.bookingId || job._id, 'in-progress')}
                          disabled={updatingStatus}
                          className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary text-[13px] font-semibold hover:bg-primary transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Start Job
                        </button>
                      )}

                      {job.status === 'in-progress' && (
                        <button
                          onClick={() => handleUpdateJobStatus(job.bookingId || job._id, 'completed')}
                          disabled={updatingStatus}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-[13px] font-semibold hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Completed Jobs */}
        {activeTab === 'completed' && (
          <div className="space-y-4">
            <h2 className="text-[18px] font-bold text-on-background">Completed Service History</h2>
            {completedJobs.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 text-center">
                <span className="material-symbols-outlined text-[48px] text-outline mb-2">task_alt</span>
                <h3 className="text-[16px] font-semibold text-on-surface">No completed jobs yet</h3>
                <p className="text-[13px] text-on-surface-variant mt-1">Jobs completed by you will be cataloged here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {completedJobs.map((job) => (
                  <div
                    key={job._id || job.bookingId}
                    className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] font-mono text-outline font-bold">#{job.bookingId}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-emerald-100 text-emerald-800">
                          Completed
                        </span>
                      </div>
                      <h4 className="text-[16px] font-bold text-on-background">{job.selectedService}</h4>
                      <p className="text-[13px] text-on-surface-variant">{job.description}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[16px] font-bold text-emerald-700">₹{job.estimatedPrice || 499}</span>
                      <span className="text-[12px] text-outline block">{job.date || 'Completed'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Earnings Breakdown */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-[18px] font-bold text-on-background">Service Earnings Breakdown</h2>
                <p className="text-[13px] text-on-surface-variant">Computed from completed customer bookings (Cash on Delivery / Direct Settlement).</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5">
                <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">Today's Earnings</span>
                <span className="text-[26px] font-bold text-emerald-600">₹{metrics?.todayEarnings || 0}</span>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5">
                <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">This Week</span>
                <span className="text-[26px] font-bold text-primary">₹{metrics?.weekEarnings || 0}</span>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5">
                <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">This Month</span>
                <span className="text-[26px] font-bold text-tertiary">₹{metrics?.monthEarnings || 0}</span>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5">
                <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">Total All-Time</span>
                <span className="text-[26px] font-bold text-on-background">₹{metrics?.totalEarnings || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Profile Settings */}
        {activeTab === 'profile' && (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 md:p-8 max-w-2xl">
            <h2 className="text-[20px] font-bold text-on-background mb-4">Edit Provider Profile</h2>

            {profileMessage && (
              <div className={`p-3 rounded-xl mb-4 text-[13px] font-semibold ${
                profileMessage.includes('successfully') ? 'bg-emerald-100 text-emerald-800' : 'bg-error-container/50 text-error'
              }`}>
                {profileMessage}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-on-surface mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-background text-[14px] outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-on-surface mb-1">Phone</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-background text-[14px] outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-on-surface mb-1">Service Category</label>
                  <input
                    type="text"
                    value={profileForm.service}
                    onChange={(e) => setProfileForm({ ...profileForm, service: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-background text-[14px] outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-on-surface mb-1">Location</label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-background text-[14px] outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-on-surface mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={profileForm.experience}
                    onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-background text-[14px] outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-on-surface mb-1">Starting Price (₹)</label>
                  <input
                    type="number"
                    value={profileForm.startingPrice}
                    onChange={(e) => setProfileForm({ ...profileForm, startingPrice: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-background text-[14px] outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={profileForm.skills}
                  onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-background text-[14px] outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1">About / Bio</label>
                <textarea
                  value={profileForm.about}
                  onChange={(e) => setProfileForm({ ...profileForm, about: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-background text-[14px] outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary font-semibold text-[14px] hover:bg-primary transition-colors cursor-pointer disabled:opacity-50"
              >
                {savingProfile ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </form>
          </div>
        )}

      </div>
    </main>
  );
}

export default ProviderDashboard;

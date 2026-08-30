import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function CommercialDashboard() {
  const { token } = useAuth();

  const [data, setData] = useState(null);
  const [verifiedProviders, setVerifiedProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'create'

  // Create Form State
  const [requestForm, setRequestForm] = useState({
    mallName: 'Phoenix Marketcity',
    floor: '2',
    area: 'Food Court — F24',
    serviceType: 'Electrical',
    priority: 'High',
    description: '',
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  // Assign Modal / Action state
  const [assigningId, setAssigningId] = useState(null);
  const [selectedProviderId, setSelectedProviderId] = useState('');

  const fetchMaintenanceData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch maintenance requests & metrics
      const res = await fetch('http://localhost:5001/api/maintenance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const mData = await res.json();
        setData(mData);
      } else {
        setError('Failed to load commercial maintenance data.');
      }

      // Fetch verified providers for assignment
      const pRes = await fetch('http://localhost:5001/api/providers');
      if (pRes.ok) {
        const pData = await pRes.json();
        setVerifiedProviders(pData.filter((p) => p.verified));
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
      fetchMaintenanceData();
    }
  }, [token]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!requestForm.description.trim()) {
      setFormMessage('Please enter a description for the maintenance issue.');
      return;
    }

    setSubmittingRequest(true);
    setFormMessage('');

    try {
      const res = await fetch('http://localhost:5001/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestForm),
      });

      const resData = await res.json();
      if (!res.ok) {
        setFormMessage(resData.error || 'Failed to submit maintenance request.');
        setSubmittingRequest(false);
        return;
      }

      setFormMessage('Maintenance request created successfully!');
      setRequestForm({
        mallName: 'Phoenix Marketcity',
        floor: '2',
        area: 'Food Court — F24',
        serviceType: 'Electrical',
        priority: 'High',
        description: '',
      });

      setTimeout(() => {
        setFormMessage('');
        setActiveTab('requests');
        fetchMaintenanceData();
      }, 1200);
    } catch (err) {
      setFormMessage('Unable to connect to server');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleAssignProvider = async (requestId) => {
    if (!selectedProviderId) return;
    setAssigningId(requestId);
    try {
      const res = await fetch(`http://localhost:5001/api/maintenance/${requestId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ providerId: selectedProviderId }),
      });
      if (res.ok) {
        setSelectedProviderId('');
        fetchMaintenanceData();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to assign provider');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAssigningId(null);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5001/api/maintenance/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchMaintenanceData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="pt-[72px] min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-on-surface-variant text-[14px]">Loading Commercial Maintenance Dashboard...</p>
      </div>
    );
  }

  const { metrics, requests = [] } = data || {};

  return (
    <main className="pt-[72px] min-h-screen bg-background pb-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-8">

        {/* Header Banner */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-md text-[11px] font-bold bg-secondary-container text-on-secondary-container">
                Commercial Portal
              </span>
            </div>
            <h1 className="text-[26px] md:text-[30px] font-bold text-on-background">Mall Maintenance Management</h1>
            <p className="text-on-surface-variant text-[14px] mt-0.5">
              Manage facility upkeep, log commercial service requests, and assign verified utility technicians.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('create')}
            className="self-start sm:self-center inline-flex items-center gap-2 bg-primary-container text-on-primary px-5 py-2.5 rounded-xl text-[14px] font-semibold hover:bg-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            New Request
          </button>
        </div>

        {error && (
          <div className="bg-error-container/50 border border-error/30 rounded-2xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="text-error text-[14px] font-medium">{error}</p>
          </div>
        )}

        {/* Core Commercial Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">Open Requests</span>
            <span className="text-[26px] font-bold text-amber-600">{metrics?.openRequestsCount || 0}</span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">Assigned</span>
            <span className="text-[26px] font-bold text-primary">{metrics?.assignedRequestsCount || 0}</span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">In Progress</span>
            <span className="text-[26px] font-bold text-tertiary">{metrics?.inProgressCount || 0}</span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">Completed</span>
            <span className="text-[26px] font-bold text-emerald-600">{metrics?.completedCount || 0}</span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-2xs col-span-2 lg:col-span-1">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">High Priority</span>
            <span className="text-[26px] font-bold text-error">{metrics?.highPriorityCount || 0}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-outline-variant/30 gap-6 overflow-x-auto pb-1">
          {[
            { id: 'requests', label: `Maintenance Requests (${requests.length})`, icon: 'storefront' },
            { id: 'create', label: 'Create New Request', icon: 'add_task' },
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

        {/* Tab 1: Maintenance Requests List */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <h2 className="text-[18px] font-bold text-on-background">Commercial Maintenance Queue</h2>
            {requests.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 text-center">
                <span className="material-symbols-outlined text-[48px] text-outline mb-2">storefront</span>
                <h3 className="text-[16px] font-semibold text-on-surface">No maintenance requests</h3>
                <p className="text-[13px] text-on-surface-variant mt-1">Submit a commercial maintenance request to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {requests.map((r) => (
                  <div
                    key={r._id || r.requestId}
                    className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] font-mono text-outline font-bold">#{r.requestId}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          r.priority === 'Emergency' ? 'bg-error-container text-error' :
                          r.priority === 'High' ? 'bg-amber-100 text-amber-900' :
                          'bg-surface-container text-on-surface-variant'
                        }`}>
                          {r.priority} Priority
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          r.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          r.status === 'In Progress' ? 'bg-tertiary-container/30 text-tertiary' :
                          r.status === 'Assigned' ? 'bg-primary-container/30 text-primary' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                      
                      <h3 className="text-[18px] font-bold text-on-background">{r.serviceType} Service — {r.mallName}</h3>
                      <p className="text-[13px] font-medium text-primary">Floor {r.floor} • Unit/Area: {r.area}</p>
                      <p className="text-[14px] text-on-surface-variant leading-relaxed">{r.description}</p>
                      
                      <p className="text-[12px] text-outline pt-1">
                        Assigned Technician: <strong className="text-on-surface">{r.assignedProviderName || 'Not Assigned'}</strong>
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-outline-variant/30">
                      {/* Provider Assignment */}
                      {r.status === 'Requested' && (
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedProviderId}
                            onChange={(e) => setSelectedProviderId(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-outline-variant bg-surface text-[12px] font-semibold outline-none"
                          >
                            <option value="">Select Verified Provider...</option>
                            {verifiedProviders.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.name} ({p.service})
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssignProvider(r.requestId || r._id)}
                            disabled={!selectedProviderId || assigningId === (r.requestId || r._id)}
                            className="px-3 py-2 rounded-xl bg-primary text-on-primary text-[12px] font-semibold hover:bg-primary-container transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Assign
                          </button>
                        </div>
                      )}

                      {/* Status transitions */}
                      {r.status !== 'Completed' && r.status !== 'Requested' && (
                        <div className="flex items-center gap-2">
                          {r.status === 'Assigned' && (
                            <button
                              onClick={() => handleUpdateStatus(r.requestId || r._id, 'In Progress')}
                              className="px-4 py-2 rounded-xl bg-tertiary-container text-on-tertiary text-[12px] font-semibold hover:bg-tertiary transition-colors cursor-pointer"
                            >
                              Start Job
                            </button>
                          )}
                          {r.status === 'In Progress' && (
                            <button
                              onClick={() => handleUpdateStatus(r.requestId || r._id, 'Completed')}
                              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-[12px] font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                            >
                              Mark Completed
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Create Maintenance Request */}
        {activeTab === 'create' && (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 md:p-8 max-w-2xl shadow-sm">
            <h2 className="text-[20px] font-bold text-on-background mb-4">Create Commercial Maintenance Request</h2>

            {formMessage && (
              <div className={`p-3 rounded-xl mb-4 text-[13px] font-semibold ${
                formMessage.includes('successfully') ? 'bg-emerald-100 text-emerald-800' : 'bg-error-container/50 text-error'
              }`}>
                {formMessage}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1">Mall / Facility Name</label>
                <input
                  type="text"
                  value={requestForm.mallName}
                  onChange={(e) => setRequestForm({ ...requestForm, mallName: e.target.value })}
                  placeholder="e.g. Phoenix Marketcity"
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-background text-[14px] outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-on-surface mb-1">Floor</label>
                  <input
                    type="text"
                    value={requestForm.floor}
                    onChange={(e) => setRequestForm({ ...requestForm, floor: e.target.value })}
                    placeholder="e.g. 2nd Floor"
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-background text-[14px] outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-on-surface mb-1">Area / Unit Number</label>
                  <input
                    type="text"
                    value={requestForm.area}
                    onChange={(e) => setRequestForm({ ...requestForm, area: e.target.value })}
                    placeholder="e.g. Food Court — F24"
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-background text-[14px] outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-on-surface mb-1">Service Type</label>
                  <select
                    value={requestForm.serviceType}
                    onChange={(e) => setRequestForm({ ...requestForm, serviceType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-background text-[14px] outline-none focus:border-primary"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-on-surface mb-1">Priority</label>
                  <select
                    value={requestForm.priority}
                    onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-background text-[14px] outline-none focus:border-primary"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1">Problem Description</label>
                <textarea
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                  placeholder="Describe the commercial maintenance issue in detail..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-background text-[14px] outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={submittingRequest}
                className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary font-semibold text-[14px] hover:bg-primary transition-colors cursor-pointer disabled:opacity-50"
              >
                {submittingRequest ? 'Submitting Request...' : 'Submit Commercial Request'}
              </button>
            </form>
          </div>
        )}

      </div>
    </main>
  );
}

export default CommercialDashboard;

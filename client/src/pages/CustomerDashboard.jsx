import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Rating from '../components/Rating';

function CustomerDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');

  // Review modal state
  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch user's bookings
      const bookingsRes = await fetch('http://localhost:5001/api/bookings/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings(data);
      } else {
        setError('Unable to load bookings.');
      }

      // Fetch recommended providers
      const providersRes = await fetch('http://localhost:5001/api/providers');
      if (providersRes.ok) {
        const provData = await providersRes.json();
        setProviders(provData.slice(0, 4));
      }
    } catch (err) {
      console.error(err);
      setError('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const upcomingBooking = bookings.find((b) =>
    ['requested', 'accepted', 'in-progress', 'Booking Requested'].includes(b.status)
  );

  const filteredBookings = bookings.filter((b) => {
    const st = b.status === 'Booking Requested' ? 'requested' : b.status;
    if (filter === 'Upcoming') return ['requested', 'accepted', 'in-progress'].includes(st);
    if (filter === 'Completed') return st === 'completed';
    if (filter === 'Cancelled') return st === 'cancelled';
    return true;
  });

  const handleOpenReview = (booking) => {
    setReviewBooking(booking);
    setRating(5);
    setComment('');
    setReviewError('');
    setReviewSuccess('');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewBooking) return;
    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const res = await fetch('http://localhost:5001/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: reviewBooking.bookingId || reviewBooking._id,
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error || 'Failed to submit review');
        setSubmittingReview(false);
        return;
      }

      setReviewSuccess('Thank you! Your review has been submitted.');
      setTimeout(() => {
        setReviewBooking(null);
        fetchDashboardData();
      }, 1500);
    } catch (err) {
      setReviewError('Failed to connect to server');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (statusStr) => {
    const st = statusStr === 'Booking Requested' ? 'requested' : statusStr;
    switch (st) {
      case 'requested':
        return <span className="px-2.5 py-1 rounded-full text-[12px] font-semibold bg-secondary-container/30 text-secondary">Requested</span>;
      case 'accepted':
        return <span className="px-2.5 py-1 rounded-full text-[12px] font-semibold bg-primary-container/30 text-primary">Accepted</span>;
      case 'in-progress':
        return <span className="px-2.5 py-1 rounded-full text-[12px] font-semibold bg-tertiary-container/30 text-tertiary">In Progress</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-[12px] font-semibold bg-emerald-100 text-emerald-700">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-[12px] font-semibold bg-error-container/40 text-error">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[12px] font-semibold bg-surface-container text-on-surface-variant">{statusStr}</span>;
    }
  };

  if (loading) {
    return (
      <div className="pt-[72px] min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-on-surface-variant text-[14px]">Loading bookings...</p>
      </div>
    );
  }

  return (
    <main className="pt-[72px] min-h-screen bg-background pb-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 md:p-8 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-primary-fixed text-primary rounded-full text-[12px] font-semibold">Customer Dashboard</span>
            </div>
            <h1 className="text-[26px] md:text-[30px] font-bold text-on-background">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-on-surface-variant text-[14px] mt-1">
              Manage your bookings, track active services, and discover recommended providers.
            </p>
          </div>
          <Link
            to="/"
            className="self-start sm:self-center inline-flex items-center gap-2 bg-primary-container text-on-primary px-5 py-2.5 rounded-xl text-[14px] font-semibold hover:bg-primary transition-colors no-underline"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Book New Service
          </Link>
        </div>

        {error && (
          <div className="bg-error-container/50 border border-error/30 rounded-2xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="text-error text-[14px] font-medium">{error}</p>
          </div>
        )}

        {/* Upcoming Booking Card */}
        <div>
          <h2 className="text-[20px] font-bold text-on-background mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">schedule</span>
            Upcoming Booking
          </h2>
          {upcomingBooking ? (
            <div className="bg-surface-container-lowest border border-primary/30 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-primary-container/20 text-primary rounded-2xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[32px]">handyman</span>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[13px] font-mono text-outline font-semibold">#{upcomingBooking.bookingId}</span>
                    {getStatusBadge(upcomingBooking.status)}
                  </div>
                  <h3 className="text-[20px] font-bold text-on-background">{upcomingBooking.selectedService}</h3>
                  <p className="text-[14px] text-on-surface-variant mt-1 leading-relaxed">{upcomingBooking.description}</p>
                  
                  <div className="flex flex-wrap gap-4 mt-3 text-[13px] text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
                      {upcomingBooking.date || 'Today'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                      {upcomingBooking.timeSlot || 'As soon as possible'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                      {upcomingBooking.location?.city || 'Pune'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-between gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-outline-variant/30">
                <div className="text-left md:text-right">
                  <span className="text-[12px] text-on-surface-variant font-medium block">Est. Price</span>
                  <span className="text-[20px] font-bold text-primary">₹{upcomingBooking.estimatedPrice || 499}</span>
                </div>
                <Link
                  to={`/bookings/${upcomingBooking.bookingId || upcomingBooking._id}`}
                  className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-[14px] font-semibold hover:bg-primary-container transition-colors no-underline"
                >
                  Track Booking
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 text-center">
              <span className="material-symbols-outlined text-[48px] text-outline mb-2">event_available</span>
              <h3 className="text-[16px] font-semibold text-on-surface">No upcoming bookings</h3>
              <p className="text-[13px] text-on-surface-variant mt-1 mb-4">You don't have any active service requests at the moment.</p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-primary font-semibold text-[14px] hover:underline no-underline"
              >
                Browse Services & Book Now →
              </Link>
            </div>
          )}
        </div>

        {/* Recent Services / Service History */}
        <div id="history">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-[20px] font-bold text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history</span>
              Service History
            </h2>

            {/* Filter Tabs */}
            <div className="flex bg-surface-container p-1 rounded-xl gap-1 self-start">
              {['All', 'Upcoming', 'Completed', 'Cancelled'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                    filter === tab
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 text-center">
              <span className="material-symbols-outlined text-[48px] text-outline mb-2">inbox</span>
              <h3 className="text-[16px] font-semibold text-on-surface">No bookings found</h3>
              <p className="text-[13px] text-on-surface-variant mt-1">No bookings match the selected filter option.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredBookings.map((b) => {
                const st = b.status === 'Booking Requested' ? 'requested' : b.status;
                return (
                  <div
                    key={b._id || b.bookingId}
                    className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 hover:border-primary/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-[24px]">build</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[12px] font-mono text-outline font-semibold">#{b.bookingId}</span>
                          {getStatusBadge(b.status)}
                        </div>
                        <h4 className="text-[16px] font-bold text-on-background">{b.selectedService}</h4>
                        <p className="text-[13px] text-on-surface-variant line-clamp-1">{b.description}</p>
                        <p className="text-[12px] text-outline mt-1">
                          Date: {b.date || 'Today'} • Time: {b.timeSlot || 'Standard'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-outline-variant/20">
                      <span className="text-[16px] font-bold text-on-background">₹{b.estimatedPrice || 499}</span>
                      
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/bookings/${b.bookingId || b._id}`}
                          className="px-3.5 py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high text-[13px] font-semibold transition-colors no-underline"
                        >
                          Details
                        </Link>
                        
                        {st === 'completed' && (
                          <button
                            onClick={() => handleOpenReview(b)}
                            className="px-3.5 py-2 rounded-xl bg-primary-container text-on-primary hover:bg-primary text-[13px] font-semibold transition-colors cursor-pointer"
                          >
                            Submit Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recommended Providers */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[20px] font-bold text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">verified</span>
              Recommended Providers
            </h2>
            <Link to="/services/electrician" className="text-[13px] font-semibold text-primary hover:underline no-underline">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {providers.map((p) => (
              <div key={p.slug || p._id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 flex flex-col justify-between hover:border-primary/50 transition-all shadow-2xs">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center font-bold text-on-primary text-[16px]">
                      {p.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-on-background truncate">{p.name}</h4>
                      <p className="text-[12px] text-on-surface-variant">{p.service}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Rating value={p.rating || 5.0} />
                    <span className="text-[12px] text-on-surface-variant font-medium">({p.reviewCount || 0})</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20 mt-2">
                  <span className="text-[14px] font-bold text-primary">₹{p.startingPrice || p.pricing || 499}</span>
                  <Link
                    to={`/book/${p.slug}`}
                    className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary text-[12px] font-semibold hover:bg-primary transition-colors no-underline"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Review Modal */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl max-w-md w-full p-6 shadow-xl relative">
            <button
              onClick={() => setReviewBooking(null)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-[20px] font-bold text-on-background mb-1">Write a Review</h3>
            <p className="text-[13px] text-on-surface-variant mb-4">
              Share your experience for {reviewBooking.selectedService} (Booking #{reviewBooking.bookingId})
            </p>

            {reviewError && (
              <div className="bg-error-container/50 border border-error/30 rounded-xl p-3 mb-4 text-[13px] text-error">
                {reviewError}
              </div>
            )}

            {reviewSuccess && (
              <div className="bg-emerald-100 border border-emerald-300 rounded-xl p-3 mb-4 text-[13px] text-emerald-800 font-medium">
                {reviewSuccess}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="cursor-pointer text-[28px] focus:outline-none"
                    >
                      <span className={star <= rating ? 'text-amber-400' : 'text-outline-variant'}>★</span>
                    </button>
                  ))}
                  <span className="text-[14px] font-bold text-on-surface ml-2">{rating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the service provided?"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-background text-[14px] outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewBooking(null)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/50 text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary text-[13px] font-semibold hover:bg-primary transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default CustomerDashboard;

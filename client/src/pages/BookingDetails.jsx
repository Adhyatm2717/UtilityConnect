import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Rating from '../components/Rating';

const STATUSES = ['requested', 'accepted', 'in-progress', 'completed'];

function BookingDetails() {
  const { id } = useParams();
  const { token, user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [provider, setProvider] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review submission state for customer
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchBooking = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:5001/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || 'Failed to load booking details');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setBooking(data);

      // Fetch provider details if available
      if (data.providerSlug || data.providerId) {
        const pRes = await fetch(`http://localhost:5001/api/providers/${data.providerSlug || data.providerId}`);
        if (pRes.ok) {
          const pData = await pRes.json();
          setProvider(pData);
        }
      }

      // Fetch existing review if completed
      const rRes = await fetch(`http://localhost:5001/api/reviews/booking/${data.bookingId || data._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (rRes.ok) {
        const rData = await rRes.json();
        if (rData) setReview(rData);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && id) {
      fetchBooking();
    }
  }, [token, id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!booking) return;
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
          bookingId: booking.bookingId || booking._id,
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

      setReviewSuccess('Thank you! Your review has been saved.');
      setReview(data);
    } catch (err) {
      setReviewError('Unable to connect to server');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-[72px] min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-on-surface-variant text-[14px]">Loading booking details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="pt-[72px] min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <span className="material-symbols-outlined text-[64px] text-error mb-2">error</span>
        <h2 className="text-[20px] font-bold text-on-background">{error || 'Booking not found'}</h2>
        <Link to="/" className="mt-4 text-primary hover:underline text-[14px] font-semibold">
          ← Back to Home
        </Link>
      </div>
    );
  }

  const currentStatus = booking.status === 'Booking Requested' ? 'requested' : booking.status;
  const currentStepIndex = STATUSES.indexOf(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  return (
    <main className="pt-[72px] min-h-screen bg-background pb-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">

        {/* Back Link */}
        <Link
          to={user?.role === 'provider' ? '/provider/dashboard' : '/customer/dashboard'}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline self-start no-underline"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Dashboard
        </Link>

        {/* Header Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-mono text-outline font-bold">Booking #{booking.bookingId}</span>
              </div>
              <h1 className="text-[24px] md:text-[28px] font-bold text-on-background">{booking.selectedService}</h1>
              <p className="text-[14px] text-on-surface-variant mt-1">Booked on {new Date(booking.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[12px] text-on-surface-variant font-medium block">Estimated Price</span>
              <span className="text-[24px] font-bold text-primary">₹{booking.estimatedPrice || 499}</span>
            </div>
          </div>

          {/* Status Tracker / Timeline */}
          <div className="mb-6">
            <h3 className="text-[14px] font-bold text-on-surface uppercase tracking-wider mb-6">Booking Status Tracker</h3>

            {isCancelled ? (
              <div className="bg-error-container/40 border border-error/30 rounded-2xl p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-error text-[24px]">cancel</span>
                <div>
                  <h4 className="text-[15px] font-bold text-error">Booking Cancelled</h4>
                  <p className="text-[13px] text-on-surface-variant">This service request has been rejected or cancelled.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
                {STATUSES.map((st, index) => {
                  const isDone = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const labels = {
                    requested: 'Requested',
                    accepted: 'Accepted',
                    'in-progress': 'In Progress',
                    completed: 'Completed',
                  };
                  const icons = {
                    requested: 'pending',
                    accepted: 'check_circle',
                    'in-progress': 'engineering',
                    completed: 'verified',
                  };

                  return (
                    <div
                      key={st}
                      className={`flex flex-col items-center p-4 rounded-2xl border text-center transition-all ${
                        isCurrent
                          ? 'bg-primary-container/20 border-primary text-primary shadow-xs'
                          : isDone
                          ? 'bg-surface-container border-outline-variant text-on-surface'
                          : 'bg-surface-container-low border-outline-variant/30 text-outline'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 font-bold ${
                          isDone ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-outline'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">{icons[st]}</span>
                      </div>
                      <span className="text-[13px] font-bold">{labels[st]}</span>
                      {isCurrent && <span className="text-[11px] font-medium text-primary mt-0.5">Current Status</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service & Location Info */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-[16px] font-bold text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              Service Details
            </h3>

            <div className="space-y-3 text-[14px]">
              <div>
                <span className="text-[12px] text-on-surface-variant font-semibold block uppercase tracking-wider">Problem Description</span>
                <p className="text-on-surface mt-0.5 font-medium leading-relaxed">{booking.description}</p>
              </div>

              <div className="pt-2 border-t border-outline-variant/20">
                <span className="text-[12px] text-on-surface-variant font-semibold block uppercase tracking-wider">Schedule</span>
                <p className="text-on-surface font-medium">Date: {booking.date || 'Today'}</p>
                <p className="text-on-surface font-medium">Time: {booking.timeSlot || booking.scheduledTime || 'Standard Slot'}</p>
              </div>

              <div className="pt-2 border-t border-outline-variant/20">
                <span className="text-[12px] text-on-surface-variant font-semibold block uppercase tracking-wider">Location</span>
                <p className="text-on-surface font-medium">
                  {[booking.location?.address, booking.location?.area, booking.location?.city, booking.location?.pin].filter(Boolean).join(', ') || 'Customer address'}
                </p>
              </div>
            </div>
          </div>

          {/* Provider Card Info */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-[16px] font-bold text-on-background flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">person</span>
                Assigned Provider
              </h3>

              {provider ? (
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-primary-container text-on-primary rounded-2xl flex items-center justify-center font-bold text-[20px] shrink-0">
                    {provider.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h4 className="text-[18px] font-bold text-on-background">{provider.name}</h4>
                    <p className="text-[13px] text-on-surface-variant font-medium">{provider.service}</p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Rating value={provider.rating || 5.0} />
                      <span className="text-[13px] font-semibold text-on-surface">({provider.reviewCount || 0} reviews)</span>
                    </div>

                    <p className="text-[13px] text-on-surface-variant mt-2 leading-relaxed">{provider.about || 'Verified utility service professional.'}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[14px] text-on-surface font-medium">Provider details assigned to this booking.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Review Section */}
        {currentStatus === 'completed' && (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 shadow-sm">
            <h3 className="text-[18px] font-bold text-on-background mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">star</span>
              Service Review
            </h3>

            {review ? (
              <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <Rating value={review.rating} />
                  <span className="text-[12px] text-outline">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-[14px] text-on-surface font-medium">{review.comment || 'No comment provided.'}</p>
              </div>
            ) : user?.role === 'customer' ? (
              <form onSubmit={handleSubmitReview} className="space-y-4 max-w-lg">
                {reviewError && (
                  <div className="bg-error-container/50 border border-error/30 rounded-xl p-3 text-[13px] text-error">
                    {reviewError}
                  </div>
                )}
                {reviewSuccess && (
                  <div className="bg-emerald-100 border border-emerald-300 rounded-xl p-3 text-[13px] text-emerald-800 font-medium">
                    {reviewSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-[13px] font-medium text-on-surface mb-1.5">Rating</label>
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
                    placeholder="Write a comment about the service experience..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-background text-[14px] outline-none focus:border-primary transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary text-[14px] font-semibold hover:bg-primary transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <p className="text-[13px] text-on-surface-variant font-medium">Awaiting customer review.</p>
            )}
          </div>
        )}

      </div>
    </main>
  );
}

export default BookingDetails;

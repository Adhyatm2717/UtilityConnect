import { Link } from 'react-router-dom';

function StepConfirmation({ booking, provider }) {
  // Format the time slot label
  function formatTime(timeValue) {
    if (!timeValue) return 'As soon as possible';
    const [h] = timeValue.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${display}:00 ${suffix}`;
  }

  // Format the date
  function formatDate(dateStr) {
    if (!dateStr) return 'Today';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  }

  const details = [
    { icon: 'confirmation_number', label: 'Booking ID', value: booking.bookingId },
    { icon: 'person', label: 'Provider', value: provider.name },
    { icon: 'handyman', label: 'Service', value: booking.selectedService },
    {
      icon: 'calendar_today',
      label: 'Date & Time',
      value: booking.scheduleType === 'now'
        ? 'Today — As soon as possible'
        : `${formatDate(booking.date)} — ${formatTime(booking.timeSlot)}`,
    },
    {
      icon: 'location_on',
      label: 'Location',
      value: [booking.location.address, booking.location.area, booking.location.city, booking.location.pin]
        .filter(Boolean)
        .join(', '),
    },
  ];

  return (
    <div className="flex flex-col gap-6 items-center">

      {/* Success Animation */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="w-20 h-20 rounded-full bg-secondary/15 flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full bg-secondary/10 animate-ping" />
          <span
            className="material-symbols-outlined text-secondary text-[40px] relative z-10"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            check_circle
          </span>
        </div>
        <div className="text-center">
          <h2 className="text-[24px] font-bold text-on-surface">Booking Confirmed!</h2>
          <p className="text-[14px] text-on-surface-variant mt-1">Your service request has been submitted successfully.</p>
        </div>
      </div>

      {/* Booking Details Card */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 w-full max-w-lg">

        {/* Status Badge */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 bg-secondary-container/20 text-secondary px-4 py-2 rounded-full">
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              pending
            </span>
            <span className="text-[14px] font-semibold">Booking Requested</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col divide-y divide-surface-container">
          {details.map((item) => (
            <div key={item.label} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wide mb-0.5">{item.label}</p>
                <p className="text-[14px] text-on-surface font-medium break-words">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Provider Contact Note */}
      <div className="flex items-start gap-3 bg-surface-container-low rounded-xl p-4 border border-outline-variant/50 w-full max-w-lg">
        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">info</span>
        <p className="text-[13px] text-on-surface-variant leading-relaxed">
          The provider will review your request and confirm shortly. You will receive a status update once they accept.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
        <Link
          to="/"
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-on-primary py-3 px-6 rounded-xl text-[14px] font-medium no-underline hover:bg-primary-container transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          Back to Home
        </Link>
        <Link
          to={`/providers/${provider.slug}`}
          className="flex-1 flex items-center justify-center gap-2 bg-surface-container-low text-primary py-3 px-6 rounded-xl text-[14px] font-medium no-underline border border-outline-variant hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">person</span>
          View Provider
        </Link>
      </div>
    </div>
  );
}

export default StepConfirmation;

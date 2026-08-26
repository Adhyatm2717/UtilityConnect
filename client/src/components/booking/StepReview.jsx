function StepReview({ provider, bookingData }) {
  const selectedSvc = provider.services.find((s) => s.name === bookingData.selectedService);
  const price = selectedSvc ? selectedSvc.price : provider.startingPrice;

  // Format the time slot label
  function formatTime(timeValue) {
    if (!timeValue) return '';
    const [h] = timeValue.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${display}:00 ${suffix}`;
  }

  // Format the date
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  const reviewItems = [
    {
      icon: 'handyman',
      label: 'Service',
      value: bookingData.selectedService,
    },
    {
      icon: 'person',
      label: 'Provider',
      value: provider.name,
    },
    {
      icon: 'description',
      label: 'Problem',
      value: bookingData.description,
    },
    {
      icon: 'location_on',
      label: 'Location',
      value: [
        bookingData.location.address,
        bookingData.location.area,
        bookingData.location.city,
        bookingData.location.pin,
      ]
        .filter(Boolean)
        .join(', '),
    },
    {
      icon: 'calendar_today',
      label: 'Date',
      value: bookingData.scheduleType === 'now' ? 'Today (Immediate)' : formatDate(bookingData.date),
    },
    {
      icon: 'schedule',
      label: 'Time',
      value: bookingData.scheduleType === 'now' ? 'As soon as possible' : formatTime(bookingData.timeSlot),
    },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* Review Summary */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
        <h3 className="text-[18px] font-semibold text-on-surface mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">fact_check</span>
          Review Your Booking
        </h3>

        <div className="flex flex-col divide-y divide-surface-container">
          {reviewItems.map((item) => (
            <div key={item.label} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wide mb-1">{item.label}</p>
                <p className="text-[15px] text-on-surface leading-relaxed break-words">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attached Photos */}
      {bookingData.images.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
          <h4 className="text-[14px] font-medium text-on-surface-variant mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">photo_library</span>
            Attached Photos ({bookingData.images.length})
          </h4>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {bookingData.images.map((img, i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden border border-outline-variant">
                <img src={img.preview} alt={img.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estimated Price */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[14px] text-on-surface-variant">Estimated Price</p>
            <p className="text-[28px] font-bold text-primary mt-1">₹{price}</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[28px]">payments</span>
          </div>
        </div>
        <p className="text-[13px] text-on-surface-variant mt-3 border-t border-surface-container pt-3">
          Final price may vary based on the scope of work and materials required.
        </p>
      </div>

      {/* Payment Note */}
      <div className="flex items-start gap-3 bg-secondary-container/15 rounded-xl p-4 border border-secondary/20">
        <span
          className="material-symbols-outlined text-secondary text-[20px] mt-0.5"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
        >
          account_balance_wallet
        </span>
        <p className="text-[14px] text-on-surface leading-relaxed">
          <strong>Payment will be handled directly with the service provider.</strong>
          <br />
          <span className="text-on-surface-variant text-[13px]">
            No online payment is required at this time.
          </span>
        </p>
      </div>
    </div>
  );
}

export default StepReview;

import Rating from '../Rating';

function StepService({ provider, selectedService, onServiceChange }) {
  return (
    <div className="flex flex-col gap-6">

      {/* Provider Info Card */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-surface-container">
            <img src={provider.image} alt={provider.name} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[18px] font-semibold text-on-surface truncate">{provider.name}</h3>
              {provider.verified && (
                <span
                  className="material-symbols-outlined text-primary text-[20px] shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}
                  title="Verified Professional"
                >
                  verified
                </span>
              )}
            </div>
            <p className="text-[14px] text-on-surface-variant">{provider.service} · {provider.location}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <Rating value={provider.rating} />
              <span className="text-[13px] font-semibold text-on-surface">{provider.rating}</span>
              <span className="text-[13px] text-on-surface-variant">({provider.reviewCount} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Service Selection */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
        <h3 className="text-[18px] font-semibold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">handyman</span>
          Select a Service
        </h3>

        <div className="flex flex-col gap-3">
          {provider.services.map((svc) => (
            <label
              key={svc.name}
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                selectedService === svc.name
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-outline-variant hover:border-primary/40 hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedService === svc.name ? 'border-primary' : 'border-outline'
                }`}>
                  {selectedService === svc.name && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-[15px] text-on-surface font-medium">{svc.name}</span>
              </div>
              <span className="text-[15px] font-bold text-primary">₹{svc.price}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Starting Price Note */}
      <div className="flex items-start gap-3 bg-surface-container-low rounded-xl p-4 border border-outline-variant/50">
        <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">info</span>
        <p className="text-[13px] text-on-surface-variant leading-relaxed">
          Starting price is <strong className="text-on-surface">₹{provider.startingPrice}</strong>. Final price may vary based on the scope of work and materials required.
        </p>
      </div>
    </div>
  );
}

export default StepService;

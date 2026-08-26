function StepLocation({ location, onLocationChange }) {
  function handleChange(field, value) {
    onLocationChange({ ...location, [field]: value });
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Location Form */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
        <h3 className="text-[18px] font-semibold text-on-surface mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">location_on</span>
          Service Location
        </h3>
        <p className="text-[13px] text-on-surface-variant mb-5">
          Where should the service provider visit?
        </p>

        <div className="flex flex-col gap-4">
          {/* Address */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="booking-address" className="text-[14px] font-medium text-on-surface">
              Address <span className="text-error">*</span>
            </label>
            <input
              id="booking-address"
              type="text"
              value={location.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Flat no., building name, street"
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-[14px] text-on-surface placeholder:text-outline focus:border-primary outline-none transition-colors"
            />
          </div>

          {/* Area */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="booking-area" className="text-[14px] font-medium text-on-surface">
              Area / Locality <span className="text-error">*</span>
            </label>
            <input
              id="booking-area"
              type="text"
              value={location.area}
              onChange={(e) => handleChange('area', e.target.value)}
              placeholder="E.g., Koregaon Park, Baner, Kothrud"
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-[14px] text-on-surface placeholder:text-outline focus:border-primary outline-none transition-colors"
            />
          </div>

          {/* City + PIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="booking-city" className="text-[14px] font-medium text-on-surface">
                City <span className="text-error">*</span>
              </label>
              <input
                id="booking-city"
                type="text"
                value={location.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="City name"
                className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-[14px] text-on-surface placeholder:text-outline focus:border-primary outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="booking-pin" className="text-[14px] font-medium text-on-surface">
                PIN Code <span className="text-error">*</span>
              </label>
              <input
                id="booking-pin"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={location.pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  handleChange('pin', val);
                }}
                placeholder="6-digit PIN"
                className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 text-[14px] text-on-surface placeholder:text-outline focus:border-primary outline-none transition-colors"
              />
              {location.pin.length > 0 && location.pin.length < 6 && (
                <p className="text-[12px] text-error">PIN code must be 6 digits</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        <div className="h-48 md:h-56 bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-highest relative flex items-center justify-center">
          {/* Grid lines to simulate map */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: 'linear-gradient(rgba(0,74,198,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,74,198,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />
          </div>

          {/* Location Pin */}
          <div className="flex flex-col items-center gap-2 z-10">
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center animate-pulse">
              <span
                className="material-symbols-outlined text-primary text-[32px]"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                location_on
              </span>
            </div>
            {location.area || location.city ? (
              <div className="bg-surface-container-lowest/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-outline-variant shadow-sm">
                <p className="text-[13px] font-medium text-on-surface text-center">
                  {[location.area, location.city].filter(Boolean).join(', ')}
                </p>
              </div>
            ) : (
              <p className="text-[13px] text-on-surface-variant">Enter your address above</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StepLocation;

function StepSchedule({ scheduleType, onScheduleTypeChange, date, onDateChange, timeSlot, onTimeSlotChange }) {
  // Generate today and tomorrow dates for min attribute
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Time slots from 9 AM to 6 PM
  const timeSlots = [
    { label: '9:00 AM', value: '09:00' },
    { label: '10:00 AM', value: '10:00' },
    { label: '11:00 AM', value: '11:00' },
    { label: '12:00 PM', value: '12:00' },
    { label: '1:00 PM', value: '13:00' },
    { label: '2:00 PM', value: '14:00' },
    { label: '3:00 PM', value: '15:00' },
    { label: '4:00 PM', value: '16:00' },
    { label: '5:00 PM', value: '17:00' },
    { label: '6:00 PM', value: '18:00' },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* Schedule Type Selection */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
        <h3 className="text-[18px] font-semibold text-on-surface mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">calendar_today</span>
          When do you need the service?
        </h3>
        <p className="text-[13px] text-on-surface-variant mb-5">
          Choose a time that works best for you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Book Now */}
          <button
            onClick={() => onScheduleTypeChange('now')}
            className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              scheduleType === 'now'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-outline-variant hover:border-primary/40 hover:bg-surface-container-low'
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              scheduleType === 'now' ? 'bg-primary/15' : 'bg-surface-container'
            }`}>
              <span className={`material-symbols-outlined text-[28px] ${
                scheduleType === 'now' ? 'text-primary' : 'text-on-surface-variant'
              }`}
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                bolt
              </span>
            </div>
            <div className="text-center">
              <p className={`text-[16px] font-semibold ${scheduleType === 'now' ? 'text-primary' : 'text-on-surface'}`}>
                Book Now
              </p>
              <p className="text-[13px] text-on-surface-variant mt-1">
                Request immediate service
              </p>
            </div>
          </button>

          {/* Schedule for Later */}
          <button
            onClick={() => onScheduleTypeChange('later')}
            className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              scheduleType === 'later'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-outline-variant hover:border-primary/40 hover:bg-surface-container-low'
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              scheduleType === 'later' ? 'bg-primary/15' : 'bg-surface-container'
            }`}>
              <span className={`material-symbols-outlined text-[28px] ${
                scheduleType === 'later' ? 'text-primary' : 'text-on-surface-variant'
              }`}
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                schedule
              </span>
            </div>
            <div className="text-center">
              <p className={`text-[16px] font-semibold ${scheduleType === 'later' ? 'text-primary' : 'text-on-surface'}`}>
                Schedule for Later
              </p>
              <p className="text-[13px] text-on-surface-variant mt-1">
                Pick a date & time slot
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Date & Time Picker — shown only for 'later' */}
      {scheduleType === 'later' && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col gap-6">

          {/* Date Picker */}
          <div className="flex flex-col gap-2">
            <label htmlFor="booking-date" className="text-[14px] font-medium text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">event</span>
              Select Date <span className="text-error">*</span>
            </label>
            <input
              id="booking-date"
              type="date"
              value={date}
              min={todayStr}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full sm:w-auto bg-surface border border-outline-variant rounded-xl px-4 py-3 text-[14px] text-on-surface focus:border-primary outline-none transition-colors cursor-pointer"
            />
          </div>

          {/* Time Slot Grid */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
              Select Time Slot <span className="text-error">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.value}
                  onClick={() => onTimeSlotChange(slot.value)}
                  className={`py-3 px-2 rounded-xl text-[13px] font-medium border cursor-pointer transition-all duration-200 ${
                    timeSlot === slot.value
                      ? 'border-primary bg-primary text-on-primary shadow-sm'
                      : 'border-outline-variant text-on-surface-variant hover:border-primary/40 hover:bg-surface-container-low'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Book Now info */}
      {scheduleType === 'now' && (
        <div className="flex items-start gap-3 bg-secondary-container/15 rounded-xl p-4 border border-secondary/20">
          <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">info</span>
          <p className="text-[13px] text-on-surface-variant leading-relaxed">
            Your booking request will be sent immediately. The provider will confirm availability and respond within <strong className="text-on-surface">1 hour</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

export default StepSchedule;

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import providers from '../data/providers';
import StepService from '../components/booking/StepService';
import StepProblem from '../components/booking/StepProblem';
import StepLocation from '../components/booking/StepLocation';
import StepSchedule from '../components/booking/StepSchedule';
import StepReview from '../components/booking/StepReview';
import StepConfirmation from '../components/booking/StepConfirmation';

const STEPS = [
  { key: 'service', label: 'Service', icon: 'handyman' },
  { key: 'problem', label: 'Problem', icon: 'description' },
  { key: 'location', label: 'Location', icon: 'location_on' },
  { key: 'schedule', label: 'Schedule', icon: 'calendar_today' },
  { key: 'review', label: 'Review', icon: 'fact_check' },
  { key: 'confirm', label: 'Confirmed', icon: 'check_circle' },
];

function BookingFlow() {
  const { slug } = useParams();
  const provider = providers.find((p) => p.slug === slug);

  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState([]);

  // Booking state
  const [selectedService, setSelectedService] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState({ address: '', area: '', city: 'Pune', pin: '' });
  const [scheduleType, setScheduleType] = useState('now');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [bookingResult, setBookingResult] = useState(null);

  // Pre-select first service when provider loads
  if (provider && !selectedService && provider.services.length > 0) {
    setSelectedService(provider.services[0].name);
  }

  // Provider not found
  if (!provider) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-[72px]">
        <span className="material-symbols-outlined text-[64px] text-outline-variant">person_off</span>
        <h1 className="text-[24px] font-semibold text-on-surface mt-4">Provider not found</h1>
        <Link to="/" className="mt-4 text-primary hover:underline text-[14px]">
          ← Back to Home
        </Link>
      </div>
    );
  }

  // Validation per step
  function validate() {
    const errs = [];

    switch (currentStep) {
      case 0: // Service
        if (!selectedService) errs.push('Please select a service.');
        break;
      case 1: // Problem
        if (description.trim().length < 10) errs.push('Problem description must be at least 10 characters.');
        break;
      case 2: // Location
        if (!location.address.trim()) errs.push('Address is required.');
        if (!location.area.trim()) errs.push('Area is required.');
        if (!location.city.trim()) errs.push('City is required.');
        if (location.pin.length !== 6) errs.push('PIN code must be exactly 6 digits.');
        break;
      case 3: // Schedule
        if (!scheduleType) errs.push('Please select a schedule type.');
        if (scheduleType === 'later') {
          if (!date) errs.push('Please select a date.');
          if (!timeSlot) errs.push('Please select a time slot.');
        }
        break;
      default:
        break;
    }

    setErrors(errs);
    return errs.length === 0;
  }

  function handleNext() {
    if (!validate()) return;

    if (currentStep === 4) {
      // Review → Confirm: generate booking
      const bookingId = 'UC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const booking = {
        bookingId,
        providerId: provider.id,
        providerSlug: provider.slug,
        selectedService,
        description,
        images: images.map((img) => ({ name: img.name, preview: img.preview })),
        location,
        scheduleType,
        date: scheduleType === 'now' ? new Date().toISOString().split('T')[0] : date,
        timeSlot: scheduleType === 'now' ? null : timeSlot,
        status: 'Booking Requested',
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage
      try {
        const existing = JSON.parse(localStorage.getItem('uc_bookings') || '[]');
        existing.push(booking);
        localStorage.setItem('uc_bookings', JSON.stringify(existing));
      } catch {
        // Silently fail if storage is unavailable
      }

      setBookingResult(booking);
      setCurrentStep(5);
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }

    setErrors([]);
    // Scroll to top on step change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBack() {
    setErrors([]);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Build the bookingData object for review
  const bookingData = {
    selectedService,
    description,
    images,
    location,
    scheduleType,
    date,
    timeSlot,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pt-[72px]">
      <main className="w-full max-w-[720px] mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">

        {/* Back to Provider Link */}
        {currentStep < 5 && (
          <Link
            to={`/providers/${provider.slug}`}
            className="text-[13px] text-primary hover:underline flex items-center gap-1 no-underline self-start"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to {provider.name}
          </Link>
        )}

        {/* Page Title */}
        {currentStep < 5 && (
          <div>
            <h1 className="text-[24px] md:text-[28px] font-bold text-on-surface leading-tight">
              Book a Service
            </h1>
            <p className="text-[14px] text-on-surface-variant mt-1">
              {provider.service} with {provider.name}
            </p>
          </div>
        )}

        {/* Step Progress Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {STEPS.map((step, index) => (
            <div key={step.key} className="flex items-center gap-1 flex-shrink-0">
              {/* Step Circle */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-300 ${
                    index < currentStep
                      ? 'bg-secondary text-on-secondary'
                      : index === currentStep
                        ? 'bg-primary text-on-primary shadow-md'
                        : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {index < currentStep ? (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-[12px] font-medium hidden sm:inline whitespace-nowrap transition-colors ${
                    index <= currentStep ? 'text-on-surface' : 'text-on-surface-variant'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`w-6 md:w-10 h-[2px] rounded-full transition-colors duration-300 ${
                    index < currentStep ? 'bg-secondary' : 'bg-outline-variant'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Validation Errors */}
        {errors.length > 0 && (
          <div className="bg-error-container rounded-xl p-4 border border-error/20 flex items-start gap-3">
            <span className="material-symbols-outlined text-error text-[20px] mt-0.5 shrink-0">error</span>
            <div>
              {errors.map((err, i) => (
                <p key={i} className="text-[13px] text-error leading-relaxed">{err}</p>
              ))}
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="min-h-[300px]">
          {currentStep === 0 && (
            <StepService
              provider={provider}
              selectedService={selectedService}
              onServiceChange={setSelectedService}
            />
          )}
          {currentStep === 1 && (
            <StepProblem
              description={description}
              onDescriptionChange={setDescription}
              images={images}
              onImagesChange={setImages}
            />
          )}
          {currentStep === 2 && (
            <StepLocation
              location={location}
              onLocationChange={setLocation}
            />
          )}
          {currentStep === 3 && (
            <StepSchedule
              scheduleType={scheduleType}
              onScheduleTypeChange={setScheduleType}
              date={date}
              onDateChange={setDate}
              timeSlot={timeSlot}
              onTimeSlotChange={setTimeSlot}
            />
          )}
          {currentStep === 4 && (
            <StepReview
              provider={provider}
              bookingData={bookingData}
            />
          )}
          {currentStep === 5 && bookingResult && (
            <StepConfirmation
              booking={bookingResult}
              provider={provider}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex justify-between items-center pt-4 border-t border-outline-variant/50">
            {currentStep > 0 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-[14px] font-medium text-on-surface-variant hover:text-on-surface px-4 py-2.5 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-primary text-on-primary text-[14px] font-medium px-6 py-2.5 rounded-xl hover:bg-primary-container transition-colors cursor-pointer shadow-sm"
            >
              {currentStep === 4 ? (
                <>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Confirm Booking
                </>
              ) : (
                <>
                  Next
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

export default BookingFlow;

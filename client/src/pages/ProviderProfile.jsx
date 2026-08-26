import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Rating from '../components/Rating';

function ProviderProfile() {
  const { slug } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5001/api/providers/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Provider not found');
        return res.json();
      })
      .then(data => {
        setProvider(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch provider:', err);
        setProvider(null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-[72px]">
        <h1 className="text-[20px] font-semibold text-on-surface mt-4">Loading provider...</h1>
      </div>
    );
  }

  // If no provider found, show a not-found message
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

  return (
    <div className="min-h-screen bg-background flex flex-col pt-[72px]">
      <main className="w-full max-w-[1200px] mx-auto px-4 md:px-10 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* Left Column — Profile Content (8 cols) */}
        <div className="md:col-span-8 flex flex-col gap-6">

          {/* Header / Banner Card */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
            {/* Banner */}
            <div className="h-36 md:h-48 w-full bg-gradient-to-r from-surface-container-high to-surface-container-highest relative">
              <div className="absolute inset-0 bg-primary/5" />
            </div>

            {/* Avatar + Name */}
            <div className="px-6 pb-6 relative pt-14">
              {/* Avatar */}
              <div className="absolute -top-12 left-6 w-24 h-24 rounded-full border-4 border-surface-container-lowest overflow-hidden bg-surface-container">
                <img src={provider.image} alt={provider.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-[24px] md:text-[28px] font-bold text-on-surface">{provider.name}</h1>
                    {provider.verified && (
                      <span
                        className="material-symbols-outlined text-primary text-[22px]"
                        style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}
                        title="Verified Professional"
                      >
                        verified
                      </span>
                    )}
                  </div>
                  <p className="text-[16px] text-on-surface-variant">{provider.service} · {provider.location}</p>
                </div>

                {/* Stats Chips */}
                <div className="flex gap-3 flex-wrap">
                  <div className="flex items-center gap-1 bg-surface-container py-2 px-3 rounded-lg">
                    <span
                      className="material-symbols-outlined text-tertiary-container text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}
                    >
                      star
                    </span>
                    <span className="text-[14px] font-bold text-on-surface">{provider.rating}</span>
                    <span className="text-[13px] text-on-surface-variant">({provider.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 bg-surface-container py-2 px-3 rounded-lg">
                    <span className="material-symbols-outlined text-secondary text-[18px]">task_alt</span>
                    <span className="text-[14px] font-bold text-on-surface">{provider.experience} yrs</span>
                    <span className="text-[13px] text-on-surface-variant">experience</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
            <h2 className="text-[20px] font-semibold text-on-surface mb-3">About</h2>
            <p className="text-[15px] text-on-surface-variant leading-relaxed">{provider.about}</p>
          </section>

          {/* Skills Section */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
            <h2 className="text-[20px] font-semibold text-on-surface mb-4">Specialized Skills</h2>
            <div className="flex flex-wrap gap-2">
              {provider.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 rounded-full bg-surface-container-low border border-outline-variant text-[13px] font-medium text-on-surface-variant"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Services & Pricing */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
            <h2 className="text-[20px] font-semibold text-on-surface mb-4">Services & Pricing</h2>
            <div className="flex flex-col divide-y divide-surface-container">
              {provider.services.map((svc) => (
                <div key={svc.name} className="flex justify-between items-center py-3">
                  <span className="text-[15px] text-on-surface">{svc.name}</span>
                  <span className="text-[15px] font-semibold text-primary">₹{svc.price}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Reviews Section */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
            <h2 className="text-[20px] font-semibold text-on-surface mb-5">Client Reviews</h2>
            <div className="flex flex-col gap-5">
              {provider.reviews.map((review, index) => (
                <div
                  key={index}
                  className={`flex flex-col gap-2 ${index < provider.reviews.length - 1 ? 'pb-5 border-b border-surface-container' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {/* Initials Avatar */}
                      <div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center text-[13px] font-bold shrink-0">
                        {review.initials}
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-on-surface">{review.name}</p>
                        <p className="text-[12px] text-on-surface-variant">{review.date}</p>
                      </div>
                    </div>
                    <Rating value={review.rating} size="sm" />
                  </div>
                  <p className="text-[14px] text-on-surface-variant leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column — Sticky Booking Widget (4 cols) */}
        <div className="md:col-span-4">
          <div className="sticky top-[88px] flex flex-col gap-5">

            {/* Pricing + Contact Widget */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-md border border-outline-variant flex flex-col gap-5">
              <div>
                <span className="text-[28px] font-bold text-on-surface">
                  ₹{provider.startingPrice}
                </span>
                <span className="text-[15px] text-on-surface-variant font-normal ml-2">starting price</span>
                <p className="text-[13px] text-on-surface-variant mt-1">Final price depends on service type and scope.</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium text-on-surface">Select Service</label>
                <select className="w-full bg-surface rounded-lg border border-outline-variant px-4 py-2 text-[14px] text-on-surface focus:border-primary outline-none transition-colors">
                  {provider.services.map((s) => (
                    <option key={s.name}>{s.name} — ₹{s.price}</option>
                  ))}
                </select>
              </div>

              {/* Book Now — links to booking flow */}
              <div>
                <Link
                  to={`/book/${provider.slug}`}
                  className="w-full bg-primary text-on-primary text-[14px] font-medium py-3 rounded-xl flex items-center justify-center gap-2 no-underline hover:bg-primary-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  Book Now
                </Link>
                <p className="text-[12px] text-on-surface-variant text-center mt-2">
                  💳 Payment handled directly with provider
                </p>
              </div>

              <div className="flex items-center justify-center gap-1 text-on-surface-variant text-[13px]">
                <span className="material-symbols-outlined text-[15px]">verified_user</span>
                UtilityConnect Verified Provider
              </div>
            </div>

            {/* Availability Snapshot */}
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant flex flex-col gap-4">
              <h3 className="text-[16px] font-semibold text-on-surface">Availability</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col gap-1 p-2 rounded-lg bg-surface-container border border-primary text-primary cursor-pointer hover:bg-surface-container-high transition-colors">
                  <span className="text-[11px] font-semibold uppercase">Today</span>
                  <span className="text-[13px] font-bold">
                    {provider.availability === 'Available Today' ? '2 Slots' : 'Full'}
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-2 rounded-lg bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer">
                  <span className="text-[11px] font-semibold uppercase">Tomorrow</span>
                  <span className="text-[13px] font-bold">
                    {provider.availability === 'Available Tomorrow' ? 'Open' : '3 Slots'}
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-2 rounded-lg bg-surface border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer">
                  <span className="text-[11px] font-semibold uppercase">Wed</span>
                  <span className="text-[13px] font-bold">Open</span>
                </div>
              </div>
              <p className="text-[12px] text-on-surface-variant text-center">Usually responds within 1 hour</p>
            </div>

            {/* Back Link */}
            <Link
              to={`/services/${provider.serviceSlug}`}
              className="text-[13px] text-primary hover:underline flex items-center gap-1 no-underline"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to {provider.service}s
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}

export default ProviderProfile;

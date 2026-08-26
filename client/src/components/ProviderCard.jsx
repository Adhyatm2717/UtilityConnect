import { Link } from 'react-router-dom';
import Rating from './Rating';

function ProviderCard({ provider }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow duration-200">

      {/* Avatar + Verified Badge */}
      <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 relative self-start">
        <img
          src={provider.image}
          alt={provider.name}
          className="w-full h-full object-cover"
        />
        {provider.verified && (
          <div className="absolute bottom-0 right-0 bg-secondary-container text-on-secondary-container rounded-full p-[2px] border-2 border-surface-container-lowest">
            <span
              className="material-symbols-outlined text-[12px]"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              verified
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Name + Availability Badge */}
          <div className="flex justify-between items-start mb-1">
            <div>
              <h3 className="text-[18px] font-semibold text-on-surface leading-tight">{provider.name}</h3>
              <p className="text-[13px] text-on-surface-variant mt-[2px]">{provider.service}</p>
            </div>
            {provider.availability === 'Available Today' && (
              <span className="bg-secondary-container/20 text-secondary text-[12px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 shrink-0 ml-2">
                <span className="material-symbols-outlined text-[13px]">bolt</span>
                Available Today
              </span>
            )}
          </div>

          {/* Rating + Experience */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div className="flex items-center gap-1">
              <Rating value={provider.rating} />
              <span className="text-[13px] font-semibold text-on-surface ml-1">{provider.rating}</span>
              <span className="text-[13px] text-on-surface-variant">({provider.reviewCount} reviews)</span>
            </div>
            <span className="text-on-surface-variant text-[13px]">•</span>
            <span className="text-[13px] text-on-surface-variant">{provider.experience} yrs exp.</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-on-surface-variant text-[13px] mt-2">
            <span className="material-symbols-outlined text-[15px]">location_on</span>
            {provider.distance} km away • {provider.location}
          </div>
        </div>

        {/* Price + Buttons */}
        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
          <div>
            <span className="text-[18px] font-bold text-primary">₹{provider.startingPrice}</span>
            <span className="text-[13px] text-on-surface-variant ml-1">starting</span>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/providers/${provider.slug}`}
              className="text-[13px] font-medium text-primary bg-surface-container-low hover:bg-surface-container-high px-4 py-2 rounded-xl transition-colors no-underline"
            >
              View Profile
            </Link>
            <button
              className="text-[13px] font-medium bg-primary text-on-primary px-4 py-2 rounded-xl shadow-sm transition-colors cursor-not-allowed opacity-80"
              title="Booking available in next milestone"
              disabled
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProviderCard;

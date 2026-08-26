// Filter sidebar — matches the Stitch browse page sidebar design
function FilterPanel({ filters, onChange }) {
  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-outline-variant bg-surface-container-low pt-8 px-4 gap-4 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto">
      <h2 className="text-[20px] font-semibold text-on-surface mb-2">Filters</h2>

      {/* Rating Filter */}
      <div>
        <h3 className="text-[13px] font-medium text-on-surface-variant mb-2">Rating</h3>
        <div className="flex flex-col gap-2">
          {['4.5', '4.0', 'all'].map((val) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={val}
                checked={filters.rating === val}
                onChange={(e) => onChange('rating', e.target.value)}
                className="text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-[14px] text-on-surface flex items-center gap-1">
                {val === 'all' ? 'All Ratings' : `${val}+`}
                {val !== 'all' && (
                  <span
                    className="material-symbols-outlined text-secondary text-[14px]"
                    style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                  >
                    star
                  </span>
                )}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability Filter */}
      <div>
        <h3 className="text-[13px] font-medium text-on-surface-variant mb-2">Availability</h3>
        <div className="flex flex-col gap-2">
          {['Available Today', 'Available Tomorrow', 'all'].map((val) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="availability"
                value={val}
                checked={filters.availability === val}
                onChange={(e) => onChange('availability', e.target.value)}
                className="text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-[14px] text-on-surface">
                {val === 'all' ? 'Any Time' : val}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="text-[13px] font-medium text-on-surface-variant mb-2">Starting Price</h3>
        <div className="flex flex-col gap-2">
          {[
            { label: 'Under ₹300', value: 'under300' },
            { label: '₹300 – ₹500', value: '300to500' },
            { label: '₹500+', value: 'above500' },
            { label: 'Any Price', value: 'all' },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="price"
                value={opt.value}
                checked={filters.price === opt.value}
                onChange={(e) => onChange('price', e.target.value)}
                className="text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-[14px] text-on-surface">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          onChange('rating', 'all');
          onChange('availability', 'all');
          onChange('price', 'all');
        }}
        className="mt-2 text-[13px] font-medium text-primary hover:underline text-left"
      >
        Reset Filters
      </button>
    </aside>
  );
}

export default FilterPanel;

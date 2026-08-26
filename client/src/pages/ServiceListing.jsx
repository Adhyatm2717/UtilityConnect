import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProviderCard from '../components/ProviderCard';
import FilterPanel from '../components/FilterPanel';

// Map of service slugs to display labels
const SERVICE_LABELS = {
  electrician: 'Electricians',
  plumber: 'Plumbers',
  carpenter: 'Carpenters',
  tailor: 'Tailors',
  maintenance: 'Maintenance Staff',
};

function ServiceListing() {
  const { service } = useParams();

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [filters, setFilters] = useState({
    rating: 'all',
    availability: 'all',
    price: 'all',
  });

  useEffect(() => {
    fetch('http://localhost:5001/api/providers')
      .then(res => res.json())
      .then(data => {
        setProviders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch providers:', err);
        setLoading(false);
      });
  }, []);

  // Update a single filter key
  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  // Filter + search + sort logic
  const displayedProviders = useMemo(() => {
    // Start with providers that match the selected service category
    let result = providers.filter((p) => p.serviceSlug === service);

    // Search: match name or service text
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.service.toLowerCase().includes(term) ||
          p.location.toLowerCase().includes(term) ||
          p.skills.some((s) => s.toLowerCase().includes(term))
      );
    }

    // Rating filter
    if (filters.rating === '4.5') result = result.filter((p) => p.rating >= 4.5);
    else if (filters.rating === '4.0') result = result.filter((p) => p.rating >= 4.0);

    // Availability filter
    if (filters.availability !== 'all') {
      result = result.filter((p) => p.availability === filters.availability);
    }

    // Price filter
    if (filters.price === 'under300') result = result.filter((p) => p.startingPrice < 300);
    else if (filters.price === '300to500') result = result.filter((p) => p.startingPrice >= 300 && p.startingPrice <= 500);
    else if (filters.price === 'above500') result = result.filter((p) => p.startingPrice > 500);

    // Sort
    if (sortBy === 'rating') result = [...result].sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'price_asc') result = [...result].sort((a, b) => a.startingPrice - b.startingPrice);
    else if (sortBy === 'distance') result = [...result].sort((a, b) => a.distance - b.distance);

    return result;
  }, [providers, service, search, filters, sortBy]);

  const serviceLabel = SERVICE_LABELS[service] || 'Providers';

  return (
    <div className="min-h-screen bg-background flex flex-col pt-[72px]">
      <div className="flex flex-1">
        {/* Sidebar Filters */}
        <FilterPanel filters={filters} onChange={handleFilterChange} />

        {/* Main Content */}
        <main className="flex-1 px-4 md:px-10 py-8 max-w-full">

          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-[28px] md:text-[36px] font-bold text-on-surface leading-tight">
                {serviceLabel} in Pune
              </h1>
              <p className="text-on-surface-variant text-[14px] mt-1">
                {displayedProviders.length} professional{displayedProviders.length !== 1 ? 's' : ''} found near you
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-on-surface-variant font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-outline-variant focus:border-primary bg-surface text-[14px] px-3 py-2 shadow-sm outline-none"
              >
                <option value="recommended">Recommended</option>
                <option value="rating">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="distance">Nearest</option>
              </select>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 mb-8 shadow-sm focus-within:border-primary transition-colors">
            <span className="material-symbols-outlined text-outline mr-3 text-[20px]">search</span>
            <input
              type="text"
              placeholder={`Search ${serviceLabel.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[14px] text-on-surface placeholder:text-outline"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-outline hover:text-on-surface ml-2">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Mobile Filter Row */}
          <div className="flex md:hidden gap-2 mb-6 flex-wrap">
            {[
              { label: 'Rating: ' + (filters.rating === 'all' ? 'All' : filters.rating + '+'), key: 'rating', value: 'all' },
              { label: 'Availability: ' + (filters.availability === 'all' ? 'All' : filters.availability.replace('Available ', '')), key: 'availability', value: 'all' },
              { label: 'Price: ' + (filters.price === 'all' ? 'All' : filters.price), key: 'price', value: 'all' },
            ].map((chip) => (
              <button
                key={chip.key}
                onClick={() => handleFilterChange(chip.key, chip.value)}
                className="text-[12px] font-medium px-3 py-1 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                {chip.label} ✕
              </button>
            ))}
          </div>

          {/* Provider Cards Grid */}
          {loading ? (
            <div className="text-center py-20">
              <p className="text-on-surface-variant text-[16px]">Loading providers...</p>
            </div>
          ) : displayedProviders.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-[48px] text-outline-variant">search_off</span>
              <p className="text-on-surface-variant text-[16px] mt-4">No providers found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearch('');
                  setFilters({ rating: 'all', availability: 'all', price: 'all' });
                }}
                className="mt-4 text-primary text-[14px] font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {displayedProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ServiceListing;

import { Link } from 'react-router-dom';

// Add Material Symbols to the head via index.css — icons used here match the Stitch design
const services = [
  { name: 'Electrician', slug: 'electrician', icon: 'bolt', description: 'Wiring, repairs, installations', color: 'bg-primary/10 text-primary' },
  { name: 'Plumber', slug: 'plumber', icon: 'water_drop', description: 'Pipes, leaks, bathroom fitting', color: 'bg-secondary/10 text-secondary' },
  { name: 'Carpenter', slug: 'carpenter', icon: 'carpenter', description: 'Furniture, doors, woodwork', color: 'bg-tertiary/10 text-tertiary' },
  { name: 'Tailor', slug: 'tailor', icon: 'styler', description: 'Stitching, alterations, designs', color: 'bg-primary/10 text-primary' },
  { name: 'Maintenance', slug: 'maintenance', icon: 'handyman', description: 'General repairs and upkeep', color: 'bg-secondary/10 text-secondary' },
];

const steps = [
  { step: '1', title: 'Choose a Service', desc: 'Browse from 5 service categories and find the right type of professional.', icon: 'category' },
  { step: '2', title: 'View Providers', desc: 'Compare ratings, experience, pricing, and availability of verified professionals.', icon: 'people' },
  { step: '3', title: 'Book & Get Help', desc: 'Schedule a visit. Payment is handled directly with your service provider.', icon: 'check_circle' },
];

function Home() {
  return (
    <main className="pt-[72px] min-h-screen bg-background">

      {/* Hero Section */}
      <section className="bg-surface-container-low py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <h1 className="text-[36px] md:text-[48px] font-bold text-on-background leading-tight tracking-tight">
              Find Trusted Service
              <span className="text-primary-container block">Professionals Near You</span>
            </h1>
            <p className="mt-5 text-on-surface-variant text-[17px] leading-relaxed">
              Connect with verified electricians, plumbers, carpenters, tailors, and maintenance
              staff for your home, apartment, or commercial space.
            </p>
            <div className="mt-8 flex items-center gap-4 flex-wrap">
              <Link
                to="/services/electrician"
                className="bg-primary-container text-on-primary px-8 py-3 rounded-xl text-[15px] font-semibold hover:bg-primary transition-colors no-underline"
              >
                Browse Services
              </Link>
              <div className="flex items-center gap-2 text-on-surface-variant text-[14px]">
                <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>verified</span>
                All providers are verified
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[26px] font-semibold text-on-background mb-2">Our Services</h2>
          <p className="text-on-surface-variant text-[15px] mb-8">Click a category to browse available professionals</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {services.map((service) => (
              <Link
                key={service.slug}
                to={`/services/${service.slug}`}
                className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 text-center hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer no-underline group"
              >
                <div className={`w-14 h-14 rounded-xl ${service.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-[26px]">{service.icon}</span>
                </div>
                <h3 className="font-semibold text-on-background text-[15px]">{service.name}</h3>
                <p className="text-on-surface-variant text-[12px] mt-1">{service.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[26px] font-semibold text-on-background mb-2 text-center">How It Works</h2>
          <p className="text-on-surface-variant text-[15px] mb-12 text-center">Get help in three simple steps</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-4 shadow-sm">
                  <span className="material-symbols-outlined text-on-primary text-[28px]">{s.icon}</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-surface-container-highest text-primary text-[13px] font-bold flex items-center justify-center mb-3 -mt-10 ml-10 border-2 border-surface-container-low">
                  {s.step}
                </div>
                <h3 className="text-[17px] font-semibold text-on-background mb-2">{s.title}</h3>
                <p className="text-on-surface-variant text-[14px] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-highest border-t border-outline-variant py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <span className="text-[20px] font-bold text-primary">UtilityConnect</span>
            <p className="text-on-surface-variant text-[13px] mt-2 leading-relaxed max-w-sm">
              Connecting you with trusted, verified service professionals for homes, apartments, and commercial spaces.
            </p>
          </div>
          <div>
            <h4 className="text-[14px] font-semibold text-on-surface mb-3">Services</h4>
            {services.map((s) => (
              <Link key={s.slug} to={`/services/${s.slug}`} className="block text-on-surface-variant hover:text-primary text-[13px] mb-1 no-underline transition-colors">
                {s.name}
              </Link>
            ))}
          </div>
          <div>
            <h4 className="text-[14px] font-semibold text-on-surface mb-3">Platform</h4>
            <a href="#" className="block text-on-surface-variant hover:text-primary text-[13px] mb-1 no-underline transition-colors">Become a Provider</a>
            <a href="#" className="block text-on-surface-variant hover:text-primary text-[13px] mb-1 no-underline transition-colors">Terms of Service</a>
            <a href="#" className="block text-on-surface-variant hover:text-primary text-[13px] mb-1 no-underline transition-colors">Privacy Policy</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-outline-variant">
          <p className="text-on-surface-variant text-[13px]">© 2026 UtilityConnect. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

export default Home;

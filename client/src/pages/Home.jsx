function Home() {
  const services = [
    { name: 'Electrician', icon: '⚡', description: 'Wiring, repairs, installations' },
    { name: 'Plumber', icon: '🔧', description: 'Pipes, leaks, bathroom fitting' },
    { name: 'Carpenter', icon: '🪚', description: 'Furniture, doors, woodwork' },
    { name: 'Tailor', icon: '🧵', description: 'Stitching, alterations, designs' },
    { name: 'Maintenance', icon: '🛠️', description: 'General repairs and upkeep' },
  ];

  return (
    <main className="pt-[72px]">

      {/* Hero Section */}
      <section className="bg-surface-container-low py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-on-background leading-tight">
            Find Trusted Service <br />
            <span className="text-primary-container">Professionals Near You</span>
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Connect with verified electricians, plumbers, carpenters, and more
            for your home, apartment, or commercial space.
          </p>
          <button className="mt-8 bg-primary-container text-on-primary px-8 py-3 rounded-xl text-base font-semibold hover:bg-primary transition-colors cursor-pointer">
            Browse Services
          </button>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-on-background mb-8 text-center">
            Our Services
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {services.map((service) => (
              <div
                key={service.name}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 text-center hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
              >
                <div className="text-4xl mb-3">{service.icon}</div>
                <h3 className="font-semibold text-on-background text-sm">{service.name}</h3>
                <p className="text-on-surface-variant text-xs mt-1">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant/30 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-on-surface-variant text-sm">
          © 2026 UtilityConnect. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

export default Home;

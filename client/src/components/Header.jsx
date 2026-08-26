import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-outline-variant/30 h-[72px]">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="w-9 h-9 bg-primary-container rounded-xl flex items-center justify-center">
            <span className="text-on-primary text-lg font-bold">U</span>
          </div>
          <span className="text-on-background text-xl font-semibold">
            UtilityConnect
          </span>
        </Link>

        {/* Navigation links — will be expanded in later milestones */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-on-surface-variant text-sm font-medium hover:text-primary no-underline transition-colors">
            Home
          </Link>
          <Link to="/services" className="text-on-surface-variant text-sm font-medium hover:text-primary no-underline transition-colors">
            Services
          </Link>
        </nav>

        {/* Auth buttons placeholder — will be functional in a later milestone */}
        <div className="flex items-center gap-3">
          <button className="text-sm font-medium text-primary px-4 py-2 rounded-xl hover:bg-primary-fixed/30 transition-colors cursor-pointer">
            Log In
          </button>
          <button className="text-sm font-medium text-on-primary bg-primary-container px-4 py-2 rounded-xl hover:bg-primary transition-colors cursor-pointer">
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const roleBadge = {
    customer: { label: 'Customer', color: 'bg-primary-fixed text-primary' },
    provider: { label: 'Provider', color: 'bg-secondary-container text-on-secondary-container' },
    admin: { label: 'Admin', color: 'bg-tertiary-container text-on-tertiary' },
  };

  const badge = roleBadge[user?.role] || roleBadge.customer;
  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'provider' ? '/provider/dashboard' : '/customer/dashboard';

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

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-on-surface-variant text-sm font-medium hover:text-primary no-underline transition-colors">
            Home
          </Link>
          <Link to="/services/electrician" className="text-on-surface-variant text-sm font-medium hover:text-primary no-underline transition-colors">
            Services
          </Link>
          <Link to="/mall/dashboard" className="text-on-surface-variant text-sm font-medium hover:text-primary no-underline transition-colors">
            Mall Services
          </Link>
          {isAuthenticated && (
            <Link to={dashboardPath} className="text-on-surface-variant text-sm font-medium hover:text-primary no-underline transition-colors font-semibold text-primary">
              {user?.role === 'admin' ? 'Admin Portal' : user?.role === 'provider' ? 'Provider Dashboard' : 'My Dashboard'}
            </Link>
          )}
        </nav>

        {/* Auth area */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                id="user-menu-button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-container transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 bg-primary-container rounded-full flex items-center justify-center">
                  <span className="text-on-primary text-[13px] font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden sm:inline text-on-surface text-[13px] font-medium max-w-[120px] truncate">
                  {user?.name}
                </span>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                  expand_more
                </span>
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-outline-variant/20">
                    <p className="text-on-surface text-[13px] font-semibold truncate">{user?.name}</p>
                    <p className="text-on-surface-variant text-[12px] truncate">{user?.email}</p>
                    <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="py-1">
                    <Link
                      to={dashboardPath}
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-left px-4 py-2 text-on-surface text-[13px] font-medium hover:bg-surface-container transition-colors flex items-center gap-2 no-underline"
                    >
                      <span className="material-symbols-outlined text-[18px]">dashboard</span>
                      Dashboard
                    </Link>

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="w-full text-left px-4 py-2 text-on-surface text-[13px] font-medium hover:bg-surface-container transition-colors flex items-center gap-2 no-underline"
                      >
                        <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                        Admin Control
                      </Link>
                    )}

                    <Link
                      to="/mall/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-left px-4 py-2 text-on-surface text-[13px] font-medium hover:bg-surface-container transition-colors flex items-center gap-2 no-underline"
                    >
                      <span className="material-symbols-outlined text-[18px]">storefront</span>
                      Mall Maintenance
                    </Link>

                    <button
                      id="logout-button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-error text-[13px] font-medium hover:bg-error-container/30 transition-colors flex items-center gap-2 cursor-pointer border-t border-outline-variant/20 mt-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-primary px-4 py-2 rounded-xl hover:bg-primary-fixed/30 transition-colors no-underline">
                Log In
              </Link>
              <Link to="/signup" className="text-sm font-medium text-on-primary bg-primary-container px-4 py-2 rounded-xl hover:bg-primary transition-colors no-underline">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

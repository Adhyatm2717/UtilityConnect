import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    setError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Enter a valid email';
    if (!formData.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.errors?.[0]?.msg || 'Login failed');
        setSubmitting(false);
        return;
      }
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError('Unable to connect to server');
      setSubmitting(false);
    }
  };

  return (
    <main className="pt-[72px] min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 shadow-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-on-primary text-[28px]">login</span>
            </div>
            <h1 className="text-[24px] font-bold text-on-background">Welcome Back</h1>
            <p className="text-on-surface-variant text-[14px] mt-1">Log in to your UtilityConnect account</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="bg-error-container/50 border border-error/30 rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[18px]">error</span>
              <span className="text-error text-[13px] font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[13px] font-medium text-on-surface mb-1.5">Email</label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-xl border bg-surface-container-low text-on-background text-[14px] outline-none transition-colors placeholder:text-outline ${
                  fieldErrors.email ? 'border-error' : 'border-outline-variant/50 focus:border-primary'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-error text-[12px] mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-medium text-on-surface mb-1.5">Password</label>
              <input
                id="login-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl border bg-surface-container-low text-on-background text-[14px] outline-none transition-colors placeholder:text-outline ${
                  fieldErrors.password ? 'border-error' : 'border-outline-variant/50 focus:border-primary'
                }`}
              />
              {fieldErrors.password && (
                <p className="text-error text-[12px] mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={submitting}
              className="w-full bg-primary-container text-on-primary py-3 rounded-xl text-[15px] font-semibold hover:bg-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-on-surface-variant text-[13px]">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-medium hover:underline no-underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;

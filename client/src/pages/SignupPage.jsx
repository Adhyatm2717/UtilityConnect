import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState('customer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    service: '',
    location: { address: '', area: '', city: '', pin: '' },
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5001/api/services')
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['address', 'area', 'city', 'pin'].includes(name)) {
      setFormData({ ...formData, location: { ...formData.location, [name]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setFieldErrors({ ...fieldErrors, [name]: '' });
    setError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Enter a valid email';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'At least 6 characters';
    if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    if (role === 'provider' && !formData.service)
      errs.service = 'Please select a service';
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
    const endpoint =
      role === 'provider'
        ? 'http://localhost:5001/api/auth/register/provider'
        : 'http://localhost:5001/api/auth/register/customer';
    const body = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      location: formData.location,
    };
    if (role === 'provider') body.service = formData.service;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.errors?.[0]?.msg || 'Registration failed');
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

  const inputCls = (field) =>
    `w-full px-4 py-3 rounded-xl border bg-surface-container-low text-on-background text-[14px] outline-none transition-colors placeholder:text-outline ${
      fieldErrors[field] ? 'border-error' : 'border-outline-variant/50 focus:border-primary'
    }`;

  return (
    <main className="pt-[72px] min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 shadow-sm">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-on-primary text-[28px]">person_add</span>
            </div>
            <h1 className="text-[24px] font-bold text-on-background">Create Account</h1>
            <p className="text-on-surface-variant text-[14px] mt-1">Join UtilityConnect today</p>
          </div>

          {/* Role toggle */}
          <div className="flex bg-surface-container rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                role === 'customer'
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('provider')}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                role === 'provider'
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Service Provider
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div className="bg-error-container/50 border border-error/30 rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[18px]">error</span>
              <span className="text-error text-[13px] font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-[13px] font-medium text-on-surface mb-1.5">Full Name</label>
              <input
                id="signup-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={inputCls('name')}
              />
              {fieldErrors.name && <p className="text-error text-[12px] mt-1">{fieldErrors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[13px] font-medium text-on-surface mb-1.5">Email</label>
              <input
                id="signup-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={inputCls('email')}
              />
              {fieldErrors.email && <p className="text-error text-[12px] mt-1">{fieldErrors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[13px] font-medium text-on-surface mb-1.5">Phone (optional)</label>
              <input
                id="signup-phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className={inputCls('phone')}
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 chars"
                  className={inputCls('password')}
                />
                {fieldErrors.password && (
                  <p className="text-error text-[12px] mt-1">{fieldErrors.password}</p>
                )}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">Confirm Password</label>
                <input
                  id="signup-confirm-password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={inputCls('confirmPassword')}
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-error text-[12px] mt-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Provider-only: Service */}
            {role === 'provider' && (
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">Your Service</label>
                <select
                  id="signup-service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className={inputCls('service')}
                >
                  <option value="">Select a service...</option>
                  {services.map((s) => (
                    <option key={s.slug || s._id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.service && (
                  <p className="text-error text-[12px] mt-1">{fieldErrors.service}</p>
                )}
              </div>
            )}

            {/* Location section */}
            <div>
              <label className="block text-[13px] font-medium text-on-surface mb-1.5">Location (optional)</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="city"
                  value={formData.location.city}
                  onChange={handleChange}
                  placeholder="City"
                  className={inputCls('city')}
                />
                <input
                  name="area"
                  value={formData.location.area}
                  onChange={handleChange}
                  placeholder="Area"
                  className={inputCls('area')}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              id="signup-submit"
              type="submit"
              disabled={submitting}
              className="w-full bg-primary-container text-on-primary py-3 rounded-xl text-[15px] font-semibold hover:bg-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {submitting
                ? 'Creating Account...'
                : role === 'provider'
                ? 'Register as Provider'
                : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-on-surface-variant text-[13px]">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline no-underline">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default SignupPage;

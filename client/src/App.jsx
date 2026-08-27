import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Home from './pages/Home';
import ServiceListing from './pages/ServiceListing';
import ProviderProfile from './pages/ProviderProfile';
import BookingFlow from './pages/BookingFlow';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CustomerDashboard from './pages/CustomerDashboard';
import BookingDetails from './pages/BookingDetails';
import ProviderDashboard from './pages/ProviderDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServiceListing />} />
          <Route path="/services/:service" element={<ServiceListing />} />
          <Route path="/providers/:slug" element={<ProviderProfile />} />
          <Route path="/book/:slug" element={<BookingFlow />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Customer Protected Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute requiredRole="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer"
            element={
              <ProtectedRoute requiredRole="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Booking Tracking & Details */}
          <Route
            path="/bookings/:id"
            element={
              <ProtectedRoute>
                <BookingDetails />
              </ProtectedRoute>
            }
          />

          {/* Provider Protected Routes */}
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute requiredRole="provider">
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider"
            element={
              <ProtectedRoute requiredRole="provider">
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

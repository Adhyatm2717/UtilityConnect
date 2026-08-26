import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import ServiceListing from './pages/ServiceListing';
import ProviderProfile from './pages/ProviderProfile';
import BookingFlow from './pages/BookingFlow';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services/:service" element={<ServiceListing />} />
        <Route path="/providers/:slug" element={<ProviderProfile />} />
        <Route path="/book/:slug" element={<BookingFlow />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

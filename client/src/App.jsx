import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import ServiceListing from './pages/ServiceListing';
import ProviderProfile from './pages/ProviderProfile';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services/:service" element={<ServiceListing />} />
        <Route path="/providers/:slug" element={<ProviderProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import CourierDashboard from './pages/courier';
import MerchantDashboard from './pages/merchant';
import CustomerDashboard from './pages/customer';
import AdminDashboard from './pages/admin';
import { SettingsProvider } from './context/SettingsContext';



function App() {
  return (
    <Router>
      <SettingsProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route path="/customer/home" element={<CustomerDashboard />} />
          <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
          <Route path="/courier/dashboard" element={<CourierDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
  
          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SettingsProvider>
    </Router>
  );
}

export default App;

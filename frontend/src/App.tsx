import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import CourierDashboard from './pages/courier';
import MerchantDashboard from './pages/merchant';

// Simple Dashboard Placeholders
const Dashboard = ({ title }: { title: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-slate-900">{title}</h1>
      <p className="text-slate-500 mt-2">Welcome to your Ardi workspace.</p>
      <button 
        onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
        className="mt-6 text-primary-600 font-semibold hover:underline"
      >
        Logout
      </button>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Routes */}
        <Route path="/customer/home" element={<Dashboard title="Customer Home" />} />
        <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
        <Route path="/courier/dashboard" element={<CourierDashboard />} />
        <Route path="/admin" element={<Dashboard title="Admin Portal" />} />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

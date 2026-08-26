import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { VendorDashboard } from './components/VendorDashboard';

export function App() {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('vendor_user');
    const savedToken = localStorage.getItem('vendor_access_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setCurrentView('dashboard');
      } catch (err) {
        localStorage.removeItem('vendor_user');
        localStorage.removeItem('vendor_access_token');
      }
    }
  }, []);

  const handleLoginSuccess = (loggedInUser: any) => {
    setUser(loggedInUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('vendor_user');
    localStorage.removeItem('vendor_access_token');
    setUser(null);
    setCurrentView('login');
  };

  if (currentView === 'register') {
    return <RegisterPage onNavigateToLogin={() => setCurrentView('login')} />;
  }

  if (currentView === 'dashboard' && user) {
    return <VendorDashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <LoginPage
      onLoginSuccess={handleLoginSuccess}
      onNavigateToRegister={() => setCurrentView('register')}
    />
  );
}

export default App;

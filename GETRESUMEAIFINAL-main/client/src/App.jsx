import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import AppRouter from './routes/AppRouter';

function App() {
  const location = useLocation();
  const hideNavbarRoutes = ['/dashboard', '/builder', '/templates', '/profile', '/jobs', '/test'];
  const shouldHideNavbar = hideNavbarRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className="min-h-screen bg-white">
      {/* Decorative background glow */}
      {!shouldHideNavbar && <div className="glow left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 fixed" />}
      
      {/* Hide Navbar on specific routes */}
      {!shouldHideNavbar && <Navbar />}
      
      <main className="relative z-10">
        <AppRouter />
      </main>
    </div>
  );
}

export default App;

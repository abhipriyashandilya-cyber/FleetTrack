import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Maintenance from './pages/Maintenance';
import FuelAnalytics from './pages/FuelAnalytics';
import { LayoutDashboard, Truck, Users, LogOut, ShieldCheck, Wrench, Fuel } from 'lucide-react';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Vehicles', path: '/vehicles', icon: Truck },
    { label: 'Drivers', path: '/drivers', icon: Users },
    { label: 'Maintenance', path: '/maintenance', icon: Wrench },
    { label: 'Fuel Analytics', path: '/fuel', icon: Fuel },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-6 shadow-xl">
        <div className="space-y-8">
          <div className="flex items-center gap-3 text-white px-2">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-bold tracking-wide">FleetTrack</span>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'hover:bg-slate-800 hover:text-white text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout Button */}
        <div className="border-t border-slate-800 pt-4 space-y-4">
          <div className="px-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Signed in as</p>
            <p className="text-sm font-medium text-slate-200 truncate">{user?.email || 'Manager'}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-950/40 text-red-400 transition-colors w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-600 font-medium">
        Loading FleetTrack...
      </div>
    );
  }

  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute>
                <Vehicles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/drivers"
            element={
              <ProtectedRoute>
                <Drivers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance"
            element={
              <ProtectedRoute>
                <Maintenance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fuel"
            element={
              <ProtectedRoute>
                <FuelAnalytics />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import ErrorBoundary from './components/ui/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import { LoadingPage } from './components/ui/LoadingSpinner';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

// Public Pages (eager load for better UX)
import Home from './pages/Home';
import Contact from './pages/Contact';
import About from './pages/About';
import BuyerLogin from './pages/buyer/Login';

// Lazy load heavy pages
const Properties = lazy(() => import('./pages/Properties'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const Campaigns = lazy(() => import('./pages/Campaigns'));
const Jobs = lazy(() => import('./pages/Jobs'));
const FunnelLinkTree = lazy(() => import('./pages/FunnelLinkTree'));
const BuyerDashboard = lazy(() => import('./pages/buyer/Dashboard'));
const Advertise = lazy(() => import('./pages/Advertise'));

// Admin Pages (lazy load all)
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const CRM = lazy(() => import('./pages/admin/CRM'));
const LeadsKanban = lazy(() => import('./pages/admin/LeadsKanban'));
const AdminCalendar = lazy(() => import('./pages/admin/Calendar'));
const PropertiesList = lazy(() => import('./pages/admin/PropertiesList'));
const PropertyForm = lazy(() => import('./pages/admin/PropertyForm'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const UsersList = lazy(() => import('./pages/admin/UsersList'));
const CampaignsList = lazy(() => import('./pages/admin/CampaignsList'));
const JobsList = lazy(() => import('./pages/admin/JobsList'));
const Marketing = lazy(() => import('./pages/admin/Marketing'));
const WhatsAppStation = lazy(() => import('./pages/admin/WhatsAppStation'));

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <HashRouter>
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              {/* Linktree Funnel (Special Route) */}
              <Route path="/funnel" element={<FunnelLinkTree />} />

              {/* Public Area */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="properties" element={<Properties />} />
                <Route path="properties/:id" element={<PropertyDetails />} />
                <Route path="campaigns" element={<Campaigns />} />
                <Route path="jobs" element={<Jobs />} />
                <Route path="contact" element={<Contact />} />
                <Route path="about" element={<About />} />
                <Route path="advertise" element={<Advertise />} />

                {/* Buyer Area Routes */}
                <Route path="buyer/login" element={<BuyerLogin />} />
                <Route
                  path="buyer/dashboard"
                  element={
                    <ProtectedRoute>
                      <BuyerDashboard />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Admin Area - Protected */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'agent']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="crm" element={<LeadsKanban />} />
                <Route path="crm-legacy" element={<CRM />} />
                <Route path="calendar" element={<AdminCalendar />} />
                <Route path="marketing" element={<Marketing />} />
                <Route path="whatsapp" element={<WhatsAppStation />} />
                <Route path="properties" element={<PropertiesList />} />
                <Route path="properties/new" element={<PropertyForm />} />
                <Route path="properties/edit/:id" element={<PropertyForm />} />
                <Route path="users" element={<UsersList />} />
                <Route path="campaigns" element={<CampaignsList />} />
                <Route path="jobs" element={<JobsList />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </HashRouter>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import Campaigns from './pages/Campaigns';
import Jobs from './pages/Jobs';
import FunnelLinkTree from './pages/FunnelLinkTree';
import BuyerLogin from './pages/buyer/Login';
import BuyerDashboard from './pages/buyer/Dashboard';
import Contact from './pages/Contact';
import About from './pages/About';
import Advertise from './pages/Advertise';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import CRM from './pages/admin/CRM';
import AdminCalendar from './pages/admin/Calendar'; // Import Calendar
import PropertiesList from './pages/admin/PropertiesList';
import PropertyForm from './pages/admin/PropertyForm';
import AdminSettings from './pages/admin/Settings';
import UsersList from './pages/admin/UsersList';
import CampaignsList from './pages/admin/CampaignsList';
import JobsList from './pages/admin/JobsList';
import Marketing from './pages/admin/Marketing';
import WhatsAppStation from './pages/admin/WhatsAppStation';

const App: React.FC = () => {
  return (
    <HashRouter>
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
          <Route path="buyer/dashboard" element={<BuyerDashboard />} />
        </Route>

        {/* Admin Area */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="crm" element={<CRM />} />
          <Route path="calendar" element={<AdminCalendar />} /> {/* New Route */}
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
    </HashRouter>
  );
};

export default App;
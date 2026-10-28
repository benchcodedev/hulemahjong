import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import { HuleProvider, useHule } from './context/HuleContext';

import ReservePage from './pages/public/ReservePage';
import BookingPassPage from './pages/public/BookingPassPage';
import TablesPage from './pages/public/TablesPage';
import MembershipPage from './pages/public/MembershipPage';
import EventsPage from './pages/public/EventsPage';
import EventDetailPage from './pages/public/EventDetailPage';
import GalleryPage from './pages/public/GalleryPage';
import ContactPage from './pages/public/ContactPage';

import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminTablesPage from './pages/admin/AdminTablesPage';
import AdminSlotsPromosPage from './pages/admin/AdminSlotsPromosPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminGalleryPage from './pages/admin/AdminGalleryPage';
import AdminMembershipsPage from './pages/admin/AdminMembershipsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function RouteBehavior() {
  const location = useLocation();
  const { flash, clearFlash } = useHule();

  useEffect(() => {
    if (flash && Date.now() - flash.ts > 800) {
      clearFlash();
    }
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      window.scrollTo(0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.hash]);

  return null;
}

function CheckBookingRedirect() {
  const [searchParams] = useSearchParams();
  const { db, notify } = useHule();
  const code = (searchParams.get('booking_code') || '').trim().toUpperCase();

  if (!code) return <Navigate to="/contact#lookup" replace />;
  const found = db.bookings.find((b) => String(b.booking_code).toUpperCase() === code);
  if (!found) {
    setTimeout(() => notify('error', `Booking reference "${code}" was not found.`), 0);
    return <Navigate to="/contact#lookup" replace />;
  }
  return <Navigate to={`/booking/${found.booking_code}`} replace />;
}

export default function App() {
  return (
    <HuleProvider>
      <BrowserRouter>
        <RouteBehavior />
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<ReservePage />} />
          <Route path="/booking/:bookingCode" element={<BookingPassPage />} />
          <Route path="/check-booking" element={<CheckBookingRedirect />} />
          <Route path="/tables" element={<TablesPage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:slug" element={<EventDetailPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Admin CMS Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/admin/tables" element={<AdminTablesPage />} />
          <Route path="/admin/slots-promos" element={<AdminSlotsPromosPage />} />
          <Route path="/admin/events" element={<AdminEventsPage />} />
          <Route path="/admin/gallery" element={<AdminGalleryPage />} />
          <Route path="/admin/memberships" element={<AdminMembershipsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </HuleProvider>
  );
}

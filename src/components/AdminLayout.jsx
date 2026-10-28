import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useHule } from '../context/HuleContext';

export default function AdminLayout({
  title = 'CMS Admin — Hule Mahjong',
  heading = 'Dashboard',
  subheading = 'Manage reservations, table inventory, pricing, events, and media.',
  headerActions = null,
  children,
}) {
  const { db, currentAdmin, logoutAdmin, flash, clearFlash } = useHule();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (!currentAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const pendingBookingsCount = db.bookings.filter(
    (b) => b.status === 'pending' || b.payment_status === 'waiting_verification'
  ).length;
  const pendingMembershipsCount = db.membershipApplications.filter((a) => a.status === 'pending').length;
  const unreadInquiriesCount = db.inquiries.filter((i) => !i.is_read).length;

  const cmsLinks = [
    { label: 'Dashboard & Floor', to: '/admin', badge: 0, exact: true },
    { label: 'Bookings', to: '/admin/bookings', badge: pendingBookingsCount },
    { label: 'Tables & Pricing', to: '/admin/tables', badge: 0 },
    { label: 'Time Slots & Promos', to: '/admin/slots-promos', badge: 0 },
    { label: 'Events & Clinics', to: '/admin/events', badge: 0 },
    { label: 'Photo Gallery', to: '/admin/gallery', badge: 0 },
    { label: 'Memberships', to: '/admin/memberships', badge: pendingMembershipsCount },
    { label: 'Settings & Inbox', to: '/admin/settings', badge: unreadInquiriesCount },
  ];

  const handleSignOut = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="bg-[#f7f5f0] text-[#171614] antialiased min-h-screen">
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Mobile Top Bar */}
        <div className="lg:hidden bg-[#0e0f0d] text-white px-4 py-3.5 flex items-center justify-between">
          <Link to="/admin" className="text-[18px] tracking-tight">
            <span className="font-light">Hule</span>
            <span className="font-bold text-[#c3b091]">CMS</span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen((p) => !p)}
            className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-semibold"
          >
            Menu ☰
          </button>
        </div>

        {/* Sidebar Navigation */}
        <aside
          className={`${
            sidebarOpen ? 'flex' : 'hidden'
          } lg:flex lg:w-[265px] shrink-0 bg-[#0e0f0d] text-white flex-col justify-between p-5`}
        >
          <div>
            <div className="px-2 pt-1 pb-6 border-b border-white/10 flex items-center justify-between">
              <Link to="/admin" className="inline-flex items-baseline text-[21px] tracking-[-0.03em]">
                <span className="font-light">Hule</span>
                <span className="font-bold text-[#c3b091]">Mahjong</span>
                <span className="ml-2 text-[10px] uppercase tracking-widest bg-[#c3b091]/20 text-[#c3b091] px-2 py-0.5 rounded-full font-semibold">
                  CMS
                </span>
              </Link>
            </div>

            <nav className="mt-6 space-y-1">
              {cmsLinks.map((link) => {
                const active = link.exact ? location.pathname === link.to : location.pathname.startsWith(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition ${
                      active
                        ? 'bg-[#c3b091] text-[#141310] font-semibold'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                          active ? 'bg-[#141310] text-white' : 'bg-[#c3b091] text-[#141310]'
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-white/10 space-y-2.5">
            <Link
              to="/"
              target="_blank"
              className="w-full py-2.5 px-3.5 rounded-xl border border-white/15 hover:border-[#c3b091] text-[12.5px] text-white/85 hover:text-[#c3b091] flex items-center justify-between transition"
            >
              <span>Open Live Website</span>
              <span>↗</span>
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-2 px-3.5 rounded-xl text-left text-[12px] text-white/50 hover:text-red-300 transition"
            >
              Sign Out ({currentAdmin.name || 'Admin'})
            </button>

            <div className="pt-3 border-t border-white/10 px-2 flex items-center gap-2 text-[10.5px] text-white/45">
              <svg className="w-3.5 h-4 shrink-0" viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 4H8a4 4 0 0 0-4 4v54a4 4 0 0 0 4 4h10" stroke="#c3b091" strokeWidth="7" strokeLinecap="round" />
                <path d="M42 4h10a4 4 0 0 1 4 4v54a4 4 0 0 1-4 4H42" stroke="#c3b091" strokeWidth="7" strokeLinecap="round" />
                <line x1="16" y1="26" x2="34" y2="26" stroke="#27B084" strokeWidth="6" strokeLinecap="round" />
                <line x1="16" y1="38" x2="28" y2="38" stroke="#27B084" strokeWidth="6" strokeLinecap="round" />
              </svg>
              <span>
                Powered by <strong className="text-white/80 font-bold tracking-wider">BENCHCODE™</strong>
              </span>
            </div>
          </div>
        </aside>

        {/* Main CMS Content Area */}
        <div className="flex-1 min-w-0">
          <header className="bg-white border-b border-[#ebe5d9] px-5 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-[20px] sm:text-[22px] font-bold text-[#141414] tracking-tight">{heading}</h1>
              <p className="text-[12.5px] text-[#777] mt-0.5">{subheading}</p>
            </div>
            {headerActions && <div className="flex items-center gap-3">{headerActions}</div>}
          </header>

          <div className="p-5 sm:p-8 max-w-[1320px]">
            {flash && (
              <div className="mb-6">
                {flash.type === 'success' ? (
                  <div className="rounded-2xl border border-[#d6c5a9] bg-[#faf5eb] px-5 py-3.5 text-[13.5px] font-medium text-[#4f3e22] flex items-center justify-between gap-3">
                    <span>✓ {flash.message}</span>
                    <button type="button" onClick={clearFlash} className="text-xs text-[#6e5b3e] font-semibold">
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5 text-[13.5px] font-medium text-red-800 flex items-center justify-between gap-3">
                    <span>{flash.message}</span>
                    <button type="button" onClick={clearFlash} className="text-xs text-red-700 font-semibold">
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )}

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

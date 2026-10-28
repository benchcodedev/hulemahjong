import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useHule } from '../context/HuleContext';

export default function PublicLayout({ title, hideCtaBanner = false, children }) {
  const { siteSettings, currentAdmin, flash, clearFlash } = useHule();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const brandPrefix = siteSettings.brand_prefix || 'Hule';
  const brandSuffix = siteSettings.brand_suffix || 'Mahjong';
  const bannerImg = siteSettings.banner_image || '/images/mahjong/cta-banner.jpg';
  const bannerUrl =
    bannerImg.startsWith('http') || bannerImg.startsWith('data:')
      ? bannerImg
      : `/${bannerImg.replace(/^\/+/, '')}`;
  const waNumber = String(siteSettings.contact_whatsapp || '6281288997788').replace(/\D/g, '');

  useEffect(() => {
    document.title = title || `${brandPrefix}${brandSuffix} — Elevated Social Mahjong Lounge`;
  }, [title, brandPrefix, brandSuffix]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search, location.hash]);

  const pathname = location.pathname;
  const navItems = [
    { label: 'Reserve', to: '/', active: pathname === '/' || pathname.startsWith('/booking') },
    { label: 'Tables', to: '/tables', active: pathname === '/tables' },
    { label: 'Membership', to: '/membership', active: pathname === '/membership' },
    { label: 'Events', to: '/events', active: pathname.startsWith('/events') },
    { label: 'Gallery', to: '/gallery', active: pathname === '/gallery' },
    { label: 'Contact', to: '/contact', active: pathname === '/contact' },
  ];

  const handleBookClick = (e) => {
    if (pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('booking-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="print-root-wrapper bg-[#c3b091] print:bg-white text-[#171614] antialiased p-2 sm:p-4 md:p-6 lg:p-7 print:p-0 min-h-screen print:min-h-0 selection:bg-[#c3b091]/35 selection:text-[#171614]">
      {/* Main White Canvas inside #c3b091 Frame */}
      <div className="bg-white max-w-[1360px] print:max-w-none mx-auto min-h-[calc(100vh-3.5rem)] print:min-h-0 rounded-[6px] sm:rounded-[8px] print:rounded-none shadow-[0_24px_80px_rgba(32,25,15,0.16)] print:shadow-none overflow-hidden flex flex-col justify-between">
        <div>
          {/* Top Navigation Header */}
          <header className="no-print px-5 sm:px-10 lg:px-14 pt-6 pb-4">
            <div className="flex items-center justify-between gap-4">
              {/* Brand Wordmark */}
              <Link
                to="/"
                className="inline-flex items-baseline text-[20px] sm:text-[22px] tracking-[-0.03em] text-[#141413] group"
              >
                <span className="font-normal">{brandPrefix}</span>
                <span className="font-bold">{brandSuffix}</span>
                <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-[#c3b091] group-hover:scale-125 transition"></span>
              </Link>

              {/* Center Floating Pill Navbar */}
              <nav
                aria-label="Main Navigation"
                className="hidden lg:inline-flex items-center bg-[#f6f4f0] rounded-full p-1 border border-[#ede8df]"
              >
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-4 py-1.5 rounded-full text-[12.5px] transition duration-150 ${
                      item.active
                        ? 'bg-[#e7dcc8] text-[#4f3e22] font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                        : 'text-[#57544e] hover:text-[#141413] font-medium'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Right Pill CTA + Mobile Hamburger */}
              <div className="flex items-center gap-2.5">
                {currentAdmin && (
                  <Link
                    to="/admin"
                    className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-full border border-[#c3b091] bg-[#fbf9f5] text-[12px] font-semibold text-[#6e5b3e] hover:bg-[#f2eadb] transition"
                  >
                    CMS Panel
                  </Link>
                )}

                <Link
                  to={pathname === '/' ? '/#booking-section' : '/'}
                  onClick={handleBookClick}
                  className="inline-flex items-center gap-2.5 bg-[#c3b091] hover:bg-[#b59f7c] text-[#171512] font-semibold text-[12.5px] rounded-full pl-4 pr-1.5 py-1.5 transition shadow-sm"
                >
                  <span>Book Table</span>
                  <span className="w-7 h-7 rounded-full bg-white text-[#171512] flex items-center justify-center shrink-0">
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 17L17 7" />
                      <path d="M8 7h9v9" />
                    </svg>
                  </span>
                </Link>

                {/* Mobile Menu Trigger */}
                <button
                  type="button"
                  aria-label="Toggle Menu"
                  onClick={() => setMobileOpen((prev) => !prev)}
                  className="lg:hidden w-10 h-10 rounded-full border border-[#e7e2d8] bg-[#faf8f5] flex items-center justify-center text-[#171512]"
                >
                  {!mobileOpen ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Responsive Mobile Navigation Drawer */}
            {mobileOpen && (
              <div className="lg:hidden mt-4 rounded-2xl border border-[#ece5d8] bg-[#faf8f4] p-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`block px-4 py-2.5 rounded-xl text-[13.5px] ${
                      item.active ? 'bg-[#e7dcc8] text-[#4f3e22] font-semibold' : 'text-[#44413c] hover:bg-white font-medium'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-2 mt-2 border-t border-[#e8e0d2] flex items-center justify-between px-2">
                  <Link to="/contact#lookup" className="text-xs font-semibold text-[#6e5b3e] hover:underline">
                    Check Booking Code
                  </Link>
                  <Link to="/admin/login" className="text-xs font-medium text-stone-500 hover:text-stone-800">
                    Admin CMS →
                  </Link>
                </div>
              </div>
            )}
          </header>

          {/* Global Flash Alerts */}
          {flash && (
            <div className="no-print max-w-[1040px] mx-auto px-5 sm:px-10 mt-2">
              {flash.type === 'success' ? (
                <div className="rounded-2xl border border-[#d6c5a9] bg-[#faf6ef] px-5 py-3.5 text-[13.5px] text-[#4f3e22] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#9e845b] shrink-0"></span>
                    <span className="font-medium">{flash.message}</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearFlash}
                    className="text-xs text-[#6e5b3e]/70 hover:text-[#4f3e22] font-semibold"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5 text-[13.5px] text-red-800 font-medium flex items-center justify-between gap-3">
                  <span>{flash.message}</span>
                  <button type="button" onClick={clearFlash} className="text-xs text-red-600 hover:text-red-900 font-semibold">
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Main Page Body */}
          <main>{children}</main>
        </div>

        {/* Seamless Bottom Rounded CTA Banner + Obsidian Footer Block */}
        <div className="no-print mx-2.5 sm:mx-5 mb-2.5 sm:mb-5 rounded-[22px] sm:rounded-[26px] overflow-hidden">
          {!hideCtaBanner && (
            <section className="relative min-h-[400px] sm:min-h-[460px] flex items-center justify-center text-center px-6 py-20 overflow-hidden">
              <img
                src={bannerUrl}
                alt="Hule Mahjong Club"
                className="absolute inset-0 w-full h-full object-cover object-center scale-[1.01]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#15120d]/55 via-[#15120d]/45 to-[#0d0e0c]/85"></div>

              <div className="relative z-10 max-w-[620px] mx-auto">
                <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-[#e7dcc8] font-semibold mb-4">
                  {siteSettings.banner_eyebrow || '2026 MEMBERSHIP — LIMITED PLACES'}
                </p>
                <h2 className="text-[32px] sm:text-[42px] lg:text-[46px] leading-[1.13] tracking-[-0.03em] text-white">
                  <span className="font-bold">{siteSettings.banner_title_line1_bold || 'Your First'}</span>{' '}
                  <span className="font-light text-white/95">{siteSettings.banner_title_line1_light || 'Round'}</span>
                  <br />
                  <span className="font-light text-white/95">{siteSettings.banner_title_line2_light || 'Starts'}</span>{' '}
                  <span className="font-bold">{siteSettings.banner_title_line2_bold || 'Here.'}</span>
                </h2>
                <p className="mt-4 text-[13px] sm:text-[14px] leading-[1.65] text-white/80 max-w-[490px] mx-auto">
                  {siteSettings.banner_description ||
                    'A curated number of Hule Club memberships open each season. Submit your application for priority automatic table reservations, VIP suite access, and tournament invitations.'}
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                  <Link
                    to="/membership#apply"
                    className="inline-flex items-center gap-3 bg-[#c3b091] hover:bg-[#d2c1a5] text-[#171512] font-semibold text-[12.5px] rounded-full pl-5 pr-1.5 py-1.5 transition shadow-lg"
                  >
                    <span>Apply for Membership</span>
                    <span className="w-7 h-7 rounded-full bg-white text-[#171512] flex items-center justify-center">
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7 17L17 7" />
                        <path d="M8 7h9v9" />
                      </svg>
                    </span>
                  </Link>

                  <a
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                      'Hi Hule Mahjong Concierge, I would like to inquire about table reservations / membership.'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/60 text-white font-medium text-[12.5px] rounded-full pl-5 pr-1.5 py-1.5 transition"
                  >
                    <span>Contact the Concierge</span>
                    <span className="w-7 h-7 rounded-full bg-white text-[#171512] flex items-center justify-center">
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7 17L17 7" />
                        <path d="M8 7h9v9" />
                      </svg>
                    </span>
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* Deep Obsidian Footer */}
          <footer className="bg-[#0d0e0c] text-white px-6 sm:px-12 lg:px-16 pt-14 sm:pt-16 pb-9">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
              {/* Column 1: Brand & Address */}
              <div className="lg:col-span-4 space-y-5">
                <Link to="/" className="inline-flex items-baseline text-[22px] tracking-[-0.03em] text-white">
                  <span className="font-light">{brandPrefix}</span>
                  <span className="font-bold text-[#c3b091]">{brandSuffix}</span>
                </Link>

                <div className="space-y-3 text-[12.5px] text-white/65 max-w-[280px]">
                  <div className="flex items-start gap-2.5">
                    <svg
                      className="w-4 h-4 text-[#c3b091] shrink-0 mt-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M12 21s-7-5.686-7-11a7 7 0 1 1 14 0c0 5.314-7 11-7 11z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    <span>
                      {siteSettings.contact_address || 'Rukan La Riviera PIK 2, Tangerang & Jl. M. Isa, Palembang'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <svg
                      className="w-4 h-4 text-[#c3b091] shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>{siteSettings.contact_phone || '+62 812-8899-7788'}</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Lounge */}
              <div className="lg:col-span-2">
                <h3 className="text-[13px] font-semibold text-white mb-4">Lounge</h3>
                <ul className="space-y-2.5 text-[12px] text-white/60">
                  <li>
                    <Link to="/" className="hover:text-[#c3b091] transition">
                      Book Automatic Table
                    </Link>
                  </li>
                  <li>
                    <Link to="/tables" className="hover:text-[#c3b091] transition">
                      Suites & Pricing
                    </Link>
                  </li>
                  <li>
                    <Link to="/gallery" className="hover:text-[#c3b091] transition">
                      Interior Gallery
                    </Link>
                  </li>
                  <li>
                    <Link to="/tables#etiquette" className="hover:text-[#c3b091] transition">
                      House Etiquette
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: Club */}
              <div className="lg:col-span-2">
                <h3 className="text-[13px] font-semibold text-white mb-4">Club</h3>
                <ul className="space-y-2.5 text-[12px] text-white/60">
                  <li>
                    <Link to="/events?category=Beginner+Coaching" className="hover:text-[#c3b091] transition">
                      Beginner Coaching
                    </Link>
                  </li>
                  <li>
                    <Link to="/events?category=Tournament" className="hover:text-[#c3b091] transition">
                      Championships
                    </Link>
                  </li>
                  <li>
                    <Link to="/events?category=Social+Night" className="hover:text-[#c3b091] transition">
                      Friday Mixers
                    </Link>
                  </li>
                  <li>
                    <Link to="/events" className="hover:text-[#c3b091] transition">
                      All Events
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 4: Membership */}
              <div className="lg:col-span-2">
                <h3 className="text-[13px] font-semibold text-white mb-4">Membership</h3>
                <ul className="space-y-2.5 text-[12px] text-white/60">
                  <li>
                    <Link to="/membership#apply" className="hover:text-[#c3b091] transition">
                      Apply Now
                    </Link>
                  </li>
                  <li>
                    <Link to="/membership" className="hover:text-[#c3b091] transition">
                      Privilege Tiers
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact#lookup" className="hover:text-[#c3b091] transition">
                      Check My Booking
                    </Link>
                  </li>
                  <li>
                    <Link to="/membership#faq" className="hover:text-[#c3b091] transition">
                      Member FAQs
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 5: Support */}
              <div className="lg:col-span-2">
                <h3 className="text-[13px] font-semibold text-white mb-4">Support</h3>
                <ul className="space-y-2.5 text-[12px] text-white/60">
                  <li>
                    <Link to="/contact" className="hover:text-[#c3b091] transition">
                      Concierge Desk
                    </Link>
                  </li>
                  <li>
                    <Link to="/tables#etiquette" className="hover:text-[#c3b091] transition">
                      No-Gambling Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/login" className="text-[#c3b091] hover:underline font-medium">
                      Admin CMS Login
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Copyright, BENCHCODE Trademark & Social Circles */}
            <div className="pt-7 flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-[11.5px] text-white/45 text-center sm:text-left">
                <p>
                  © {new Date().getFullYear()} {brandPrefix} {brandSuffix} Indonesia.{' '}
                  {siteSettings.house_policy || 'Strictly recreational & strategic point play.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* BENCHCODE Official Trademark Badge */}
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/[0.04] text-[11px] text-white/75 tracking-wide">
                  <svg className="w-3.5 h-4 shrink-0" viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 4H8a4 4 0 0 0-4 4v54a4 4 0 0 0 4 4h10" stroke="#c3b091" strokeWidth="7" strokeLinecap="round" />
                    <path d="M42 4h10a4 4 0 0 1 4 4v54a4 4 0 0 1-4 4H42" stroke="#c3b091" strokeWidth="7" strokeLinecap="round" />
                    <line x1="16" y1="26" x2="34" y2="26" stroke="#27B084" strokeWidth="6" strokeLinecap="round" />
                    <line x1="16" y1="38" x2="28" y2="38" stroke="#27B084" strokeWidth="6" strokeLinecap="round" />
                  </svg>
                  <span>
                    Powered by <strong className="font-bold text-white tracking-wider">BENCHCODE™</strong>
                  </span>
                </span>

                <div className="flex items-center gap-2">
                  <a
                    href={siteSettings.contact_instagram || 'https://instagram.com/hulemahjong.id'}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-8 h-8 rounded-full border border-white/15 hover:border-[#c3b091] text-white/70 hover:text-[#c3b091] flex items-center justify-center transition"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" />
                    </svg>
                  </a>
                  <a
                    href={`https://wa.me/${waNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="w-8 h-8 rounded-full border border-white/15 hover:border-[#c3b091] text-white/70 hover:text-[#c3b091] flex items-center justify-center transition"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </a>
                  <Link
                    to="/events"
                    aria-label="Events"
                    className="w-8 h-8 rounded-full border border-white/15 hover:border-[#c3b091] text-white/70 hover:text-[#c3b091] flex items-center justify-center transition"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  </Link>
                  <Link
                    to="/contact"
                    aria-label="Location"
                    className="w-8 h-8 rounded-full border border-white/15 hover:border-[#c3b091] text-white/70 hover:text-[#c3b091] flex items-center justify-center transition"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4l16 16M20 4L4 20" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

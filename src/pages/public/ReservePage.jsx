import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import { useHule } from '../../context/HuleContext';
import {
  calculatePricing,
  formatDateNice,
  getSlotsAvailability,
  hydrateCategory,
  todayStrOffset,
} from '../../utils/helpers';

function buildUpcomingDates() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const list = [];
  for (let i = 0; i < 21; i++) {
    const dateStr = todayStrOffset(i);
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    list.push({
      date: dateStr,
      day_short: days[dt.getDay()],
      day_num: String(dt.getDate()).padStart(2, '0'),
      month_short: months[dt.getMonth()],
    });
  }
  return list;
}

export default function ReservePage() {
  const { db, siteSettings, createBooking } = useHule();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const categories = useMemo(
    () =>
      db.tableCategories
        .filter((c) => c.is_active)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((c) => hydrateCategory(c, db)),
    [db]
  );

  const allDates = useMemo(() => buildUpcomingDates(), []);

  const requestedSlug = searchParams.get('category');
  const requestedDate = searchParams.get('date');

  const initialCat = useMemo(() => {
    if (requestedSlug) {
      const found = categories.find((c) => c.slug === requestedSlug);
      if (found) return found;
    }
    return categories[0] || null;
  }, [categories, requestedSlug]);

  const initialDate = useMemo(() => {
    if (requestedDate && allDates.some((d) => d.date === requestedDate)) {
      return requestedDate;
    }
    return allDates[1]?.date || allDates[0]?.date;
  }, [allDates, requestedDate]);

  const [categoryId, setCategoryId] = useState(() => initialCat?.id || 0);
  const [selectedDate, setSelectedDate] = useState(() => initialDate);
  const [weekPage, setWeekPage] = useState(() => {
    const idx = allDates.findIndex((d) => d.date === initialDate);
    return idx >= 0 ? Math.floor(idx / 7) : 0;
  });
  const [sessions, setSessions] = useState(1);
  const [players, setPlayers] = useState(4);
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Guest Modal Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('qris_transfer');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (requestedSlug) {
      const found = categories.find((c) => c.slug === requestedSlug);
      if (found) setCategoryId(found.id);
    } else if (categories.length && !categories.some((c) => c.id === categoryId)) {
      setCategoryId(categories[0].id);
    }
  }, [requestedSlug, categories, categoryId]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === Number(categoryId)) || categories[0] || null,
    [categories, categoryId]
  );

  const slots = useMemo(() => {
    if (!selectedCategory) return [];
    return getSlotsAvailability(db, selectedCategory, selectedDate, sessions);
  }, [db, selectedCategory, selectedDate, sessions]);

  // Ensure selectedTime points to an available slot if current one is unavailable
  useEffect(() => {
    if (!slots.length) return;
    const current = slots.find((s) => s.start_time === selectedTime);
    if (!current || !current.available) {
      const firstAvail = slots.find((s) => s.available);
      if (firstAvail) {
        setSelectedTime(firstAvail.start_time);
      } else if (!current) {
        setSelectedTime(slots[0].start_time);
      }
    }
  }, [slots, selectedTime]);

  const activeSlot = useMemo(
    () => slots.find((s) => s.start_time === selectedTime) || slots[0] || null,
    [slots, selectedTime]
  );

  const pricing = useMemo(() => {
    if (!selectedCategory) return null;
    return calculatePricing(db, selectedCategory, selectedDate, activeSlot?.start_time || selectedTime, sessions, appliedPromo);
  }, [db, selectedCategory, selectedDate, activeSlot, selectedTime, sessions, appliedPromo]);

  const weekSlice = allDates.slice(weekPage * 7, weekPage * 7 + 7);
  const monthLabel =
    weekSlice.length > 0
      ? weekSlice[0].month_short +
        (weekSlice[0].month_short !== weekSlice[weekSlice.length - 1].month_short
          ? ' – ' + weekSlice[weekSlice.length - 1].month_short
          : '')
      : '';

  const slotAvailable = Boolean(activeSlot?.available && activeSlot?.remaining_tables > 0);
  const remainingTables = activeSlot?.remaining_tables || 0;

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!selectedCategory || !slotAvailable) return;
    const code = createBooking({
      table_category_id: selectedCategory.id,
      booking_date: selectedDate,
      start_time: activeSlot.start_time,
      sessions_count: sessions,
      players_count: players,
      promo_code: pricing?.promo_valid ? appliedPromo : '',
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      payment_method: paymentMethod,
      notes,
    });
    if (code) {
      setModalOpen(false);
      navigate(`/booking/${code}`);
    }
  };

  return (
    <PublicLayout title="Reserve Mahjong Table — Hule Mahjong">
      {/* Centered Breadcrumb & Stacked Two-Tone Heading */}
      <section className="pt-9 pb-11 sm:pt-14 sm:pb-16 px-5 text-center">
        <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2 text-[12px] text-[#767676] mb-3.5">
          <Link to="/" className="hover:text-[#141413] transition">
            Home
          </Link>
          <span className="text-[#b5b5b5]">›</span>
          <Link to="/tables" className="hover:text-[#141413] transition">
            Lounge
          </Link>
          <span className="text-[#b5b5b5]">›</span>
          <span className="font-semibold text-[#8c734b]">Book Table</span>
        </nav>

        <h1 className="text-[34px] sm:text-[42px] lg:text-[44px] leading-[1.14] tracking-[-0.03em]">
          <span className="block font-semibold text-[#111111]">Reserve</span>
          <span className="block font-light text-[#6b6b6b]">Mahjong Table</span>
        </h1>
      </section>

      {/* Main Two-Column Interactive Booking Engine */}
      <section id="booking-section" className="max-w-[1040px] mx-auto px-5 sm:px-10 pb-20 sm:pb-28">
        {!categories.length || !selectedCategory ? (
          <div className="rounded-3xl border border-[#ece5d8] bg-[#faf8f4] p-10 text-center">
            <p className="text-base font-medium text-stone-700">
              No active mahjong table categories configured yet. Add tables in the Admin CMS.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              {/* LEFT COLUMN: Interactive Slot, Date, Suite & Players Controls */}
              <div className="lg:col-span-7 space-y-8">
                {/* 1. Time Slots Grid */}
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <label className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-[#1a1a1a]">
                      Select Time
                    </label>
                    <span className="text-[11px] font-medium text-[#8c734b] bg-[#f7f2e8] px-2.5 py-0.5 rounded-full border border-[#e8dcc8]">
                      {(pricing?.rate_label || 'Weekday Rate') + (pricing?.is_peak ? ' • Peak' : '')}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {slots.map((slot) => {
                      const isSelected = slot.available && slot.start_time === activeSlot?.start_time;
                      let cls = 'border-[#e5e5e5] bg-white text-[#181818] hover:border-[#c3b091]';
                      if (!slot.available) {
                        cls = 'border-[#efefef] bg-[#fcfcfc] text-[#c4c4c4] cursor-not-allowed';
                      } else if (isSelected) {
                        cls = 'border-[#c3b091] bg-[#f2eadb] text-[#534227] shadow-[0_2px_8px_rgba(195,176,145,0.22)]';
                      }
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => slot.available && setSelectedTime(slot.start_time)}
                          className={`slot-pill min-w-[88px] sm:min-w-[94px] h-[42px] px-4 rounded-full border text-[13.5px] font-semibold transition duration-150 flex items-center justify-center gap-1.5 ${cls}`}
                        >
                          <span>{slot.label}</span>
                          {slot.is_peak && slot.available && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c3b091]" title="Evening Peak Slot"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. 7-Day Date Cards Strip */}
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <label className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-[#1a1a1a]">
                      Available Dates
                    </label>
                    <div className="inline-flex items-center gap-1.5">
                      <span className="text-[11.5px] font-medium text-[#707070] mr-1">{monthLabel}</span>
                      <button
                        type="button"
                        aria-label="Previous 7 days"
                        disabled={weekPage === 0}
                        onClick={() => setWeekPage((p) => Math.max(0, p - 1))}
                        className="w-7 h-7 rounded-full border border-[#e6e6e6] hover:border-[#c3b091] flex items-center justify-center text-xs text-[#444] disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        aria-label="Next 7 days"
                        disabled={(weekPage + 1) * 7 >= allDates.length}
                        onClick={() => setWeekPage((p) => ((p + 1) * 7 < allDates.length ? p + 1 : p))}
                        className="w-7 h-7 rounded-full border border-[#e6e6e6] hover:border-[#c3b091] flex items-center justify-center text-xs text-[#444] disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
                    {weekSlice.map((item) => {
                      const active = item.date === selectedDate;
                      const cls = active
                        ? 'border-[#c3b091] bg-[#f2eadb] text-[#534227] shadow-[0_2px_8px_rgba(195,176,145,0.2)]'
                        : 'border-[#e6e6e6] bg-white text-[#181818] hover:border-[#c3b091]';
                      const dayCls = active ? 'text-[#6e5b3e]' : 'text-[#6b6b6b]';
                      return (
                        <button
                          key={item.date}
                          type="button"
                          onClick={() => setSelectedDate(item.date)}
                          className={`date-card h-[84px] sm:h-[88px] rounded-[14px] border flex flex-col items-center justify-between py-3.5 px-1 transition duration-150 ${cls}`}
                        >
                          <span className={`text-[11px] sm:text-[11.5px] font-medium ${dayCls}`}>{item.day_short}</span>
                          <span className="text-[15px] font-bold">{item.day_num}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Table / Suite Selector + Players & Session Duration */}
                <div className="space-y-5 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label
                        htmlFor="category-select"
                        className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-[#1a1a1a]"
                      >
                        Table / Suite Category
                      </label>
                      <Link to="/tables" className="text-[11px] font-medium text-[#8c734b] hover:underline">
                        Compare Suites →
                      </Link>
                    </div>
                    <select
                      id="category-select"
                      value={selectedCategory.id}
                      onChange={(e) => setCategoryId(Number(e.target.value))}
                      className="pill-select"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({cat.branch}) — {cat.formatted_weekday_price}/sesi
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="players-select"
                        className="block text-[10.5px] font-bold uppercase tracking-[0.09em] text-[#1a1a1a] mb-2.5"
                      >
                        Players
                      </label>
                      <select
                        id="players-select"
                        value={players}
                        onChange={(e) => setPlayers(Number(e.target.value))}
                        className="pill-select"
                      >
                        <option value={4}>4 Players (Standard Table)</option>
                        <option value={5}>5 Players (+1 Rotating)</option>
                        <option value={6}>6 Players (Suite Group)</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="sessions-select"
                        className="block text-[10.5px] font-bold uppercase tracking-[0.09em] text-[#1a1a1a] mb-2.5"
                      >
                        Duration
                      </label>
                      <select
                        id="sessions-select"
                        value={sessions}
                        onChange={(e) => setSessions(Number(e.target.value))}
                        className="pill-select"
                      >
                        <option value={1}>1 Session (2 Hours)</option>
                        <option value={2}>2 Sessions (4 Hours)</option>
                        <option value={3}>3 Sessions (6 Hours)</option>
                      </select>
                    </div>
                  </div>

                  {/* Optional Promo Voucher Input */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setPromoOpen((p) => !p)}
                      className="text-[12px] font-medium text-[#7c6642] hover:text-[#534227] inline-flex items-center gap-1.5"
                    >
                      <span>Have a promo code?</span>
                      <span className="text-[11px] text-[#9b896b]">(e.g. HULE10, FIRSTROUND)</span>
                    </button>
                    {promoOpen && (
                      <div className="mt-2.5 flex items-center gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          placeholder="Enter voucher code"
                          className="h-[42px] flex-1 rounded-full border border-[#e5e5e5] px-4 text-[13px] uppercase tracking-wider focus:border-[#c3b091] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setAppliedPromo(promoInput.trim())}
                          className="h-[42px] px-5 rounded-full bg-[#f2eadb] hover:bg-[#e7dcc8] text-[#534227] text-[12.5px] font-semibold transition"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                    {appliedPromo && pricing?.promo_message && (
                      <p
                        className={`mt-1.5 text-[11.5px] font-medium ${
                          pricing.promo_valid ? 'text-[#5c7a3e]' : 'text-red-600'
                        }`}
                      >
                        {pricing.promo_message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Elevated Summary Card */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-[#f0ede6] shadow-summary lg:sticky lg:top-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[20px] font-semibold text-[#141414] tracking-[-0.02em]">Summary</h2>
                    <span
                      className={
                        slotAvailable
                          ? 'text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#f5efe4] text-[#6e5b3e]'
                          : 'text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700'
                      }
                    >
                      {slotAvailable
                        ? `${remainingTables} Table${remainingTables > 1 ? 's' : ''} Available`
                        : 'Fully Booked'}
                    </span>
                  </div>

                  {/* Featured Suite / Lounge Photo */}
                  <div className="relative rounded-[14px] overflow-hidden mb-6 bg-[#f6f4f0] aspect-[16/10]">
                    <img
                      src={selectedCategory.image_url}
                      alt={selectedCategory.name}
                      className="w-full h-full object-cover transition duration-300"
                    />
                    <div className="absolute bottom-2.5 left-2.5 bg-black/55 backdrop-blur-md text-white text-[10.5px] font-medium px-3 py-1 rounded-full">
                      <span>{selectedCategory.branch}</span>
                    </div>
                  </div>

                  {/* Breakdown Key-Value Rows */}
                  <div className="divide-y divide-[#f1f0ec] text-[13px]">
                    <div className="py-3 flex items-center justify-between gap-4">
                      <span className="text-[10.5px] font-medium uppercase tracking-[0.07em] text-[#7a7a7a]">Date</span>
                      <span className="font-semibold text-[#151515]">{formatDateNice(selectedDate)}</span>
                    </div>

                    <div className="py-3 flex items-center justify-between gap-4">
                      <span className="text-[10.5px] font-medium uppercase tracking-[0.07em] text-[#7a7a7a]">Time</span>
                      <span className="font-semibold text-[#151515]">
                        {pricing?.start_time} – {pricing?.end_time} WIB
                      </span>
                    </div>

                    <div className="py-3 flex items-center justify-between gap-4">
                      <span className="text-[10.5px] font-medium uppercase tracking-[0.07em] text-[#7a7a7a]">Players</span>
                      <span className="font-semibold text-[#151515]">{players} Total</span>
                    </div>

                    <div className="py-3 flex items-center justify-between gap-4">
                      <span className="text-[10.5px] font-medium uppercase tracking-[0.07em] text-[#7a7a7a]">
                        Suite / Table
                      </span>
                      <span className="font-semibold text-[#151515] text-right">{selectedCategory.name}</span>
                    </div>

                    {pricing?.discount_amount > 0 && (
                      <div className="py-3 flex items-center justify-between gap-4">
                        <span className="text-[10.5px] font-medium uppercase tracking-[0.07em] text-[#8c734b]">
                          Promo Discount
                        </span>
                        <span className="font-semibold text-[#6e5b3e]">-{pricing.formatted_discount}</span>
                      </div>
                    )}
                  </div>

                  {/* Total Row */}
                  <div className="pt-4 pb-5 border-t border-[#f1f0ec] flex items-baseline justify-between">
                    <span className="text-[13px] text-[#6b6b6b]">Total</span>
                    <span className="text-[23px] font-bold text-[#111111] tracking-[-0.02em]">
                      {pricing?.formatted_total || selectedCategory.formatted_weekday_price}
                    </span>
                  </div>

                  {/* Primary Confirm Button */}
                  <button
                    type="button"
                    disabled={!slotAvailable}
                    onClick={() => slotAvailable && setModalOpen(true)}
                    className="w-full h-[48px] rounded-full bg-[#111111] hover:bg-[#2a241b] text-white text-[13.5px] font-medium transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {slotAvailable ? 'Confirm Booking' : 'No Tables Left on This Date'}
                  </button>

                  <p className="text-[11px] text-[#8a8a8a] text-center mt-3.5">
                    {siteSettings.cancellation_note || 'Free rescheduling up to 24h before session time.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Guest Details & Confirmation Modal */}
            {modalOpen && (
              <div
                onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs"
              >
                <div className="bg-white rounded-[26px] max-w-[500px] w-full p-6 sm:p-8 shadow-2xl border border-[#ece5d8] relative max-h-[92vh] overflow-y-auto">
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={() => setModalOpen(false)}
                    className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#f6f4f0] hover:bg-[#ebe3d4] flex items-center justify-center text-[#333] transition"
                  >
                    ✕
                  </button>

                  <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#8c734b] mb-1">
                    Complete Reservation
                  </p>
                  <h3 className="text-[22px] font-semibold text-[#141414] tracking-[-0.02em]">Guest Information</h3>

                  {/* Mini Summary Strip inside Modal */}
                  <div className="mt-4 mb-5 rounded-2xl bg-[#faf7f2] border border-[#ebe2d2] p-4 flex items-center justify-between gap-3 text-[12.5px]">
                    <div>
                      <p className="font-semibold text-[#171614]">
                        {selectedCategory.name} ({selectedCategory.branch})
                      </p>
                      <p className="text-[#6b665e] mt-0.5">
                        {formatDateNice(selectedDate)} • {pricing?.start_time}–{pricing?.end_time} WIB • {players}{' '}
                        Players
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-[#8c734b] font-semibold">Total</p>
                      <p className="text-[16px] font-bold text-[#141414]">{pricing?.formatted_total}</p>
                    </div>
                  </div>

                  <form onSubmit={handleConfirmBooking} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#333] mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Clarissa Tanoto"
                        className="w-full h-[44px] rounded-xl border border-[#e3dfd7] px-4 text-[13.5px] focus:border-[#c3b091] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#333] mb-1.5">
                          WhatsApp / Phone *
                        </label>
                        <input
                          type="text"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="0812xxxxxxxx"
                          className="w-full h-[44px] rounded-xl border border-[#e3dfd7] px-4 text-[13.5px] focus:border-[#c3b091] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#333] mb-1.5">
                          Email (Optional)
                        </label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="you@email.com"
                          className="w-full h-[44px] rounded-xl border border-[#e3dfd7] px-4 text-[13.5px] focus:border-[#c3b091] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#333] mb-1.5">
                        Payment Preference
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="pill-select !rounded-xl !h-[44px]"
                      >
                        <option value="qris_transfer">QRIS / Bank BCA Transfer</option>
                        <option value="pay_at_lounge">Pay at Concierge Desk (Hold 15m before slot)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#333] mb-1.5">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Need beginner rule card, hot tieguanyin tea pot..."
                        className="w-full rounded-xl border border-[#e3dfd7] p-3.5 text-[13px] focus:border-[#c3b091] focus:outline-none"
                      />
                    </div>

                    <p className="text-[11px] text-[#7a746a] bg-[#faf8f4] rounded-xl px-3.5 py-2.5 border border-[#eee7da]">
                      By confirming, you agree to Hule Mahjong’s house etiquette: strictly social & recreational
                      strategy play (zero gambling).
                    </p>

                    <button
                      type="submit"
                      className="w-full h-[48px] rounded-full bg-[#111111] hover:bg-[#c3b091] hover:text-[#141413] text-white font-semibold text-[13.5px] transition"
                    >
                      Lock Automatic Table Now →
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </PublicLayout>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { useHule } from '../../context/HuleContext';
import { hydrateBooking, hydrateCategory, todayStrOffset } from '../../utils/helpers';

function BookingRow({ b, categoryTables, onSave, onDelete }) {
  const [tableId, setTableId] = useState(b.mahjong_table_id || '');
  const [status, setStatus] = useState(b.status || 'pending');
  const [paymentStatus, setPaymentStatus] = useState(b.payment_status || 'unpaid');

  useEffect(() => {
    setTableId(b.mahjong_table_id || '');
    setStatus(b.status || 'pending');
    setPaymentStatus(b.payment_status || 'unpaid');
  }, [b.mahjong_table_id, b.status, b.payment_status]);

  return (
    <tr>
      <td className="py-3.5 px-4 whitespace-nowrap">
        <Link
          to={`/booking/${b.booking_code}`}
          target="_blank"
          className="font-bold text-stone-900 hover:text-[#8c734b] underline"
        >
          {b.booking_code}
        </Link>
        <span className="block text-[11px] text-stone-400">{b.category?.name || '-'}</span>
      </td>
      <td className="py-3.5 px-4">
        <span className="font-semibold text-stone-800">{b.customer_name}</span>
        <span className="block text-stone-500">
          {b.customer_phone} • {b.players_count}p
        </span>
      </td>
      <td className="py-3.5 px-4 whitespace-nowrap">
        <span className="font-semibold">{b.date_dmy}</span>
        <span className="block text-stone-500">
          {b.start_time}–{b.end_time} ({b.sessions_count}x)
        </span>
      </td>
      <td className="py-3.5 px-4 whitespace-nowrap">
        <span className="font-bold text-stone-900">{b.formatted_total}</span>
        {b.payment_proof_url && (
          <a
            href={b.payment_proof_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-[11px] font-semibold text-emerald-700 underline mt-0.5"
          >
            View Receipt ↗
          </a>
        )}
      </td>
      <td className="py-3.5 px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(b.id, { mahjong_table_id: tableId, status, payment_status: paymentStatus });
          }}
          className="flex flex-wrap items-center gap-2"
        >
          <select
            value={tableId}
            onChange={(e) => setTableId(e.target.value)}
            className="rounded-lg border border-stone-200 px-2 py-1.5 text-xs"
          >
            <option value="">-- Table --</option>
            {categoryTables.map((tbl) => (
              <option key={tbl.id} value={tbl.id}>
                {tbl.code}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-stone-200 px-2 py-1.5 text-xs"
          >
            {['pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
              <option key={st} value={st}>
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="rounded-lg border border-stone-200 px-2 py-1.5 text-xs"
          >
            {['unpaid', 'waiting_verification', 'paid', 'refunded'].map((pst) => (
              <option key={pst} value={pst}>
                {pst.charAt(0).toUpperCase() + pst.slice(1).replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-[#c3b091] hover:bg-[#b59f7c] text-[#141310] font-semibold text-xs"
          >
            Save
          </button>
        </form>
      </td>
      <td className="py-3.5 px-4 text-right">
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Delete this booking permanently?')) onDelete(b.id);
          }}
          className="text-red-500 hover:underline font-medium"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

export default function AdminBookingsPage() {
  const { db, createWalkInBooking, updateBooking, deleteBooking } = useHule();
  const [searchParams, setSearchParams] = useSearchParams();

  const [walkinOpen, setWalkinOpen] = useState(false);

  const categories = useMemo(
    () => db.tableCategories.map((c) => hydrateCategory(c, db)),
    [db]
  );
  const slots = useMemo(
    () => [...db.timeSlots].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    [db.timeSlots]
  );

  // Walk-in form state
  const [wiCatId, setWiCatId] = useState(() => categories[0]?.id || 1);
  const [wiDate, setWiDate] = useState(() => todayStrOffset(0));
  const [wiTime, setWiTime] = useState(() => slots[0]?.start_time || '13:00');
  const [wiSessions, setWiSessions] = useState(1);
  const [wiName, setWiName] = useState('');
  const [wiPhone, setWiPhone] = useState('');
  const [wiPlayers, setWiPlayers] = useState(4);
  const [wiPayment, setWiPayment] = useState('paid');

  // Filter state
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [filterDate, setFilterDate] = useState(() => searchParams.get('date') || '');
  const [filterStatus, setFilterStatus] = useState(() => searchParams.get('status') || 'all');

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) setSearch(q);
  }, [searchParams]);

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.bookings
      .filter((b) => {
        if (q) {
          const hit =
            String(b.booking_code).toLowerCase().includes(q) ||
            String(b.customer_name).toLowerCase().includes(q) ||
            String(b.customer_phone).toLowerCase().includes(q);
          if (!hit) return false;
        }
        if (filterDate && b.booking_date !== filterDate) return false;
        if (filterStatus && filterStatus !== 'all' && b.status !== filterStatus) return false;
        return true;
      })
      .map((b) => hydrateBooking(b, db));
  }, [db, search, filterDate, filterStatus]);

  const handleWalkIn = (e) => {
    e.preventDefault();
    createWalkInBooking({
      table_category_id: wiCatId,
      booking_date: wiDate,
      start_time: wiTime,
      sessions_count: wiSessions,
      customer_name: wiName,
      customer_phone: wiPhone,
      players_count: wiPlayers,
      payment_status: wiPayment,
    });
    setWiName('');
    setWiPhone('');
    setWalkinOpen(false);
  };

  const hasFilters = Boolean(search || filterDate || (filterStatus && filterStatus !== 'all'));

  return (
    <AdminLayout
      title="Bookings Management — Hule Mahjong CMS"
      heading="Reservations & Walk-Ins"
      subheading="Verify transfers, reassign automatic tables, or create walk-in bookings."
      headerActions={
        <button
          type="button"
          onClick={() => setWalkinOpen((p) => !p)}
          className="px-4 py-2 rounded-full bg-[#111] hover:bg-[#c3b091] text-white hover:text-[#141310] text-xs font-semibold transition"
        >
          + New Walk-In Booking
        </button>
      }
    >
      {/* Walk-In Quick Creation Form */}
      {walkinOpen && (
        <div className="bg-white rounded-2xl border border-[#dfd3be] p-6 mb-6">
          <h2 className="text-[16px] font-bold mb-4">Create Walk-In / Phone Reservation</h2>
          <form onSubmit={handleWalkIn} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="cms-label">Suite / Category *</label>
              <select
                value={wiCatId}
                onChange={(e) => setWiCatId(Number(e.target.value))}
                required
                className="cms-input"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.formatted_weekday_price})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="cms-label">Date *</label>
              <input
                type="date"
                value={wiDate}
                onChange={(e) => setWiDate(e.target.value)}
                required
                className="cms-input"
              />
            </div>
            <div>
              <label className="cms-label">Start Time *</label>
              <select value={wiTime} onChange={(e) => setWiTime(e.target.value)} required className="cms-input">
                {slots.map((s) => (
                  <option key={s.id} value={s.start_time}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="cms-label">Duration (Sessions)</label>
              <select
                value={wiSessions}
                onChange={(e) => setWiSessions(Number(e.target.value))}
                className="cms-input"
              >
                <option value={1}>1 Session (2h)</option>
                <option value={2}>2 Sessions (4h)</option>
                <option value={3}>3 Sessions (6h)</option>
              </select>
            </div>
            <div>
              <label className="cms-label">Guest Name *</label>
              <input
                type="text"
                value={wiName}
                onChange={(e) => setWiName(e.target.value)}
                required
                placeholder="Walk-in guest"
                className="cms-input"
              />
            </div>
            <div>
              <label className="cms-label">Phone / WhatsApp *</label>
              <input
                type="text"
                value={wiPhone}
                onChange={(e) => setWiPhone(e.target.value)}
                required
                placeholder="0812..."
                className="cms-input"
              />
            </div>
            <div>
              <label className="cms-label">Players</label>
              <input
                type="number"
                value={wiPlayers}
                onChange={(e) => setWiPlayers(Number(e.target.value))}
                min={2}
                max={12}
                className="cms-input"
              />
            </div>
            <div>
              <label className="cms-label">Payment Status</label>
              <select value={wiPayment} onChange={(e) => setWiPayment(e.target.value)} className="cms-input">
                <option value="paid">Paid at Desk</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#c3b091] hover:bg-[#b59f7c] text-[#141310] text-xs font-bold"
              >
                Assign Automatic Table & Save →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Bar */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="bg-white rounded-2xl border border-[#ebe5d9] p-4 mb-6 flex flex-wrap items-center gap-3"
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search code, guest, phone..."
          className="cms-input sm:w-64"
        />
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="cms-input sm:w-44"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="cms-input sm:w-44"
        >
          <option value="all">All Statuses</option>
          {['pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
            <option key={st} value={st}>
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </option>
          ))}
        </select>
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#111] text-white text-xs font-semibold">
          Filter
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setFilterDate('');
              setFilterStatus('all');
              setSearchParams({});
            }}
            className="text-xs text-stone-500 hover:underline px-2"
          >
            Reset
          </button>
        )}
      </form>

      {/* Bookings List */}
      <div className="bg-white rounded-2xl border border-[#ebe5d9] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf8f4] border-b border-[#ebe5d9] text-[11px] uppercase tracking-wider text-stone-500">
              <tr>
                <th className="py-3.5 px-4">Booking</th>
                <th className="py-3.5 px-4">Guest</th>
                <th className="py-3.5 px-4">Schedule</th>
                <th className="py-3.5 px-4">Total & Proof</th>
                <th className="py-3.5 px-4">Assign Unit / Status / Payment</th>
                <th className="py-3.5 px-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    No matching bookings found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <BookingRow
                    key={b.id}
                    b={b}
                    categoryTables={db.mahjongTables.filter((t) => t.table_category_id === b.table_category_id)}
                    onSave={updateBooking}
                    onDelete={deleteBooking}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

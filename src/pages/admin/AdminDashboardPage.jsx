import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { useHule } from '../../context/HuleContext';
import {
  formatDateEventCard,
  formatRupiah,
  hydrateBooking,
  timeToMinutes,
  todayStrOffset,
} from '../../utils/helpers';

export default function AdminDashboardPage() {
  const { db } = useHule();
  const todayStr = todayStrOffset(0);
  const [dateInput, setDateInput] = useState(todayStr);
  const [scheduleDate, setScheduleDate] = useState(todayStr);

  const todayBookingsCount = useMemo(
    () => db.bookings.filter((b) => b.booking_date === todayStr && b.status !== 'cancelled').length,
    [db.bookings, todayStr]
  );

  const currentYm = todayStr.slice(0, 7);
  const monthRevenue = useMemo(
    () =>
      db.bookings
        .filter((b) => String(b.booking_date).startsWith(currentYm) && b.status !== 'cancelled')
        .reduce((sum, b) => sum + Number(b.total_price || 0), 0),
    [db.bookings, currentYm]
  );

  const totalTables = db.mahjongTables.length;
  const activeTablesCount = db.mahjongTables.filter((t) => t.status === 'active').length;
  const maintenanceTablesCount = db.mahjongTables.filter((t) => t.status !== 'active').length;
  const upcomingEventsCount = db.events.filter((e) => e.is_active).length;
  const galleryCount = db.galleries.filter((g) => g.is_active).length;
  const pendingAppsCount = db.membershipApplications.filter((a) => a.status === 'pending').length;

  const slots = useMemo(
    () =>
      db.timeSlots
        .filter((s) => s.is_active)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || a.start_time.localeCompare(b.start_time)),
    [db.timeSlots]
  );

  const tables = useMemo(
    () =>
      [...db.mahjongTables]
        .sort((a, b) => a.table_category_id - b.table_category_id || a.code.localeCompare(b.code))
        .map((t) => ({
          ...t,
          category: db.tableCategories.find((c) => c.id === t.table_category_id) || null,
        })),
    [db.mahjongTables, db.tableCategories]
  );

  // Build matrix [tableId][slotStartTime] => booking
  const matrix = useMemo(() => {
    const map = {};
    const dayBookings = db.bookings.filter((b) => b.booking_date === scheduleDate && b.status !== 'cancelled');
    for (const t of tables) {
      map[t.id] = {};
      for (const s of slots) {
        const sStart = timeToMinutes(s.start_time);
        const sEnd = sStart + 120;
        const hit = dayBookings.find((b) => {
          if (Number(b.mahjong_table_id) !== t.id) return false;
          const bStart = timeToMinutes(b.start_time);
          const bEnd = bStart + Number(b.duration_minutes || 120);
          return sStart < bEnd && sEnd > bStart;
        });
        map[t.id][s.start_time] = hit || null;
      }
    }
    return map;
  }, [db.bookings, scheduleDate, tables, slots]);

  const recentBookings = useMemo(
    () => db.bookings.slice(0, 8).map((b) => hydrateBooking(b, db)),
    [db]
  );

  const monthTitle = useMemo(() => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const now = new Date();
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  }, []);

  return (
    <AdminLayout
      title="Dashboard — Hule Mahjong CMS"
      heading="Executive Overview & Live Floor"
      subheading="Monitor real-time automatic table occupancy, revenue, and bookings."
      headerActions={
        <Link
          to="/admin/tables"
          className="px-4 py-2 rounded-full bg-[#c3b091] hover:bg-[#b59f7c] text-[#141310] text-xs font-semibold transition"
        >
          + Manage Tables & Prices
        </Link>
      }
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-[#ebe5d9]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8c734b]">Today&apos;s Bookings</p>
          <p className="text-[28px] font-bold text-[#141414] mt-1">{todayBookingsCount}</p>
          <p className="text-xs text-stone-500 mt-1">Active reservations today</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#ebe5d9]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8c734b]">Monthly Revenue</p>
          <p className="text-[26px] font-bold text-[#141414] mt-1">{formatRupiah(monthRevenue)}</p>
          <p className="text-xs text-stone-500 mt-1">{monthTitle} gross bookings</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#ebe5d9]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8c734b]">Automatic Tables</p>
          <p className="text-[28px] font-bold text-[#141414] mt-1">
            {activeTablesCount} <span className="text-sm font-normal text-stone-400">/ {totalTables} active</span>
          </p>
          <p className="text-xs text-stone-500 mt-1">{maintenanceTablesCount} unit(s) in maintenance</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#ebe5d9]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8c734b]">Events & Media</p>
          <p className="text-[28px] font-bold text-[#141414] mt-1">
            {upcomingEventsCount} <span className="text-sm font-normal text-stone-400">Events</span>
          </p>
          <p className="text-xs text-stone-500 mt-1">
            {galleryCount} Gallery Photos • {pendingAppsCount} Member Apps
          </p>
        </div>
      </div>

      {/* Live Floor Schedule Matrix */}
      <div className="bg-white rounded-2xl border border-[#ebe5d9] p-5 sm:p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-[17px] font-bold text-[#141414]">Live Table Occupancy Matrix</h2>
            <p className="text-xs text-stone-500">
              Visual slot schedule across all physical mahjong tables for {formatDateEventCard(scheduleDate)}
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setScheduleDate(dateInput);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="cms-input !w-auto !py-1.5 text-xs"
            />
            <button type="submit" className="px-4 py-2 rounded-xl bg-[#111] text-white text-xs font-semibold">
              Load Date
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[780px]">
            <thead>
              <tr className="border-b border-stone-200 text-[11px] uppercase tracking-wider text-stone-500">
                <th className="py-2.5 pr-4">Table Unit</th>
                {slots.map((slot) => (
                  <th key={slot.id} className="py-2.5 px-2 text-center">
                    {slot.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {tables.map((t) => (
                <tr key={t.id}>
                  <td className="py-2.5 pr-4 whitespace-nowrap">
                    <span className="font-bold text-stone-900">{t.code}</span>
                    <span className="block text-[11px] text-stone-400">{t.category?.name || '-'}</span>
                  </td>
                  {slots.map((slot) => {
                    const cellBooking = matrix[t.id]?.[slot.start_time] || null;
                    return (
                      <td key={slot.id} className="p-1.5 text-center">
                        {t.status !== 'active' ? (
                          <span className="block py-1.5 px-2 rounded-lg bg-amber-50 text-amber-700 text-[10.5px] font-medium">
                            {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                          </span>
                        ) : cellBooking ? (
                          <Link
                            to={`/admin/bookings?search=${encodeURIComponent(cellBooking.booking_code)}`}
                            className="block py-1.5 px-2 rounded-lg bg-[#e7dcc8] text-[#4f3e22] text-[10.5px] font-semibold truncate max-w-[105px] mx-auto"
                            title={`${cellBooking.customer_name} (${cellBooking.booking_code})`}
                          >
                            {cellBooking.customer_name.length > 10
                              ? `${cellBooking.customer_name.slice(0, 10)}...`
                              : cellBooking.customer_name}
                          </Link>
                        ) : (
                          <span className="block py-1.5 px-2 rounded-lg bg-stone-50 text-stone-400 text-[10.5px]">
                            Open
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl border border-[#ebe5d9] p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-bold text-[#141414]">Recent Reservations</h2>
          <Link to="/admin/bookings" className="text-xs font-semibold text-[#8c734b] hover:underline">
            Manage All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-[11px] uppercase tracking-wider text-stone-500">
                <th className="py-3 pr-3">Code</th>
                <th className="py-3 px-3">Guest</th>
                <th className="py-3 px-3">Suite & Unit</th>
                <th className="py-3 px-3">Schedule</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 pl-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-stone-400">
                    No bookings yet.
                  </td>
                </tr>
              ) : (
                recentBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="py-3 pr-3 font-bold text-stone-900">
                      <Link
                        to={`/booking/${b.booking_code}`}
                        target="_blank"
                        className="hover:text-[#8c734b] underline"
                      >
                        {b.booking_code}
                      </Link>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-stone-800">{b.customer_name}</span>
                      <span className="block text-stone-400">{b.customer_phone}</span>
                    </td>
                    <td className="py-3 px-3">
                      {b.category?.name || '-'}
                      <span className="block text-[#8c734b] font-semibold">{b.table?.code || 'Unassigned'}</span>
                    </td>
                    <td className="py-3 px-3">
                      {b.date_dmy}
                      <span className="block text-stone-500">
                        {b.start_time}–{b.end_time}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold">{b.formatted_total}</td>
                    <td className="py-3 pl-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold uppercase ${
                          b.status === 'confirmed'
                            ? 'bg-[#f2eadb] text-[#534227]'
                            : b.status === 'cancelled'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

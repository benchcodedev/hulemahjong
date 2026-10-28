export function formatRupiah(amount) {
  const n = Math.max(0, Math.round(Number(amount) || 0));
  return 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function timeToMinutes(hhmm) {
  const [h, m] = String(hhmm || '10:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(totalMinutes) {
  const norm = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function todayStrOffset(days = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function isWeekendDate(dateStr) {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  const day = dt.getDay();
  return day === 0 || day === 6;
}

export function formatDateNice(dateStr, withWeekday = false) {
  if (!dateStr) return '-';
  const [y, m, d] = String(dateStr).split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const base = `${months[dt.getMonth()]} ${String(dt.getDate()).padStart(2, '0')}, ${dt.getFullYear()}`;
  return withWeekday ? `${days[dt.getDay()]}, ${base}` : base;
}

export function formatDateDMY(dateStr) {
  if (!dateStr) return '-';
  const [y, m, d] = String(dateStr).split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${String(dt.getDate()).padStart(2, '0')} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
}

export function formatDateEventCard(dateStr) {
  if (!dateStr) return '-';
  const [y, m, d] = String(dateStr).split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[dt.getDay()]}, ${String(dt.getDate()).padStart(2, '0')} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
}

export function formatDateFull(dateStr) {
  if (!dateStr) return '-';
  const [y, m, d] = String(dateStr).split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${days[dt.getDay()]}, ${String(dt.getDate()).padStart(2, '0')} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
}

export function slugify(str) {
  return (
    String(str || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `item-${Date.now()}`
  );
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export function getAvailableTables(db, categoryId, dateStr, startTime, durationMinutes, excludeBookingId = null) {
  const activeTables = db.mahjongTables
    .filter((t) => t.table_category_id === Number(categoryId) && t.status === 'active')
    .sort((a, b) => a.code.localeCompare(b.code));

  if (!activeTables.length) return [];

  const reqStart = timeToMinutes(startTime);
  const reqEnd = reqStart + durationMinutes;

  const existing = db.bookings.filter(
    (b) =>
      b.table_category_id === Number(categoryId) &&
      b.booking_date === dateStr &&
      b.status !== 'cancelled' &&
      (!excludeBookingId || b.id !== Number(excludeBookingId))
  );

  const occupiedIds = new Set();
  let unassigned = 0;

  for (const b of existing) {
    const bStart = timeToMinutes(b.start_time);
    const bEnd = bStart + Number(b.duration_minutes || 120);
    if (reqStart < bEnd && reqEnd > bStart) {
      if (b.mahjong_table_id) occupiedIds.add(Number(b.mahjong_table_id));
      else unassigned++;
    }
  }

  let free = activeTables.filter((t) => !occupiedIds.has(t.id));
  if (unassigned > 0) free = free.slice(unassigned);
  return free;
}

export function calculatePricing(db, category, dateStr, startTime, sessionsCount = 1, promoCodeStr = '') {
  const sessions = Math.max(1, Math.min(6, Number(sessionsCount) || 1));
  const weekend = isWeekendDate(dateStr);
  const slotObj = db.timeSlots.find((s) => s.start_time === startTime);
  const isPeak = slotObj ? Boolean(slotObj.is_peak) : timeToMinutes(startTime) >= 18 * 60;

  const sessionRate = weekend ? Number(category.weekend_price) : Number(category.weekday_price);
  const peakPerSession = isPeak ? Number(category.peak_surcharge || 0) : 0;
  const basePrice = (sessionRate + peakPerSession) * sessions;

  let discountAmount = 0;
  let appliedCode = null;
  let promoValid = false;
  let promoMessage = null;

  const cleanPromo = String(promoCodeStr || '').trim().toUpperCase();
  if (cleanPromo) {
    const promo = db.promoCodes.find((p) => p.code === cleanPromo);
    const todayStr = todayStrOffset(0);
    const notExpired = !promo?.valid_until || promo.valid_until >= todayStr;
    const withinLimit = !promo?.usage_limit || promo.used_count < promo.usage_limit;

    if (promo && promo.is_active && notExpired && withinLimit) {
      if (promo.discount_type === 'percentage') {
        discountAmount = Math.round(basePrice * (Number(promo.discount_value) / 100));
        if (promo.max_discount && discountAmount > promo.max_discount) {
          discountAmount = Number(promo.max_discount);
        }
      } else {
        discountAmount = Number(promo.discount_value);
      }
      discountAmount = Math.min(discountAmount, basePrice);
      appliedCode = promo.code;
      promoValid = true;
      promoMessage = `Promo ${promo.code} applied (-${formatRupiah(discountAmount)})`;
    } else {
      promoMessage = 'Promo code is invalid or expired.';
    }
  }

  const totalPrice = Math.max(0, basePrice - discountAmount);
  const durationMinutes = Number(category.session_minutes || 120) * sessions;
  const endTime = minutesToTime(timeToMinutes(startTime) + durationMinutes);

  return {
    is_weekend: weekend,
    rate_label: weekend ? 'Weekend Rate' : 'Weekday Rate',
    is_peak: isPeak,
    session_rate: sessionRate,
    peak_surcharge: peakPerSession * sessions,
    sessions_count: sessions,
    duration_minutes: durationMinutes,
    start_time: startTime,
    end_time: endTime,
    base_price: basePrice,
    discount_amount: discountAmount,
    promo_code: appliedCode,
    promo_valid: promoValid,
    promo_message: promoMessage,
    total_price: totalPrice,
    formatted_base: formatRupiah(basePrice),
    formatted_discount: formatRupiah(discountAmount),
    formatted_total: formatRupiah(totalPrice),
  };
}

export function getSlotsAvailability(db, category, dateStr, sessionsCount = 1) {
  const slots = db.timeSlots
    .filter((s) => s.is_active)
    .sort((a, b) => a.sort_order - b.sort_order || a.start_time.localeCompare(b.start_time));

  const totalTables = db.mahjongTables.filter((t) => t.table_category_id === category.id && t.status === 'active').length;
  const durationMinutes = Number(category.session_minutes || 120) * Math.max(1, Number(sessionsCount) || 1);
  const now = new Date();
  const todayStr = todayStrOffset(0);
  const nowMinutes = now.getHours() * 60 + now.getMinutes() - 15;

  return slots.map((slot) => {
    const free = getAvailableTables(db, category.id, dateStr, slot.start_time, durationMinutes);
    const pricing = calculatePricing(db, category, dateStr, slot.start_time, sessionsCount);
    const isPast = dateStr < todayStr || (dateStr === todayStr && timeToMinutes(slot.start_time) < nowMinutes);
    const remaining = isPast ? 0 : free.length;

    return {
      id: slot.id,
      start_time: slot.start_time,
      label: slot.label,
      is_peak: Boolean(slot.is_peak),
      available: remaining > 0,
      is_past: isPast,
      remaining_tables: remaining,
      total_tables: totalTables,
      price: pricing.total_price,
      formatted_price: pricing.formatted_total,
    };
  });
}

export function generateBookingCode(db) {
  const now = new Date();
  const ymd = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  do {
    let rand = '';
    for (let i = 0; i < 4; i++) rand += chars[Math.floor(Math.random() * chars.length)];
    code = `HLM-${ymd}-${rand}`;
  } while (db.bookings.some((b) => b.booking_code === code));
  return code;
}

export function hydrateCategory(cat, db) {
  if (!cat) return null;
  const tables = db.mahjongTables
    .filter((t) => t.table_category_id === cat.id)
    .sort((a, b) => a.code.localeCompare(b.code));
  const activeTables = tables.filter((t) => t.status === 'active');
  return {
    ...cat,
    image_url: cat.image_path || '/images/mahjong/lounge-regular.jpg',
    formatted_weekday_price: formatRupiah(cat.weekday_price),
    formatted_weekend_price: formatRupiah(cat.weekend_price),
    tables,
    tables_count: tables.length,
    active_tables_count: activeTables.length,
  };
}

export function hydrateBooking(b, db) {
  if (!b) return null;
  const catRaw = db.tableCategories.find((c) => c.id === b.table_category_id);
  const category = catRaw ? hydrateCategory(catRaw, db) : null;
  const table = db.mahjongTables.find((t) => t.id === b.mahjong_table_id) || null;
  return {
    ...b,
    category,
    table,
    formatted_total: formatRupiah(b.total_price),
    formatted_base: formatRupiah(b.base_price),
    formatted_discount: formatRupiah(b.discount_amount),
    payment_proof_url: b.payment_proof_path || null,
    date_dmy: formatDateDMY(b.booking_date),
    date_card: formatDateNice(b.booking_date, true),
  };
}

export function hydrateEvent(ev) {
  if (!ev) return null;
  const remaining = Math.max(0, Number(ev.quota || 0) - Number(ev.registered_count || 0));
  return {
    ...ev,
    image_url: ev.image_path || '/images/mahjong/event-tournament.jpg',
    formatted_price: Number(ev.price) > 0 ? formatRupiah(ev.price) : 'Free Entry',
    remaining_seats: remaining,
    date_card: formatDateEventCard(ev.event_date),
    date_full: formatDateFull(ev.event_date),
  };
}

export function hydrateGallery(g) {
  return {
    ...g,
    image_url: g.image_path || '/images/mahjong/lounge-regular.jpg',
  };
}

export function hydratePlan(p) {
  return {
    ...p,
    formatted_price: formatRupiah(p.price),
  };
}

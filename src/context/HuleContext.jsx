import React, { createContext, useContext, useEffect, useState } from 'react';
import { buildInitialData } from '../data/seedData';
import {
  calculatePricing,
  generateBookingCode,
  getAvailableTables,
  slugify,
  todayStrOffset,
} from '../utils/helpers';

const STORAGE_KEY = 'hule_mahjong_react_db_v1';
const ADMIN_SESSION_KEY = 'hule_mahjong_admin_session_v1';

const HuleContext = createContext(null);

export function HuleProvider({ children }) {
  const [db, setDb] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return buildInitialData();
  });

  const [currentAdmin, setCurrentAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem(ADMIN_SESSION_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return null;
  });

  const [flash, setFlashState] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (_) {}
  }, [db]);

  const notify = (type, message) => {
    setFlashState({ type, message, ts: Date.now() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFlash = () => setFlashState(null);

  // Admin Auth
  const loginAdmin = (email, password) => {
    const validEmail = (db.adminUser?.email || 'admin@hulemahjong.id').toLowerCase();
    const validPass = db.adminUser?.password || 'password123';
    if (String(email || '').trim().toLowerCase() === validEmail && String(password || '') === validPass) {
      const sessionObj = { email: validEmail, name: db.adminUser?.name || 'Hule Concierge Admin' };
      setCurrentAdmin(sessionObj);
      try {
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionObj));
      } catch (_) {}
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setCurrentAdmin(null);
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (_) {}
  };

  // Public Booking Creation
  const createBooking = (payload) => {
    const category = db.tableCategories.find((c) => c.id === Number(payload.table_category_id) && c.is_active);
    if (!category) {
      notify('error', 'Selected table category is invalid.');
      return null;
    }

    const dateStr = payload.booking_date || todayStrOffset(1);
    const startTime = payload.start_time || '13:00';
    const sessions = Math.max(1, Math.min(6, Number(payload.sessions_count) || 1));
    const players = Math.max(1, Math.min(12, Number(payload.players_count) || 4));
    const pricing = calculatePricing(db, category, dateStr, startTime, sessions, payload.promo_code || '');
    const freeTables = getAvailableTables(db, category.id, dateStr, startTime, pricing.duration_minutes);

    if (!freeTables.length) {
      notify('error', 'Sorry, all automatic tables in this suite were just booked for that time slot.');
      return null;
    }

    const assignedTable = freeTables[0];
    const bookingCode = generateBookingCode(db);
    const paymentMethod = payload.payment_method === 'pay_at_lounge' ? 'pay_at_lounge' : 'qris_transfer';
    const nextBookingId = (db.counters.booking || 0) + 1;

    const newBooking = {
      id: nextBookingId,
      booking_code: bookingCode,
      table_category_id: category.id,
      mahjong_table_id: assignedTable.id,
      customer_name: String(payload.customer_name || '').trim(),
      customer_phone: String(payload.customer_phone || '').trim(),
      customer_email: String(payload.customer_email || '').trim() || null,
      booking_date: dateStr,
      start_time: pricing.start_time,
      end_time: pricing.end_time,
      sessions_count: pricing.sessions_count,
      duration_minutes: pricing.duration_minutes,
      players_count: players,
      base_price: pricing.base_price,
      discount_amount: pricing.discount_amount,
      promo_code: pricing.promo_code,
      total_price: pricing.total_price,
      status: paymentMethod === 'pay_at_lounge' ? 'confirmed' : 'pending',
      payment_status: 'unpaid',
      payment_method: paymentMethod,
      payment_proof_path: null,
      notes: String(payload.notes || '').trim() || null,
      created_at: new Date().toISOString(),
    };

    setDb((prev) => ({
      ...prev,
      counters: { ...prev.counters, booking: nextBookingId },
      promoCodes: prev.promoCodes.map((p) =>
        pricing.promo_valid && p.code === pricing.promo_code ? { ...p, used_count: (p.used_count || 0) + 1 } : p
      ),
      bookings: [newBooking, ...prev.bookings],
    }));

    notify('success', `Table ${assignedTable.code} reserved! Reference: ${bookingCode}`);
    return bookingCode;
  };

  const uploadPaymentProof = (bookingCode, dataUrl) => {
    if (!dataUrl) {
      notify('error', 'Please choose a valid JPG/PNG receipt image.');
      return;
    }
    setDb((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) =>
        b.booking_code.toUpperCase() === String(bookingCode).toUpperCase()
          ? {
              ...b,
              payment_proof_path: dataUrl,
              payment_status: 'waiting_verification',
              status: b.status === 'pending' ? 'confirmed' : b.status,
            }
          : b
      ),
    }));
    notify('success', 'Payment transfer receipt uploaded! Our concierge will verify shortly.');
  };

  const applyMembership = (payload) => {
    setDb((prev) => {
      const id = (prev.counters.application || 0) + 1;
      return {
        ...prev,
        counters: { ...prev.counters, application: id },
        membershipApplications: [
          {
            id,
            membership_plan_id: Number(payload.membership_plan_id),
            applicant_name: String(payload.applicant_name || '').trim(),
            applicant_phone: String(payload.applicant_phone || '').trim(),
            applicant_email: String(payload.applicant_email || '').trim(),
            preferred_branch: String(payload.preferred_branch || 'PIK 2 — La Riviera'),
            playing_frequency: String(payload.playing_frequency || '1-2 times / week'),
            message: String(payload.message || '').trim() || null,
            status: 'pending',
            created_at: new Date().toISOString(),
          },
          ...prev.membershipApplications,
        ],
      };
    });
    notify('success', 'Thank you! Your Hule Club Membership application has been received by our Membership Secretary.');
  };

  const registerEvent = (slug, payload) => {
    const raw = db.events.find((e) => e.slug === slug && e.is_active);
    if (!raw) return false;
    const seats = Math.max(1, Math.min(4, Number(payload.seats) || 1));
    const remaining = Math.max(0, Number(raw.quota) - Number(raw.registered_count || 0));
    if (seats > remaining) {
      notify('error', 'Not enough seats remaining for this event.');
      return false;
    }
    const regCode = `EVT-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    setDb((prev) => {
      const id = (prev.counters.registration || 0) + 1;
      return {
        ...prev,
        counters: { ...prev.counters, registration: id },
        events: prev.events.map((e) => (e.id === raw.id ? { ...e, registered_count: Number(e.registered_count || 0) + seats } : e)),
        eventRegistrations: [
          {
            id,
            event_id: raw.id,
            registration_code: regCode,
            participant_name: String(payload.participant_name || '').trim(),
            participant_phone: String(payload.participant_phone || '').trim(),
            participant_email: String(payload.participant_email || '').trim() || null,
            skill_level: String(payload.skill_level || 'Intermediate'),
            seats,
            total_price: Number(raw.price || 0) * seats,
            notes: String(payload.notes || '').trim() || null,
            created_at: new Date().toISOString(),
          },
          ...prev.eventRegistrations,
        ],
      };
    });
    notify('success', `Seat confirmed! Your event registration code is ${regCode}.`);
    return true;
  };

  const sendInquiry = (payload) => {
    setDb((prev) => {
      const id = (prev.counters.inquiry || 0) + 1;
      return {
        ...prev,
        counters: { ...prev.counters, inquiry: id },
        inquiries: [
          {
            id,
            name: String(payload.name || '').trim(),
            phone: String(payload.phone || '').trim(),
            email: String(payload.email || '').trim() || null,
            subject: String(payload.subject || 'General Lounge Inquiry'),
            message: String(payload.message || '').trim(),
            is_read: false,
            created_at: new Date().toISOString(),
          },
          ...prev.inquiries,
        ],
      };
    });
    notify('success', 'Message sent! Our Hule Concierge team will reach out via WhatsApp shortly.');
  };

  // Admin CMS Operations
  const createWalkInBooking = (payload) => {
    const category = db.tableCategories.find((c) => c.id === Number(payload.table_category_id));
    if (!category) return;
    const dateStr = payload.booking_date || todayStrOffset(0);
    const startTime = payload.start_time || '13:00';
    const sessions = Math.max(1, Number(payload.sessions_count) || 1);
    const pricing = calculatePricing(db, category, dateStr, startTime, sessions);
    const free = getAvailableTables(db, category.id, dateStr, startTime, pricing.duration_minutes);
    const code = generateBookingCode(db);

    setDb((prev) => {
      const id = (prev.counters.booking || 0) + 1;
      return {
        ...prev,
        counters: { ...prev.counters, booking: id },
        bookings: [
          {
            id,
            booking_code: code,
            table_category_id: category.id,
            mahjong_table_id: free[0] ? free[0].id : null,
            customer_name: String(payload.customer_name || 'Walk-In Guest').trim(),
            customer_phone: String(payload.customer_phone || '-').trim(),
            customer_email: null,
            booking_date: dateStr,
            start_time: pricing.start_time,
            end_time: pricing.end_time,
            sessions_count: sessions,
            duration_minutes: pricing.duration_minutes,
            players_count: Number(payload.players_count) || 4,
            base_price: pricing.base_price,
            discount_amount: 0,
            promo_code: null,
            total_price: pricing.total_price,
            status: 'confirmed',
            payment_status: payload.payment_status === 'unpaid' ? 'unpaid' : 'paid',
            payment_method: 'walk_in',
            payment_proof_path: null,
            notes: 'Walk-in created via CMS',
            created_at: new Date().toISOString(),
          },
          ...prev.bookings,
        ],
      };
    });
    notify('success', `Walk-in booking ${code} created.`);
  };

  const updateBooking = (id, updates) => {
    let updatedCode = '';
    setDb((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) => {
        if (b.id !== Number(id)) return b;
        updatedCode = b.booking_code;
        return {
          ...b,
          mahjong_table_id: updates.mahjong_table_id ? Number(updates.mahjong_table_id) : null,
          status: updates.status || b.status,
          payment_status: updates.payment_status || b.payment_status,
        };
      }),
    }));
    notify('success', `Booking ${updatedCode} updated.`);
  };

  const deleteBooking = (id) => {
    setDb((prev) => ({ ...prev, bookings: prev.bookings.filter((b) => b.id !== Number(id)) }));
    notify('success', 'Booking deleted.');
  };

  const createCategory = (payload, imageDataUrl) => {
    const name = String(payload.name || 'New Suite').trim();
    const initialCount = Math.max(0, Math.min(30, Number(payload.initial_tables_count) || 0));
    const amenities = String(payload.amenities_raw || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setDb((prev) => {
      const catId = (prev.counters.category || 0) + 1;
      let tblCounter = prev.counters.table || 0;
      const prefix = name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'TBL';
      const newTables = [];
      for (let i = 1; i <= initialCount; i++) {
        tblCounter++;
        newTables.push({
          id: tblCounter,
          table_category_id: catId,
          code: `${prefix}-${String(i).padStart(2, '0')}`,
          name: `${name} #${String(i).padStart(2, '0')}`,
          floor_zone: 'Main Lounge',
          machine_model: 'Hule Whisper-Pro S1',
          status: 'active',
        });
      }

      return {
        ...prev,
        counters: { ...prev.counters, category: catId, table: tblCounter },
        tableCategories: [
          ...prev.tableCategories,
          {
            id: catId,
            name,
            slug: slugify(name),
            branch: String(payload.branch || 'PIK 2 — La Riviera').trim(),
            subtitle: String(payload.subtitle || '').trim(),
            description: String(payload.description || '').trim(),
            weekday_price: Number(payload.weekday_price) || 100000,
            weekend_price: Number(payload.weekend_price) || 130000,
            peak_surcharge: Number(payload.peak_surcharge) || 0,
            session_minutes: Number(payload.session_minutes) || 120,
            min_players: Number(payload.min_players) || 4,
            max_players: Number(payload.max_players) || 6,
            image_path: imageDataUrl || '/images/mahjong/vip-suite.jpg',
            amenities,
            is_active: true,
            sort_order: prev.tableCategories.length + 1,
          },
        ],
        mahjongTables: [...prev.mahjongTables, ...newTables],
      };
    });
    notify('success', `Suite category "${name}" created with ${initialCount} table(s).`);
  };

  const updateCategory = (id, payload, imageDataUrl) => {
    const amenities = String(payload.amenities_raw || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setDb((prev) => ({
      ...prev,
      tableCategories: prev.tableCategories.map((c) =>
        c.id === Number(id)
          ? {
              ...c,
              name: String(payload.name || c.name).trim(),
              branch: String(payload.branch || c.branch).trim(),
              weekday_price: Number(payload.weekday_price) || 0,
              weekend_price: Number(payload.weekend_price) || 0,
              peak_surcharge: Number(payload.peak_surcharge) || 0,
              session_minutes: Number(payload.session_minutes) || 120,
              min_players: Number(payload.min_players) || 4,
              max_players: Number(payload.max_players) || 6,
              subtitle: String(payload.subtitle || '').trim(),
              description: String(payload.description || '').trim(),
              amenities,
              is_active: Boolean(payload.is_active),
              image_path: imageDataUrl || c.image_path,
            }
          : c
      ),
    }));
    notify('success', `Pricing & details saved for "${payload.name}".`);
  };

  const deleteCategory = (id) => {
    const cid = Number(id);
    setDb((prev) => ({
      ...prev,
      tableCategories: prev.tableCategories.filter((c) => c.id !== cid),
      mahjongTables: prev.mahjongTables.filter((t) => t.table_category_id !== cid),
    }));
    notify('success', 'Category and its physical tables removed.');
  };

  const quickAddTable = (categoryId) => {
    let addedCode = '';
    let catName = '';
    setDb((prev) => {
      const cat = prev.tableCategories.find((c) => c.id === Number(categoryId));
      if (!cat) return prev;
      catName = cat.name;
      const existing = prev.mahjongTables.filter((t) => t.table_category_id === cat.id);
      const prefix = existing[0]
        ? existing[0].code.split('-')[0]
        : cat.name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'TBL';
      let counter = existing.length + 1;
      let code = `${prefix}-${String(counter).padStart(2, '0')}`;
      while (prev.mahjongTables.some((t) => t.code === code)) {
        counter++;
        code = `${prefix}-${String(counter).padStart(2, '0')}`;
      }
      addedCode = code;
      const id = (prev.counters.table || 0) + 1;
      return {
        ...prev,
        counters: { ...prev.counters, table: id },
        mahjongTables: [
          ...prev.mahjongTables,
          {
            id,
            table_category_id: cat.id,
            code,
            name: `${cat.name} #${String(counter).padStart(2, '0')}`,
            floor_zone: existing[0]?.floor_zone || 'Main Lounge',
            machine_model: 'Hule Whisper-Pro S1',
            status: 'active',
          },
        ],
      };
    });
    if (addedCode) notify('success', `Added automatic table ${addedCode} to ${catName}.`);
  };

  const quickRemoveTable = (categoryId) => {
    let removedCode = '';
    setDb((prev) => {
      const catTables = prev.mahjongTables.filter((t) => t.table_category_id === Number(categoryId));
      if (!catTables.length) return prev;
      const last = catTables[catTables.length - 1];
      removedCode = last.code;
      return {
        ...prev,
        mahjongTables: prev.mahjongTables.filter((t) => t.id !== last.id),
      };
    });
    if (removedCode) notify('success', `Removed table unit ${removedCode}.`);
  };

  const addCustomTable = (categoryId, payload) => {
    const code = String(payload.code || '').trim().toUpperCase();
    if (!code) return;
    setDb((prev) => {
      const id = (prev.counters.table || 0) + 1;
      return {
        ...prev,
        counters: { ...prev.counters, table: id },
        mahjongTables: [
          ...prev.mahjongTables,
          {
            id,
            table_category_id: Number(categoryId),
            code,
            name: String(payload.name || code).trim(),
            floor_zone: String(payload.floor_zone || 'Main Lounge').trim(),
            machine_model: 'Hule Whisper-Pro S1',
            status: payload.status || 'active',
          },
        ],
      };
    });
    notify('success', `Custom table ${code} added.`);
  };

  const updateTableItem = (id, payload) => {
    let code = '';
    setDb((prev) => ({
      ...prev,
      mahjongTables: prev.mahjongTables.map((t) => {
        if (t.id !== Number(id)) return t;
        code = t.code;
        return {
          ...t,
          name: String(payload.name || t.name).trim(),
          floor_zone: String(payload.floor_zone || t.floor_zone).trim(),
          status: payload.status || t.status,
        };
      }),
    }));
    notify('success', `Table ${code} updated.`);
  };

  const deleteTableItem = (id) => {
    setDb((prev) => ({ ...prev, mahjongTables: prev.mahjongTables.filter((t) => t.id !== Number(id)) }));
    notify('success', 'Table unit deleted.');
  };

  // Slots & Promos
  const addSlot = (payload) => {
    const startTime = String(payload.start_time || '').trim();
    if (!startTime) return;
    setDb((prev) => {
      const id = (prev.counters.slot || 0) + 1;
      return {
        ...prev,
        counters: { ...prev.counters, slot: id },
        timeSlots: [
          ...prev.timeSlots,
          {
            id,
            start_time: startTime,
            label: String(payload.label || startTime).trim(),
            is_peak: Boolean(payload.is_peak),
            is_active: true,
            sort_order: prev.timeSlots.length + 1,
          },
        ],
      };
    });
    notify('success', `Time slot ${startTime} added.`);
  };

  const updateSlot = (id, payload) => {
    setDb((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.map((s) =>
        s.id === Number(id)
          ? {
              ...s,
              sort_order: Number(payload.sort_order) || 1,
              start_time: String(payload.start_time || s.start_time).trim(),
              label: String(payload.label || s.label).trim(),
              is_peak: Boolean(payload.is_peak),
              is_active: Boolean(payload.is_active),
            }
          : s
      ),
    }));
    notify('success', `Slot ${payload.label || payload.start_time} updated.`);
  };

  const deleteSlot = (id) => {
    setDb((prev) => ({ ...prev, timeSlots: prev.timeSlots.filter((s) => s.id !== Number(id)) }));
    notify('success', 'Time slot deleted.');
  };

  const addPromo = (payload) => {
    const code = String(payload.code || '').trim().toUpperCase();
    if (!code) return;
    setDb((prev) => {
      const id = (prev.counters.promo || 0) + 1;
      return {
        ...prev,
        counters: { ...prev.counters, promo: id },
        promoCodes: [
          {
            id,
            code,
            description: String(payload.description || '').trim(),
            discount_type: payload.discount_type === 'fixed' ? 'fixed' : 'percentage',
            discount_value: Number(payload.discount_value) || 10,
            max_discount: payload.max_discount ? Number(payload.max_discount) : null,
            usage_limit: 200,
            used_count: 0,
            valid_until: payload.valid_until || null,
            is_active: true,
          },
          ...prev.promoCodes,
        ],
      };
    });
    notify('success', `Promo voucher ${code} created.`);
  };

  const togglePromo = (id) => {
    setDb((prev) => ({
      ...prev,
      promoCodes: prev.promoCodes.map((p) => (p.id === Number(id) ? { ...p, is_active: !p.is_active } : p)),
    }));
  };

  const deletePromo = (id) => {
    setDb((prev) => ({ ...prev, promoCodes: prev.promoCodes.filter((p) => p.id !== Number(id)) }));
    notify('success', 'Promo code deleted.');
  };

  // Events
  const createEvent = (payload, imageDataUrl) => {
    const title = String(payload.title || 'New Event').trim();
    setDb((prev) => {
      const id = (prev.counters.event || 0) + 1;
      return {
        ...prev,
        counters: { ...prev.counters, event: id },
        events: [
          {
            id,
            slug: `${slugify(title)}-${Math.random().toString(36).slice(2, 5)}`,
            title,
            category: payload.category || 'Tournament',
            event_date: payload.event_date || todayStrOffset(7),
            start_time: payload.start_time || '14:00',
            end_time: payload.end_time || '18:00',
            location: payload.location || 'Hule Mahjong PIK 2',
            price: Number(payload.price) || 0,
            quota: Number(payload.quota) || 24,
            registered_count: 0,
            image_path: imageDataUrl || '/images/mahjong/event-tournament.jpg',
            excerpt: String(payload.excerpt || '').trim(),
            description: String(payload.description || '').trim(),
            is_featured: Boolean(payload.is_featured),
            is_active: true,
          },
          ...prev.events,
        ],
      };
    });
    notify('success', `Event "${title}" published.`);
  };

  const updateEvent = (id, payload, imageDataUrl) => {
    setDb((prev) => ({
      ...prev,
      events: prev.events.map((ev) =>
        ev.id === Number(id)
          ? {
              ...ev,
              title: String(payload.title || ev.title).trim(),
              category: payload.category || ev.category,
              event_date: payload.event_date || ev.event_date,
              start_time: payload.start_time || ev.start_time,
              end_time: payload.end_time ?? ev.end_time,
              price: Number(payload.price) || 0,
              quota: Number(payload.quota) || 16,
              location: payload.location || ev.location,
              excerpt: payload.excerpt ?? ev.excerpt,
              description: payload.description ?? ev.description,
              is_active: Boolean(payload.is_active),
              is_featured: Boolean(payload.is_featured),
              image_path: imageDataUrl || ev.image_path,
            }
          : ev
      ),
    }));
    notify('success', `Event "${payload.title}" updated.`);
  };

  const deleteEvent = (id) => {
    setDb((prev) => ({ ...prev, events: prev.events.filter((e) => e.id !== Number(id)) }));
    notify('success', 'Event deleted.');
  };

  // Gallery
  const addGalleryPhoto = (payload, imageDataUrl) => {
    setDb((prev) => {
      const id = (prev.counters.gallery || 0) + 1;
      return {
        ...prev,
        counters: { ...prev.counters, gallery: id },
        galleries: [
          ...prev.galleries,
          {
            id,
            title: String(payload.title || 'Lounge Photo').trim(),
            category: payload.category || 'Lounge & Interior',
            caption: String(payload.caption || '').trim(),
            image_path: imageDataUrl || String(payload.image_url || '').trim() || '/images/mahjong/lounge-regular.jpg',
            is_featured: true,
            is_active: true,
            sort_order: prev.galleries.length + 1,
          },
        ],
      };
    });
    notify('success', 'Photo added to gallery.');
  };

  const updateGalleryPhoto = (id, payload, imageDataUrl) => {
    setDb((prev) => ({
      ...prev,
      galleries: prev.galleries.map((g) =>
        g.id === Number(id)
          ? {
              ...g,
              title: String(payload.title || g.title).trim(),
              category: payload.category || g.category,
              sort_order: Number(payload.sort_order) || 1,
              caption: String(payload.caption ?? g.caption).trim(),
              is_active: Boolean(payload.is_active),
              image_path: imageDataUrl || g.image_path,
            }
          : g
      ),
    }));
    notify('success', 'Gallery photo updated.');
  };

  const deleteGalleryPhoto = (id) => {
    setDb((prev) => ({ ...prev, galleries: prev.galleries.filter((g) => g.id !== Number(id)) }));
    notify('success', 'Photo deleted.');
  };

  // Memberships
  const createPlan = (payload) => {
    const name = String(payload.name || 'New Tier').trim();
    const benefits = String(payload.benefits_raw || '')
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    setDb((prev) => {
      const id = (prev.counters.plan || 0) + 1;
      return {
        ...prev,
        counters: { ...prev.counters, plan: id },
        membershipPlans: [
          ...prev.membershipPlans,
          {
            id,
            slug: slugify(name),
            name,
            badge: String(payload.badge || '').trim(),
            price: Number(payload.price) || 500000,
            billing_period: String(payload.billing_period || 'per quarter').trim(),
            description: String(payload.description || '').trim(),
            benefits,
            is_featured: Boolean(payload.is_featured),
            is_active: true,
            sort_order: prev.membershipPlans.length + 1,
          },
        ],
      };
    });
    notify('success', `Membership tier "${name}" created.`);
  };

  const updatePlan = (id, payload) => {
    const benefits = String(payload.benefits_raw || '')
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    setDb((prev) => ({
      ...prev,
      membershipPlans: prev.membershipPlans.map((p) =>
        p.id === Number(id)
          ? {
              ...p,
              name: String(payload.name || p.name).trim(),
              badge: String(payload.badge ?? p.badge).trim(),
              price: Number(payload.price) || 0,
              billing_period: String(payload.billing_period || p.billing_period).trim(),
              description: String(payload.description ?? p.description).trim(),
              benefits,
              is_active: Boolean(payload.is_active),
              is_featured: Boolean(payload.is_featured),
            }
          : p
      ),
    }));
    notify('success', `Tier "${payload.name}" updated.`);
  };

  const deletePlan = (id) => {
    setDb((prev) => ({ ...prev, membershipPlans: prev.membershipPlans.filter((p) => p.id !== Number(id)) }));
    notify('success', 'Membership tier deleted.');
  };

  const updateApplicationStatus = (id, status) => {
    setDb((prev) => ({
      ...prev,
      membershipApplications: prev.membershipApplications.map((a) => (a.id === Number(id) ? { ...a, status } : a)),
    }));
    notify('success', 'Application status updated.');
  };

  // Site Settings & Inbox
  const updateSettings = (payload, bannerDataUrl) => {
    setDb((prev) => ({
      ...prev,
      siteSettings: {
        ...prev.siteSettings,
        ...payload,
        banner_image: bannerDataUrl || prev.siteSettings.banner_image,
      },
    }));
    notify('success', 'Website settings updated.');
  };

  const markInquiryRead = (id) => {
    setDb((prev) => ({
      ...prev,
      inquiries: prev.inquiries.map((inq) => (inq.id === Number(id) ? { ...inq, is_read: true } : inq)),
    }));
  };

  const deleteInquiry = (id) => {
    setDb((prev) => ({ ...prev, inquiries: prev.inquiries.filter((inq) => inq.id !== Number(id)) }));
    notify('success', 'Inquiry deleted.');
  };

  return (
    <HuleContext.Provider
      value={{
        db,
        siteSettings: db.siteSettings || {},
        currentAdmin,
        flash,
        notify,
        clearFlash,
        loginAdmin,
        logoutAdmin,
        createBooking,
        uploadPaymentProof,
        applyMembership,
        registerEvent,
        sendInquiry,
        createWalkInBooking,
        updateBooking,
        deleteBooking,
        createCategory,
        updateCategory,
        deleteCategory,
        quickAddTable,
        quickRemoveTable,
        addCustomTable,
        updateTableItem,
        deleteTableItem,
        addSlot,
        updateSlot,
        deleteSlot,
        addPromo,
        togglePromo,
        deletePromo,
        createEvent,
        updateEvent,
        deleteEvent,
        addGalleryPhoto,
        updateGalleryPhoto,
        deleteGalleryPhoto,
        createPlan,
        updatePlan,
        deletePlan,
        updateApplicationStatus,
        updateSettings,
        markInquiryRead,
        deleteInquiry,
      }}
    >
      {children}
    </HuleContext.Provider>
  );
}

export function useHule() {
  return useContext(HuleContext);
}

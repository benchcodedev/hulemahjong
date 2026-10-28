import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { useHule } from '../../context/HuleContext';
import { formatRupiah, hydrateEvent, readFileAsDataUrl, todayStrOffset } from '../../utils/helpers';

function EventEditCard({ ev, onUpdate, onDelete }) {
  const [title, setTitle] = useState(ev.title);
  const [category, setCategory] = useState(ev.category);
  const [eventDate, setEventDate] = useState(ev.event_date);
  const [startTime, setStartTime] = useState(ev.start_time);
  const [endTime, setEndTime] = useState(ev.end_time || '');
  const [price, setPrice] = useState(ev.price);
  const [quota, setQuota] = useState(ev.quota);
  const [location, setLocation] = useState(ev.location);
  const [excerpt, setExcerpt] = useState(ev.excerpt || '');
  const [description, setDescription] = useState(ev.description || '');
  const [isActive, setIsActive] = useState(Boolean(ev.is_active));
  const [isFeatured, setIsFeatured] = useState(Boolean(ev.is_featured));
  const [photoFile, setPhotoFile] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    const imgUrl = await readFileAsDataUrl(photoFile);
    onUpdate(
      ev.id,
      {
        title,
        category,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        price,
        quota,
        location,
        excerpt,
        description,
        is_active: isActive,
        is_featured: isFeatured,
      },
      imgUrl
    );
    setPhotoFile(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ebe5d9] p-5 sm:p-6">
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-3 space-y-2">
          <img
            src={ev.image_url}
            alt={ev.title}
            className="w-full aspect-[16/10] object-cover rounded-xl border border-stone-200"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
            className="text-xs text-stone-500 w-full"
          />
          <p className="text-xs font-semibold text-[#8c734b]">
            Registered: {ev.registered_count || 0} / {ev.quota} seats
          </p>
        </div>

        <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="cms-label">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="cms-input"
            />
          </div>
          <div>
            <label className="cms-label">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="cms-input">
              {['Tournament', 'Beginner Coaching', 'Social Night', 'Special Event'].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="cms-label">Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              className="cms-input"
            />
          </div>
          <div>
            <label className="cms-label">Start – End</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="cms-input"
              />
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="cms-input"
              />
            </div>
          </div>
          <div>
            <label className="cms-label">Price (Rp) & Quota</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                className="cms-input"
              />
              <input
                type="number"
                value={quota}
                onChange={(e) => setQuota(Number(e.target.value))}
                required
                className="cms-input"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label className="cms-label">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="cms-input"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="cms-label">Excerpt</label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="cms-input"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="cms-label">Full Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="cms-input"
            />
          </div>

          <div className="sm:col-span-3 flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-4 text-xs font-semibold">
              <label className="inline-flex items-center gap-1.5">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                <span>Published</span>
              </label>
              <label className="inline-flex items-center gap-1.5">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
                <span>Featured</span>
              </label>
            </div>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#111] hover:bg-[#c3b091] text-white hover:text-[#141310] text-xs font-semibold transition"
            >
              Save Event Changes
            </button>
          </div>
        </div>
      </form>

      <div className="mt-3 pt-3 border-t border-stone-100 flex justify-between items-center text-xs">
        <Link to={`/events/${ev.slug}`} target="_blank" className="text-[#8c734b] hover:underline font-medium">
          View Event Page ↗
        </Link>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Delete event ${ev.title}?`)) onDelete(ev.id);
          }}
          className="text-red-500 hover:underline"
        >
          Delete Event
        </button>
      </div>
    </div>
  );
}

export default function AdminEventsPage() {
  const { db, createEvent, updateEvent, deleteEvent } = useHule();
  const [newOpen, setNewOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tournament');
  const [location, setLocation] = useState('Hule Mahjong PIK 2 — Main Salon');
  const [eventDate, setEventDate] = useState(() => todayStrOffset(7));
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('18:00');
  const [price, setPrice] = useState(125000);
  const [quota, setQuota] = useState(24);
  const [isFeatured, setIsFeatured] = useState(true);
  const [excerpt, setExcerpt] = useState('');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState(null);

  const events = useMemo(() => db.events.map(hydrateEvent), [db.events]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const imgUrl = await readFileAsDataUrl(photoFile);
    createEvent(
      {
        title,
        category,
        location,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        price,
        quota,
        is_featured: isFeatured,
        excerpt,
        description,
      },
      imgUrl
    );
    setTitle('');
    setExcerpt('');
    setDescription('');
    setPhotoFile(null);
    setNewOpen(false);
  };

  return (
    <AdminLayout
      title="Events & Coaching — Hule Mahjong CMS"
      heading="Events, Tournaments & Coaching Clinics"
      subheading="Publish mahjong tournaments, beginner coaching classes, and track participant registrations."
      headerActions={
        <button
          type="button"
          onClick={() => setNewOpen((p) => !p)}
          className="px-4 py-2 rounded-full bg-[#111] hover:bg-[#c3b091] text-white hover:text-[#141310] text-xs font-semibold transition"
        >
          + Publish New Event
        </button>
      }
    >
      {/* Create Event Form */}
      {newOpen && (
        <div className="bg-white rounded-2xl border border-[#dfd3be] p-6 mb-8">
          <h2 className="text-[16px] font-bold mb-4">Publish New Event / Clinic</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="cms-label">Event Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Sunday Beginner Mahjong Workshop"
                className="cms-input"
              />
            </div>
            <div>
              <label className="cms-label">Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="cms-input">
                <option value="Tournament">Tournament</option>
                <option value="Beginner Coaching">Beginner Coaching</option>
                <option value="Social Night">Social Night</option>
              </select>
            </div>
            <div>
              <label className="cms-label">Location *</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="cms-input"
              />
            </div>

            <div>
              <label className="cms-label">Event Date *</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                className="cms-input"
              />
            </div>
            <div>
              <label className="cms-label">Start Time *</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="cms-input"
              />
            </div>
            <div>
              <label className="cms-label">End Time</label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="cms-input"
              />
            </div>
            <div>
              <label className="cms-label">Entry Fee (Rp, 0 = Free) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min={0}
                required
                className="cms-input"
              />
            </div>

            <div>
              <label className="cms-label">Seat Quota *</label>
              <input
                type="number"
                value={quota}
                onChange={(e) => setQuota(Number(e.target.value))}
                min={1}
                required
                className="cms-input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="cms-label">Cover Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="cms-input !py-2"
              />
            </div>
            <div className="flex items-center pt-5">
              <label className="inline-flex items-center gap-2 text-xs font-semibold">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
                <span>Featured Event</span>
              </label>
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <label className="cms-label">Short Excerpt</label>
              <input
                type="text"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="One-sentence summary shown on event cards"
                className="cms-input"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="cms-label">Full Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="cms-input"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#c3b091] hover:bg-[#b59f7c] text-[#141310] text-xs font-bold"
              >
                Publish Event →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Events */}
      <div className="space-y-5 mb-10">
        {events.map((ev) => (
          <EventEditCard key={ev.id} ev={ev} onUpdate={updateEvent} onDelete={deleteEvent} />
        ))}
      </div>

      {/* Recent Event Registrations */}
      <div className="bg-white rounded-2xl border border-[#ebe5d9] p-6">
        <h2 className="text-[17px] font-bold mb-4">Recent Event & Coaching Registrations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 text-[11px] uppercase tracking-wider text-stone-500">
              <tr>
                <th className="py-2.5 pr-3">Reg Code</th>
                <th className="py-2.5 px-3">Event</th>
                <th className="py-2.5 px-3">Participant</th>
                <th className="py-2.5 px-3">Level & Seats</th>
                <th className="py-2.5 pl-3">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {db.eventRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-5 text-center text-stone-400">
                    No event registrations yet.
                  </td>
                </tr>
              ) : (
                db.eventRegistrations.map((r) => {
                  const evObj = db.events.find((e) => e.id === r.event_id);
                  return (
                    <tr key={r.id}>
                      <td className="py-2.5 pr-3 font-bold">{r.registration_code}</td>
                      <td className="py-2.5 px-3">{evObj?.title || '-'}</td>
                      <td className="py-2.5 px-3">
                        {r.participant_name} ({r.participant_phone})
                      </td>
                      <td className="py-2.5 px-3">
                        {r.skill_level} • {r.seats} seat(s)
                      </td>
                      <td className="py-2.5 pl-3 font-semibold">{formatRupiah(r.total_price)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import { useHule } from '../../context/HuleContext';
import { hydrateEvent } from '../../utils/helpers';

export default function EventDetailPage() {
  const { slug } = useParams();
  const { db, registerEvent } = useHule();

  const event = useMemo(() => {
    const raw = db.events.find((e) => e.slug === slug && e.is_active);
    return raw ? hydrateEvent(raw) : null;
  }, [db.events, slug]);

  const [participantName, setParticipantName] = useState('');
  const [participantPhone, setParticipantPhone] = useState('');
  const [seats, setSeats] = useState(1);
  const [participantEmail, setParticipantEmail] = useState('');
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [notes, setNotes] = useState('');

  if (!event) {
    return (
      <PublicLayout title="Event Not Found — Hule Mahjong">
        <section className="max-w-[680px] mx-auto px-5 py-24 text-center">
          <h1 className="text-[28px] font-semibold text-[#141414]">Event Not Found</h1>
          <p className="text-[13.5px] text-[#666] mt-2">This event may have ended or been removed.</p>
          <Link
            to="/events"
            className="inline-block mt-6 px-6 py-2.5 rounded-full bg-[#111111] text-white text-[13px] font-semibold hover:bg-[#c3b091] hover:text-[#141310] transition"
          >
            Back to Events →
          </Link>
        </section>
      </PublicLayout>
    );
  }

  const maxSeats = Math.min(4, event.remaining_seats);

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = registerEvent(event.slug, {
      participant_name: participantName,
      participant_phone: participantPhone,
      seats,
      participant_email: participantEmail,
      skill_level: skillLevel,
      notes,
    });
    if (ok) {
      setParticipantName('');
      setParticipantPhone('');
      setParticipantEmail('');
      setNotes('');
      setSeats(1);
    }
  };

  return (
    <PublicLayout title={`${event.title} — Hule Mahjong`}>
      <section className="pt-9 pb-8 sm:pt-12 sm:pb-10 px-5 text-center max-w-[780px] mx-auto">
        <nav className="inline-flex items-center gap-2 text-[12px] text-[#767676] mb-3.5">
          <Link to="/" className="hover:text-[#141413]">
            Home
          </Link>
          <span className="text-[#b5b5b5]">›</span>
          <Link to="/events" className="hover:text-[#141413]">
            Events
          </Link>
          <span className="text-[#b5b5b5]">›</span>
          <span className="font-semibold text-[#8c734b]">{event.category}</span>
        </nav>

        <h1 className="text-[28px] sm:text-[38px] font-semibold text-[#111111] leading-[1.18] tracking-[-0.025em]">
          {event.title}
        </h1>
        <p className="mt-3 text-[13.5px] text-[#777] font-medium">
          {event.date_full} • {event.start_time}
          {event.end_time ? ` – ${event.end_time}` : ''} WIB • {event.location}
        </p>
      </section>

      <section className="max-w-[1040px] mx-auto px-5 sm:px-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-[24px] overflow-hidden border border-[#ece5d8] aspect-[16/10] bg-[#f5f3ef]">
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
            </div>

            <div className="bg-[#faf8f4] rounded-[24px] p-6 sm:p-8 border border-[#ece5d8] space-y-4">
              <h2 className="text-[19px] font-semibold text-[#141414]">Event Overview</h2>
              <div className="text-[14px] text-[#555] leading-relaxed whitespace-pre-line">
                {event.description || event.excerpt}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-[24px] p-6 sm:p-7 border border-[#ebe3d4] shadow-summary">
              <div className="flex items-center justify-between pb-4 border-b border-[#f1eee8]">
                <div>
                  <p className="text-[10.5px] uppercase tracking-wider text-[#8c734b] font-bold">Entry Fee</p>
                  <p className="text-[24px] font-bold text-[#141414]">{event.formatted_price}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[11.5px] font-semibold ${
                    event.remaining_seats > 0 ? 'bg-[#f5efe4] text-[#6e5b3e]' : 'bg-red-50 text-red-700'
                  }`}
                >
                  {event.remaining_seats} Spots Left
                </span>
              </div>

              {event.remaining_seats > 0 ? (
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="cms-label">Participant Name *</label>
                    <input
                      type="text"
                      required
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      placeholder="Full name"
                      className="cms-input"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="cms-label">WhatsApp *</label>
                      <input
                        type="text"
                        required
                        value={participantPhone}
                        onChange={(e) => setParticipantPhone(e.target.value)}
                        placeholder="0812xxxxxxxx"
                        className="cms-input"
                      />
                    </div>
                    <div>
                      <label className="cms-label">Seats</label>
                      <select
                        value={seats}
                        onChange={(e) => setSeats(Number(e.target.value))}
                        className="pill-select !rounded-xl !h-[42px]"
                      >
                        {Array.from({ length: maxSeats }, (_, idx) => idx + 1).map((i) => (
                          <option key={i} value={i}>
                            {i} {i === 1 ? 'Seat' : 'Seats'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="cms-label">Email</label>
                      <input
                        type="email"
                        value={participantEmail}
                        onChange={(e) => setParticipantEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="cms-input"
                      />
                    </div>
                    <div>
                      <label className="cms-label">Skill Level</label>
                      <select
                        value={skillLevel}
                        onChange={(e) => setSkillLevel(e.target.value)}
                        className="pill-select !rounded-xl !h-[42px]"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="cms-label">Notes (Optional)</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Solo player or coming with friends?"
                      className="cms-input"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-[48px] rounded-full bg-[#111111] hover:bg-[#c3b091] text-white hover:text-[#141310] font-semibold text-[13.5px] transition"
                  >
                    Confirm Event Seat →
                  </button>
                </form>
              ) : (
                <div className="mt-5 rounded-2xl bg-stone-50 p-5 text-center text-[13px] text-stone-600">
                  This session is currently full. Contact our WhatsApp Concierge to join the priority waitlist.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

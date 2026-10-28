import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import { useHule } from '../../context/HuleContext';

export default function ContactPage() {
  const { db, siteSettings, sendInquiry, notify } = useHule();
  const navigate = useNavigate();

  const [lookupCode, setLookupCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Private Group / Corporate Booking');
  const [message, setMessage] = useState('');

  const handleLookup = (e) => {
    e.preventDefault();
    const clean = lookupCode.trim().toUpperCase();
    if (!clean) return;
    const found = db.bookings.find((b) => String(b.booking_code).toUpperCase() === clean);
    if (!found) {
      notify('error', `Booking reference "${clean}" was not found. Please check your code.`);
      return;
    }
    navigate(`/booking/${found.booking_code}`);
  };

  const handleInquiry = (e) => {
    e.preventDefault();
    sendInquiry({ name, phone, email, subject, message });
    setName('');
    setPhone('');
    setEmail('');
    setMessage('');
  };

  return (
    <PublicLayout title="Locations, Booking Lookup & Concierge — Hule Mahjong">
      <section className="pt-9 pb-11 sm:pt-14 sm:pb-16 px-5 text-center">
        <nav className="inline-flex items-center gap-2 text-[12px] text-[#767676] mb-3.5">
          <Link to="/" className="hover:text-[#141413]">
            Home
          </Link>
          <span className="text-[#b5b5b5]">›</span>
          <span className="font-semibold text-[#8c734b]">Contact & Locations</span>
        </nav>

        <h1 className="text-[34px] sm:text-[44px] leading-[1.14] tracking-[-0.03em]">
          <span className="block font-semibold text-[#111111]">Concierge</span>
          <span className="block font-light text-[#6b6b6b]">& Lounge Locations</span>
        </h1>
      </section>

      <section className="max-w-[1060px] mx-auto px-5 sm:px-10 pb-20 space-y-12">
        {/* Check Existing Booking Code Widget */}
        <div
          id="lookup"
          className="bg-[#faf7f1] rounded-[26px] border border-[#e7dcc8] p-6 sm:p-9 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#8c734b]">Already Reserved?</p>
            <h2 className="text-[22px] font-semibold text-[#141414] mt-1">Retrieve Your Digital Booking Pass</h2>
            <p className="text-[13px] text-[#68635a] mt-1">
              Enter your booking reference (e.g.{' '}
              <code className="font-semibold text-[#4f3e22]">HLM-DEMO-REG1</code>) to view table assignment or upload
              transfer proof.
            </p>
          </div>
          <form onSubmit={handleLookup} className="w-full md:w-auto flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={lookupCode}
              onChange={(e) => setLookupCode(e.target.value)}
              required
              placeholder="HLM-XXXXXX"
              className="h-[46px] sm:w-[230px] rounded-full border border-[#dfd4c1] bg-white px-5 text-[13.5px] uppercase tracking-wider focus:border-[#c3b091] focus:outline-none"
            />
            <button
              type="submit"
              className="h-[46px] px-6 rounded-full bg-[#111111] hover:bg-[#c3b091] text-white hover:text-[#141310] text-[13px] font-semibold transition"
            >
              Find Booking
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Branch Cards */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-[24px] border border-[#ece5d8] p-6 sm:p-7 shadow-soft">
              <span className="inline-block px-3 py-1 rounded-full bg-[#f5efe4] text-[#6e5b3e] text-[10.5px] font-bold uppercase tracking-wider">
                Flagship Lounge
              </span>
              <h3 className="text-[20px] font-semibold text-[#141414] mt-3">Hule Mahjong — PIK 2</h3>
              <p className="text-[13px] text-[#666] mt-1.5 leading-relaxed">
                Rukan La Riviera, Pantai Indah Kapuk 2, Kabupaten Tangerang, Banten.
              </p>
              <p className="text-[12.5px] text-[#8c734b] font-semibold mt-3">
                Open Lounge & 3×3m Private Acoustic Suites •{' '}
                {siteSettings.opening_hours || 'Daily 10:00 – 24:00 WIB'}
              </p>
            </div>

            <div className="bg-white rounded-[24px] border border-[#ece5d8] p-6 sm:p-7 shadow-soft">
              <span className="inline-block px-3 py-1 rounded-full bg-[#f5efe4] text-[#6e5b3e] text-[10.5px] font-bold uppercase tracking-wider">
                Sumatra Club
              </span>
              <h3 className="text-[20px] font-semibold text-[#141414] mt-3">Hu Le Mahjong — Palembang</h3>
              <p className="text-[13px] text-[#666] mt-1.5 leading-relaxed">
                Jl. M. Isa, Kota Palembang, Sumatera Selatan.
              </p>
              <p className="text-[12.5px] text-[#8c734b] font-semibold mt-3">
                15 Automatic Tables • Beginner Friendly Coaching • F&B Lounge
              </p>
            </div>

            <div className="bg-[#0e0f0d] text-white rounded-[24px] p-6 sm:p-7 space-y-2 text-[13px]">
              <p className="text-[10.5px] uppercase tracking-[0.14em] text-[#c3b091] font-bold">Direct Concierge</p>
              <p className="text-[17px] font-semibold">{siteSettings.contact_phone || '+62 812-8899-7788'}</p>
              <p className="text-white/65">{siteSettings.contact_email || 'concierge@hulemahjong.id'}</p>
            </div>
          </div>

          {/* Contact / Private Event Inquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-[26px] border border-[#ece5d8] p-6 sm:p-9 shadow-summary">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#8c734b]">
              Private Gatherings & Support
            </p>
            <h2 className="text-[24px] font-semibold text-[#141414] mt-1">Message the Concierge</h2>
            <p className="text-[13px] text-[#666] mt-1 mb-6">
              Planning a corporate tournament, birthday mahjong social, or group coaching session? Send us a note.
            </p>

            <form onSubmit={handleInquiry} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="cms-label">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="cms-input"
                  />
                </div>
                <div>
                  <label className="cms-label">WhatsApp / Phone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812xxxxxxxx"
                    className="cms-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="cms-label">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="cms-input"
                  />
                </div>
                <div>
                  <label className="cms-label">Topic *</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="pill-select !rounded-xl !h-[42px]"
                  >
                    <option value="Private Group / Corporate Booking">Private Group / Corporate Booking</option>
                    <option value="Beginner Coaching Request">Beginner Coaching Request</option>
                    <option value="Booking Reschedule Assistance">Booking Reschedule Assistance</option>
                    <option value="General Lounge Inquiry">General Lounge Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="cms-label">Message *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share preferred branch, date, guest count, or questions..."
                  className="cms-input"
                />
              </div>

              <button
                type="submit"
                className="w-full h-[48px] rounded-full bg-[#111111] hover:bg-[#c3b091] text-white hover:text-[#141310] font-semibold text-[13.5px] transition"
              >
                Send Message →
              </button>
            </form>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import { useHule } from '../../context/HuleContext';
import { hydratePlan } from '../../utils/helpers';

export default function MembershipPage() {
  const { db, applyMembership } = useHule();

  const plans = useMemo(
    () =>
      db.membershipPlans
        .filter((p) => p.is_active)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map(hydratePlan),
    [db]
  );

  const featuredDefault = plans.find((p) => p.is_featured) || plans[0];

  const [selectedPlanId, setSelectedPlanId] = useState(() => featuredDefault?.id || 1);
  const [preferredBranch, setPreferredBranch] = useState('PIK 2 — La Riviera');
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [playingFrequency, setPlayingFrequency] = useState('1-2 times / week');
  const [message, setMessage] = useState('');

  const handleSelectTier = (planId) => {
    setSelectedPlanId(planId);
    const el = document.getElementById('apply');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    applyMembership({
      membership_plan_id: selectedPlanId,
      preferred_branch: preferredBranch,
      applicant_name: applicantName,
      applicant_phone: applicantPhone,
      applicant_email: applicantEmail,
      playing_frequency: playingFrequency,
      message,
    });
    setApplicantName('');
    setApplicantPhone('');
    setApplicantEmail('');
    setMessage('');
  };

  return (
    <PublicLayout title="Club Membership — Hule Mahjong" hideCtaBanner={true}>
      <section className="pt-9 pb-11 sm:pt-14 sm:pb-16 px-5 text-center">
        <nav className="inline-flex items-center gap-2 text-[12px] text-[#767676] mb-3.5">
          <Link to="/" className="hover:text-[#141413]">
            Home
          </Link>
          <span className="text-[#b5b5b5]">›</span>
          <span className="font-semibold text-[#8c734b]">Membership</span>
        </nav>

        <h1 className="text-[34px] sm:text-[44px] leading-[1.14] tracking-[-0.03em]">
          <span className="block font-semibold text-[#111111]">Hule Club</span>
          <span className="block font-light text-[#6b6b6b]">Patron Membership</span>
        </h1>
        <p className="max-w-[540px] mx-auto mt-4 text-[14px] text-[#68655f] leading-relaxed">
          Priority access to private VIP suites, waived peak-hour surcharges, personal tile lockers, and seasonal
          tournament invitations.
        </p>
      </section>

      {/* Membership Tiers Grid */}
      <section className="max-w-[1080px] mx-auto px-5 sm:px-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-[26px] p-7 sm:p-8 flex flex-col justify-between border transition ${
                plan.is_featured
                  ? 'bg-[#0e0f0d] text-white border-[#0e0f0d] shadow-2xl md:-translate-y-2'
                  : 'bg-white text-[#141414] border-[#ece5d8] shadow-soft'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-5">
                  <h2 className="text-[20px] font-semibold tracking-tight">{plan.name}</h2>
                  {plan.badge && (
                    <span
                      className={`px-3 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider ${
                        plan.is_featured ? 'bg-[#c3b091] text-[#141310]' : 'bg-[#f5efe4] text-[#6e5b3e]'
                      }`}
                    >
                      {plan.badge}
                    </span>
                  )}
                </div>

                <div className={`pb-5 border-b ${plan.is_featured ? 'border-white/10' : 'border-[#f1eee8]'}`}>
                  <span className="text-[30px] font-bold tracking-[-0.03em]">{plan.formatted_price}</span>
                  <span className={`text-[12.5px] ${plan.is_featured ? 'text-white/60' : 'text-[#777]'}`}>
                    {' '}
                    / {plan.billing_period}
                  </span>
                  <p className={`mt-2.5 text-[13px] leading-relaxed ${plan.is_featured ? 'text-white/75' : 'text-[#666]'}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="mt-6 space-y-3 text-[13px]">
                  {(plan.benefits || []).map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span
                        className={`w-4 h-4 rounded-full ${
                          plan.is_featured ? 'bg-[#c3b091]/25 text-[#c3b091]' : 'bg-[#f2eadb] text-[#6e5b3e]'
                        } flex items-center justify-center text-[10px] shrink-0 mt-0.5`}
                      >
                        ✓
                      </span>
                      <span className={plan.is_featured ? 'text-white/85' : 'text-[#333]'}>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleSelectTier(plan.id)}
                className={`mt-8 w-full h-[46px] rounded-full font-semibold text-[13px] flex items-center justify-center transition ${
                  plan.is_featured
                    ? 'bg-[#c3b091] hover:bg-[#d5c4a8] text-[#141310]'
                    : 'bg-[#111111] hover:bg-[#c3b091] text-white hover:text-[#141310]'
                }`}
              >
                Select {plan.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Online Membership Application Form */}
      <section id="apply" className="max-w-[780px] mx-auto px-5 sm:px-10 pb-20">
        <div className="bg-[#faf8f4] rounded-[26px] border border-[#e7dcc8] p-6 sm:p-10">
          <div className="text-center mb-7">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#8c734b]">Seasonal Intake</p>
            <h2 className="text-[26px] font-semibold text-[#141414] mt-1">Submit Membership Application</h2>
            <p className="text-[13px] text-[#666] mt-1">
              Our Membership Secretary reviews applications within 24 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="cms-label">Selected Tier *</label>
                <select
                  id="plan-select"
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(Number(e.target.value))}
                  required
                  className="pill-select !rounded-xl"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.formatted_price}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="cms-label">Home Lounge Branch *</label>
                <select
                  value={preferredBranch}
                  onChange={(e) => setPreferredBranch(e.target.value)}
                  required
                  className="pill-select !rounded-xl"
                >
                  <option value="PIK 2 — La Riviera">PIK 2 — La Riviera (Tangerang)</option>
                  <option value="Palembang — Jl. M. Isa">Palembang — Jl. M. Isa</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="cms-label">Full Name *</label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="Your full name"
                  className="cms-input"
                />
              </div>
              <div>
                <label className="cms-label">WhatsApp Number *</label>
                <input
                  type="text"
                  required
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="cms-input"
                />
              </div>
              <div>
                <label className="cms-label">Email Address *</label>
                <input
                  type="email"
                  required
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="cms-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="cms-label">Usual Playing Frequency</label>
                <select
                  value={playingFrequency}
                  onChange={(e) => setPlayingFrequency(e.target.value)}
                  className="pill-select !rounded-xl"
                >
                  <option value="1-2 times / week">1–2 times per week</option>
                  <option value="3+ times / week">3+ times per week</option>
                  <option value="Weekends & Social Events">Weekends & Social Events</option>
                  <option value="New Beginner">New Beginner Learning Mahjong</option>
                </select>
              </div>
              <div>
                <label className="cms-label">Notes / Referral (Optional)</label>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Referred by member or special notes"
                  className="cms-input"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full h-[48px] rounded-full bg-[#111111] hover:bg-[#c3b091] text-white hover:text-[#141310] font-semibold text-[13.5px] transition"
              >
                Submit Application to Concierge →
              </button>
            </div>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}

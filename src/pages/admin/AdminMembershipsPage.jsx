import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useHule } from '../../context/HuleContext';

function PlanCard({ plan, onUpdate, onDelete }) {
  const [name, setName] = useState(plan.name);
  const [badge, setBadge] = useState(plan.badge || '');
  const [price, setPrice] = useState(plan.price);
  const [billingPeriod, setBillingPeriod] = useState(plan.billing_period);
  const [description, setDescription] = useState(plan.description || '');
  const [benefitsRaw, setBenefitsRaw] = useState((plan.benefits || []).join('\n'));
  const [isActive, setIsActive] = useState(Boolean(plan.is_active));
  const [isFeatured, setIsFeatured] = useState(Boolean(plan.is_featured));

  return (
    <div className="bg-white rounded-2xl border border-[#ebe5d9] p-5 space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onUpdate(plan.id, {
            name,
            badge,
            price,
            billing_period: billingPeriod,
            description,
            benefits_raw: benefitsRaw,
            is_active: isActive,
            is_featured: isFeatured,
          });
        }}
        className="space-y-3"
      >
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="cms-label">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="cms-input !py-1.5 text-xs font-bold"
            />
          </div>
          <div>
            <label className="cms-label">Badge</label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="cms-input !py-1.5 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="cms-label">Price (Rp)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
              className="cms-input !py-1.5 text-xs font-semibold"
            />
          </div>
          <div>
            <label className="cms-label">Period</label>
            <input
              type="text"
              value={billingPeriod}
              onChange={(e) => setBillingPeriod(e.target.value)}
              required
              className="cms-input !py-1.5 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="cms-label">Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="cms-input !py-1.5 text-xs"
          />
        </div>

        <div>
          <label className="cms-label">Benefits (1 per line)</label>
          <textarea
            rows={4}
            value={benefitsRaw}
            onChange={(e) => setBenefitsRaw(e.target.value)}
            className="cms-input !py-1.5 text-xs"
          />
        </div>

        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-1">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Active
            </label>
            <label className="inline-flex items-center gap-1">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} /> Featured
            </label>
          </div>
          <button type="submit" className="px-4 py-1.5 rounded-full bg-[#111] text-white font-semibold">
            Save
          </button>
        </div>
      </form>

      <div className="text-right">
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Delete plan ${plan.name}?`)) onDelete(plan.id);
          }}
          className="text-[11px] text-red-500 hover:underline"
        >
          Delete Plan
        </button>
      </div>
    </div>
  );
}

function ApplicationRow({ app, planName, onUpdateStatus }) {
  const [status, setStatus] = useState(app.status || 'pending');
  return (
    <tr>
      <td className="py-3 pr-3">
        <span className="font-bold text-stone-900">{app.applicant_name}</span>
        <span className="block text-stone-500">
          {app.applicant_phone} • {app.applicant_email}
        </span>
      </td>
      <td className="py-3 px-3 font-semibold text-[#6e5b3e]">{planName}</td>
      <td className="py-3 px-3">
        {app.preferred_branch}
        <span className="block text-stone-400">{app.playing_frequency}</span>
      </td>
      <td className="py-3 px-3 max-w-[220px]">{app.message || '-'}</td>
      <td className="py-3 pl-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onUpdateStatus(app.id, status);
          }}
          className="flex items-center gap-2"
        >
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-stone-200 px-2 py-1 text-xs"
          >
            {['pending', 'contacted', 'approved', 'rejected'].map((st) => (
              <option key={st} value={st}>
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </option>
            ))}
          </select>
          <button type="submit" className="px-3 py-1 rounded-lg bg-[#c3b091] text-[#141310] font-semibold">
            Save
          </button>
        </form>
      </td>
    </tr>
  );
}

export default function AdminMembershipsPage() {
  const { db, createPlan, updatePlan, deletePlan, updateApplicationStatus } = useHule();
  const [newOpen, setNewOpen] = useState(false);

  const [name, setName] = useState('');
  const [badge, setBadge] = useState('');
  const [price, setPrice] = useState(1500000);
  const [billingPeriod, setBillingPeriod] = useState('per quarter');
  const [description, setDescription] = useState('');
  const [benefitsRaw, setBenefitsRaw] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    createPlan({
      name,
      badge,
      price,
      billing_period: billingPeriod,
      description,
      benefits_raw: benefitsRaw,
      is_featured: isFeatured,
    });
    setName('');
    setBadge('');
    setDescription('');
    setBenefitsRaw('');
    setIsFeatured(false);
    setNewOpen(false);
  };

  return (
    <AdminLayout
      title="Memberships — Hule Mahjong CMS"
      heading="Membership Tiers & Applications"
      subheading="Configure patron privileges, pricing, and approve incoming member applications."
      headerActions={
        <button
          type="button"
          onClick={() => setNewOpen((p) => !p)}
          className="px-4 py-2 rounded-full bg-[#111] hover:bg-[#c3b091] text-white hover:text-[#141310] text-xs font-semibold transition"
        >
          + New Membership Tier
        </button>
      }
    >
      {/* Add New Plan Form */}
      {newOpen && (
        <div className="bg-white rounded-2xl border border-[#dfd3be] p-6 mb-8">
          <h2 className="text-[16px] font-bold mb-4">Create Membership Plan</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="cms-label">Tier Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Platinum Patron"
                className="cms-input"
              />
            </div>
            <div>
              <label className="cms-label">Badge Label</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="VIP Choice"
                className="cms-input"
              />
            </div>
            <div>
              <label className="cms-label">Price (Rp) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                className="cms-input"
              />
            </div>
            <div>
              <label className="cms-label">Billing Period *</label>
              <input
                type="text"
                value={billingPeriod}
                onChange={(e) => setBillingPeriod(e.target.value)}
                required
                className="cms-input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="cms-label">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="cms-input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="cms-label">Benefits (1 per line)</label>
              <textarea
                rows={3}
                value={benefitsRaw}
                onChange={(e) => setBenefitsRaw(e.target.value)}
                placeholder={'20% off all sessions\nFree hot tea'}
                className="cms-input"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-xs font-semibold">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
                <span>Highlight as Featured Dark Card</span>
              </label>
              <button type="submit" className="px-6 py-2 rounded-full bg-[#c3b091] text-[#141310] text-xs font-bold">
                Create Tier →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {db.membershipPlans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onUpdate={updatePlan} onDelete={deletePlan} />
        ))}
      </div>

      {/* Membership Applications Table */}
      <div className="bg-white rounded-2xl border border-[#ebe5d9] p-6">
        <h2 className="text-[17px] font-bold mb-4">Membership Applications</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 text-[11px] uppercase tracking-wider text-stone-500">
              <tr>
                <th className="py-2.5 pr-3">Applicant</th>
                <th className="py-2.5 px-3">Selected Tier</th>
                <th className="py-2.5 px-3">Branch & Frequency</th>
                <th className="py-2.5 px-3">Notes</th>
                <th className="py-2.5 pl-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {db.membershipApplications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-stone-400">
                    No membership applications yet.
                  </td>
                </tr>
              ) : (
                db.membershipApplications.map((app) => {
                  const p = db.membershipPlans.find((pl) => pl.id === app.membership_plan_id);
                  return (
                    <ApplicationRow
                      key={app.id}
                      app={app}
                      planName={p?.name || '-'}
                      onUpdateStatus={updateApplicationStatus}
                    />
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

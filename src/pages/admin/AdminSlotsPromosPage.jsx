import React, { useMemo, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useHule } from '../../context/HuleContext';
import { formatRupiah } from '../../utils/helpers';

function SlotRow({ slot, onUpdate, onDelete }) {
  const [sortOrder, setSortOrder] = useState(slot.sort_order || 1);
  const [startTime, setStartTime] = useState(slot.start_time);
  const [label, setLabel] = useState(slot.label);
  const [isPeak, setIsPeak] = useState(Boolean(slot.is_peak));
  const [isActive, setIsActive] = useState(Boolean(slot.is_active));

  return (
    <div className="rounded-xl border border-stone-200 p-3 flex flex-wrap items-center justify-between gap-2 bg-[#fcfbf9]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onUpdate(slot.id, {
            sort_order: sortOrder,
            start_time: startTime,
            label,
            is_peak: isPeak,
            is_active: isActive,
          });
        }}
        className="flex flex-wrap items-center gap-2.5 flex-1"
      >
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          className="w-14 rounded-lg border border-stone-200 px-2 py-1 text-xs"
          title="Sort Order"
        />
        <input
          type="text"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-20 rounded-lg border border-stone-200 px-2 py-1 text-xs font-bold"
        />
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-24 rounded-lg border border-stone-200 px-2 py-1 text-xs"
        />

        <label className="inline-flex items-center gap-1 text-xs text-stone-700">
          <input type="checkbox" checked={isPeak} onChange={(e) => setIsPeak(e.target.checked)} />
          <span>Peak</span>
        </label>
        <label className="inline-flex items-center gap-1 text-xs text-stone-700">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          <span>Active</span>
        </label>

        <button type="submit" className="px-3 py-1 rounded-lg bg-[#e7dcc8] text-[#3d301b] text-xs font-semibold">
          Save
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          if (window.confirm(`Remove slot ${slot.label}?`)) onDelete(slot.id);
        }}
        className="text-xs text-red-500 hover:underline px-1"
      >
        ✕
      </button>
    </div>
  );
}

export default function AdminSlotsPromosPage() {
  const { db, addSlot, updateSlot, deleteSlot, addPromo, togglePromo, deletePromo } = useHule();

  // New Slot state
  const [slotTime, setSlotTime] = useState('');
  const [slotLabel, setSlotLabel] = useState('');
  const [slotPeak, setSlotPeak] = useState(false);

  // New Promo state
  const [promoCode, setPromoCode] = useState('');
  const [promoType, setPromoType] = useState('percentage');
  const [promoVal, setPromoVal] = useState('');
  const [promoMax, setPromoMax] = useState('');
  const [promoUntil, setPromoUntil] = useState('');
  const [promoDesc, setPromoDesc] = useState('');

  const slots = useMemo(
    () =>
      [...db.timeSlots].sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0) || a.start_time.localeCompare(b.start_time)
      ),
    [db.timeSlots]
  );

  const handleAddSlot = (e) => {
    e.preventDefault();
    addSlot({ start_time: slotTime, label: slotLabel || slotTime, is_peak: slotPeak });
    setSlotTime('');
    setSlotLabel('');
    setSlotPeak(false);
  };

  const handleAddPromo = (e) => {
    e.preventDefault();
    addPromo({
      code: promoCode,
      discount_type: promoType,
      discount_value: promoVal,
      max_discount: promoMax || null,
      valid_until: promoUntil || null,
      description: promoDesc,
    });
    setPromoCode('');
    setPromoVal('');
    setPromoMax('');
    setPromoUntil('');
    setPromoDesc('');
  };

  return (
    <AdminLayout
      title="Time Slots & Promo Codes — Hule Mahjong CMS"
      heading="Operating Time Slots & Promo Vouchers"
      subheading="Configure session start times, peak-hour surcharges, and discount codes."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Booking Time Slots */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#ebe5d9] p-6 space-y-5">
          <div>
            <h2 className="text-[17px] font-bold">Session Time Slots</h2>
            <p className="text-xs text-stone-500">
              These pills appear in the &quot;SELECT TIME&quot; grid on the Reserve page.
            </p>
          </div>

          <form onSubmit={handleAddSlot} className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pb-4 border-b border-stone-100">
            <input
              type="text"
              value={slotTime}
              onChange={(e) => setSlotTime(e.target.value)}
              required
              placeholder="HH:MM (15:00)"
              className="cms-input !py-2 text-xs"
            />
            <input
              type="text"
              value={slotLabel}
              onChange={(e) => setSlotLabel(e.target.value)}
              placeholder="Label (15:00)"
              className="cms-input !py-2 text-xs"
            />
            <label className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 px-2">
              <input type="checkbox" checked={slotPeak} onChange={(e) => setSlotPeak(e.target.checked)} />
              <span>Peak Rate</span>
            </label>
            <button
              type="submit"
              className="rounded-xl bg-[#c3b091] hover:bg-[#b59f7c] text-[#141310] text-xs font-bold py-2"
            >
              + Add Slot
            </button>
          </form>

          <div className="space-y-2.5">
            {slots.map((slot) => (
              <SlotRow key={slot.id} slot={slot} onUpdate={updateSlot} onDelete={deleteSlot} />
            ))}
          </div>
        </div>

        {/* Right: Promo Vouchers */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#ebe5d9] p-6 space-y-5">
          <div>
            <h2 className="text-[17px] font-bold">Promo & Voucher Codes</h2>
            <p className="text-xs text-stone-500">Create percentage or fixed Rupiah discounts for players.</p>
          </div>

          <form onSubmit={handleAddPromo} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-5 border-b border-stone-100">
            <div>
              <label className="cms-label">Code *</label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                required
                placeholder="MAHJONG25"
                className="cms-input uppercase"
              />
            </div>
            <div>
              <label className="cms-label">Type *</label>
              <select value={promoType} onChange={(e) => setPromoType(e.target.value)} className="cms-input">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Rupiah (Rp)</option>
              </select>
            </div>
            <div>
              <label className="cms-label">Value (% or Rp) *</label>
              <input
                type="number"
                value={promoVal}
                onChange={(e) => setPromoVal(e.target.value)}
                required
                placeholder="15 or 25000"
                className="cms-input"
              />
            </div>
            <div>
              <label className="cms-label">Max Discount Cap (Optional Rp)</label>
              <input
                type="number"
                value={promoMax}
                onChange={(e) => setPromoMax(e.target.value)}
                placeholder="50000"
                className="cms-input"
              />
            </div>
            <div>
              <label className="cms-label">Valid Until</label>
              <input
                type="date"
                value={promoUntil}
                onChange={(e) => setPromoUntil(e.target.value)}
                className="cms-input"
              />
            </div>
            <div>
              <label className="cms-label">Description</label>
              <input
                type="text"
                value={promoDesc}
                onChange={(e) => setPromoDesc(e.target.value)}
                placeholder="Weekend promo"
                className="cms-input"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button type="submit" className="px-5 py-2 rounded-full bg-[#111] text-white text-xs font-semibold">
                + Create Promo Code
              </button>
            </div>
          </form>

          <div className="space-y-2.5">
            {db.promoCodes.map((promo) => (
              <div
                key={promo.id}
                className="rounded-xl border border-stone-200 p-3.5 flex items-center justify-between gap-3 bg-[#fcfbf9] text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#141414]">{promo.code}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        promo.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {promo.is_active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <p className="text-stone-500 mt-0.5">
                    {promo.discount_type === 'percentage'
                      ? `${promo.discount_value}% OFF`
                      : `${formatRupiah(promo.discount_value)} OFF`}{' '}
                    • Used {promo.used_count}
                    {promo.usage_limit ? `/${promo.usage_limit}` : ''}x
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => togglePromo(promo.id)}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-medium hover:bg-stone-100"
                  >
                    {promo.is_active ? 'Pause' : 'Enable'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete promo ${promo.code}?`)) deletePromo(promo.id);
                    }}
                    className="text-red-500 hover:underline px-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

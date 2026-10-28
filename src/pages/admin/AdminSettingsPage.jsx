import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useHule } from '../../context/HuleContext';
import { formatDateDMY, readFileAsDataUrl } from '../../utils/helpers';

export default function AdminSettingsPage() {
  const { db, siteSettings, updateSettings, markInquiryRead, deleteInquiry } = useHule();

  const [form, setForm] = useState(() => ({
    brand_prefix: siteSettings.brand_prefix || 'Hule',
    brand_suffix: siteSettings.brand_suffix || 'Mahjong',
    cancellation_note: siteSettings.cancellation_note || '',
    house_policy: siteSettings.house_policy || '',
    banner_eyebrow: siteSettings.banner_eyebrow || '',
    banner_title_line1_bold: siteSettings.banner_title_line1_bold || 'Your First',
    banner_title_line1_light: siteSettings.banner_title_line1_light || 'Round',
    banner_title_line2_light: siteSettings.banner_title_line2_light || 'Starts',
    banner_title_line2_bold: siteSettings.banner_title_line2_bold || 'Here.',
    banner_description: siteSettings.banner_description || '',
    contact_address: siteSettings.contact_address || '',
    contact_phone: siteSettings.contact_phone || '',
    contact_whatsapp: siteSettings.contact_whatsapp || '',
    contact_email: siteSettings.contact_email || '',
    opening_hours: siteSettings.opening_hours || '',
    payment_bank_name: siteSettings.payment_bank_name || '',
    payment_account_number: siteSettings.payment_account_number || '',
    payment_account_holder: siteSettings.payment_account_holder || '',
  }));
  const [bannerFile, setBannerFile] = useState(null);

  const setField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bannerDataUrl = await readFileAsDataUrl(bannerFile);
    updateSettings(form, bannerDataUrl);
    setBannerFile(null);
  };

  return (
    <AdminLayout
      title="Site Settings & Inbox — Hule Mahjong CMS"
      heading="Website Content Settings & Concierge Inbox"
      subheading="Customize brand identity, CTA banner copy & background image, payment bank account, and read guest inquiries."
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left: Global CMS Settings Form */}
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-7 bg-white rounded-2xl border border-[#ebe5d9] p-6 space-y-6"
        >
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#8c734b] mb-3">Brand & House Rules</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="cms-label">Brand Prefix (Regular)</label>
                <input
                  type="text"
                  value={form.brand_prefix}
                  onChange={(e) => setField('brand_prefix', e.target.value)}
                  className="cms-input"
                />
              </div>
              <div>
                <label className="cms-label">Brand Suffix (Bold)</label>
                <input
                  type="text"
                  value={form.brand_suffix}
                  onChange={(e) => setField('brand_suffix', e.target.value)}
                  className="cms-input"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="cms-label">Booking Cancellation Note</label>
                <input
                  type="text"
                  value={form.cancellation_note}
                  onChange={(e) => setField('cancellation_note', e.target.value)}
                  className="cms-input"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="cms-label">Recreational House Policy (Footer)</label>
                <input
                  type="text"
                  value={form.house_policy}
                  onChange={(e) => setField('house_policy', e.target.value)}
                  className="cms-input"
                />
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-stone-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#8c734b] mb-3">CTA Banner Section</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="cms-label">Eyebrow Text</label>
                <input
                  type="text"
                  value={form.banner_eyebrow}
                  onChange={(e) => setField('banner_eyebrow', e.target.value)}
                  className="cms-input"
                />
              </div>
              <div>
                <label className="cms-label">Line 1 Bold</label>
                <input
                  type="text"
                  value={form.banner_title_line1_bold}
                  onChange={(e) => setField('banner_title_line1_bold', e.target.value)}
                  className="cms-input"
                />
              </div>
              <div>
                <label className="cms-label">Line 1 Light</label>
                <input
                  type="text"
                  value={form.banner_title_line1_light}
                  onChange={(e) => setField('banner_title_line1_light', e.target.value)}
                  className="cms-input"
                />
              </div>
              <div>
                <label className="cms-label">Line 2 Light</label>
                <input
                  type="text"
                  value={form.banner_title_line2_light}
                  onChange={(e) => setField('banner_title_line2_light', e.target.value)}
                  className="cms-input"
                />
              </div>
              <div>
                <label className="cms-label">Line 2 Bold</label>
                <input
                  type="text"
                  value={form.banner_title_line2_bold}
                  onChange={(e) => setField('banner_title_line2_bold', e.target.value)}
                  className="cms-input"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="cms-label">Banner Description</label>
                <textarea
                  rows={2}
                  value={form.banner_description}
                  onChange={(e) => setField('banner_description', e.target.value)}
                  className="cms-input"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="cms-label">Replace Banner Background Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                  className="cms-input !py-2"
                />
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-stone-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#8c734b] mb-3">
              Contact & Payment Settlement
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="cms-label">Branch Address Summary</label>
                <input
                  type="text"
                  value={form.contact_address}
                  onChange={(e) => setField('contact_address', e.target.value)}
                  className="cms-input"
                />
              </div>
              <div>
                <label className="cms-label">Display Phone</label>
                <input
                  type="text"
                  value={form.contact_phone}
                  onChange={(e) => setField('contact_phone', e.target.value)}
                  className="cms-input"
                />
              </div>
              <div>
                <label className="cms-label">WhatsApp Number (628...)</label>
                <input
                  type="text"
                  value={form.contact_whatsapp}
                  onChange={(e) => setField('contact_whatsapp', e.target.value)}
                  className="cms-input"
                />
              </div>
              <div>
                <label className="cms-label">Concierge Email</label>
                <input
                  type="text"
                  value={form.contact_email}
                  onChange={(e) => setField('contact_email', e.target.value)}
                  className="cms-input"
                />
              </div>
              <div>
                <label className="cms-label">Opening Hours</label>
                <input
                  type="text"
                  value={form.opening_hours}
                  onChange={(e) => setField('opening_hours', e.target.value)}
                  className="cms-input"
                />
              </div>
              <div>
                <label className="cms-label">Bank Name</label>
                <input
                  type="text"
                  value={form.payment_bank_name}
                  onChange={(e) => setField('payment_bank_name', e.target.value)}
                  className="cms-input"
                />
              </div>
              <div>
                <label className="cms-label">Account Number</label>
                <input
                  type="text"
                  value={form.payment_account_number}
                  onChange={(e) => setField('payment_account_number', e.target.value)}
                  className="cms-input"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="cms-label">Account Holder Name</label>
                <input
                  type="text"
                  value={form.payment_account_holder}
                  onChange={(e) => setField('payment_account_holder', e.target.value)}
                  className="cms-input"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-full bg-[#111] hover:bg-[#c3b091] text-white hover:text-[#141310] text-xs font-bold transition"
          >
            Save All Website Settings →
          </button>
        </form>

        {/* Right: Concierge Messages Inbox */}
        <div className="xl:col-span-5 bg-white rounded-2xl border border-[#ebe5d9] p-6 space-y-4">
          <h2 className="text-[17px] font-bold">Concierge Contact Inbox</h2>

          <div className="space-y-3">
            {db.inquiries.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">No inquiries received yet.</p>
            ) : (
              db.inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className={`rounded-xl border ${
                    inq.is_read ? 'border-stone-200 bg-white' : 'border-[#c3b091] bg-[#faf6ee]'
                  } p-4 text-xs space-y-2`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-stone-900">{inq.subject}</p>
                      <p className="text-stone-500">
                        {inq.name} • {inq.phone} {inq.email ? `• ${inq.email}` : ''}
                      </p>
                    </div>
                    <span className="text-[10.5px] text-stone-400 shrink-0">
                      {inq.created_at ? formatDateDMY(String(inq.created_at).slice(0, 10)) : 'Recent'}
                    </span>
                  </div>
                  <p className="text-stone-700 leading-relaxed">{inq.message}</p>

                  <div className="flex items-center justify-end gap-3 pt-1">
                    {!inq.is_read && (
                      <button
                        type="button"
                        onClick={() => markInquiryRead(inq.id)}
                        className="text-[#6e5b3e] font-semibold hover:underline"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Delete message?')) deleteInquiry(inq.id);
                      }}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

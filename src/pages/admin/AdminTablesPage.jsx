import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useHule } from '../../context/HuleContext';
import { hydrateCategory, readFileAsDataUrl } from '../../utils/helpers';

function TableUnitRow({ tbl, onUpdate, onDelete }) {
  const [name, setName] = useState(tbl.name);
  const [floorZone, setFloorZone] = useState(tbl.floor_zone);
  const [status, setStatus] = useState(tbl.status);

  useEffect(() => {
    setName(tbl.name);
    setFloorZone(tbl.floor_zone);
    setStatus(tbl.status);
  }, [tbl.name, tbl.floor_zone, tbl.status]);

  return (
    <div className="rounded-xl border border-stone-200 p-3 flex flex-wrap items-center justify-between gap-2 bg-[#fcfbf9]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onUpdate(tbl.id, { name, floor_zone: floorZone, status });
        }}
        className="flex-1 flex flex-wrap items-center gap-2"
      >
        <span className="px-2.5 py-1 rounded-lg bg-[#0e0f0d] text-[#c3b091] text-xs font-bold">{tbl.code}</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs w-36"
        />
        <input
          type="text"
          value={floorZone}
          onChange={(e) => setFloorZone(e.target.value)}
          className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs w-32"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={`rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-semibold ${
            status === 'active' ? 'text-emerald-700' : 'text-amber-700'
          }`}
        >
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="inactive">Inactive</option>
        </select>
        <button
          type="submit"
          className="px-2.5 py-1 rounded-lg bg-[#e7dcc8] hover:bg-[#c3b091] text-[#3d301b] text-xs font-semibold"
        >
          Update
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          if (window.confirm(`Delete table ${tbl.code}?`)) onDelete(tbl.id);
        }}
        className="text-xs text-red-500 hover:underline px-1.5"
      >
        ✕
      </button>
    </div>
  );
}

function CategorySection({
  category,
  onQuickAdd,
  onQuickRemove,
  onUpdateCategory,
  onDeleteCategory,
  onAddCustomTable,
  onUpdateTable,
  onDeleteTable,
}) {
  const [name, setName] = useState(category.name);
  const [branch, setBranch] = useState(category.branch);
  const [weekdayPrice, setWeekdayPrice] = useState(category.weekday_price);
  const [weekendPrice, setWeekendPrice] = useState(category.weekend_price);
  const [peakSurcharge, setPeakSurcharge] = useState(category.peak_surcharge);
  const [sessionMinutes, setSessionMinutes] = useState(category.session_minutes);
  const [minPlayers, setMinPlayers] = useState(category.min_players);
  const [maxPlayers, setMaxPlayers] = useState(category.max_players);
  const [subtitle, setSubtitle] = useState(category.subtitle || '');
  const [amenitiesRaw, setAmenitiesRaw] = useState((category.amenities || []).join(', '));
  const [description, setDescription] = useState(category.description || '');
  const [isActive, setIsActive] = useState(Boolean(category.is_active));
  const [photoFile, setPhotoFile] = useState(null);

  // Custom table form
  const [customCode, setCustomCode] = useState('');
  const [customName, setCustomName] = useState('');
  const [customZone, setCustomZone] = useState('Main Lounge');
  const [customStatus, setCustomStatus] = useState('active');

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const imgUrl = await readFileAsDataUrl(photoFile);
    onUpdateCategory(
      category.id,
      {
        name,
        branch,
        weekday_price: weekdayPrice,
        weekend_price: weekendPrice,
        peak_surcharge: peakSurcharge,
        session_minutes: sessionMinutes,
        min_players: minPlayers,
        max_players: maxPlayers,
        subtitle,
        amenities_raw: amenitiesRaw,
        description,
        is_active: isActive,
      },
      imgUrl
    );
    setPhotoFile(null);
  };

  const handleCustomAdd = (e) => {
    e.preventDefault();
    onAddCustomTable(category.id, {
      code: customCode,
      name: customName,
      floor_zone: customZone,
      status: customStatus,
    });
    setCustomCode('');
    setCustomName('');
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ebe5d9] overflow-hidden">
      {/* Category Top Header with Quick +1 / -1 Table Controls */}
      <div className="bg-[#faf8f4] border-b border-[#ebe5d9] p-5 sm:px-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={category.image_url}
            alt={category.name}
            className="w-20 h-14 rounded-xl object-cover border border-[#e5dec9]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-bold text-[#141414]">{category.name}</h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold ${
                  category.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-200 text-stone-600'
                }`}
              >
                {category.is_active ? 'Active' : 'Hidden'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {category.branch} • <strong>{category.active_tables_count}</strong> active / {category.tables_count} total
              units
            </p>
          </div>
        </div>

        {/* Quick Tambah / Kurang Meja Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Remove the last physical table in this category?')) onQuickRemove(category.id);
            }}
            className="px-3.5 py-2 rounded-xl border border-stone-300 hover:border-red-400 text-xs font-semibold text-stone-700 hover:text-red-600 transition"
          >
            − Kurangi 1 Meja
          </button>

          <button
            type="button"
            onClick={() => onQuickAdd(category.id)}
            className="px-4 py-2 rounded-xl bg-[#c3b091] hover:bg-[#b59f7c] text-[#141310] text-xs font-bold transition"
          >
            + Tambah 1 Meja Otomatis
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left: Edit Pricing, Photo & Details */}
        <div className="xl:col-span-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#8c734b]">Pricing & Suite Details</h3>
          <form onSubmit={handleSaveCategory} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="cms-label">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="cms-input"
                />
              </div>
              <div>
                <label className="cms-label">Branch</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  required
                  className="cms-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="cms-label">Weekday (Rp)</label>
                <input
                  type="number"
                  value={weekdayPrice}
                  onChange={(e) => setWeekdayPrice(Number(e.target.value))}
                  required
                  className="cms-input font-semibold"
                />
              </div>
              <div>
                <label className="cms-label">Weekend (Rp)</label>
                <input
                  type="number"
                  value={weekendPrice}
                  onChange={(e) => setWeekendPrice(Number(e.target.value))}
                  required
                  className="cms-input font-semibold"
                />
              </div>
              <div>
                <label className="cms-label">Peak +Rp</label>
                <input
                  type="number"
                  value={peakSurcharge}
                  onChange={(e) => setPeakSurcharge(Number(e.target.value))}
                  required
                  className="cms-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="cms-label">Session (Min)</label>
                <input
                  type="number"
                  value={sessionMinutes}
                  onChange={(e) => setSessionMinutes(Number(e.target.value))}
                  required
                  className="cms-input"
                />
              </div>
              <div>
                <label className="cms-label">Min Guests</label>
                <input
                  type="number"
                  value={minPlayers}
                  onChange={(e) => setMinPlayers(Number(e.target.value))}
                  required
                  className="cms-input"
                />
              </div>
              <div>
                <label className="cms-label">Max Guests</label>
                <input
                  type="number"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  required
                  className="cms-input"
                />
              </div>
            </div>

            <div>
              <label className="cms-label">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="cms-input"
              />
            </div>

            <div>
              <label className="cms-label">Amenities (comma-separated)</label>
              <input
                type="text"
                value={amenitiesRaw}
                onChange={(e) => setAmenitiesRaw(e.target.value)}
                className="cms-input"
              />
            </div>

            <div>
              <label className="cms-label">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="cms-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="cms-label">Replace Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="text-xs text-stone-600"
                />
              </div>
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 mt-4">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded"
                />
                <span>Visible on Booking Page</span>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-[#111] hover:bg-[#c3b091] text-white hover:text-[#141310] text-xs font-semibold transition"
              >
                Save Pricing & Details
              </button>
            </div>
          </form>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Delete this entire category and all its tables?')) onDeleteCategory(category.id);
              }}
              className="text-[11.5px] text-red-500 hover:underline"
            >
              Delete entire category
            </button>
          </div>
        </div>

        {/* Right: Physical Automatic Tables List */}
        <div className="xl:col-span-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#8c734b]">
            Physical Mahjong Table Units ({category.tables.length})
          </h3>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {category.tables.map((tbl) => (
              <TableUnitRow key={tbl.id} tbl={tbl} onUpdate={onUpdateTable} onDelete={onDeleteTable} />
            ))}
          </div>

          {/* Custom Table Add Row */}
          <form onSubmit={handleCustomAdd} className="pt-3 border-t border-stone-200 grid grid-cols-2 sm:grid-cols-5 gap-2">
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              required
              placeholder="Code (VIP-09)"
              className="cms-input !py-1.5 text-xs"
            />
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              required
              placeholder="Unit Name"
              className="cms-input !py-1.5 text-xs"
            />
            <input
              type="text"
              value={customZone}
              onChange={(e) => setCustomZone(e.target.value)}
              required
              className="cms-input !py-1.5 text-xs"
            />
            <select
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              className="cms-input !py-1.5 text-xs"
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <button type="submit" className="rounded-xl bg-[#111] text-white text-xs font-semibold py-1.5 px-3">
              + Add Custom
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminTablesPage() {
  const {
    db,
    createCategory,
    updateCategory,
    deleteCategory,
    quickAddTable,
    quickRemoveTable,
    addCustomTable,
    updateTableItem,
    deleteTableItem,
  } = useHule();

  const [newOpen, setNewOpen] = useState(false);

  const [newName, setNewName] = useState('');
  const [newBranch, setNewBranch] = useState('PIK 2 — La Riviera');
  const [newInitialCount, setNewInitialCount] = useState(2);
  const [newWeekday, setNewWeekday] = useState(150000);
  const [newWeekend, setNewWeekend] = useState(195000);
  const [newPeak, setNewPeak] = useState(20000);
  const [newMinutes, setNewMinutes] = useState(120);
  const [newMinPlayers, setNewMinPlayers] = useState(4);
  const [newMaxPlayers, setNewMaxPlayers] = useState(6);
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newAmenities, setNewAmenities] = useState('Automatic Shuffler Table, Complimentary Tea, USB-C Charging');
  const [newDescription, setNewDescription] = useState('');
  const [newPhoto, setNewPhoto] = useState(null);

  const categories = useMemo(
    () =>
      [...db.tableCategories]
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((c) => hydrateCategory(c, db)),
    [db]
  );

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    const imgUrl = await readFileAsDataUrl(newPhoto);
    createCategory(
      {
        name: newName,
        branch: newBranch,
        initial_tables_count: newInitialCount,
        weekday_price: newWeekday,
        weekend_price: newWeekend,
        peak_surcharge: newPeak,
        session_minutes: newMinutes,
        min_players: newMinPlayers,
        max_players: newMaxPlayers,
        subtitle: newSubtitle,
        amenities_raw: newAmenities,
        description: newDescription,
      },
      imgUrl
    );
    setNewName('');
    setNewSubtitle('');
    setNewDescription('');
    setNewPhoto(null);
    setNewOpen(false);
  };

  return (
    <AdminLayout
      title="Tables & Pricing — Hule Mahjong CMS"
      heading="Tables, Suites & Dynamic Pricing"
      subheading="Set weekday/weekend/peak session rates, upload suite photos, and add/remove physical automatic tables."
      headerActions={
        <button
          type="button"
          onClick={() => setNewOpen((p) => !p)}
          className="px-4 py-2 rounded-full bg-[#111] hover:bg-[#c3b091] text-white hover:text-[#141310] text-xs font-semibold transition"
        >
          + Add New Suite / Category
        </button>
      }
    >
      {/* Create New Category Panel */}
      {newOpen && (
        <div className="bg-white rounded-2xl border border-[#dfd3be] p-6 mb-8">
          <h2 className="text-[16px] font-bold mb-4">Create New Table / Suite Category</h2>
          <form onSubmit={handleCreateCategory} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="cms-label">Category / Suite Name *</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                placeholder="e.g. Emerald VIP Suite"
                className="cms-input"
              />
            </div>
            <div>
              <label className="cms-label">Branch *</label>
              <input
                type="text"
                value={newBranch}
                onChange={(e) => setNewBranch(e.target.value)}
                required
                className="cms-input"
              />
            </div>
            <div>
              <label className="cms-label">Initial Table Count</label>
              <input
                type="number"
                value={newInitialCount}
                onChange={(e) => setNewInitialCount(Number(e.target.value))}
                min={0}
                max={30}
                className="cms-input"
              />
            </div>

            <div>
              <label className="cms-label">Weekday Price (Rp) *</label>
              <input
                type="number"
                value={newWeekday}
                onChange={(e) => setNewWeekday(Number(e.target.value))}
                min={0}
                required
                className="cms-input"
              />
            </div>
            <div>
              <label className="cms-label">Weekend Price (Rp) *</label>
              <input
                type="number"
                value={newWeekend}
                onChange={(e) => setNewWeekend(Number(e.target.value))}
                min={0}
                required
                className="cms-input"
              />
            </div>
            <div>
              <label className="cms-label">Peak Surcharge (Rp) *</label>
              <input
                type="number"
                value={newPeak}
                onChange={(e) => setNewPeak(Number(e.target.value))}
                min={0}
                required
                className="cms-input"
              />
            </div>
            <div>
              <label className="cms-label">Minutes per Session *</label>
              <input
                type="number"
                value={newMinutes}
                onChange={(e) => setNewMinutes(Number(e.target.value))}
                min={30}
                required
                className="cms-input"
              />
            </div>

            <div>
              <label className="cms-label">Min Players</label>
              <input
                type="number"
                value={newMinPlayers}
                onChange={(e) => setNewMinPlayers(Number(e.target.value))}
                min={1}
                className="cms-input"
              />
            </div>
            <div>
              <label className="cms-label">Max Players</label>
              <input
                type="number"
                value={newMaxPlayers}
                onChange={(e) => setNewMaxPlayers(Number(e.target.value))}
                min={1}
                className="cms-input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="cms-label">Subtitle</label>
              <input
                type="text"
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                placeholder="Private Room • Automatic Shuffler"
                className="cms-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="cms-label">Amenities (comma-separated)</label>
              <input
                type="text"
                value={newAmenities}
                onChange={(e) => setNewAmenities(e.target.value)}
                className="cms-input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="cms-label">Suite Photo (JPG/PNG)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewPhoto(e.target.files?.[0] || null)}
                className="cms-input !py-2"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <label className="cms-label">Description</label>
              <textarea
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="cms-input"
                placeholder="Describe the room atmosphere and hardware..."
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#c3b091] hover:bg-[#b59f7c] text-[#141310] text-xs font-bold"
              >
                Create Category & Generate Tables →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Categories & Physical Tables */}
      <div className="space-y-8">
        {categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            onQuickAdd={quickAddTable}
            onQuickRemove={quickRemoveTable}
            onUpdateCategory={updateCategory}
            onDeleteCategory={deleteCategory}
            onAddCustomTable={addCustomTable}
            onUpdateTable={updateTableItem}
            onDeleteTable={deleteTableItem}
          />
        ))}
      </div>
    </AdminLayout>
  );
}

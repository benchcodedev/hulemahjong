import React, { useMemo, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useHule } from '../../context/HuleContext';
import { hydrateGallery, readFileAsDataUrl } from '../../utils/helpers';

const CATEGORIES = ['Lounge & Interior', 'VIP Suites', 'Tournaments & Community', 'Food & Beverage'];

function PhotoCard({ photo, onUpdate, onDelete }) {
  const [title, setTitle] = useState(photo.title);
  const [category, setCategory] = useState(photo.category);
  const [sortOrder, setSortOrder] = useState(photo.sort_order || 1);
  const [caption, setCaption] = useState(photo.caption || '');
  const [isActive, setIsActive] = useState(Boolean(photo.is_active));
  const [file, setFile] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    const imgUrl = await readFileAsDataUrl(file);
    onUpdate(
      photo.id,
      {
        title,
        category,
        sort_order: sortOrder,
        caption,
        is_active: isActive,
      },
      imgUrl
    );
    setFile(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ebe5d9] overflow-hidden">
      <div className="aspect-[16/10] bg-stone-100 relative">
        <img src={photo.image_url} alt={photo.title} className="w-full h-full object-cover" />
        <span className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
          {photo.category}
        </span>
      </div>

      <form onSubmit={handleSave} className="p-4 space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="cms-input !py-1.5 text-xs font-semibold"
        />

        <div className="grid grid-cols-2 gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="cms-input !py-1.5 text-xs"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="cms-input !py-1.5 text-xs"
            placeholder="Order"
          />
        </div>

        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption"
          className="cms-input !py-1.5 text-xs"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-[11px] text-stone-500 w-full"
        />

        <div className="flex items-center justify-between pt-1">
          <label className="inline-flex items-center gap-1.5 text-xs font-medium">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span>Visible</span>
          </label>
          <button type="submit" className="px-4 py-1.5 rounded-full bg-[#111] text-white text-xs font-semibold">
            Save
          </button>
        </div>
      </form>

      <div className="px-4 pb-4 flex justify-end">
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Delete this photo?')) onDelete(photo.id);
          }}
          className="text-[11px] text-red-500 hover:underline"
        >
          Delete Photo
        </button>
      </div>
    </div>
  );
}

export default function AdminGalleryPage() {
  const { db, addGalleryPhoto, updateGalleryPhoto, deleteGalleryPhoto } = useHule();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Lounge & Interior');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);

  const photos = useMemo(
    () => [...db.galleries].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map(hydrateGallery),
    [db.galleries]
  );

  const handleUpload = async (e) => {
    e.preventDefault();
    const dataUrl = await readFileAsDataUrl(file);
    addGalleryPhoto({ title, category, image_url: imageUrl, caption }, dataUrl);
    setTitle('');
    setImageUrl('');
    setCaption('');
    setFile(null);
  };

  return (
    <AdminLayout
      title="Photo Gallery — Hule Mahjong CMS"
      heading="Photo & Media Gallery"
      subheading="Upload interior photos, VIP room showcases, tournament snapshots, and F&B imagery."
    >
      {/* Upload Photo Card */}
      <div className="bg-white rounded-2xl border border-[#ebe5d9] p-6 mb-8">
        <h2 className="text-[16px] font-bold mb-4">Add New Gallery Photo</h2>
        <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="cms-label">Photo Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. VIP Sakura Suite"
              className="cms-input"
            />
          </div>
          <div>
            <label className="cms-label">Category *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="cms-input">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="cms-label">Upload Image File (JPG/PNG)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="cms-input !py-2"
            />
          </div>
          <div>
            <label className="cms-label">Or External Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="cms-input"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="cms-label">Caption</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Short editorial caption"
              className="cms-input"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full h-[42px] rounded-full bg-[#c3b091] hover:bg-[#b59f7c] text-[#141310] text-xs font-bold transition"
            >
              + Upload to Gallery
            </button>
          </div>
        </form>
      </div>

      {/* Existing Photos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} onUpdate={updateGalleryPhoto} onDelete={deleteGalleryPhoto} />
        ))}
      </div>
    </AdminLayout>
  );
}

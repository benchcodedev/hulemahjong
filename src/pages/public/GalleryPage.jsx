import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import { useHule } from '../../context/HuleContext';
import { hydrateGallery } from '../../utils/helpers';

const CATEGORIES = ['All', 'Lounge & Interior', 'VIP Suites', 'Tournaments & Community', 'Food & Beverage'];

export default function GalleryPage() {
  const { db } = useHule();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'All';
  const [lightbox, setLightbox] = useState(null);

  const photos = useMemo(() => {
    return db.galleries
      .filter((g) => g.is_active && (selectedCategory === 'All' || g.category === selectedCategory))
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map(hydrateGallery);
  }, [db.galleries, selectedCategory]);

  return (
    <PublicLayout title="Lounge & Interior Gallery — Hule Mahjong">
      <section className="pt-9 pb-10 sm:pt-14 sm:pb-14 px-5 text-center">
        <nav className="inline-flex items-center gap-2 text-[12px] text-[#767676] mb-3.5">
          <Link to="/" className="hover:text-[#141413]">
            Home
          </Link>
          <span className="text-[#b5b5b5]">›</span>
          <span className="font-semibold text-[#8c734b]">Gallery</span>
        </nav>

        <h1 className="text-[34px] sm:text-[44px] leading-[1.14] tracking-[-0.03em]">
          <span className="block font-semibold text-[#111111]">Inside</span>
          <span className="block font-light text-[#6b6b6b]">Hule Lounge</span>
        </h1>

        <div className="mt-7 inline-flex flex-wrap items-center justify-center bg-[#f6f4f0] rounded-full p-1.5 border border-[#ece5d8] gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => (cat === 'All' ? setSearchParams({}) : setSearchParams({ category: cat }))}
              className={`px-4 py-1.5 rounded-full text-[12.5px] transition ${
                selectedCategory === cat
                  ? 'bg-[#e7dcc8] text-[#4f3e22] font-semibold'
                  : 'text-[#5c5851] hover:text-[#111] font-medium'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-[1100px] mx-auto px-5 sm:px-10 pb-20">
        {photos.length === 0 ? (
          <div className="rounded-3xl bg-[#faf8f4] border border-[#ece5d8] p-12 text-center text-[#666]">
            No photos in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightbox(photo)}
                className="gallery-trigger text-left group rounded-[22px] overflow-hidden border border-[#ece5d8] bg-white shadow-soft"
              >
                <div className="relative aspect-[16/11] bg-[#f5f3ef] overflow-hidden">
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-black/55 backdrop-blur-xs text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                    {photo.category}
                  </span>
                </div>
                <div className="p-4 sm:p-5">
                  <h2 className="text-[15.5px] font-semibold text-[#151515]">{photo.title}</h2>
                  {photo.caption && <p className="text-[12.5px] text-[#6d6962] mt-1 line-clamp-2">{photo.caption}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {lightbox && (
        <div
          onClick={(e) => e.target === e.currentTarget && setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
        >
          <div className="max-w-[880px] w-full relative">
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute -top-11 right-0 text-white/85 hover:text-white text-sm font-semibold px-3 py-1 rounded-full bg-white/10"
            >
              Close ✕
            </button>
            <img
              src={lightbox.image_url}
              alt={lightbox.title}
              className="w-full max-h-[75vh] object-contain rounded-2xl bg-black"
            />
            <div className="mt-3 text-center text-white">
              <p className="text-[16px] font-semibold">{lightbox.title}</p>
              <p className="text-[13px] text-white/70 mt-0.5">{lightbox.caption}</p>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import { useHule } from '../../context/HuleContext';
import { hydrateCategory } from '../../utils/helpers';

export default function TablesPage() {
  const { db } = useHule();

  const categories = useMemo(
    () =>
      db.tableCategories
        .filter((c) => c.is_active)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((c) => hydrateCategory(c, db)),
    [db]
  );

  return (
    <PublicLayout title="Suites & Automatic Tables — Hule Mahjong">
      <section className="pt-9 pb-11 sm:pt-14 sm:pb-16 px-5 text-center">
        <nav className="inline-flex items-center gap-2 text-[12px] text-[#767676] mb-3.5">
          <Link to="/" className="hover:text-[#141413]">
            Home
          </Link>
          <span className="text-[#b5b5b5]">›</span>
          <span className="font-semibold text-[#8c734b]">Tables & Suites</span>
        </nav>

        <h1 className="text-[34px] sm:text-[44px] leading-[1.14] tracking-[-0.03em]">
          <span className="block font-semibold text-[#111111]">Automatic Tables</span>
          <span className="block font-light text-[#6b6b6b]">& Private Suites</span>
        </h1>
        <p className="max-w-[560px] mx-auto mt-4 text-[14px] text-[#68655f] leading-relaxed">
          Every table at Hule Mahjong is equipped with whisper-quiet dual-deck automatic shufflers, weighted ivory-tone
          tiles, and tableside artisanal tea & dim sum service.
        </p>
      </section>

      <section className="max-w-[1100px] mx-auto px-5 sm:px-10 pb-20 space-y-10">
        {categories.map((category) => (
          <article
            key={category.id}
            className="bg-white rounded-[26px] border border-[#ece5d8] shadow-soft overflow-hidden grid grid-cols-1 lg:grid-cols-12"
          >
            <div className="lg:col-span-5 relative min-h-[260px] bg-[#f6f4f0]">
              <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
              <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[#171512] text-[11px] font-semibold px-3.5 py-1 rounded-full">
                {category.branch}
              </span>
              <span className="absolute bottom-4 left-4 bg-[#111111]/80 backdrop-blur-md text-[#e7dcc8] text-[11px] font-semibold px-3.5 py-1 rounded-full">
                {category.active_tables_count} Active Table{category.active_tables_count === 1 ? '' : 's'}
              </span>
            </div>

            <div className="lg:col-span-7 p-6 sm:p-9 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8c734b]">
                      {category.subtitle || 'Automatic Mahjong Experience'}
                    </p>
                    <h2 className="text-[24px] sm:text-[26px] font-semibold text-[#141414] tracking-[-0.02em] mt-1">
                      {category.name}
                    </h2>
                  </div>
                  <div className="text-left sm:text-right bg-[#faf7f1] border border-[#ece2d0] rounded-2xl px-4 py-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-[#7d6947] font-semibold">
                      Weekday / {category.session_minutes / 60}h Session
                    </p>
                    <p className="text-[20px] font-bold text-[#141414]">{category.formatted_weekday_price}</p>
                    <p className="text-[11px] text-[#78736a]">Weekend: {category.formatted_weekend_price}</p>
                  </div>
                </div>

                <p className="mt-4 text-[13.5px] text-[#5e5b55] leading-relaxed">{category.description}</p>

                {category.amenities?.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {category.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-[#f6f3ec] border border-[#e7dfd1] text-[11.5px] font-medium text-[#534227]"
                      >
                        ✓ {amenity}
                      </span>
                    ))}
                  </div>
                )}

                {/* Live Physical Tables Inventory Strip */}
                <div className="mt-6 pt-5 border-t border-[#f2eee7]">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-[#7a746a] mb-2.5">
                    Physical Units in Lounge ({category.tables.length} Total)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {category.tables.map((t) => (
                      <span
                        key={t.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] border ${
                          t.status === 'active'
                            ? 'border-[#dfd3be] bg-white text-[#2a241b]'
                            : 'border-stone-200 bg-stone-50 text-stone-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            t.status === 'active' ? 'bg-emerald-500' : 'bg-amber-400'
                          }`}
                        ></span>
                        <strong className="font-semibold">{t.code}</strong>
                        <span className="text-[11px] opacity-75">
                          {t.status === 'active' ? t.floor_zone : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-7 pt-5 border-t border-[#f2eee7] flex flex-wrap items-center justify-between gap-4">
                <span className="text-[12px] text-[#777]">
                  Capacity: {category.min_players}–{category.max_players} Guests • {category.session_minutes}{' '}
                  mins/session
                </span>

                <Link
                  to={`/?category=${encodeURIComponent(category.slug)}`}
                  className="inline-flex items-center gap-3 bg-[#111111] hover:bg-[#c3b091] text-white hover:text-[#141413] font-semibold text-[12.5px] rounded-full pl-5 pr-1.5 py-1.5 transition"
                >
                  <span>Book {category.name}</span>
                  <span className="w-7 h-7 rounded-full bg-white text-[#141413] flex items-center justify-center">
                    ↗
                  </span>
                </Link>
              </div>
            </div>
          </article>
        ))}

        {/* House Etiquette & Strictly Recreational Play Banner */}
        <div
          id="etiquette"
          className="rounded-[24px] bg-[#faf7f1] border border-[#e7dcc8] p-7 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#8c734b]">01 • Pure Strategy</p>
            <h3 className="text-[17px] font-semibold text-[#141414] mt-1">Zero Gambling Policy</h3>
            <p className="text-[13px] text-[#666055] mt-1.5 leading-relaxed">
              Hule Mahjong is a strictly recreational social & mind-sport venue. Cash betting, casino chips, or
              wagering of any kind are strictly prohibited.
            </p>
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#8c734b]">
              02 • Beginner Friendly
            </p>
            <h3 className="text-[17px] font-semibold text-[#141414] mt-1">Complimentary Table Intro</h3>
            <p className="text-[13px] text-[#666055] mt-1.5 leading-relaxed">
              First time playing on an automatic table? Our floor hosts gladly demonstrate the push-button elevator
              shuffle and provide scoring reference cards.
            </p>
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#8c734b]">03 • Punctual Holds</p>
            <h3 className="text-[17px] font-semibold text-[#141414] mt-1">15-Minute Grace Window</h3>
            <p className="text-[13px] text-[#666055] mt-1.5 leading-relaxed">
              Reserved tables are held for 15 minutes past your session start. Reschedule free of charge up to 24 hours
              before tee-off.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

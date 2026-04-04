"use client";

import Link from "next/link";
import { useState } from "react";
import { pluralize } from "@/lib/text";

const INITIAL_VISIBLE = 6;
const STEP = 6;

export type ChartBlockItem = {
  slug: string;
  title: string;
  href: string;
  image: string;
  category: string;
  year: number;
  meta: string;
  subMeta: string;
};

type ChartBlockSection = {
  id: string;
  title: string;
  kicker: string;
  typeLabel: string;
  emptyLabel: string;
  items: ChartBlockItem[];
};

type ChartBlocksProps = {
  sections: ChartBlockSection[];
};

function ChartSection({ section }: { section: ChartBlockSection }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const visibleItems = section.items.slice(0, visibleCount);
  const remainingCount = Math.max(section.items.length - visibleCount, 0);

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="route-kicker">{section.kicker}</p>
          <h2 className="font-heading mt-3 text-3xl font-extrabold uppercase leading-[1.1] tracking-[0.01em] text-black">
            {section.title}
          </h2>
        </div>
        <p className="font-body text-sm font-normal text-[color:var(--muted)]">
          {pluralize(section.items.length, "ranked entry", "ranked entries")}
        </p>
      </div>

      {section.items.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {visibleItems.map((item, index) => (
              <Link
                key={`${section.id}-${item.slug}`}
                href={item.href}
                className="hover-card group flex h-full flex-col"
              >
                <div className="relative">
                  <div className="absolute left-3 top-3 z-10 font-heading text-4xl font-extrabold leading-none tracking-[0.01em] tabular-nums text-white/78 drop-shadow-[0_4px_18px_rgba(0,0,0,0.28)]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="aspect-[1.18/0.7] overflow-hidden rounded-[0.4rem] bg-[#ede5da]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="hover-card-media h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex flex-1 flex-col pt-4">
                  <p className="route-kicker text-[0.72rem]">
                    {section.typeLabel} · {item.category}
                  </p>
                  <h3 className="hover-card-title card-heading clamp-2 mt-2 min-h-[3rem] text-[1.35rem] font-semibold leading-tight text-black">
                    {item.title}
                  </h3>
                  <p className="clamp-1 mt-1.5 font-body text-[0.82rem] font-normal text-black/58">{item.meta}</p>
                  <p className="clamp-1 mt-1.5 font-body text-[0.82rem] font-normal text-black/58">{item.subMeta}</p>
                </div>
              </Link>
            ))}
          </div>

          {remainingCount > 0 ? (
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setVisibleCount((current) => current + STEP)}
                className="route-action route-action-primary focus-ring"
              >
                Show more ({remainingCount} more)
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="rounded-[0.72rem] border border-[color:var(--line)] bg-[color:var(--card)] p-6">
          <p className="route-kicker">No matches in this chart</p>
          <p className="mt-3 font-body text-base font-normal leading-relaxed text-[color:var(--muted)]">
            {section.emptyLabel}
          </p>
        </div>
      )}
    </section>
  );
}

export function ChartBlocks({ sections }: ChartBlocksProps) {
  return (
    <div className="mt-12 space-y-16">
      {sections.map((section) => (
        <ChartSection key={section.id} section={section} />
      ))}
    </div>
  );
}

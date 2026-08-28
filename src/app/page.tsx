import Link from "next/link";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { Sparkles, ChevronRight } from "lucide-react";
import { HomeClient } from "@/components/user/HomeClient";
import { OnboardingModal } from "@/components/user/OnboardingModal";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CATEGORIES = [
  { name: 'All', icon: '✦', gradient: 'from-violet-500 to-fuchsia-500' },
  { name: 'Birthday', icon: '🎂', gradient: 'from-pink-500 to-rose-500' },
  { name: 'Wedding', icon: '💍', gradient: 'from-amber-400 to-orange-500' },
  { name: 'Onam', icon: '🌸', gradient: 'from-green-400 to-emerald-600' },
  { name: 'Christmas', icon: '🎄', gradient: 'from-red-500 to-green-600' },
  { name: 'General', icon: '⭐', gradient: 'from-blue-500 to-indigo-500' },
];

async function FeaturedTemplates() {
  const { data: templates } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[17px] font-bold text-[var(--color-text-primary)]">Featured Templates</h2>
        <Link href="/categories/General" className="flex items-center gap-1 text-[var(--color-brand-violet-light)] text-[13px] font-medium">
          See all <ChevronRight size={14} />
        </Link>
      </div>

      {templates && templates.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {templates.map((template, idx) => (
            <Link
              href={`/generate/${template.id}`}
              key={template.id}
              className="group relative flex flex-col overflow-hidden rounded-[20px] glass-card glass-card-hover transition-all duration-300 active:scale-[0.97]"
            >
              {/* Preview thumbnail */}
              <div
                className="aspect-[3/4] w-full relative overflow-hidden"
                style={{
                  backgroundColor: template.artboard_color || '#1a1a2e',
                  backgroundImage: template.background_url ? `url(${template.background_url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                {/* Category badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold tracking-wide uppercase">
                    {template.category || 'General'}
                  </span>
                </div>
              </div>

              {/* Info footer */}
              <div className="p-3">
                <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">{template.name}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="flex -space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 border border-[var(--color-bg-card)]" />
                    ))}
                  </div>
                  <span className="text-[10px] text-[var(--color-text-muted)]">Use template</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-[20px] gradient-brand flex items-center justify-center mb-4">
            <Sparkles size={28} className="text-white" />
          </div>
          <p className="text-[var(--color-text-secondary)] text-[14px]">No templates yet.<br/>Check back soon!</p>
        </div>
      )}
    </>
  );
}

function TemplatesSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-32 bg-[var(--color-bg-card)] rounded animate-pulse" />
        <div className="h-4 w-16 bg-[var(--color-bg-card)] rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-[20px] glass-card">
            <div className="aspect-[3/4] w-full bg-[var(--color-bg-card)] animate-pulse" />
            <div className="p-3">
              <div className="h-4 w-3/4 bg-[var(--color-bg-card)] rounded mb-2 animate-pulse" />
              <div className="h-3 w-1/2 bg-[var(--color-bg-card)] rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] pb-nav overflow-x-hidden">
      <OnboardingModal />

      {/* ── Hero Top Bar ─────────────────────────────── */}
      <div className="px-5 pt-14 pb-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[var(--color-text-muted)] text-[13px] font-medium tracking-widest uppercase mb-1">Design Studio</p>
            <h1 className="text-[28px] font-black tracking-tight text-[var(--color-text-primary)] leading-none">
              crafter<span className="gradient-brand-text">.</span>
            </h1>
          </div>
        </div>

        {/* Hero Card */}
        <div className="relative rounded-[28px] overflow-hidden mb-6"
          style={{ background: 'linear-gradient(135deg, #4f1eb8 0%, #7c3aed 40%, #c026d3 100%)' }}>
          {/* Glow blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-pink-500/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 p-6 pb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-semibold tracking-wide uppercase">
                ✦ New
              </div>
            </div>
            <h2 className="text-white text-[22px] font-black leading-tight mb-2">
              Personalize any<br />template instantly
            </h2>
            <p className="text-white/60 text-[13px] mb-5 leading-relaxed">
              Add your name, photo and create stunning designs in seconds.
            </p>
            <HomeClient />
          </div>
        </div>
      </div>

      {/* ── Category Chips ────────────────────────────── */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-bold text-[var(--color-text-primary)]">Browse by Category</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.name === 'All' ? '/#templates' : `/categories/${cat.name}`}
              className="flex-shrink-0 flex flex-col items-center gap-2 group"
            >
              <div className={`w-14 h-14 rounded-[18px] bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-[22px] shadow-lg group-hover:scale-105 transition-transform duration-200`}>
                {cat.icon}
              </div>
              <span className="text-[11px] font-medium text-[var(--color-text-secondary)] group-hover:text-white transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Templates Grid ─────────────────────────────── */}
      <div id="templates" className="px-5">
        <Suspense fallback={<TemplatesSkeleton />}>
          <FeaturedTemplates />
        </Suspense>
      </div>

      {/* ── Bottom Nav ────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pointer-events-none">
        <div className="pointer-events-auto glass-card rounded-[24px] px-8 py-4 flex items-center justify-around"
          style={{ boxShadow: 'var(--shadow-bottom-nav)', background: 'rgba(30,0,12,0.92)' }}>
          {/* Home */}
          <Link href="/" className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-[10px] gradient-brand flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            </div>
            <span className="text-[10px] font-semibold text-white">Home</span>
          </Link>

          {/* Explore */}
          <Link href="/categories/General" className="flex flex-col items-center gap-1.5 group">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-text-muted)] group-hover:text-white transition-colors">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <span className="text-[10px] font-medium text-[var(--color-text-muted)] group-hover:text-white transition-colors">Explore</span>
          </Link>

          {/* Gallery */}
          <Link href="/categories/Birthday" className="flex flex-col items-center gap-1.5 group">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-text-muted)] group-hover:text-white transition-colors">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
            <span className="text-[10px] font-medium text-[var(--color-text-muted)] group-hover:text-white transition-colors">Gallery</span>
          </Link>

          {/* Profile */}
          <Link href="/" className="flex flex-col items-center gap-1.5 group">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-text-muted)] group-hover:text-white transition-colors">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </div>
            <span className="text-[10px] font-medium text-[var(--color-text-muted)] group-hover:text-white transition-colors">Profile</span>
          </Link>
        </div>
      </nav>

    </div>
  );
}

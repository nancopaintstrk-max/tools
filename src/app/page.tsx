import Link from "next/link";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { Sparkles, ChevronRight, Home as HomeIcon, Heart, Search, User } from "lucide-react";
import { OnboardingModal } from "@/components/user/OnboardingModal";
import { UserAvatarMenu } from "@/components/user/UserAvatarMenu";
import { HeroCarousel } from "@/components/user/HeroCarousel";
import { BottomNav } from "@/components/user/BottomNav";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/* ── Dynamic Categories ─────────────────────────────── */
async function DynamicCategories() {
  const { data: templates } = await supabase
    .from('templates')
    .select('category, elements')
    .order('created_at', { ascending: false });

  const uniqueCats = new Map<string, { icon: string; bg: string; textColor: string }>();
  uniqueCats.set('All', { icon: '✨', bg: 'linear-gradient(135deg, #7C3AED, #3B82F6)', textColor: '#7C3AED' });

  const palette = [
    { bg: '#FFE5EE', textColor: '#E11D48' },
    { bg: '#FFF3D6', textColor: '#D97706' },
    { bg: '#E6FAF0', textColor: '#059669' },
    { bg: '#FFE9E9', textColor: '#DC2626' },
    { bg: '#E0F2FF', textColor: '#0284C7' },
    { bg: '#F3E8FF', textColor: '#9333EA' },
    { bg: '#DCFCE7', textColor: '#16A34A' },
  ];

  if (templates) {
    let colorIdx = 0;
    templates.forEach(t => {
      if (!t.category) return;
      if (!uniqueCats.has(t.category)) {
        let icon = '⭐';
        if (t.elements && Array.isArray(t.elements)) {
          const meta = t.elements.find((el: any) => el.id === 'category-icon-meta');
          if (meta && meta.icon) icon = meta.icon;
        }
        const p = palette[colorIdx % palette.length];
        uniqueCats.set(t.category, { icon, bg: p.bg, textColor: p.textColor });
        colorIdx++;
      } else {
        const current = uniqueCats.get(t.category);
        if (t.elements && Array.isArray(t.elements)) {
          const meta = t.elements.find((el: any) => el.id === 'category-icon-meta');
          if (meta && meta.icon && current?.icon === '⭐') {
            uniqueCats.set(t.category, { ...current!, icon: meta.icon });
          }
        }
      }
    });
  }

  const categoriesList = Array.from(uniqueCats.entries()).map(([name, data]) => ({
    name, ...data
  }));

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
      {categoriesList.map((cat) => (
        <Link
          key={cat.name}
          href={cat.name === 'All' ? '/#templates' : `/categories/${cat.name}`}
          className="flex-shrink-0 flex flex-col items-center gap-2.5 group"
        >
          <div
            className="w-[90px] h-[90px] rounded-[26px] flex items-center justify-center text-[52px] leading-none shadow-sm group-hover:scale-105 transition-transform duration-200"
            style={{ background: cat.bg }}
          >
            {cat.icon}
          </div>
          <span
            className="text-[12px] font-semibold"
            style={{ color: cat.textColor }}
          >
            {cat.name}
          </span>
        </Link>
      ))}
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2.5">
          <div className="w-[90px] h-[90px] rounded-[26px] bg-gray-100 animate-pulse" />
          <div className="h-3 w-14 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

/* ── Featured Templates ──────────────────────────────── */
async function FeaturedTemplates() {
  const { data: templates } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12);

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[19px] font-bold text-gray-900">Featured Templates</h2>
        <Link
          href="/categories/General"
          className="flex items-center gap-1 text-[13px] font-semibold px-3 py-1.5 rounded-full"
          style={{ background: '#EDE9FF', color: '#7C3AED' }}
        >
          See all <ChevronRight size={13} />
        </Link>
      </div>

      {templates && templates.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {templates.map((template) => (
            <Link
              href={`/generate/${template.id}`}
              key={template.id}
              className="group relative flex flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.14)] transition-all duration-300 active:scale-[0.97]"
            >
              <div
                className="aspect-[3/4] w-full relative overflow-hidden"
                style={{
                  backgroundColor: template.artboard_color || '#f5f0ff',
                  backgroundImage: template.background_url ? `url(${template.background_url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 text-[10px] font-bold tracking-wide uppercase">
                    {template.category || 'General'}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-white">
                <h3 className="text-[13px] font-bold text-gray-800 truncate">{template.name}</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Tap to personalise</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] bg-white p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div
            className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
          >
            <Sparkles size={28} className="text-white" />
          </div>
          <p className="text-gray-500 text-[14px]">No templates yet.<br />Check back soon!</p>
        </div>
      )}
    </>
  );
}

function TemplatesSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div className="h-5 w-36 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-7 w-20 bg-gray-100 rounded-full animate-pulse" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-[20px] bg-white shadow-sm">
            <div className="aspect-[3/4] w-full bg-gray-100 animate-pulse" />
            <div className="p-3">
              <div className="h-4 w-3/4 bg-gray-100 rounded mb-2 animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

async function HeroSection() {
  const { data: templates } = await supabase
    .from('templates')
    .select('id, name, category, background_url')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="px-5 mt-5">
      <div className="relative rounded-[28px] overflow-hidden bg-gray-100">

        <Suspense fallback={
          <div className="relative z-10 h-32 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-white/20 border-t-white animate-spin" />
          </div>
        }>
          <HeroCarousel templates={templates || []} />
        </Suspense>
      </div>
    </div>
  );
}

async function QuickStats() {
  const { count } = await supabase
    .from('templates')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="px-5 mt-4 grid grid-cols-2 gap-3">
      <div className="bg-white rounded-[16px] p-3 shadow-sm flex flex-col items-center justify-center text-center gap-0.5">
        <span className="text-[11px] font-medium text-gray-400">Total Templates</span>
        <span className="text-[24px] font-black text-gray-900 leading-none">{count || 0}</span>
        <span className="text-[10px] font-semibold" style={{ color: '#7C3AED' }}>Always growing</span>
      </div>
      <a href="https://nancopaints.com" target="_blank" rel="noopener noreferrer" className="bg-black rounded-[16px] px-4 shadow-sm flex items-center justify-center hover:shadow-md transition-shadow">
        <img src="/logo.png" alt="Nanco Paints" className="w-[70px] h-[70px] object-contain" />
      </a>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen pb-nav overflow-x-hidden relative" style={{ backgroundColor: '#F7F5FF' }}>
      {/* Background Pattern fading into transparency */}
      <div 
        className="absolute top-0 left-0 w-full h-[60vh] z-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'url(/pattern.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
        }}
      />

      <div className="relative z-10">
        <OnboardingModal />

      {/* ── Top Bar ─────────────────────────────── */}
      <div className="px-5 pt-8 pb-6 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <img src="/light-logo.png" alt="Crafter Logo" style={{ width: 150, height: 'auto' }} className="object-contain" />
          <h1 className="text-[18px] font-black text-gray-900 leading-tight" style={{ marginRight: 10, paddingLeft: 6 }}>
            crafter<span style={{ color: '#7C3AED' }}>.</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <UserAvatarMenu />
        </div>
      </div>

      {/* ── Hero Banner ─────────────────────────── */}
      <HeroSection />

      {/* ── Quick Stats ─────────────────────────── */}
      <Suspense fallback={
        <div className="px-5 mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white rounded-[16px] h-20 animate-pulse" />
          <div className="bg-gray-200 rounded-[16px] h-20 animate-pulse" />
        </div>
      }>
        <QuickStats />
      </Suspense>

      {/* ── Categories ──────────────────────────── */}
      <div className="px-5 mt-7">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[19px] font-bold text-gray-900">Browse by Category</h2>
        </div>
        <Suspense fallback={<CategorySkeleton />}>
          <DynamicCategories />
        </Suspense>
      </div>

      {/* ── Templates Grid ──────────────────────── */}
      <div id="templates" className="px-5 mt-8">
        <Suspense fallback={<TemplatesSkeleton />}>
          <FeaturedTemplates />
        </Suspense>
      </div>

      {/* ── Bottom Navigation ─────────────────────── */}
      <BottomNav />
      </div>
    </div>
  );
}

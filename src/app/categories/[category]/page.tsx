import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, SlidersHorizontal } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CATEGORY_META: Record<string, { gradient: string; icon: string; desc: string }> = {
  Birthday: { gradient: 'from-pink-500 to-rose-600', icon: '🎂', desc: 'Celebrate in style' },
  Wedding: { gradient: 'from-amber-400 to-orange-500', icon: '💍', desc: 'Your perfect day' },
  Onam: { gradient: 'from-green-400 to-emerald-600', icon: '🌸', desc: 'Festival of harvest' },
  Christmas: { gradient: 'from-red-500 to-green-600', icon: '🎄', desc: 'Season\'s greetings' },
  General: { gradient: 'from-blue-500 to-indigo-600', icon: '⭐', desc: 'For every occasion' },
};

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const decodedCategory = decodeURIComponent(resolvedParams.category);
  const meta = CATEGORY_META[decodedCategory] ?? { gradient: 'from-violet-500 to-purple-600', icon: '✦', desc: 'Templates' };

  const { data: templates } = await supabase
    .from('templates')
    .select('*')
    .eq('category', decodedCategory)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] pb-nav">
      {/* Hero header */}
      <div className={`relative bg-gradient-to-br ${meta.gradient} pt-14 pb-8 px-5`}>
        {/* Glow blob */}
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.2), transparent 60%)' }} />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center justify-center w-9 h-9 rounded-[12px] bg-black/20 backdrop-blur-sm mb-5 text-white hover:bg-black/30 transition-colors">
            <ChevronLeft size={18} />
          </Link>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-white/60 text-[12px] font-semibold uppercase tracking-widest mb-1">Category</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{meta.icon}</span>
                <div>
                  <h1 className="text-white text-[28px] font-black leading-none">{decodedCategory}</h1>
                  <p className="text-white/60 text-[13px] mt-0.5">{meta.desc}</p>
                </div>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm text-white text-[12px] font-semibold">
              {templates?.length || 0} designs
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-bold text-[var(--color-text-primary)]">All Templates</h2>
          <button className="flex items-center gap-2 px-3 py-2 rounded-[12px] glass-card text-[var(--color-text-secondary)] text-[12px] font-medium hover:text-white transition-colors">
            <SlidersHorizontal size={13} /> Filter
          </button>
        </div>

        {templates && templates.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {templates.map((template) => (
              <Link
                href={`/generate/${template.id}`}
                key={template.id}
                className="group relative flex flex-col overflow-hidden rounded-[20px] glass-card glass-card-hover transition-all duration-200 active:scale-[0.97]"
              >
                <div
                  className="aspect-[3/4] w-full relative overflow-hidden"
                  style={{
                    backgroundColor: template.artboard_color || '#1a1a2e',
                    backgroundImage: template.background_url ? `url(${template.background_url})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                </div>
                <div className="p-3">
                  <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">{template.name}</h3>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Tap to personalize</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] glass-card p-12 text-center">
            <span className="text-4xl block mb-3">{meta.icon}</span>
            <p className="text-[var(--color-text-secondary)] text-[14px]">No {decodedCategory} templates yet.</p>
            <Link href="/admin/editor" className="inline-flex mt-4 px-5 py-2.5 rounded-full gradient-brand text-white text-[13px] font-semibold">
              Create the first one
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pointer-events-none">
        <div className="pointer-events-auto glass-card rounded-[24px] px-6 py-4 flex items-center justify-around"
          style={{ background: 'rgba(17,17,19,0.85)' }}>
          <Link href="/" className="flex flex-col items-center gap-1.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-text-muted)]"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span className="text-[10px] font-medium text-[var(--color-text-muted)]">Home</span>
          </Link>
          <Link href="/admin/editor" className="flex flex-col items-center gap-1.5 -mt-6">
            <div className="w-14 h-14 rounded-[18px] gradient-brand shadow-glow-violet flex items-center justify-center" style={{boxShadow:'var(--shadow-glow-violet)'}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <span className="text-[10px] font-semibold text-white">Create</span>
          </Link>
          <Link href="/admin" className="flex flex-col items-center gap-1.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-text-muted)]"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            <span className="text-[10px] font-medium text-[var(--color-text-muted)]">Admin</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

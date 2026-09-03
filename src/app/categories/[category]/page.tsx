import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, SlidersHorizontal } from "lucide-react";
import { BottomNav } from "@/components/user/BottomNav";
import { CategoryTemplatesClient } from "@/components/user/CategoryTemplatesClient";

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

  let query = supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (decodedCategory !== 'General') {
    query = query.eq('category', decodedCategory);
  }

  const { data: templates } = await query;

  // Try to find the dynamic icon assigned to this category in the database
  let dynamicIcon = meta.icon;
  if (templates && templates.length > 0) {
    for (const t of templates) {
      if (t.elements && Array.isArray(t.elements)) {
        const metaEl = t.elements.find((el: any) => el.id === 'category-icon-meta');
        if (metaEl && metaEl.icon) {
          dynamicIcon = metaEl.icon;
          break; // Stop at the first template that has a valid category icon
        }
      }
    }
  }

  const RANDOM_GRADIENTS = [
    'from-pink-500 to-rose-600',
    'from-violet-500 to-purple-600',
    'from-blue-500 to-indigo-600',
    'from-amber-400 to-orange-500',
    'from-green-400 to-emerald-600',
    'from-cyan-400 to-blue-500',
    'from-fuchsia-500 to-pink-600',
  ];
  const randomGradient = RANDOM_GRADIENTS[Math.floor(Math.random() * RANDOM_GRADIENTS.length)];

  return (
    <div className="min-h-screen bg-[#F7F5FF] pb-nav">
      {/* Hero header */}
      <div className={`relative bg-gradient-to-br ${randomGradient} pt-6 pb-5 px-5 overflow-hidden min-h-[220px] flex flex-col`}>
        {/* Pattern Background */}
        <div 
          className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: 'url(/pattern.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        
        {/* Large Icon */}
        <div className="absolute top-10 left-4 pointer-events-none">
          <span className="text-[100px] leading-none drop-shadow-lg">{dynamicIcon}</span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <Link href="/" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors shadow-sm">
              <ChevronLeft size={18} />
            </Link>
            <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold shadow-sm tracking-wide">
              {templates?.length || 0} DESIGNS
            </div>
          </div>

          <div className="flex items-end justify-end text-right mt-12">
            <div>
              <h1 className="text-white text-[48px] font-black leading-none tracking-tight drop-shadow-md">{decodedCategory}</h1>
              <p className="text-white/90 text-[13px] font-medium mt-1">{meta.desc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <CategoryTemplatesClient 
        initialTemplates={templates || []} 
        categoryName={decodedCategory} 
        metaIcon={dynamicIcon} 
      />
      <BottomNav />
    </div>
  );
}

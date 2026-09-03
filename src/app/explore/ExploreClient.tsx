"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Sparkles } from "lucide-react";
import { BottomNav } from "@/components/user/BottomNav";

interface Template {
  id: string;
  name: string;
  category: string;
  artboard_color?: string;
  background_url?: string;
  tags?: string[];
}

export function ExploreClient({ initialTemplates }: { initialTemplates: Template[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = initialTemplates.filter((template) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Check name
    if (template.name && template.name.toLowerCase().includes(query)) return true;
    
    // Check category
    if (template.category && template.category.toLowerCase().includes(query)) return true;
    
    // Check tags
    if (template.tags) {
      if (Array.isArray(template.tags)) {
        if (template.tags.some(t => typeof t === 'string' && t.toLowerCase().includes(query))) return true;
      } else if (typeof template.tags === 'string') {
        if ((template.tags as unknown as string).toLowerCase().includes(query)) return true;
      }
    }
    
    return false;
  });

  return (
    <div className="min-h-screen bg-[#F7F5FF] pb-nav">
      
      {/* Search Header */}
      <div className="bg-white px-5 pt-14 pb-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-b-[32px] sticky top-0 z-40">
        <h1 className="text-[28px] font-black text-gray-900 mb-1 leading-tight tracking-tight">Explore</h1>
        <p className="text-[13px] text-gray-500 font-medium mb-5">Search through all templates.</p>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search templates, categories, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-full text-[15px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-8 pb-24">
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredTemplates.map((template) => (
              <Link
                href={`/generate/${template.id}`}
                key={template.id}
                className="group relative flex flex-col overflow-hidden rounded-[20px] bg-white shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md active:scale-[0.97]"
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
                  
                  {/* Category Badge on Template */}
                  <div className="absolute top-2 right-2 px-2 py-1 bg-white/20 backdrop-blur-md rounded-md">
                    <span className="text-white text-[9px] font-bold tracking-widest uppercase">{template.category}</span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-[14px] font-bold text-gray-900 truncate">{template.name}</h3>
                  <p className="text-[11px] font-medium text-gray-400 mt-0.5">Tap to personalize</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] bg-white shadow-sm border border-gray-100 p-12 text-center mt-6">
            <span className="text-4xl block mb-3 opacity-50">🔍</span>
            <p className="text-gray-500 font-medium text-[15px]">No results found for "{searchQuery}"</p>
            <p className="text-gray-400 text-[13px] mt-2">Try searching for a different keyword.</p>
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}

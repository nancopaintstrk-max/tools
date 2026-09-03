"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: string;
  artboard_color?: string;
  background_url?: string;
  tags?: string[];
}

export function CategoryTemplatesClient({ 
  initialTemplates, 
  categoryName, 
  metaIcon 
}: { 
  initialTemplates: Template[], 
  categoryName: string, 
  metaIcon: string 
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = initialTemplates.filter((template) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Check name
    if (template.name && template.name.toLowerCase().includes(query)) return true;
    
    // Check category
    if (template.category && template.category.toLowerCase().includes(query)) return true;
    
    // Check tags (if we have them as an array or JSON string)
    if (template.tags) {
      if (Array.isArray(template.tags)) {
        if (template.tags.some(t => t.toLowerCase().includes(query))) return true;
      } else if (typeof template.tags === 'string') {
        if (template.tags.toLowerCase().includes(query)) return true;
      }
    }
    
    return false;
  });

  return (
    <div className="px-5 pt-6 pb-24">
      {categoryName === "General" && (
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search templates, categories, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-[16px] text-[14px] text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
          />
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[17px] font-bold text-gray-900">
          {searchQuery ? `Search Results (${filteredTemplates.length})` : 'All Templates'}
        </h2>
        <button className="flex items-center gap-2 px-3 py-2 rounded-[12px] bg-white border border-gray-100 shadow-sm text-gray-500 text-[12px] font-medium hover:text-gray-900 transition-colors">
          <SlidersHorizontal size={13} /> Filter
        </button>
      </div>

      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
              </div>
              <div className="p-3">
                <h3 className="text-[13px] font-bold text-gray-900 truncate">{template.name}</h3>
                <p className="text-[10px] font-medium text-gray-400 mt-0.5">Tap to personalize</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] bg-white shadow-sm border border-gray-100 p-12 text-center">
          <span className="text-4xl block mb-3">{metaIcon}</span>
          <p className="text-gray-500 font-medium text-[14px]">
            {searchQuery ? `No results found for "${searchQuery}"` : `No ${categoryName} templates yet.`}
          </p>
          <Link href="/admin/editor" className="inline-flex mt-4 px-5 py-2.5 rounded-full bg-violet-600 text-white text-[13px] font-semibold hover:bg-violet-700 transition-colors">
            Create the first one
          </Link>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { HomeClient } from "./HomeClient";

interface Template {
  id: string;
  name: string;
  category: string;
  background_url: string;
}

export function HeroCarousel({ templates }: { templates: Template[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!templates || templates.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % templates.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [templates]);

  if (!templates || templates.length === 0) {
    return (
      <div className="relative z-10 flex items-center justify-center h-48">
        <span className="text-gray-500 text-[13px]">No templates available</span>
      </div>
    );
  }

  const currentTemplate = templates[currentIndex];

  return (
    <Link href={`/generate/${currentTemplate.id}`} className="block relative w-full h-[320px] group">
      {/* Background Image of Template */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          backgroundImage: currentTemplate.background_url ? `url(${currentTemplate.background_url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 1
        }}
      />
      
      {/* Bottom Gradient for Category Badge Readability */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10 animate-fade-in" key={currentTemplate.id}>
        <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md rounded-full px-4 py-2">
          <span className="text-white text-[13px] font-bold tracking-wide uppercase shadow-sm">
            ✦ {currentTemplate.category || 'Featured'}
          </span>
        </div>
        
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight size={18} />
        </div>
      </div>
      
      {/* Carousel Dots */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
        {templates.map((_, idx) => (
          <div 
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
          />
        ))}
      </div>
    </Link>
  );
}

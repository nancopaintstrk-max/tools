"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home as HomeIcon, Search, User, Globe } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const controlNavbar = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (currentScrollY > lastScrollY && currentScrollY > 50) {
            setIsVisible(false);
          } else if (currentScrollY < lastScrollY) {
            setIsVisible(true);
          }
          
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', controlNavbar, { passive: true });
    return () => window.removeEventListener('scroll', controlNavbar);
  }, []);

  return (
    <nav 
      className={`fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 pointer-events-none transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-[120%]'
      }`}
    >
      <div className="max-w-[400px] mx-auto bg-white/95 backdrop-blur-xl rounded-full p-2 flex items-center justify-between border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.08)] pointer-events-auto">
        <Link href="/" className={`flex flex-col items-center justify-center w-[72px] h-14 rounded-full transition-colors ${pathname === '/' ? 'bg-violet-50 text-violet-600' : 'text-gray-400 hover:text-gray-900'}`}>
          <HomeIcon size={22} className={`mb-1 ${pathname === '/' ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
          <span className="text-[10px] font-bold tracking-wide">Home</span>
        </Link>
        
        <Link href="/explore" className={`flex flex-col items-center justify-center w-[72px] h-14 rounded-full transition-colors ${pathname === '/explore' ? 'bg-violet-50 text-violet-600' : 'text-gray-400 hover:text-gray-900'}`}>
          <Search size={22} className={`mb-1 ${pathname === '/explore' ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
          <span className="text-[10px] font-semibold tracking-wide">Explore</span>
        </Link>

        <a href="https://nancopaints.com" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center justify-center w-[72px] h-14 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
          <img src="/image.png" alt="Nanco Paints" className="w-[28px] h-[28px] object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
          <span className="text-[10px] font-semibold tracking-wide">nancopaints</span>
        </a>

        <Link href="/profile" className={`flex flex-col items-center justify-center w-[72px] h-14 rounded-full transition-colors ${pathname === '/profile' ? 'bg-violet-50 text-violet-600' : 'text-gray-400 hover:text-gray-900'}`}>
          <User size={22} className={`mb-1 ${pathname === '/profile' ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
          <span className="text-[10px] font-semibold tracking-wide">Profile</span>
        </Link>
      </div>
    </nav>
  );
}

"use client";

import { useUserStore } from "@/store/userStore";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function HomeClient() {
  const router = useRouter();
  const { userName, userPhoto } = useUserStore();

  if (!userName) {
    // While the modal is showing, show a subtle placeholder
    return (
      <div className="flex items-center gap-3 py-1">
        <div className="w-10 h-10 rounded-[14px] bg-white/10 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-white/10 rounded-full w-24 animate-pulse" />
          <div className="h-2.5 bg-white/08 rounded-full w-16 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          {userPhoto ? (
            <img src={userPhoto} alt={userName} className="w-11 h-11 rounded-[14px] object-cover border-2 border-white/20" />
          ) : (
            <div className="w-11 h-11 rounded-[14px] gradient-brand flex items-center justify-center text-white font-bold text-lg">
              {userName[0]?.toUpperCase()}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-[#3d0020] flex items-center justify-center">
            <CheckCircle2 size={8} className="text-white" />
          </div>
        </div>
        <div>
          <p className="text-white text-[14px] font-semibold leading-none">Hey, {userName.split(' ')[0]}!</p>
          <p className="text-white/50 text-[11px] mt-0.5">Profile ready ✓</p>
        </div>
      </div>

      <button
        onClick={() => router.push('/#templates')}
        className="px-4 py-2 rounded-full bg-white text-[#7c3aed] text-[12px] font-bold hover:bg-white/90 transition-colors flex items-center gap-1"
      >
        Browse <ArrowRight size={12} />
      </button>
    </div>
  );
}

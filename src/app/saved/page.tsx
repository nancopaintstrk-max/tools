import { BottomNav } from "@/components/user/BottomNav";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function SavedPage() {
  return (
    <div className="min-h-screen bg-[#F7F5FF] pb-nav">
      
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-b-[32px] relative z-10">
        <h1 className="text-[28px] font-black text-gray-900 mb-1 leading-tight tracking-tight">Saved</h1>
        <p className="text-[13px] text-gray-500 font-medium">Your favorite personalized templates.</p>
      </div>

      {/* Content */}
      <div className="px-5 pt-12 pb-24">
        <div className="rounded-[24px] bg-white shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-4">
            <Heart size={28} className="text-violet-500" />
          </div>
          <h2 className="text-[18px] font-bold text-gray-900 mb-2">No saved templates</h2>
          <p className="text-gray-500 font-medium text-[14px] leading-relaxed">
            You haven't saved any templates yet. Tap the heart icon on any template to save it here for quick access later.
          </p>
          <Link href="/explore" className="inline-flex mt-6 px-6 py-3 rounded-full bg-violet-600 text-white text-[14px] font-bold shadow-lg shadow-violet-600/20 hover:bg-violet-700 transition-colors">
            Start Exploring
          </Link>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}

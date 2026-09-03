"use client";

import { useUserStore } from "@/store/userStore";
import { BottomNav } from "@/components/user/BottomNav";
import { LogIn, User, Phone, Edit2, Sparkles } from "lucide-react";

export default function ProfilePage() {
  const { userName, userPhone, userPhoto, setUserData } = useUserStore();

  const handleEdit = () => {
    // Resetting the userName triggers the onboarding modal again
    setUserData("", "", null);
  };

  const initial = userName ? userName.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[#F7F5FF] pb-nav">
      
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-b-[32px] relative z-10">
        <h1 className="text-[28px] font-black text-gray-900 mb-1 leading-tight tracking-tight">Your Profile</h1>
        <p className="text-[13px] text-gray-500 font-medium">Manage your personal details.</p>
      </div>

      {/* Content */}
      <div className="px-5 pt-8 pb-24">
        {/* User Card */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col items-center relative mb-6">
          <button 
            onClick={handleEdit}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Edit2 size={16} />
          </button>

          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg overflow-hidden mb-4 border-4 border-white"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}
          >
            {userPhoto ? (
              <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>

          <h2 className="text-[20px] font-bold text-gray-900">{userName || 'Guest User'}</h2>
          
          <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-violet-50 text-violet-600 rounded-full text-[12px] font-semibold">
            <Sparkles size={14} /> Profile Ready
          </div>
        </div>

        {/* Details List */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
              <User size={18} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Name</p>
              <p className="text-[14px] font-semibold text-gray-900">{userName || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
              <Phone size={18} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Mobile Number</p>
              <p className="text-[14px] font-semibold text-gray-900">{userPhone || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Nanco Paints Login Button */}
        <a 
          href="https://nancopaints.com/customer_registration" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-4 rounded-[16px] bg-black text-white text-[14px] font-bold shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <LogIn size={18} />
          Sign in to Nanco Paints
        </a>
      </div>
      
      <BottomNav />
    </div>
  );
}

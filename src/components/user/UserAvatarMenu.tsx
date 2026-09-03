"use client";

import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { Phone, LogIn, Edit2 } from "lucide-react";

export function UserAvatarMenu() {
  const { userName, userPhone, userPhoto, setUserData } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);

  // If no user name yet (onboarding not done), we might just show 'U'
  const initial = userName ? userName.charAt(0).toUpperCase() : 'U';

  const handleEdit = () => {
    // Resetting the userName triggers the onboarding modal again
    setUserData("", "", null);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[15px] shadow overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}
      >
        {userPhoto ? (
          <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 w-64 bg-white rounded-[20px] shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in origin-top-right">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <p className="font-bold text-gray-900 text-[15px]">{userName || 'Guest User'}</p>
              {userPhone && (
                <p className="text-gray-500 text-[12px] flex items-center gap-1 mt-1">
                  <Phone size={12} /> {userPhone}
                </p>
              )}
            </div>
            
            <div className="p-2">
              <button 
                onClick={handleEdit}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-gray-50 rounded-[12px] transition-colors"
              >
                <Edit2 size={16} className="text-gray-400" />
                Edit Profile
              </button>
              
              <div className="h-px bg-gray-100 my-1 mx-2" />
              
              <a 
                href="https://nancopaints.com/customer_registration" 
                className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium text-[var(--color-brand-violet)] hover:bg-violet-50 rounded-[12px] transition-colors"
              >
                <LogIn size={16} />
                Login / Register
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

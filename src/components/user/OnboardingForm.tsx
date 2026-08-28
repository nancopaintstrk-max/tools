"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { ArrowRight, Camera } from "lucide-react";

export function OnboardingForm() {
  const router = useRouter();
  const { userName, userPhone, userPhoto, setUserData } = useUserStore();
  
  const [name, setName] = useState(userName);
  const [phone, setPhone] = useState(userPhone);
  const [photo, setPhoto] = useState<string | null>(userPhoto);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setPhoto(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setUserData(name, phone, photo);
    router.push("/#categories");
  };

  return (
    <div className="w-full max-w-sm bg-[var(--color-pure-white)] rounded-[28px] p-8 shadow-sm-2">
      <div className="mb-8 text-center">
        <h2 className="font-shop-display text-[24px] text-[var(--color-ink-black)] leading-none mb-2">Create yours</h2>
        <p className="font-shop-body text-[14px] text-[var(--color-muted-gray)]">Details will automatically fill into your templates.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Photo Upload - Circular Avatar */}
        <div className="flex justify-center mb-2">
          <label className="relative w-24 h-24 rounded-full bg-[var(--color-canvas-mist)] border border-[var(--color-faint-border)] flex items-center justify-center cursor-pointer overflow-hidden group hover:bg-gray-100 transition-colors">
            {photo ? (
              <>
                <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Camera className="text-white" size={20} />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-[var(--color-muted-gray)]">
                <Camera size={20} className="mb-1" />
                <span className="font-shop-meta text-[11px]">Upload</span>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </label>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-4">
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            required
            className="w-full bg-[var(--color-pure-white)] border border-[var(--color-faint-border)] rounded-full px-5 py-3.5 font-shop-body text-[16px] text-[var(--color-ink-black)] placeholder:text-[var(--color-cool-stone)] focus:outline-none focus:border-[var(--color-shop-violet)] transition-colors"
          />

          <input 
            type="tel" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number (Optional)"
            className="w-full bg-[var(--color-pure-white)] border border-[var(--color-faint-border)] rounded-full px-5 py-3.5 font-shop-body text-[16px] text-[var(--color-ink-black)] placeholder:text-[var(--color-cool-stone)] focus:outline-none focus:border-[var(--color-shop-violet)] transition-colors"
          />
        </div>

        {/* Submit */}
        <button 
          type="submit" 
          disabled={!name.trim()}
          className="mt-2 w-full bg-[var(--color-shop-violet)] text-white font-shop-display text-[16px] py-4 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg-2 disabled:opacity-50 disabled:shadow-none"
        >
          Save Details
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { Camera, ArrowRight, User, Phone, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

export function OnboardingModal() {
  const { userName, setUserData } = useUserStore();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    // Never show on admin pages
    if (pathname?.startsWith("/admin")) return;
    if (!userName) {
      setTimeout(() => setVisible(true), 400);
    }
  }, [userName, pathname]);

  if (!visible) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPhoto(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleStep1 = () => {
    if (!name.trim()) return;
    setStep(2);
  };

  const handleFinish = () => {
    setEntering(true);
    setUserData(name.trim(), phone.trim(), photo);
    setTimeout(() => setVisible(false), 500);
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-end justify-center transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Sheet */}
      <div
        className={`relative w-full max-w-md rounded-t-[36px] overflow-hidden transition-transform duration-500 ease-out ${visible ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ background: 'linear-gradient(160deg, #2e0016 0%, #1a0008 100%)', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none' }}
      >
        {/* Glow accents */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.3), transparent 70%)' }} />
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-2xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.2), transparent 70%)' }} />

        <div className="relative z-10 px-6 pt-8 pb-10">
          {/* Handle pill */}
          <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-8" />

          {/* Step 1 — Name & Phone */}
          {step === 1 && (
            <div className="animate-slide-up">
              {/* Icon */}
              <div className="w-16 h-16 rounded-[22px] gradient-brand flex items-center justify-center mb-6 shadow-lg" style={{boxShadow:'0 0 40px rgba(124,58,237,0.5)'}}>
                <Sparkles size={28} className="text-white" />
              </div>

              <h2 className="text-[26px] font-black text-white leading-tight mb-1">
                Let's get you<br />personalised.
              </h2>
              <p className="text-white/50 text-[14px] mb-8 leading-relaxed">
                Your details will be auto-filled into every template you pick.
              </p>

              {/* Name Input */}
              <div className="mb-4">
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2 block">Your Name</label>
                <div className="flex items-center gap-3 bg-white/08 border border-white/10 rounded-[16px] px-4 py-3.5 focus-within:border-[var(--color-brand-violet-light)] transition-colors" style={{background:'rgba(255,255,255,0.06)'}}>
                  <User size={16} className="text-white/30 flex-shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Rahul Kumar"
                    className="flex-1 bg-transparent text-white text-[15px] placeholder:text-white/25 focus:outline-none"
                    onKeyDown={e => e.key === 'Enter' && handleStep1()}
                    autoFocus
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div className="mb-8">
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2 block">Mobile Number <span className="normal-case font-normal text-white/25">(optional)</span></label>
                <div className="flex items-center gap-3 bg-white/08 border border-white/10 rounded-[16px] px-4 py-3.5 focus-within:border-[var(--color-brand-violet-light)] transition-colors" style={{background:'rgba(255,255,255,0.06)'}}>
                  <Phone size={16} className="text-white/30 flex-shrink-0" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="flex-1 bg-transparent text-white text-[15px] placeholder:text-white/25 focus:outline-none"
                    onKeyDown={e => e.key === 'Enter' && handleStep1()}
                  />
                </div>
              </div>

              <button
                onClick={handleStep1}
                disabled={!name.trim()}
                className="w-full py-4 rounded-[18px] gradient-brand text-white font-bold text-[16px] flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
                style={{boxShadow:'0 0 40px rgba(124,58,237,0.4)'}}
              >
                Continue <ArrowRight size={18} />
              </button>

              {/* Step dots */}
              <div className="flex justify-center gap-2 mt-6">
                <div className="w-6 h-1.5 rounded-full gradient-brand" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </div>
            </div>
          )}

          {/* Step 2 — Photo */}
          {step === 2 && (
            <div className="animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep(1)} className="w-9 h-9 rounded-[12px] flex items-center justify-center" style={{background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)'}}>
                  <ArrowRight size={16} className="text-white rotate-180" />
                </button>
                <h2 className="text-[22px] font-black text-white">Add your photo</h2>
              </div>

              <p className="text-white/50 text-[14px] mb-8">
                Your photo will appear inside the template design.
              </p>

              {/* Photo picker */}
              <label className="relative flex flex-col items-center justify-center w-full h-52 rounded-[24px] cursor-pointer overflow-hidden group transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: photo ? 'none' : '2px dashed rgba(255,255,255,0.15)' }}>
                {photo ? (
                  <>
                    <img src={photo} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur text-white text-[13px] font-semibold">
                        <Camera size={14} /> Change photo
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-white/40 group-hover:text-white/60 transition-colors">
                    <div className="w-16 h-16 rounded-[20px] flex items-center justify-center" style={{background:'rgba(255,255,255,0.08)'}}>
                      <Camera size={28} />
                    </div>
                    <div className="text-center">
                      <p className="text-[15px] font-semibold text-white/60">Tap to upload photo</p>
                      <p className="text-[12px] text-white/30 mt-1">JPG, PNG or HEIC</p>
                    </div>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>

              {/* Skip / Done */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleFinish}
                  className="flex-1 py-3.5 rounded-[16px] text-white/50 text-[14px] font-medium border border-white/10 hover:border-white/20 hover:text-white/70 transition-all"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleFinish}
                  className={`flex-2 flex-1 py-3.5 rounded-[16px] font-bold text-[15px] flex items-center justify-center gap-2 transition-all ${entering ? 'opacity-50' : ''}`}
                  style={{ background: photo ? 'linear-gradient(135deg, #7c3aed, #ec4899)' : 'rgba(255,255,255,0.08)', color: photo ? 'white' : 'rgba(255,255,255,0.4)', boxShadow: photo ? '0 0 30px rgba(124,58,237,0.4)' : 'none' }}
                >
                  Let's go! <Sparkles size={15} />
                </button>
              </div>

              {/* Step dots */}
              <div className="flex justify-center gap-2 mt-6">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <div className="w-6 h-1.5 rounded-full gradient-brand" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

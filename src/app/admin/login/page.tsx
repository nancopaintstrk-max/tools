"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, ArrowRight, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] flex items-center justify-center px-5"
      style={{ backgroundImage: 'radial-gradient(ellipse at top, #3d0020 0%, #1a0008 60%)' }}>

      {/* Glow accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.4), transparent 70%)' }} />

      <div className="relative w-full max-w-sm">
        {/* Shield icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-[28px] gradient-brand flex items-center justify-center shadow-2xl"
            style={{ boxShadow: '0 0 60px rgba(124,58,237,0.5)' }}>
            <Shield size={36} className="text-white" />
          </div>
        </div>

        <h1 className="text-[28px] font-black text-white text-center mb-1">Admin Portal</h1>
        <p className="text-[var(--color-text-muted)] text-[14px] text-center mb-8">
          Restricted access — sign in to continue.
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* Username */}
          <div>
            <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2 block">Username</label>
            <div className="flex items-center gap-3 rounded-[16px] px-4 py-4 transition-colors focus-within:border-[var(--color-brand-violet-light)]"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <User size={16} className="text-white/30 flex-shrink-0" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                className="flex-1 bg-transparent text-white text-[15px] placeholder:text-white/25 focus:outline-none"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-2 block">Password</label>
            <div className="flex items-center gap-3 rounded-[16px] px-4 py-4 transition-colors focus-within:border-[var(--color-brand-violet-light)]"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <Lock size={16} className="text-white/30 flex-shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="flex-1 bg-transparent text-white text-[15px] placeholder:text-white/25 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-[12px] px-4 py-3 text-red-400 text-[13px] font-medium"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !username || !password}
            className="mt-2 w-full py-4 rounded-[18px] gradient-brand text-white font-bold text-[16px] flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
            style={{ boxShadow: '0 0 40px rgba(124,58,237,0.4)' }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <> Sign In <ArrowRight size={18} /> </>
            )}
          </button>
        </form>

        <p className="text-center text-[12px] text-[var(--color-text-muted)] mt-8">
          <a href="/" className="hover:text-white transition-colors">← Back to user portal</a>
        </p>
      </div>
    </div>
  );
}

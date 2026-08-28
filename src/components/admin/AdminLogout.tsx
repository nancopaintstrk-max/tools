"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function AdminLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <button
      onClick={handleLogout}
      title="Sign out"
      className="flex items-center gap-2 px-3 py-2.5 rounded-[14px] text-white/60 hover:text-white transition-colors text-[13px] font-medium"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
    >
      <LogOut size={15} />
      <span>Logout</span>
    </button>
  );
}

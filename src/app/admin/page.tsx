import Link from "next/link";
import { Plus, LayoutTemplate, Edit2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AdminLogout } from "@/components/admin/AdminLogout";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboard() {
  const { data: templates } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] pb-10">

      {/* Top Bar */}
      <div className="px-5 pt-14 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[var(--color-text-muted)] text-[12px] font-semibold uppercase tracking-widest mb-1">Admin Portal</p>
            <h1 className="text-[26px] font-black text-[var(--color-text-primary)] leading-none">
              Your Templates
            </h1>
          </div>
          <AdminLogout />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-5 mb-6">
        <div className="glass-card rounded-[20px] px-5 py-4 flex items-center justify-between">
          <div className="text-center">
            <p className="text-[22px] font-black text-[var(--color-text-primary)]">{templates?.length || 0}</p>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Templates</p>
          </div>
          <div className="w-px h-8 bg-[var(--color-border-subtle)]" />
          <div className="text-center">
            <p className="text-[22px] font-black gradient-brand-text">Live</p>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Status</p>
          </div>
          <div className="w-px h-8 bg-[var(--color-border-subtle)]" />
          <Link href="/" className="text-center group">
            <p className="text-[22px] font-black text-[var(--color-text-primary)]">View</p>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">User side</p>
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-bold text-[var(--color-text-primary)]">All Designs</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Create New */}
          <Link href="/admin/editor" className="group">
            <div className="aspect-[3/4] rounded-[20px] border border-dashed border-[var(--color-border-muted)] flex flex-col items-center justify-center gap-3 hover:border-[var(--color-brand-violet)] hover:bg-[var(--color-bg-card-hover)] transition-all active:scale-[0.97]">
              <div className="w-12 h-12 rounded-[16px] gradient-brand flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Plus size={24} className="text-white" />
              </div>
              <span className="text-[13px] font-semibold text-[var(--color-text-secondary)] group-hover:text-white transition-colors">New Template</span>
            </div>
          </Link>

          {/* Actual Templates */}
          {templates && templates.map((template) => (
            <div key={template.id} className="group flex flex-col overflow-hidden rounded-[20px] glass-card glass-card-hover transition-all active:scale-[0.97]">
              <div
                className="aspect-[3/4] w-full relative overflow-hidden"
                style={{
                  backgroundColor: template.artboard_color || '#18181b',
                  backgroundImage: template.background_url ? `url(${template.background_url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
                {!template.background_url && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <LayoutTemplate size={36} className="text-white/10" />
                  </div>
                )}
                <div className="absolute bottom-3 left-3 right-3">
                  <Link
                    href={`/admin/editor?id=${template.id}`}
                    className="flex items-center justify-center gap-1.5 w-full bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-colors rounded-full py-2 text-white text-[11px] font-semibold"
                  >
                    <Edit2 size={11} /> Edit
                  </Link>
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-[12px] font-semibold text-[var(--color-text-primary)] truncate">{template.name}</h3>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{template.category || 'General'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

  );
}

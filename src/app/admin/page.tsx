import Link from "next/link";
import { Plus, LayoutTemplate, Edit2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AdminLogout } from "@/components/admin/AdminLogout";
import { DeleteTemplateButton } from "@/components/admin/DeleteTemplateButton";

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

        <div className="columns-2 lg:columns-4 gap-3 sm:gap-4">
          {/* Create New */}
          <Link href="/admin/editor" className="group block break-inside-avoid mb-4">
            <div className="aspect-[3/4] w-full rounded-[20px] border border-dashed border-[var(--color-border-muted)] flex flex-col items-center justify-center gap-3 hover:border-[var(--color-brand-violet)] hover:bg-[var(--color-bg-card-hover)] transition-all active:scale-[0.97]">
              <div className="w-12 h-12 rounded-[16px] gradient-brand flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Plus size={24} className="text-white" />
              </div>
              <span className="text-[13px] font-semibold text-[var(--color-text-secondary)] group-hover:text-white transition-colors">New Template</span>
            </div>
          </Link>

          {/* Actual Templates */}
          {templates && templates.map((template) => (
            <div key={template.id} className="group flex flex-col overflow-hidden rounded-[20px] glass-card glass-card-hover transition-all active:scale-[0.97] break-inside-avoid mb-4">
              <div
                className="w-full relative overflow-hidden"
                style={{
                  aspectRatio: `${template.width || 800} / ${template.height || 1066}`,
                  backgroundColor: template.artboard_color || '#18181b',
                  containerType: 'inline-size'
                }}
              >
                {/* Render Template Elements as CSS for thumbnail preview */}
                {(() => {
                  const elementsToRender = template.elements && Array.isArray(template.elements) ? [...template.elements] : [];
                  if (template.background_url && !elementsToRender.some(el => el.type === 'bg' || el.id === 'template-bg')) {
                    elementsToRender.unshift({ id: 'template-bg', type: 'bg' });
                  }
                  
                  return elementsToRender.map((el: any, idx: number) => {
                    const leftPct = (el.x / (template.width || 800)) * 100;
                    const topPct = (el.y / (template.height || 800)) * 100;
                    const widthPct = (el.width / (template.width || 800)) * 100;
                    const heightPct = el.height ? (el.height / (template.height || 800)) * 100 : 'auto';
                    
                    if (el.type === 'bg' || el.id === 'template-bg') {
                      if (template.background_url && !template.background_url.startsWith('blob:')) {
                        return (
                          <img
                            key={el.id || idx}
                            src={template.background_url}
                            alt="background"
                            className="absolute pointer-events-none object-cover"
                            style={{
                              left: 0,
                              top: 0,
                              width: '100%',
                              height: '100%',
                            }}
                          />
                        );
                      }
                      return null;
                    }

                    if (el.type === 'text') {
                    return (
                      <div
                        key={el.id || idx}
                        className="absolute leading-none pointer-events-none"
                        style={{
                          left: `${leftPct}%`,
                          top: `${topPct}%`,
                          color: el.fill || '#000',
                          fontSize: `${(el.fontSize / (template.width || 800)) * 100}cqw`, 
                          fontWeight: el.fontWeight || 'normal',
                          transform: `rotate(${el.rotation || 0}deg)`,
                          transformOrigin: 'top left',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {el.placeholderText || 'Text'}
                      </div>
                    );
                  }
                  
                  if (el.type === 'image') {
                    if (el.imageSrc && !el.imageSrc.startsWith('blob:')) {
                      return (
                        <img
                          key={el.id || idx}
                          src={el.imageSrc}
                          alt="element"
                          className="absolute object-cover pointer-events-none"
                          style={{
                            left: `${leftPct}%`,
                            top: `${topPct}%`,
                            width: `${widthPct}%`,
                            height: `${heightPct}%`,
                            transform: `rotate(${el.rotation || 0}deg) ${el.flipX ? 'scaleX(-1)' : ''}`,
                            transformOrigin: 'top left',
                            borderRadius: el.cornerRadius ? `${(el.cornerRadius / (template.width || 800)) * 100}%` : 0,
                          }}
                        />
                      );
                    } else {
                      return (
                        <div
                          key={el.id || idx}
                          className="absolute pointer-events-none bg-gray-100/50 border-2 border-dashed border-gray-300 backdrop-blur-sm flex items-center justify-center"
                          style={{
                            left: `${leftPct}%`,
                            top: `${topPct}%`,
                            width: `${widthPct}%`,
                            height: `${heightPct}%`,
                            transform: `rotate(${el.rotation || 0}deg)`,
                            transformOrigin: 'top left',
                            borderRadius: el.cornerRadius ? `${(el.cornerRadius / (template.width || 800)) * 100}%` : 0,
                          }}
                        >
                          <ImageIcon size={24} className="text-gray-400 opacity-50" />
                        </div>
                      );
                    }
                  }
                  return null;
                })})()}

                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                {!template.background_url && (!template.elements || template.elements.length === 0) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <LayoutTemplate size={36} className="text-white/10" />
                  </div>
                )}
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                  <Link
                    href={`/admin/editor?id=${template.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-colors rounded-full py-2 text-white text-[11px] font-semibold"
                  >
                    <Edit2 size={11} /> Edit
                  </Link>
                  <DeleteTemplateButton template={template} />
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

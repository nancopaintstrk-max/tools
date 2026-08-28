import { supabase } from "@/lib/supabase";
import { GenerateCanvas } from "@/components/user/GenerateCanvas";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function GeneratePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { data: template } = await supabase
    .from('templates')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-linen-canvas)]">
        <h1 className="font-bento-display text-2xl">Template not found.</h1>
      </div>
    );
  }

  return <GenerateCanvas template={template} />;
}

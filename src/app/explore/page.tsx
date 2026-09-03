import { supabase } from "@/lib/supabase";
import { ExploreClient } from "./ExploreClient";

// export const dynamic = 'force-dynamic'; // Removed to allow ISR caching
export const revalidate = 30;

export default async function ExplorePage() {
  const { data: templates } = await supabase
    .from('templates')
    .select('id, name, category, background_url, artboard_color, tags')
    .order('created_at', { ascending: false });

  return <ExploreClient initialTemplates={templates || []} />;
}

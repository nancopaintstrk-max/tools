import { supabase } from "@/lib/supabase";
import { ExploreClient } from "./ExploreClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ExplorePage() {
  const { data: templates } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false });

  return <ExploreClient initialTemplates={templates || []} />;
}

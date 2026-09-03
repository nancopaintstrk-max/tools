import { Suspense } from "react";
import TemplateEditor from "@/components/admin/TemplateEditor";

export default function ClientEditorPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50">
      <Suspense fallback={<div className="flex items-center justify-center h-full">Loading Editor...</div>}>
        <TemplateEditor isClientMode={true} />
      </Suspense>
    </div>
  );
}

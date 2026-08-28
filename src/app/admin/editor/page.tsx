"use client";
import dynamic from "next/dynamic";

const TemplateEditor = dynamic(() => import("../../../components/admin/TemplateEditor"), {
  ssr: false,
});

export default function EditorPage() {
  return (
    <div className="h-screen w-full overflow-hidden flex flex-col">
      <TemplateEditor />
    </div>
  );
}

'use client';
import { Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteTemplateButton({ template }: { template: any }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this template and all its associated images?")) return;
    
    setIsDeleting(true);

    // Extract image URLs to delete from storage
    const filesToDelete: string[] = [];
    if (template.background_url) {
       const parts = template.background_url.split('/templates/');
       if (parts.length > 1) filesToDelete.push(parts[1].split('?')[0]); // Split ? in case of query strings
    }
    
    if (template.elements) {
      template.elements.forEach((el: any) => {
        if (el.type === 'image' && el.imageSrc) {
           const parts = el.imageSrc.split('/templates/');
           if (parts.length > 1) filesToDelete.push(parts[1].split('?')[0]);
        }
      });
    }

    try {
      // 1. Delete files from storage
      if (filesToDelete.length > 0) {
        await supabase.storage.from('templates').remove(filesToDelete);
      }
      
      // 2. Delete template from database
      const { error } = await supabase.from('templates').delete().eq('id', template.id);
      if (error) throw error;
      
      router.refresh(); // Refresh the page to reflect changes
    } catch (err: any) {
      alert("Failed to delete template: " + (err.message || "Unknown error"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleDelete();
      }}
      disabled={isDeleting}
      className="flex items-center justify-center p-2 bg-red-500/80 hover:bg-red-500 disabled:opacity-50 transition-colors rounded-full text-white shrink-0"
      title="Delete Template"
    >
      {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
    </button>
  );
}

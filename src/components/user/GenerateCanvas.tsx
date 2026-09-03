"use client";

import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Text, Rect, Group } from "react-konva";
import useImage from "use-image";
import { useUserStore } from "@/store/userStore";
import { Download, ChevronLeft, Share2, Check } from "lucide-react";
import Link from "next/link";
import Konva from "konva";
import { useRouter } from "next/navigation";

export function GenerateCanvas({ template }: { template: any }) {
  const { userName, userPhone, userPhoto } = useUserStore();
  const stageRef = useRef<Konva.Stage>(null);
  const router = useRouter();

  const [elements, setElements] = useState<any[]>([]);
  const [bgImage] = useImage(template.background_url || "");
  const [downloaded, setDownloaded] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-fill logic on mount
  useEffect(() => {
    if (!userName && !userPhoto) {
      router.push("/");
      return;
    }
    const modifiedElements = template.elements.map((el: any) => {
      if (el.type === 'text' && el.name === 'userName') return { ...el, text: userName || el.placeholderText || "User Name" };
      if (el.type === 'text' && el.name === 'userPhone') return { ...el, text: userPhone || el.placeholderText || "Phone" };
      if (el.type === 'image' && el.name === 'userImage' && userPhoto) return { ...el, imageSrc: userPhoto };
      return el;
    });
    setElements(modifiedElements);
  }, [template, userName, userPhone, userPhoto, router]);

  const handleDownload = () => {
    if (!stageRef.current) return;
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 3 });
    const link = document.createElement('a');
    link.download = `${template.name.replace(/\s+/g, '_')}_Generated.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const URLImage = ({ element }: { element: any }) => {
    const [img] = useImage(element.imageSrc || "");
    const imageWidth = element.width || 150;
    const imageHeight = element.height || 150;

    let cropObj = undefined;
    if (img) {
      const aspectRatio = imageWidth / imageHeight;
      const imgRatio = img.width / img.height;
      let newWidth, newHeight;
      if (aspectRatio >= imgRatio) {
        newWidth = img.width;
        newHeight = img.width / aspectRatio;
      } else {
        newWidth = img.height * aspectRatio;
        newHeight = img.height;
      }
      cropObj = {
        x: (img.width - newWidth) / 2,
        y: (img.height - newHeight) / 2,
        width: newWidth,
        height: newHeight
      };
    }

    return (
      <Group x={element.x} y={element.y} width={imageWidth} height={imageHeight} clip={{ x: 0, y: 0, width: imageWidth, height: imageHeight }}>
        {img ? <KonvaImage image={img} width={imageWidth} height={imageHeight} crop={cropObj} draggable={element.name === 'userImage'} />
             : <Rect width={imageWidth} height={imageHeight} fill="#27272a" />}
      </Group>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] flex flex-col">

      {/* Top Bar */}
      <div className="px-5 pt-14 pb-4 flex items-center justify-between flex-shrink-0">
        <Link
          href={`/categories/${encodeURIComponent(template.category || 'General')}`}
          className="w-10 h-10 rounded-[14px] glass-card flex items-center justify-center text-[var(--color-text-primary)] hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>

        <div className="text-center">
          <h1 className="text-[15px] font-bold text-[var(--color-text-primary)] truncate max-w-[180px]">{template.name}</h1>
          <p className="text-[11px] text-[var(--color-text-muted)]">{template.category || 'General'}</p>
        </div>

        <button className="w-10 h-10 rounded-[14px] glass-card flex items-center justify-center text-[var(--color-text-secondary)] hover:text-white transition-colors">
          <Share2 size={17} />
        </button>
      </div>

      {/* Canvas Preview */}
      <div className="flex-1 flex items-center justify-center px-5 py-4">
        <div className="relative">
          {/* Glow backdrop */}
          <div className="absolute inset-0 rounded-[28px] blur-2xl opacity-30 scale-95 pointer-events-none"
            style={{ background: `${template.artboard_color || '#7c3aed'}` }} />
          
          {/* Canvas */}
          <div
            className="relative rounded-[24px] overflow-hidden shadow-2xl border border-white/10"
            style={{
              width: windowSize.width > 0 ? Math.min(windowSize.width - 40, template.width * Math.min(1, (windowSize.width - 40) / template.width, (windowSize.height - 260) / template.height)) : 340,
              height: windowSize.height > 0 ? Math.min(windowSize.height - 260, template.height * Math.min(1, (windowSize.width - 40) / template.width, (windowSize.height - 260) / template.height)) : 480,
            }}
          >
            <Stage
              width={windowSize.width > 0 ? Math.min(windowSize.width - 40, template.width * Math.min(1, (windowSize.width - 40) / template.width, (windowSize.height - 260) / template.height)) : 340}
              height={windowSize.height > 0 ? Math.min(windowSize.height - 260, template.height * Math.min(1, (windowSize.width - 40) / template.width, (windowSize.height - 260) / template.height)) : 480}
              ref={stageRef}
              scaleX={windowSize.width > 0 ? Math.min(1, (windowSize.width - 40) / template.width, (windowSize.height - 260) / template.height) : Math.min(1, 340 / template.width)}
              scaleY={windowSize.height > 0 ? Math.min(1, (windowSize.width - 40) / template.width, (windowSize.height - 260) / template.height) : Math.min(1, 480 / template.height)}
            >
              <Layer>
                <Rect x={0} y={0} width={template.width} height={template.height} fill={template.artboard_color || '#ffffff'} />
                {elements.map((el) => {
                  if (el.type === 'canvas') return null;
                  if (el.type === 'bg') return bgImage ? <KonvaImage key={el.id} image={bgImage} width={template.width} height={template.height} /> : null;
                  if (el.type === 'text') return (
                    <Text key={el.id} text={el.text || el.placeholderText || 'Text'} x={el.x} y={el.y}
                      fontSize={el.fontSize || 32} fontFamily={el.fontFamily || 'Arial'}
                      fill={el.fill || '#000000'} fontStyle={el.fontWeight || 'normal'}
                      align={el.align || 'left'} width={el.width} />
                  );
                  if (el.type === 'image') return <URLImage key={el.id} element={el} />;
                  return null;
                })}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>

      {/* Bottom Action Panel */}
      <div className="px-5 pb-10 flex-shrink-0">
        {/* User info strip */}
        {userName && (
          <div className="glass-card rounded-[16px] px-4 py-3 flex items-center gap-3 mb-4">
            {userPhoto ? (
              <img src={userPhoto} alt={userName} className="w-9 h-9 rounded-[10px] object-cover border border-white/10" />
            ) : (
              <div className="w-9 h-9 rounded-[10px] gradient-brand flex items-center justify-center text-white font-bold text-sm">
                {userName[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">{userName}</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">Auto-filled in design</p>
            </div>
            <Link href="/" className="text-[var(--color-brand-violet-light)] text-[12px] font-medium hover:text-white transition-colors">
              Change
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* Download button */}
          <button
            onClick={handleDownload}
            className={`w-full py-4 rounded-[20px] flex items-center justify-center gap-3 font-bold text-[16px] transition-all duration-300 ${
              downloaded
                ? 'bg-green-500 text-white'
                : 'gradient-brand text-white'
            }`}
            style={{ boxShadow: downloaded ? '0 0 40px rgba(34, 197, 94, 0.4)' : 'var(--shadow-glow-violet)' }}
          >
            {downloaded ? (
              <><Check size={20} /> Saved to device!</>
            ) : (
              <><Download size={20} /> Download Design</>
            )}
          </button>

          {/* Advanced Edit Button */}
          <Link
            href={`/editor/${template.id}?id=${template.id}`}
            className="w-full py-4 rounded-[20px] bg-white text-[var(--color-brand-violet)] border border-[var(--color-brand-violet-light)] flex items-center justify-center gap-3 font-bold text-[16px] hover:bg-violet-50 transition-colors shadow-sm"
          >
            Edit Manually
          </Link>
        </div>
      </div>
    </div>
  );
}

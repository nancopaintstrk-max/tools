"use client";

import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Text, Rect, Transformer, Group, Line } from "react-konva";
import Konva from "konva";
import useImage from "use-image";
import { Upload, Image as ImageIcon, Type, Download, Trash2, ArrowUpToLine, ArrowDownToLine, Wand2, Loader2, PaintBucket, Settings2, RefreshCw, Undo2, Redo2, Lock, Unlock, GripVertical, Layers, Square, Crop, MoreHorizontal, Eraser, ChevronLeft } from "lucide-react";
import { removeBackground, Config } from "@imgly/background-removal";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export type ElementType = "text" | "image" | "bg" | "canvas";

export type DrawLine = {
  tool: 'brush' | 'eraser';
  color: string;
  size: number;
  points: number[];
};

export interface TemplateElement {
  id: string;
  type: ElementType;
  name: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fill?: string;
  placeholderText?: string;
  imageSrc?: string; // For user uploaded images in placeholders
  isLocked?: boolean;
  filters?: {
    brightness?: number;
    contrast?: number;
    blurRadius?: number;
    noise?: number;
    grayscale?: boolean;
    sepia?: boolean;
    invert?: boolean;
  };
  drawLines?: DrawLine[];
  cornerRadius?: number | [number, number, number, number];
  crop?: { x: number; y: number; width: number; height: number };
  flipX?: boolean;
  flipY?: boolean;
}

// --- Magic Fill Utilities ---
const hexToRgba = (hex: string, alpha: number = 255) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b, a: alpha };
};

const colorMatch = (c1: any, c2: any, tolerance: number) => {
  return Math.abs(c1.r - c2.r) <= tolerance &&
    Math.abs(c1.g - c2.g) <= tolerance &&
    Math.abs(c1.b - c2.b) <= tolerance &&
    Math.abs(c1.a - c2.a) <= tolerance;
};

const floodFill = (imageData: ImageData, x: number, y: number, fillColor: any, tolerance: number) => {
  const { data, width, height } = imageData;
  const targetColorOffset = (y * width + x) * 4;
  const targetColor = {
    r: data[targetColorOffset],
    g: data[targetColorOffset + 1],
    b: data[targetColorOffset + 2],
    a: data[targetColorOffset + 3]
  };

  if (colorMatch(targetColor, fillColor, 0)) return imageData; // Already the same color

  const pixelsToCheck = [x, y];
  const checked = new Uint8Array(width * height);

  while (pixelsToCheck.length > 0) {
    const cy = pixelsToCheck.pop()!;
    const cx = pixelsToCheck.pop()!;
    const offset = (cy * width + cx) * 4;

    if (checked[cy * width + cx]) continue;
    checked[cy * width + cx] = 1;

    const currentColor = {
      r: data[offset],
      g: data[offset + 1],
      b: data[offset + 2],
      a: data[offset + 3]
    };

    if (colorMatch(currentColor, targetColor, tolerance)) {
      data[offset] = fillColor.r;
      data[offset + 1] = fillColor.g;
      data[offset + 2] = fillColor.b;
      data[offset + 3] = fillColor.a;

      if (cx > 0) pixelsToCheck.push(cx - 1, cy);
      if (cx < width - 1) pixelsToCheck.push(cx + 1, cy);
      if (cy > 0) pixelsToCheck.push(cx, cy - 1);
      if (cy < height - 1) pixelsToCheck.push(cx, cy + 1);
    }
  }
  return imageData;
};
// ----------------------------

const getKonvaFilters = (elFilters?: TemplateElement['filters']) => {
  if (!elFilters) return [];
  const filters = [];
  if (elFilters.brightness !== undefined) filters.push(Konva.Filters.Brighten);
  if (elFilters.contrast !== undefined) filters.push(Konva.Filters.Contrast);
  if (elFilters.blurRadius !== undefined && elFilters.blurRadius > 0) filters.push(Konva.Filters.Blur);
  if (elFilters.noise !== undefined && elFilters.noise > 0) filters.push(Konva.Filters.Noise);
  if (elFilters.grayscale) filters.push(Konva.Filters.Grayscale);
  if (elFilters.sepia) filters.push(Konva.Filters.Sepia);
  if (elFilters.invert) filters.push(Konva.Filters.Invert);
  return filters;
};

const BgImageElement = ({ el, bgImage, STAGE_WIDTH, STAGE_HEIGHT, onSelect, isMagicFillMode, magicFillTransparent, magicFillColor, magicFillTolerance, setBgImageUrl }: any) => {
  const imageRef = useRef<any>(null);

  useEffect(() => {
    if (bgImage && imageRef.current) {
      imageRef.current.cache();
    }
  }, [bgImage, el.filters, STAGE_WIDTH, STAGE_HEIGHT]);

  const konvaFilters = getKonvaFilters(el.filters);

  return (
    <Group x={0} y={0} name="template-bg-group">
      <KonvaImage
        ref={imageRef}
        key={el.id}
        image={bgImage}
        x={0}
        y={0}
        width={STAGE_WIDTH}
        height={STAGE_HEIGHT}
        name="template-bg"
        filters={konvaFilters}
        brightness={el.filters?.brightness || 0}
        contrast={el.filters?.contrast || 0}
        blurRadius={el.filters?.blurRadius || 0}
        noise={el.filters?.noise || 0}
        onClick={(e) => {
          onSelect();
          if (isMagicFillMode && bgImage) {
            const pos = e.target.getRelativePointerPosition();
            if (!pos) return;

            const canvas = document.createElement('canvas');
            canvas.width = bgImage.width;
            canvas.height = bgImage.height;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            ctx.drawImage(bgImage, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            const startX = Math.floor(pos.x * (bgImage.width / STAGE_WIDTH));
            const startY = Math.floor(pos.y * (bgImage.height / STAGE_HEIGHT));

            const fillRgba = magicFillTransparent
              ? { r: 0, g: 0, b: 0, a: 0 }
              : hexToRgba(magicFillColor, 255);

            floodFill(imageData, startX, startY, fillRgba, magicFillTolerance);
            ctx.putImageData(imageData, 0, 0);
            setBgImageUrl(canvas.toDataURL());
          }
        }}
        onTap={() => onSelect()}
      />
      {el.drawLines?.map((line: DrawLine, i: number) => (
        <Line
          key={i}
          points={line.points}
          stroke={line.tool === 'eraser' ? 'black' : line.color}
          strokeWidth={line.size}
          tension={0.5}
          lineCap="round"
          lineJoin="round"
          globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
          listening={false}
        />
      ))}
    </Group>
  );
};

const URLImageElement = ({ el, selectedId, onSelect, onChange }: { el: TemplateElement, selectedId: string | null, onSelect: () => void, onChange: (newAttrs: any) => void }) => {
  const [image] = useImage(el.imageSrc || "");
  const imageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (selectedId === el.id && imageRef.current) {
      trRef.current?.nodes([imageRef.current]);
      trRef.current?.getLayer()?.batchDraw();
    }
  }, [selectedId, el.id]);

  useEffect(() => {
    if (image && imageRef.current) {
      imageRef.current.cache();
    }
  }, [image, el.filters, el.width, el.height, el.cornerRadius]);

  const konvaFilters = getKonvaFilters(el.filters);

  let autoCrop = undefined;
  if (image && !el.crop) {
    const aspectRatio = (el.width || 100) / (el.height || 100);
    const imgRatio = image.width / image.height;
    let newWidth, newHeight;
    if (aspectRatio >= imgRatio) {
      newWidth = image.width;
      newHeight = image.width / aspectRatio;
    } else {
      newWidth = image.height * aspectRatio;
      newHeight = image.height;
    }
    autoCrop = {
      x: (image.width - newWidth) / 2,
      y: (image.height - newHeight) / 2,
      width: newWidth,
      height: newHeight
    };
  }

  return (
    <React.Fragment>
      {el.imageSrc ? (
        <Group x={el.x} y={el.y} draggable={!el.isLocked} listening={!el.isLocked}
          onDragEnd={(e) => {
            onChange({ x: e.target.x(), y: e.target.y() });
          }}
          onTransformEnd={(e) => {
            const node = trRef.current?.node();
            if (!node) return;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);
            onChange({
              x: node.x(),
              y: node.y(),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY),
            });
          }}>
          <KonvaImage
            ref={imageRef}
            image={image}
            x={el.flipX ? el.width : 0}
            y={el.flipY ? el.height : 0}
            scaleX={el.flipX ? -1 : 1}
            scaleY={el.flipY ? -1 : 1}
            width={el.width}
            height={el.height}
            onClick={onSelect}
            onTap={onSelect}
            filters={konvaFilters}
            brightness={el.filters?.brightness || 0}
            contrast={el.filters?.contrast || 0}
            blurRadius={el.filters?.blurRadius || 0}
            noise={el.filters?.noise || 0}
            cornerRadius={el.cornerRadius || 0}
            crop={el.crop || autoCrop}
          />
          {el.drawLines?.map((line: DrawLine, i: number) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.tool === 'eraser' ? 'black' : line.color}
              strokeWidth={line.size}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
              listening={false}
            />
          ))}
        </Group>
      ) : (
        <Rect
          ref={imageRef}
          x={el.x}
          y={el.y}
          width={el.width}
          height={el.height}
          fill="rgba(0, 0, 0, 0.2)"
          stroke={selectedId === el.id ? "#2665d6" : "#000000"}
          strokeWidth={selectedId === el.id ? 4 : 2}
          draggable={!el.isLocked}
          listening={!el.isLocked}
          onClick={onSelect}
          onTap={onSelect}
          onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
          onTransformEnd={(e) => {
            const node = imageRef.current;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);
            onChange({
              x: node.x(),
              y: node.y(),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY),
            });
          }}
        />
      )}
      {selectedId === el.id && (
        <Transformer
          ref={trRef}
          keepRatio={true}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 10 || newBox.height < 10) return oldBox;
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

export default function TemplateEditor() {
  const router = useRouter();

  const [activeEditingElement, setActiveEditingElement] = useState<string | null>(null);

  const [templateName, setTemplateName] = useState("Untitled Template");
  const [templateCategory, setTemplateCategory] = useState("General");
  const [isSaving, setIsSaving] = useState(false);

  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [originalBgImageUrl, setOriginalBgImageUrl] = useState<string | null>(null);
  const [bgImage] = useImage(bgImageUrl || "");

  // History State
  const [history, setHistory] = useState<TemplateElement[][]>([
    [{ id: 'canvas-bg', type: 'canvas', name: 'Canvas', x: 0, y: 0, isLocked: true }]
  ]);
  const [historyStep, setHistoryStep] = useState(0);
  const elements = history[historyStep];

  const setElements = (newElements: TemplateElement[]) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => historyStep > 0 && setHistoryStep(historyStep - 1);
  const redo = () => historyStep < history.length - 1 && setHistoryStep(historyStep + 1);

  const [selectedId, setSelectedId] = useState<string | null>('canvas-bg');
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null); // For layer drag drop
  const [menuPosition, setMenuPosition] = useState<{ x: number, y: number } | null>(null); // For contextual menu

  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [artboardColor, setArtboardColor] = useState<string>("#ffffff");

  // Magic Fill State
  const [isMagicFillMode, setIsMagicFillMode] = useState(false);
  const [magicFillColor, setMagicFillColor] = useState<string>("#ff0000");
  const [magicFillTransparent, setMagicFillTransparent] = useState(true);
  const [magicFillTolerance, setMagicFillTolerance] = useState(32);

  // Brush / Eraser State
  const [isBrushMode, setIsBrushMode] = useState(false);
  const [brushTool, setBrushTool] = useState<'brush' | 'eraser'>('eraser');
  const [brushColor, setBrushColor] = useState<string>("#000000");
  const [brushSize, setBrushSize] = useState<number>(20);
  const isDrawing = useRef(false);

  // Corner Radius State
  const [isCornerRadiusMode, setIsCornerRadiusMode] = useState(false);
  const [isAdvancedRadius, setIsAdvancedRadius] = useState(false);

  // Crop State
  const [isCropMode, setIsCropMode] = useState(false);
  const [cropRect, setCropRect] = useState<{ x: number, y: number, width: number, height: number } | null>(null);

  // Left Sidebar State
  const [activeLeftTab, setActiveLeftTab] = useState<'none' | 'branding' | 'uploads'>('none');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Zoom and Pan State
  const [stageConfig, setStageConfig] = useState({ scale: 1, x: 50, y: 50 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  const containerRef = useRef<HTMLDivElement>(null);

  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null); // Only used for Text nodes now

  const STAGE_WIDTH = bgImage ? bgImage.width : 800;
  const STAGE_HEIGHT = bgImage ? bgImage.height : 800;

  const selectedElement = elements.find(el => el.id === selectedId);

  const handlePointerDown = (e: any) => {
    if (isBrushMode && selectedElement) {
      isDrawing.current = true;
      const pos = e.target.getStage().getRelativePointerPosition();
      const elX = selectedElement.x || 0;
      const elY = selectedElement.y || 0;
      const relX = pos.x - elX;
      const relY = pos.y - elY;

      const newLine: DrawLine = { tool: brushTool, color: brushColor, size: brushSize, points: [relX, relY] };
      const currentLines = selectedElement.drawLines || [];
      updateElement(selectedId!, { drawLines: [...currentLines, newLine] });
    }
  };

  const handlePointerMove = (e: any) => {
    if (!isBrushMode || !isDrawing.current || !selectedElement) return;

    const pos = e.target.getStage().getRelativePointerPosition();
    const elX = selectedElement.x || 0;
    const elY = selectedElement.y || 0;
    const relX = pos.x - elX;
    const relY = pos.y - elY;

    const currentLines = selectedElement.drawLines || [];
    if (currentLines.length === 0) return;

    const lastLine = { ...currentLines[currentLines.length - 1] };
    lastLine.points = lastLine.points.concat([relX, relY]);

    const newLines = [...currentLines];
    newLines.splice(newLines.length - 1, 1, lastLine);

    updateElement(selectedId!, { drawLines: newLines });
  };

  const handlePointerUp = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
    }
  };

  useEffect(() => {
    // Attach Transformer if a text node is selected
    const selectedEl = elements.find(el => el.id === selectedId);
    if (selectedEl?.type === 'text' && stageRef.current) {
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node && trRef.current) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    } else if (trRef.current) {
      trRef.current.nodes([]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedId, elements]);

  useEffect(() => {
    if (selectedId && stageRef.current && containerRef.current) {
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node) {
        const box = node.getClientRect({ relativeTo: stageRef.current.container() });
        setMenuPosition({
          x: box.x + box.width / 2,
          y: Math.max(0, box.y - 40)
        });
      }
    } else {
      setMenuPosition(null);
    }
  }, [selectedId, elements, stageConfig]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setIsSpacePressed(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Center stage when image changes
  useEffect(() => {
    if (containerSize.width > 0 && containerSize.height > 0) {
      // Calculate a scale that fits the artboard nicely in the view (with some padding)
      const padding = 100;
      const scaleX = (containerSize.width - padding) / STAGE_WIDTH;
      const scaleY = (containerSize.height - padding) / STAGE_HEIGHT;
      const scale = Math.min(1, Math.min(scaleX, scaleY)); // don't scale up more than 1x by default

      setStageConfig({
        scale,
        x: (containerSize.width - STAGE_WIDTH * scale) / 2,
        y: (containerSize.height - STAGE_HEIGHT * scale) / 2,
      });
    }
  }, [STAGE_WIDTH, STAGE_HEIGHT, containerSize.width, containerSize.height]);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    setStageConfig({
      scale: newScale,
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setBgImageUrl(url);
      setOriginalBgImageUrl(url);

      const hasTemplate = elements.some(el => el.id === 'template-bg');
      if (!hasTemplate) {
        const newElements = [...elements];
        const canvasIdx = newElements.findIndex(el => el.id === 'canvas-bg');
        newElements.splice(canvasIdx + 1, 0, { id: 'template-bg', type: 'bg', name: 'Template', x: 0, y: 0, isLocked: true });
        setElements(newElements);
        setSelectedId('template-bg');
      } else {
        setSelectedId('template-bg');
      }
    }
  };

  const addElement = (type: ElementType, name: string, overrides: Partial<TemplateElement> = {}) => {
    const newElement: TemplateElement = {
      id: `${name}-${Date.now()}`,
      type,
      name,
      x: 100,
      y: 100,
      ...(type === "text" ? { fontSize: 32, fill: "#000000", placeholderText: `[${name}]` } : { width: 150, height: 150 }),
      ...overrides,
    };
    setElements([...elements, newElement]);
    setSelectedId(newElement.id);
  };

  const updateElement = (id: string, attrs: Partial<TemplateElement>) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, ...attrs } : el)));
  };

  const deleteSelected = () => {
    if (selectedId && selectedId !== 'canvas-bg' && selectedId !== 'template-bg') {
      setElements(elements.filter((el) => el.id !== selectedId));
      setSelectedId(null);
    }
  };

  const bringForward = () => {
    if (!selectedId || selectedId === 'canvas-bg' || selectedId === 'template-bg') return;
    const idx = elements.findIndex(el => el.id === selectedId);
    if (idx < elements.length - 1) {
      const newElements = [...elements];
      const temp = newElements[idx];
      newElements[idx] = newElements[idx + 1];
      newElements[idx + 1] = temp;
      setElements(newElements);
    }
  };

  const sendBackward = () => {
    if (!selectedId || selectedId === 'canvas-bg' || selectedId === 'template-bg') return;
    const idx = elements.findIndex(el => el.id === selectedId);
    
    const minIndex = elements.findIndex(el => el.id === 'template-bg') > -1 
      ? elements.findIndex(el => el.id === 'template-bg') + 1
      : elements.findIndex(el => el.id === 'canvas-bg') + 1;

    if (idx > minIndex) {
      const newElements = [...elements];
      const temp = newElements[idx];
      newElements[idx] = newElements[idx - 1];
      newElements[idx - 1] = temp;
      setElements(newElements);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLayerId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!draggedLayerId) return;
    const dragIndex = elements.findIndex(el => el.id === draggedLayerId);
    if (dragIndex === dropIndex) return;

    const newElements = [...elements];
    const [draggedEl] = newElements.splice(dragIndex, 1);
    newElements.splice(dropIndex, 0, draggedEl);
    setElements(newElements);
    setDraggedLayerId(null);
  };

  const handlePlaceholderImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && selectedId) {
      const url = URL.createObjectURL(e.target.files[0]);
      updateElement(selectedId, { imageSrc: url });
    }
  };

  const removeBackgroundAI = async () => {
    const selectedEl = elements.find(el => el.id === selectedId);
    if (!selectedEl) return;

    let targetUrl = "";
    if (selectedEl.type === 'bg') {
      targetUrl = bgImageUrl || "";
    } else if (selectedEl.type === 'image') {
      targetUrl = selectedEl.imageSrc || "";
    }

    if (!targetUrl) return;

    setIsProcessingAI(true);
    try {
      // Process the image
      const imageBlob = await removeBackground(targetUrl);
      const url = URL.createObjectURL(imageBlob);

      if (selectedEl.type === 'bg') {
        setBgImageUrl(url);
      } else {
        updateElement(selectedEl.id, { imageSrc: url });
      }
    } catch (error) {
      console.error("AI Cutout Error:", error);
      alert("Failed to remove background. See console for details.");
    } finally {
      setIsProcessingAI(false);
    }
  };

  const saveTemplate = async () => {
    setIsSaving(true);
    try {
      let finalBgUrl = null;
      if (bgImageUrl && bgImageUrl.startsWith('blob:')) {
        const res = await fetch(bgImageUrl);
        const blob = await res.blob();
        const fileExt = blob.type.split('/')[1] || 'png';
        const fileName = `bg_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('templates').upload(fileName, blob);
        
        // If storage fails, we might just proceed without background or alert (ignoring storage errors if bucket doesn't exist yet for simplicity)
        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('templates').getPublicUrl(fileName);
          finalBgUrl = publicUrlData.publicUrl;
        } else {
          console.warn("Storage upload failed, background won't be saved correctly if bucket 'templates' is missing.", uploadError);
        }
      } else {
        finalBgUrl = bgImageUrl;
      }

      const metadata = {
        name: templateName,
        category: templateCategory,
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        artboard_color: artboardColor,
        background_url: finalBgUrl,
        elements: elements.filter(el => el.type !== 'bg').map(({ id, imageSrc, ...rest }) => rest)
      };

      const { error } = await supabase.from('templates').insert(metadata);
      if (error) throw error;
      
      alert("Template saved successfully!");
      router.push("/admin"); // Redirect back to admin dashboard
    } catch (err: any) {
      console.error("Save Template Error:", err);
      alert("Failed to save template: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };



  return (
    <div className="flex h-full w-full gap-4 font-bento bg-white p-2">

      {/* 1. Left Sidebar - Toolbar (Light Bento) */}
      <div className="w-[80px] bg-gray-50 rounded-[24px] py-6 px-3 flex flex-col items-center gap-6 shadow-sm z-10 shrink-0 h-full border border-gray-200">

        {/* Templates Back Button */}
        <button onClick={() => router.back()} className="w-full aspect-square bg-gray-900 hover:bg-gray-800 text-white rounded-[16px] flex flex-col items-center justify-center gap-1 transition-transform hover:scale-105 shadow-md group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Templates</span>
        </button>

        <div className="w-full h-[1px] bg-gray-200"></div>

        <div className="flex flex-col gap-2 w-full">
          <button onClick={undo} disabled={historyStep === 0} className="w-full aspect-square bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-700 rounded-[16px] flex items-center justify-center transition-colors border border-gray-200 shadow-sm" title="Undo">
            <Undo2 size={18} />
          </button>
          <button onClick={redo} disabled={historyStep === history.length - 1} className="w-full aspect-square bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-700 rounded-[16px] flex items-center justify-center transition-colors border border-gray-200 shadow-sm" title="Redo">
            <Redo2 size={18} />
          </button>
        </div>

        <div className="w-full h-[1px] bg-gray-200"></div>

        {/* Tools */}
        <div className="flex flex-col gap-3 w-full">
          <label className="w-full py-3 bg-white hover:bg-gray-800 hover:text-white text-gray-700 rounded-[16px] flex flex-col items-center justify-center gap-2 transition-all group cursor-pointer border border-gray-200 shadow-sm">
            <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
            <span className="text-[9px] font-bold uppercase tracking-wider">BG</span>
            <input type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
          </label>

          <button onClick={() => addElement("image", "userImage")} className="w-full py-3 bg-white hover:bg-gray-800 hover:text-white text-gray-700 rounded-[16px] flex flex-col items-center justify-center gap-2 transition-all group border border-gray-200 shadow-sm">
            <ImageIcon size={20} className="group-hover:-translate-y-1 transition-transform" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Image</span>
          </button>

          <button onClick={() => addElement("text", "userName")} className="w-full py-3 bg-white hover:bg-gray-800 hover:text-white text-gray-700 rounded-[16px] flex flex-col items-center justify-center gap-2 transition-all group border border-gray-200 shadow-sm">
            <Type size={20} className="group-hover:-translate-y-1 transition-transform" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Text</span>
          </button>

          <div className="w-full h-[1px] bg-gray-200 my-1"></div>

          <button onClick={() => setActiveLeftTab(activeLeftTab === 'uploads' ? 'none' : 'uploads')} className={`w-full py-3 rounded-[16px] flex flex-col items-center justify-center gap-2 transition-all group border shadow-sm ${activeLeftTab === 'uploads' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'}`}>
            <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Uploads</span>
          </button>

          <button onClick={() => setActiveLeftTab(activeLeftTab === 'branding' ? 'none' : 'branding')} className={`w-full py-3 rounded-[16px] flex flex-col items-center justify-center gap-2 transition-all group border shadow-sm ${activeLeftTab === 'branding' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'}`}>
            <Layers size={20} className="group-hover:-translate-y-1 transition-transform" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Brand</span>
          </button>

          <div className="w-full h-[1px] bg-gray-200 my-1"></div>

          <button onClick={saveTemplate} disabled={isSaving} className="w-full py-3 bg-[#2665d6] hover:bg-[#1d4ed8] text-white rounded-[16px] flex flex-col items-center justify-center gap-2 transition-all group shadow-sm disabled:opacity-50">
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} className="group-hover:-translate-y-1 transition-transform" />}
            <span className="text-[9px] font-bold uppercase tracking-wider">{isSaving ? 'Saving' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* 1.5 Secondary Left Panel (Flyout) */}
      {activeLeftTab !== 'none' && (
        <div className="w-[280px] bg-gray-50 rounded-[24px] flex flex-col shadow-sm h-full shrink-0 overflow-hidden text-gray-800 border border-gray-200 animate-in slide-in-from-left-4 duration-200">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h2 className="font-semibold text-gray-900 text-[16px]">
              {activeLeftTab === 'branding' ? 'Brand Assets' : 'Uploads'}
            </h2>
            <button onClick={() => setActiveLeftTab('none')} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
              <ChevronLeft size={18} className="rotate-180" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {activeLeftTab === 'branding' && (
              <div className="flex flex-col gap-3">
                <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Logos</span>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => addElement('image', 'logo', { imageSrc: '/logo.png' })} className="aspect-square bg-white border border-gray-200 rounded-[12px] p-2 hover:border-gray-400 hover:shadow-md transition-all flex items-center justify-center">
                    <img src="/logo.png" alt="Logo" className="max-w-full max-h-full object-contain" />
                  </button>
                  <button onClick={() => addElement('image', 'light-logo', { imageSrc: '/light-logo.png' })} className="aspect-square bg-gray-900 border border-gray-900 rounded-[12px] p-2 hover:opacity-90 hover:shadow-md transition-all flex items-center justify-center">
                    <img src="/light-logo.png" alt="Light Logo" className="max-w-full max-h-full object-contain" />
                  </button>
                  <button onClick={() => addElement('image', 'dark-logo', { imageSrc: '/dark-logo.png' })} className="aspect-square bg-white border border-gray-200 rounded-[12px] p-2 hover:border-gray-400 hover:shadow-md transition-all flex items-center justify-center">
                    <img src="/dark-logo.png" alt="Dark Logo" className="max-w-full max-h-full object-contain" />
                  </button>
                </div>
              </div>
            )}

            {activeLeftTab === 'uploads' && (
              <div className="flex flex-col gap-4">
                <label className="w-full py-8 border-2 border-dashed border-gray-300 rounded-[16px] flex flex-col items-center justify-center gap-2 hover:bg-white hover:border-gray-400 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <Upload size={18} className="text-gray-600" />
                  </div>
                  <span className="text-[13px] font-medium text-gray-600">Click to upload</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                    if (e.target.files) {
                      const newImages = Array.from(e.target.files).map(f => URL.createObjectURL(f));
                      setUploadedImages(prev => [...newImages, ...prev]);
                    }
                  }} />
                </label>
                
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {uploadedImages.map((src, i) => (
                      <button key={i} onClick={() => addElement('image', `upload-${i}`, { imageSrc: src })} className="aspect-square bg-white border border-gray-200 rounded-[12px] overflow-hidden hover:border-gray-400 hover:shadow-md transition-all">
                        <img src={src} alt="Uploaded" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Middle Content Area (Canvas + Bottom Tools) */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 h-full relative">

        {/* Top: Canvas Area */}
        <div
          ref={containerRef}
          className={`flex-1 bg-gray-100 rounded-[32px] overflow-hidden relative shadow-inner border border-gray-200 ${isSpacePressed ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          {/* Subtle Grid Background for Light Mode */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#d1d5db 1px, transparent 1px), linear-gradient(90deg, #d1d5db 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          <Stage
            width={containerSize.width}
            height={containerSize.height}
            scaleX={stageConfig.scale}
            scaleY={stageConfig.scale}
            x={stageConfig.x}
            y={stageConfig.y}
            draggable={isSpacePressed}
            onDragEnd={(e) => {
              if (e.target === stageRef.current) {
                setStageConfig({ ...stageConfig, x: e.target.x(), y: e.target.y() });
              }
            }}
            onWheel={handleWheel}
            ref={stageRef}
            onMouseDown={(e) => {
              if (isBrushMode && selectedElement) {
                handlePointerDown(e);
                return;
              }
              const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === "workspace";
              if (clickedOnEmpty) {
                setSelectedId(null);
              }
            }}
            onMouseMove={(e) => {
              if (isBrushMode && selectedElement) {
                handlePointerMove(e);
              }
            }}
            onMouseUp={(e) => {
              if (isBrushMode && selectedElement) {
                handlePointerUp();
              }
            }}
            onTouchStart={(e) => {
              if (isBrushMode && selectedElement) {
                handlePointerDown(e);
                return;
              }
              const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === "workspace";
              if (clickedOnEmpty) {
                setSelectedId(null);
              }
            }}
            onTouchMove={(e) => {
              if (isBrushMode && selectedElement) {
                handlePointerMove(e);
              }
            }}
            onTouchEnd={(e) => {
              if (isBrushMode && selectedElement) {
                handlePointerUp();
              }
            }}
          >
            <Layer>
              {/* The Infinite Workspace Background (Invisible but catches events) */}
              <Rect
                x={-stageConfig.x / stageConfig.scale}
                y={-stageConfig.y / stageConfig.scale}
                width={containerSize.width / stageConfig.scale}
                height={containerSize.height / stageConfig.scale}
                name="workspace"
                fill="transparent"
                draggable
                onDragMove={(e) => {
                  if (!isSpacePressed) {
                    // If space is not pressed, panning using this rect
                    setStageConfig({
                      ...stageConfig,
                      x: stageConfig.x + e.evt.movementX,
                      y: stageConfig.y + e.evt.movementY
                    });
                  }
                }}
                onDragEnd={(e) => {
                  // Reset its position so it doesn't actually move relative to the stage
                  e.target.x(-stageConfig.x / stageConfig.scale);
                  e.target.y(-stageConfig.y / stageConfig.scale);
                }}
              />

              {/* The Artboard Group with Clipping */}
              <Group clipX={0} clipY={0} clipWidth={STAGE_WIDTH} clipHeight={STAGE_HEIGHT}>
                <Rect
                  x={0} y={0}
                  width={STAGE_WIDTH} height={STAGE_HEIGHT}
                  fill={artboardColor}
                  name="artboard-bg"
                  shadowColor="black" shadowBlur={10} shadowOpacity={0.1}
                  onClick={() => setSelectedId('canvas-bg')}
                  onTap={() => setSelectedId('canvas-bg')}
                />

                {elements.map((el) => {
                  if (el.type === 'bg' || el.id === 'template-bg') {
                    return bgImage ? (
                      <BgImageElement
                        key={el.id}
                        el={el}
                        bgImage={bgImage}
                        STAGE_WIDTH={STAGE_WIDTH}
                        STAGE_HEIGHT={STAGE_HEIGHT}
                        isMagicFillMode={isMagicFillMode}
                        magicFillTransparent={magicFillTransparent}
                        magicFillColor={magicFillColor}
                        magicFillTolerance={magicFillTolerance}
                        setBgImageUrl={setBgImageUrl}
                        onSelect={() => setSelectedId('template-bg')}
                      />
                    ) : null;
                  }

                  if (el.type === "image") {
                    return (
                      <URLImageElement
                        key={el.id}
                        el={el}
                        selectedId={selectedId}
                        onSelect={() => setSelectedId(el.id)}
                        onChange={(newAttrs) => updateElement(el.id, newAttrs)}
                      />
                    );
                  }

                  if (el.type === "text") {
                    return (
                      <Text
                        key={el.id}
                        id={el.id}
                        text={el.placeholderText}
                        x={el.x}
                        y={el.y}
                        fontSize={el.fontSize}
                        fontFamily="Inter, sans-serif"
                        fill={el.fill}
                        draggable={!el.isLocked}
                        listening={!el.isLocked}
                        onClick={() => setSelectedId(el.id)}
                        onTap={() => setSelectedId(el.id)}
                        onDragEnd={(e) => updateElement(el.id, { x: e.target.x(), y: e.target.y() })}
                        onTransformEnd={(e) => {
                          const node = e.target;
                          const scaleY = node.scaleY();
                          node.scaleX(1);
                          node.scaleY(1);
                          updateElement(el.id, {
                            x: node.x(),
                            y: node.y(),
                            fontSize: (el.fontSize || 32) * scaleY,
                          });
                        }}
                      />
                    );
                  }
                  return null;
                })}
              </Group>

              <Transformer
                ref={trRef}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 10 || newBox.height < 10) return oldBox;
                  return newBox;
                }}
              />
            </Layer>
          </Stage>

          {/* Contextual Floating Menu (Canva Style) */}
          {menuPosition && selectedElement && selectedElement.type !== 'bg' && selectedElement.type !== 'canvas' && (
            <div
              className="absolute z-20 flex items-center gap-1 bg-white p-1.5 rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-gray-100 animate-in fade-in zoom-in duration-200"
              style={{ left: menuPosition.x, top: menuPosition.y, transform: 'translate(-50%, -100%)' }}
            >
              <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-[8px] transition-colors text-gray-700 text-[13px] font-medium">
                Edit
              </button>

              <div className="w-[1px] h-5 bg-gray-200 mx-1"></div>

              <button
                onClick={selectedElement.type === 'image' ? removeBackgroundAI : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] transition-colors text-[13px] font-medium ${selectedElement.type === 'image' ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
                title="BG Remover"
              >
                BG Remover {isProcessingAI && <Loader2 size={12} className="animate-spin ml-1" />}
              </button>

              <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-[8px] transition-colors text-gray-700 text-[13px] font-medium">
                Eraser
              </button>

              {/* Color Swatch Mock */}
              <div className="flex items-center gap-1 px-1">
                <div className="w-5 h-5 rounded-[4px] border border-gray-200 cursor-pointer shadow-sm" style={{ background: selectedElement.fill || '#8e6251' }}></div>
                {selectedElement.type === 'text' && (
                  <>
                    <div className="w-5 h-5 rounded-[4px] border border-gray-200 cursor-pointer shadow-sm" style={{ background: '#d1dcb8' }}></div>
                    <div className="w-5 h-5 rounded-[4px] border border-gray-200 cursor-pointer shadow-sm" style={{ background: '#d6a78a' }}></div>
                  </>
                )}
              </div>

              <div className="w-[1px] h-5 bg-gray-200 mx-1"></div>

              <button className="flex items-center gap-1.5 p-1.5 hover:bg-gray-100 rounded-[8px] transition-colors text-gray-700" title="Stroke style">
                <Square size={16} />
              </button>

              <button className="flex items-center gap-1.5 p-1.5 hover:bg-gray-100 rounded-[8px] transition-colors text-gray-700" title="Crop">
                <Crop size={16} />
              </button>

              <button onClick={() => updateElement(selectedElement.id, { flipX: !selectedElement.flipX })} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-[8px] transition-colors text-gray-700 text-[13px] font-medium">
                Flip
              </button>

              <div className="w-[1px] h-5 bg-gray-200 mx-1"></div>

              <button
                onClick={() => updateElement(selectedElement.id, { isLocked: !selectedElement.isLocked })}
                className="flex items-center gap-1.5 p-1.5 hover:bg-gray-100 rounded-[8px] transition-colors text-gray-700"
                title={selectedElement.isLocked ? "Unlock" : "Lock"}
              >
                {selectedElement.isLocked ? <Lock size={16} /> : <Unlock size={16} />}
              </button>

              <button onClick={bringForward} className="p-1.5 hover:bg-gray-100 rounded-[8px] transition-colors text-gray-700" title="Bring Forward">
                <ArrowUpToLine size={16} />
              </button>
              <button onClick={sendBackward} className="p-1.5 hover:bg-gray-100 rounded-[8px] transition-colors text-gray-700" title="Send Backward">
                <ArrowDownToLine size={16} />
              </button>

              <div className="w-[1px] h-5 bg-gray-200 mx-1"></div>

              <button onClick={deleteSelected} className="p-1.5 hover:bg-red-50 text-red-600 rounded-[8px] transition-colors" title="Delete">
                <Trash2 size={16} />
              </button>

              <button className="flex items-center gap-1.5 p-1.5 hover:bg-gray-100 rounded-[8px] transition-colors text-gray-700" title="More">
                <MoreHorizontal size={16} />
              </button>
            </div>
          )}

          {/* Zoom Controls Overlay */}
          <div className="absolute bottom-6 right-6 flex gap-1 z-10 bg-white/90 backdrop-blur-md text-gray-800 p-1.5 rounded-[16px] border border-gray-200 shadow-lg">
            <button onClick={() => setStageConfig(s => ({ ...s, scale: s.scale * 1.1 }))} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-[10px] transition-colors"><span className="text-lg font-bold leading-none">+</span></button>
            <button onClick={() => setStageConfig(s => ({ ...s, scale: 1 }))} className="px-3 h-8 flex items-center justify-center text-[12px] font-bold hover:bg-gray-100 rounded-[10px] transition-colors">{Math.round(stageConfig.scale * 100)}%</button>
            <button onClick={() => setStageConfig(s => ({ ...s, scale: s.scale / 1.1 }))} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-[10px] transition-colors"><span className="text-lg font-bold leading-none">-</span></button>
          </div>
        </div>


      </div>

      {/* 3. Right Sidebar - Properties (Light Bento) */}
      <div className="w-[320px] bg-gray-50 rounded-[24px] flex flex-col shadow-sm h-full shrink-0 overflow-hidden text-gray-800 border border-gray-200">

        {isCornerRadiusMode ? (
          <div className="flex flex-col h-full">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
              <button onClick={() => setIsCornerRadiusMode(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><ChevronLeft size={18} /></button>
              <h2 className="font-semibold text-gray-900 text-[16px]">Corner Radius</h2>
            </div>
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-5 flex flex-col gap-6">
              {(() => {
                const editEl = elements.find(el => el.id === selectedId);
                if (!editEl) return null;

                const currentRadius = editEl.cornerRadius || 0;
                let tl = 0, tr = 0, br = 0, bl = 0;
                if (Array.isArray(currentRadius)) {
                  [tl, tr, br, bl] = currentRadius;
                } else {
                  tl = tr = br = bl = currentRadius;
                }

                const updateUniform = (val: number) => {
                  updateElement(editEl.id, { cornerRadius: val });
                };

                const updateIndependent = (idx: number, val: number) => {
                  const newArr: [number, number, number, number] = [tl, tr, br, bl];
                  newArr[idx] = val;
                  updateElement(editEl.id, { cornerRadius: newArr });
                };

                return (
                  <div className="flex flex-col gap-5">
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-[10px]">
                      <button onClick={() => setIsAdvancedRadius(false)} className={`flex-1 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors ${!isAdvancedRadius ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Uniform</button>
                      <button onClick={() => setIsAdvancedRadius(true)} className={`flex-1 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors ${isAdvancedRadius ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Advanced</button>
                    </div>

                    {!isAdvancedRadius ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[12px] font-medium text-gray-700"><span>Radius</span><span>{tl}px</span></div>
                        <input type="range" min="0" max="200" step="1" value={tl} onChange={(e) => updateUniform(parseInt(e.target.value))} className="w-full accent-gray-900" />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between text-[12px] font-medium text-gray-700"><span>Top Left</span><span>{tl}px</span></div>
                          <input type="range" min="0" max="200" step="1" value={tl} onChange={(e) => updateIndependent(0, parseInt(e.target.value))} className="w-full accent-gray-900" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between text-[12px] font-medium text-gray-700"><span>Top Right</span><span>{tr}px</span></div>
                          <input type="range" min="0" max="200" step="1" value={tr} onChange={(e) => updateIndependent(1, parseInt(e.target.value))} className="w-full accent-gray-900" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between text-[12px] font-medium text-gray-700"><span>Bottom Right</span><span>{br}px</span></div>
                          <input type="range" min="0" max="200" step="1" value={br} onChange={(e) => updateIndependent(2, parseInt(e.target.value))} className="w-full accent-gray-900" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between text-[12px] font-medium text-gray-700"><span>Bottom Left</span><span>{bl}px</span></div>
                          <input type="range" min="0" max="200" step="1" value={bl} onChange={(e) => updateIndependent(3, parseInt(e.target.value))} className="w-full accent-gray-900" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        ) : isBrushMode ? (
          <div className="flex flex-col h-full">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
              <button onClick={() => setIsBrushMode(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><ChevronLeft size={18} /></button>
              <h2 className="font-semibold text-gray-900 text-[16px]">Brush & Eraser</h2>
            </div>
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-5 flex flex-col gap-6">
               <div className="flex flex-col gap-4">
                  <div className="flex gap-2 bg-gray-100 p-1 rounded-[10px]">
                     <button onClick={() => setBrushTool('eraser')} className={`flex-1 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors ${brushTool === 'eraser' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Eraser</button>
                     <button onClick={() => setBrushTool('brush')} className={`flex-1 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors ${brushTool === 'brush' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Brush</button>
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex justify-between text-[12px] font-medium text-gray-700"><span>Size</span><span>{brushSize}px</span></div>
                    <input type="range" min="1" max="100" step="1" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-full accent-gray-900" />
                  </div>

                  {brushTool === 'brush' && (
                    <div className="flex flex-col gap-2 mt-2">
                      <span className="text-[12px] font-medium text-gray-700">Brush Color</span>
                      <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="w-full h-10 rounded-[8px] cursor-pointer border border-gray-200 p-1" />
                    </div>
                  )}
               </div>

               <div className="mt-auto pt-4 border-t border-gray-200">
                  <button onClick={() => updateElement(selectedId!, { drawLines: [] })} className="w-full bg-red-50 text-red-600 py-2.5 rounded-[10px] text-[13px] font-medium hover:bg-red-100 transition-colors border border-red-200">
                    Clear All Strokes
                  </button>
               </div>
            </div>
          </div>
        ) : activeEditingElement ? (
          <div className="flex flex-col h-full">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
              <button onClick={() => setActiveEditingElement(null)} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><ChevronLeft size={18} /></button>
              <h2 className="font-semibold text-gray-900 text-[16px]">Edit Image</h2>
            </div>
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-5 flex flex-col gap-6">
              {(() => {
                const editEl = elements.find(el => el.id === activeEditingElement);
                if (!editEl) return null;

                const updateFilter = (key: string, value: any) => {
                  updateElement(editEl.id, { filters: { ...(editEl.filters || {}), [key]: value } });
                };

                const applyToAll = () => {
                  const currentFilters = editEl.filters || {};
                  const newElements = elements.map(el => {
                    if (el.type === 'image' || el.type === 'bg' || el.id === 'template-bg') {
                      return { ...el, filters: { ...currentFilters } };
                    }
                    return el;
                  });
                  setElements(newElements);
                };

                return (
                  <>
                    <div className="flex flex-col gap-4">
                      {/* Brightness */}
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[12px] font-medium text-gray-700"><span>Brightness</span><span>{Math.round((editEl.filters?.brightness || 0) * 100)}</span></div>
                        <input type="range" min="-1" max="1" step="0.01" value={editEl.filters?.brightness || 0} onChange={(e) => updateFilter('brightness', parseFloat(e.target.value))} className="w-full accent-gray-900" />
                      </div>
                      {/* Contrast */}
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[12px] font-medium text-gray-700"><span>Contrast</span><span>{editEl.filters?.contrast || 0}</span></div>
                        <input type="range" min="-100" max="100" step="1" value={editEl.filters?.contrast || 0} onChange={(e) => updateFilter('contrast', parseFloat(e.target.value))} className="w-full accent-gray-900" />
                      </div>
                      {/* Blur */}
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[12px] font-medium text-gray-700"><span>Blur</span><span>{editEl.filters?.blurRadius || 0}</span></div>
                        <input type="range" min="0" max="40" step="1" value={editEl.filters?.blurRadius || 0} onChange={(e) => updateFilter('blurRadius', parseFloat(e.target.value))} className="w-full accent-gray-900" />
                      </div>
                      {/* Noise */}
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[12px] font-medium text-gray-700"><span>Noise</span><span>{(editEl.filters?.noise || 0).toFixed(1)}</span></div>
                        <input type="range" min="0" max="4" step="0.1" value={editEl.filters?.noise || 0} onChange={(e) => updateFilter('noise', parseFloat(e.target.value))} className="w-full accent-gray-900" />
                      </div>
                    </div>

                    <div className="w-full h-[1px] bg-gray-200"></div>

                    <div className="flex flex-col gap-3">
                      <span className="text-[12px] font-semibold text-gray-800">Presets</span>
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => updateFilter('grayscale', !editEl.filters?.grayscale)} className={`px-3 py-1.5 rounded-[8px] border text-[12px] font-medium transition-colors ${editEl.filters?.grayscale ? 'bg-gray-100 border-gray-300 text-gray-900' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Grayscale</button>
                        <button onClick={() => updateFilter('sepia', !editEl.filters?.sepia)} className={`px-3 py-1.5 rounded-[8px] border text-[12px] font-medium transition-colors ${editEl.filters?.sepia ? 'bg-gray-100 border-gray-300 text-gray-900' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Sepia</button>
                        <button onClick={() => updateFilter('invert', !editEl.filters?.invert)} className={`px-3 py-1.5 rounded-[8px] border text-[12px] font-medium transition-colors ${editEl.filters?.invert ? 'bg-gray-100 border-gray-300 text-gray-900' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Invert</button>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button onClick={applyToAll} className="w-full bg-black text-white py-2.5 rounded-[10px] text-[13px] font-medium hover:bg-gray-800 transition-colors shadow-sm">
                        Apply to All Images
                      </button>
                      <p className="text-[11px] text-gray-500 text-center mt-2">Applies these adjustments to all other images and backgrounds on the canvas.</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h2 className="font-semibold text-gray-900 text-[16px]">Properties</h2>
            </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-5 flex flex-col gap-6">

          {/* Template Meta */}
          <div className="flex flex-col gap-4 pb-5 border-b border-gray-200">
             <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Template Name</label>
                <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="w-full bg-white text-gray-900 border border-gray-200 rounded-[10px] px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2665d6]" placeholder="e.g. Birthday Card" />
             </div>
             <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Category</label>
                <select value={templateCategory} onChange={(e) => setTemplateCategory(e.target.value)} className="w-full bg-white text-gray-900 border border-gray-200 rounded-[10px] px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2665d6]">
                  <option value="General">General</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Onam">Onam</option>
                  <option value="Christmas">Christmas</option>
                </select>
             </div>
          </div>

          {selectedElement ? (
            <>
              {/* Canva-style Context Tools */}
              <div className="flex flex-col gap-3 bg-white p-3 rounded-[12px] border border-gray-200 shadow-sm">

                <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-1">
                  <button onClick={() => setActiveEditingElement(selectedElement.id)} className="flex items-center justify-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-[8px] transition-colors text-gray-700 text-[12px] font-medium border border-gray-200 shadow-sm shrink-0">
                    Edit
                  </button>
                  <div className="w-[1px] h-5 bg-gray-200 shrink-0 mx-1"></div>

                  <button
                    onClick={selectedElement.type === 'image' || selectedElement.type === 'bg' ? removeBackgroundAI : undefined}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] transition-colors text-[12px] font-medium shrink-0 border border-gray-200 shadow-sm ${selectedElement.type === 'image' || selectedElement.type === 'bg' ? 'bg-gray-100 text-gray-800 hover:opacity-80' : 'text-gray-400 bg-gray-50 cursor-not-allowed'}`}
                  >
                    BG Remover <span className="bg-gray-800 text-white px-1 rounded-[4px] text-[9px] uppercase tracking-wider ml-1">Pro</span>
                    {isProcessingAI && <Loader2 size={12} className="animate-spin ml-1" />}
                  </button>

                  <button onClick={() => setIsBrushMode(true)} className="flex items-center justify-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-[8px] transition-colors text-gray-700 text-[12px] font-medium border border-gray-200 shadow-sm shrink-0">
                    <Eraser size={12} /> Brush
                  </button>

                  <button onClick={() => setIsCornerRadiusMode(true)} className="flex items-center justify-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-[8px] transition-colors text-gray-700 text-[12px] font-medium border border-gray-200 shadow-sm shrink-0">
                    <Square size={12} /> Corner Radius
                  </button>
                </div>

                <div className="w-full h-[1px] bg-gray-200"></div>

                <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-1">
                  {/* Colours Group */}
                  <div className="flex gap-1.5 shrink-0 bg-gray-50 p-1 rounded-[8px] border border-gray-200">
                    <button onDoubleClick={() => document.getElementById('main-color-picker')?.click()} onClick={() => selectedElement.type === 'text' ? updateElement(selectedElement.id, { fill: '#8e6251' }) : selectedElement.type === 'canvas' ? setArtboardColor('#8e6251') : undefined} className="w-6 h-6 rounded-[4px] shadow-sm border border-black/10 hover:scale-110 transition-transform" style={{ background: '#8e6251' }} title="Greyorange"></button>
                    <button onDoubleClick={() => document.getElementById('main-color-picker')?.click()} onClick={() => selectedElement.type === 'text' ? updateElement(selectedElement.id, { fill: '#d1dcb8' }) : selectedElement.type === 'canvas' ? setArtboardColor('#d1dcb8') : undefined} className="w-6 h-6 rounded-[4px] shadow-sm border border-black/10 hover:scale-110 transition-transform" style={{ background: '#d1dcb8' }} title="Pastel greygreen"></button>
                    <button onDoubleClick={() => document.getElementById('main-color-picker')?.click()} onClick={() => selectedElement.type === 'text' ? updateElement(selectedElement.id, { fill: '#d6a78a' }) : selectedElement.type === 'canvas' ? setArtboardColor('#d6a78a') : undefined} className="w-6 h-6 rounded-[4px] shadow-sm border border-black/10 hover:scale-110 transition-transform" style={{ background: '#d6a78a' }} title="Greyorange"></button>
                    <button onDoubleClick={() => document.getElementById('main-color-picker')?.click()} onClick={() => selectedElement.type === 'text' ? updateElement(selectedElement.id, { fill: '#ffffff' }) : selectedElement.type === 'canvas' ? setArtboardColor('#ffffff') : undefined} className="w-6 h-6 rounded-[4px] shadow-sm border border-black/10 hover:scale-110 transition-transform" style={{ background: '#ffffff' }} title="White"></button>
                    <div className="relative w-6 h-6 rounded-[4px] shadow-sm border border-black/10 hover:scale-110 transition-transform flex items-center justify-center bg-white overflow-hidden" title="Current Color">
                      <input
                        id="main-color-picker"
                        type="color"
                        value={selectedElement.type === 'text' ? (selectedElement.fill || '#000000') : selectedElement.type === 'canvas' ? artboardColor : '#ffffff'}
                        onChange={(e) => selectedElement.type === 'text' ? updateElement(selectedElement.id, { fill: e.target.value }) : selectedElement.type === 'canvas' ? setArtboardColor(e.target.value) : undefined}
                        className="w-10 h-10 cursor-pointer absolute -top-2 -left-2"
                      />
                    </div>
                  </div>

                  <div className="w-[1px] h-5 bg-gray-200 shrink-0 mx-1"></div>

                  <button className="p-1.5 hover:bg-gray-100 rounded-[8px] transition-colors text-gray-700 border border-gray-200 shadow-sm shrink-0" title="Stroke style">
                    <Square size={14} />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 rounded-[8px] transition-colors text-gray-700 border border-gray-200 shadow-sm shrink-0" title="Crop">
                    <Crop size={14} />
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-[8px] transition-colors text-gray-700 text-[12px] font-medium border border-gray-200 shadow-sm shrink-0">
                    Flip
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 rounded-[8px] transition-colors text-gray-700 border border-gray-200 shadow-sm shrink-0" title="More">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>

              {/* Layer Controls */}
              {selectedElement.type !== 'bg' && selectedElement.type !== 'canvas' && (
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Arrange</span>
                  <div className="flex gap-2">
                    <button onClick={bringForward} className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-[8px] py-2 text-[12px] font-medium text-gray-700 transition-colors shadow-sm">
                      <ArrowUpToLine size={14} className="text-gray-500" /> Forward
                    </button>
                    <button onClick={sendBackward} className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-[8px] py-2 text-[12px] font-medium text-gray-700 transition-colors shadow-sm">
                      <ArrowDownToLine size={14} className="text-gray-500" /> Backward
                    </button>
                  </div>
                </div>
              )}



              {/* Background Properties */}
              {selectedElement.type === "bg" && (
                <div className="flex flex-col gap-6">

                  {/* Magic Fill */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-gray-900">
                      <PaintBucket size={16} />
                      <h3 className="text-[14px] font-semibold">Magic Fill Tool</h3>
                    </div>

                    {/* Toggle row */}
                    <div
                      onClick={() => setIsMagicFillMode(!isMagicFillMode)}
                      className="flex items-center justify-between cursor-pointer group"
                    >
                      <span className="text-[13px] font-medium text-gray-700 group-hover:text-black transition-colors">Enable Magic Fill</span>
                      <div className={`relative w-[44px] h-[24px] rounded-full transition-colors duration-300 ${isMagicFillMode ? 'bg-gray-800' : 'bg-gray-300'}`}>
                        <div className={`absolute top-1/2 -translate-y-1/2 w-[20px] h-[20px] bg-white rounded-full shadow-sm transition-all duration-300 ${isMagicFillMode ? 'left-[22px]' : 'left-[2px]'}`}></div>
                      </div>
                    </div>

                    {/* Active State Panel */}
                    {isMagicFillMode && (
                      <div className="flex flex-col gap-4 p-4 bg-white border border-gray-200 rounded-[12px] shadow-sm">

                        <div
                          onClick={() => setMagicFillTransparent(!magicFillTransparent)}
                          className="flex items-center justify-between cursor-pointer group"
                        >
                          <span className="text-[12px] font-medium text-gray-700 group-hover:text-black transition-colors">Make transparent</span>
                          <div className={`relative w-[36px] h-[20px] rounded-full transition-colors duration-300 ${magicFillTransparent ? 'bg-gray-800' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1/2 -translate-y-1/2 w-[16px] h-[16px] bg-white rounded-full shadow-sm transition-all duration-300 ${magicFillTransparent ? 'left-[18px]' : 'left-[2px]'}`}></div>
                          </div>
                        </div>

                        {!magicFillTransparent && (
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-medium text-gray-700">Fill Color</span>
                            <div className="relative w-7 h-7 rounded-full overflow-hidden border border-gray-200 shrink-0">
                              <input
                                type="color"
                                value={magicFillColor}
                                onChange={(e) => setMagicFillColor(e.target.value)}
                                className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-[12px] font-medium text-gray-700">Tolerance</span>
                            <span className="text-[11px] font-mono font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded-[4px]">{magicFillTolerance}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="255"
                            value={magicFillTolerance}
                            onChange={(e) => setMagicFillTolerance(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2665d6]"
                          />
                        </div>

                      </div>
                    )}

                    {originalBgImageUrl && originalBgImageUrl !== bgImageUrl && (
                      <button
                        onClick={() => setBgImageUrl(originalBgImageUrl)}
                        className="flex items-center justify-center gap-2 w-full mt-2 bg-white hover:bg-gray-100 border border-gray-200 transition-colors rounded-[10px] py-2.5 text-[13px] font-medium text-gray-700 shadow-sm"
                      >
                        <RefreshCw size={14} className="text-gray-500" /> Reset Image
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Text Properties */}
              {selectedElement.type === "text" && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Content</span>
                    <input
                      type="text"
                      value={selectedElement.placeholderText}
                      onChange={(e) => updateElement(selectedElement.id, { placeholderText: e.target.value })}
                      className="w-full bg-white text-gray-900 border border-gray-200 rounded-[10px] px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2665d6] focus:border-transparent shadow-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between bg-white border border-gray-200 rounded-[12px] p-3 shadow-sm">
                    <span className="text-[13px] font-medium text-gray-800">Text Color</span>
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0">
                      <input
                        type="color"
                        value={selectedElement.fill}
                        onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })}
                        className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Image Properties */}
              {selectedElement.type === "image" && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Image Asset</span>
                    <label className="flex items-center justify-center gap-2 w-full bg-white hover:bg-gray-100 border border-gray-200 transition-colors rounded-[10px] py-2.5 cursor-pointer text-[13px] font-medium text-gray-700 shadow-sm">
                      <Upload size={14} className="text-gray-500" /> Replace Image
                      <input type="file" accept="image/*" onChange={handlePlaceholderImageUpload} className="hidden" />
                    </label>
                  </div>

                  {selectedElement.imageSrc && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">AI Tools</span>
                      <button
                        onClick={removeBackgroundAI}
                        disabled={isProcessingAI}
                        className="flex items-center justify-center gap-2 w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 disabled:opacity-50 transition-colors rounded-[10px] py-2.5 text-[13px] font-medium shadow-sm"
                      >
                        {isProcessingAI ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                        {isProcessingAI ? "Processing..." : "Remove Background"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Delete Button */}
              {selectedElement.type !== "bg" && selectedElement.type !== 'canvas' && (
                <div className="mt-auto pt-6 border-t border-gray-200">
                  <button onClick={deleteSelected} className="flex items-center justify-center gap-2 w-full bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-200 rounded-[10px] py-2.5 text-[13px] font-medium shadow-sm">
                    <Trash2 size={16} /> Delete Element
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4 mt-8">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 border border-gray-200 shadow-sm">
                <Settings2 size={20} className="text-gray-400" />
              </div>
              <p className="text-[13px] text-gray-500">Select an element on the canvas to view its properties.</p>
            </div>
          )}
        </div>

        {/* Layers / Position Panel */}
        <div className="border-t border-gray-200 bg-white p-4 flex flex-col h-[280px] shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={16} className="text-gray-900" />
            <h3 className="font-semibold text-gray-900 text-[14px]">Layers</h3>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {[...elements].reverse().map((el, index) => {
              const actualIndex = elements.length - 1 - index;
              const isSelected = selectedId === el.id;

              return (
                <div
                  key={el.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, el.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, actualIndex)}
                  onClick={() => setSelectedId(el.id)}
                  className={`flex items-center justify-between p-2 rounded-[10px] cursor-pointer border ${isSelected ? 'bg-gray-100 border-gray-300' : 'bg-gray-50 border-gray-200 hover:border-gray-300'} transition-all`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <GripVertical size={14} className="text-gray-400 cursor-grab" />
                    <span className="text-[12px] font-medium text-gray-700 truncate">{el.name}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); updateElement(el.id, { isLocked: !el.isLocked }); }}
                    className="p-1 hover:bg-gray-200 rounded-[6px] text-gray-500"
                  >
                    {el.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </>
    )}
  </div>
</div>
  );
}
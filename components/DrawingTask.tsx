
import React, { useRef, useState, useEffect } from 'react';

interface DrawingTaskProps {
  onSave: (dataUrl: string) => void;
  readOnly?: boolean;
  initialData?: string;
  baseImage?: string;
}

const DrawingTask: React.FC<DrawingTaskProps> = ({ onSave, readOnly, initialData, baseImage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ef4444');

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (baseImage || initialData) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = initialData || baseImage || '';
    }
  };

  useEffect(() => {
    initCanvas();
  }, [initialData, baseImage]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (readOnly) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (readOnly) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL());
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            onSave(canvas.toDataURL());
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white border-2 border-slate-100 rounded-[32px] p-6 shadow-inner">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
           {['#ef4444', '#3b82f6', '#10b981', '#000000'].map(c => (
             <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-slate-800 scale-110' : 'border-transparent'}`} style={{backgroundColor: c}} />
           ))}
        </div>
        <div className="flex gap-4">
          {!readOnly && (
            <label className="text-[10px] font-black text-indigo-600 uppercase cursor-pointer hover:underline">
              Загрузить фон
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          )}
          {!readOnly && (
            <button onClick={initCanvas} className="text-[10px] font-black text-slate-400 uppercase hover:text-red-500 transition-colors">Очистить</button>
          )}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className={`border-2 border-slate-50 w-full bg-slate-50 cursor-crosshair rounded-2xl shadow-sm ${readOnly ? 'pointer-events-none' : ''}`}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={stopDrawing}
        onTouchMove={draw}
      />
    </div>
  );
};

export default DrawingTask;

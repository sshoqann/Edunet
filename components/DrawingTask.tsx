
import React, { useRef, useState, useEffect } from 'react';

interface DrawingTaskProps {
  onSave: (dataUrl: string) => void;
  readOnly?: boolean;
  initialData?: string;
}

const DrawingTask: React.FC<DrawingTaskProps> = ({ onSave, readOnly, initialData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (initialData) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = initialData;
    } else {
      // Draw a simple physics scene background (a box on a line)
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, 250);
      ctx.lineTo(350, 250);
      ctx.stroke();
      ctx.strokeRect(150, 200, 100, 50);
      ctx.font = '12px Inter';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Тело', 185, 230);
    }
  }, [initialData]);

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

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ef4444'; // Red for forces

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Redraw base
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 250);
    ctx.lineTo(350, 250);
    ctx.stroke();
    ctx.strokeRect(150, 200, 100, 50);
    ctx.fillText('Тело', 185, 230);
  };

  return (
    <div className="bg-white border rounded-lg p-4 shadow-inner">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">Нарисуйте векторы сил (красным)</span>
        {!readOnly && (
          <button onClick={clear} className="text-xs text-indigo-600 hover:underline">Очистить</button>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        className={`border w-full bg-slate-50 cursor-crosshair rounded ${readOnly ? 'pointer-events-none' : ''}`}
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

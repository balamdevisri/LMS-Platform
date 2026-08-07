import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Eraser, RotateCcw, Download, X } from 'lucide-react';
import { toast } from 'sonner';

interface WhiteboardProps {
  onClose: () => void;
  isInstructor: boolean;
}

export const InteractiveWhiteboard: React.FC<WhiteboardProps> = ({ onClose, isInstructor }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3b82f6'); // Default Blue
  const [lineWidth, setLineWidth] = useState(4);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high DPI canvas resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Initial white background
    ctx.fillStyle = '#0f172a'; // Dark slate canvas
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isInstructor) {
      toast.info('Student View: Only lead mentor can draw on the main board.');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isInstructor) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (tool === 'eraser') {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = lineWidth * 4;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, rect.width, rect.height);
    toast.info('Whiteboard cleared');
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'KaizenQ_Whiteboard_Diagram.png';
    link.href = canvas.toDataURL();
    link.click();
    toast.success('Downloaded whiteboard diagram!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 font-['Sora'] select-none"
    >
      <div className="bg-slate-900 border border-sky-500/20 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-sky-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-sm text-white">Interactive Architectural Whiteboard</h3>
              <p className="text-[11px] text-slate-400 font-medium">Real-time diagramming canvas for mentor & live stream</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadCanvas}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar (Only Instructor editable) */}
        <div className="bg-slate-900/90 px-6 py-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-4 text-xs font-bold">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTool('pen')}
              className={`p-2 rounded-xl border flex items-center gap-1.5 cursor-pointer ${
                tool === 'pen' ? 'bg-sky-500/20 border-sky-400 text-sky-300' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Pencil className="w-4 h-4" />
              <span>Pen</span>
            </button>

            <button
              onClick={() => setTool('eraser')}
              className={`p-2 rounded-xl border flex items-center gap-1.5 cursor-pointer ${
                tool === 'eraser' ? 'bg-rose-500/20 border-rose-400 text-rose-300' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Eraser className="w-4 h-4" />
              <span>Eraser</span>
            </button>

            <button
              onClick={clearCanvas}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-2">
            {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#ffffff'].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setTool('pen');
                }}
                className={`w-6 h-6 rounded-full transition-transform cursor-pointer border ${
                  color === c && tool === 'pen' ? 'scale-125 border-white ring-2 ring-sky-400' : 'border-slate-700'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Stroke Width */}
          <div className="flex items-center gap-2 text-slate-400">
            <span>Size:</span>
            <input
              type="range"
              min="2"
              max="16"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-24 accent-sky-500 cursor-pointer"
            />
            <span className="font-mono text-sky-400">{lineWidth}px</span>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full cursor-crosshair touch-none"
          />
        </div>

      </div>
    </motion.div>
  );
};

import React, { useEffect, useRef, useState } from 'react';

interface AnimatedKaizenQProps {
  width?: number;
  height?: number;
  theme?: 'light' | 'dark';
  autoPlay?: boolean;
  className?: string;
  onSequenceComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  delay: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export const AnimatedKaizenQ: React.FC<AnimatedKaizenQProps> = ({
  width = 800,
  height = 420,
  theme = 'light',
  autoPlay = true,
  className = '',
  onSequenceComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const stepsList = [
    '1. Particles Spawning & Orbital Motion',
    '2. Magnetic Path Snap & Symbol Assembly',
    '3. Left AI Circuit Branches & Arrow Ignition',
    '4. Royal Blue to Cyan Gradient Solidification',
    '5. Sora Wordmark & Tagline Reveal',
    '6. Specular Chromatic Lens Sweep',
    '7. Spring Elastic Soft Pulse',
    '8. Settled Premium Finish with Interactive Dynamics',
  ];

  const animationStateRef = useRef({
    startTime: Date.now(),
    isPlaying: autoPlay,
    mouse: { x: -1000, y: -1000, targetX: -1000, targetY: -1000, radius: 140 },
  });

  const restartAnimation = () => {
    animationStateRef.current.startTime = Date.now();
    animationStateRef.current.isPlaying = true;
    setCurrentStepIndex(0);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let sparks: Spark[] = [];
    let sparkTriggered = false;

    const symCx = width < 600 ? width * 0.5 : width * 0.24;
    const symCy = width < 600 ? height * 0.38 : height * 0.5;
    const symScale = width < 600 ? 0.75 : 0.95;

    const generateSymbolPoints = (): { x: number; y: number }[] => {
      const points: { x: number; y: number }[] = [];

      // 1. Q Outer Circle (r=66)
      const r = 66 * symScale;
      for (let i = 0; i < 300; i++) {
        const angle = (i / 300) * Math.PI * 2;
        points.push({
          x: symCx + Math.cos(angle) * r,
          y: symCy + Math.sin(angle) * r,
        });
      }

      // 2. K Vertical Stem (80, 56) to (80, 144)
      const xStem = symCx + (80 - 110) * symScale;
      const yStemStart = symCy + (56 - 100) * symScale;
      const yStemEnd = symCy + (144 - 100) * symScale;
      for (let i = 0; i < 110; i++) {
        const t = i / 110;
        points.push({
          x: xStem,
          y: yStemStart + t * (yStemEnd - yStemStart),
        });
      }

      // 3. K Upper Arm (80, 100) -> (136, 54)
      const xPivot = symCx + (80 - 110) * symScale;
      const yPivot = symCy + (100 - 100) * symScale;
      const xUpper = symCx + (136 - 110) * symScale;
      const yUpper = symCy + (54 - 100) * symScale;
      for (let i = 0; i < 110; i++) {
        const t = i / 110;
        points.push({
          x: xPivot + t * (xUpper - xPivot),
          y: yPivot + t * (yUpper - yPivot),
        });
      }

      // 4. K Lower Arm & Q Tail (80, 100) -> (172, 168)
      const xTail = symCx + (172 - 110) * symScale;
      const yTail = symCy + (168 - 100) * symScale;
      for (let i = 0; i < 130; i++) {
        const t = i / 130;
        points.push({
          x: xPivot + t * (xTail - xPivot),
          y: yPivot + t * (yTail - yPivot),
        });
      }

      // 5. Left AI Circuit Branches
      const branches = [
        { y: 72, xEnd: 48, nodeX: 12 },
        { y: 100, xEnd: 44, nodeX: 2 },
        { y: 128, xEnd: 48, nodeX: 18 },
      ];
      branches.forEach((b) => {
        const yPos = symCy + (b.y - 100) * symScale;
        const xStart = symCx + (b.nodeX - 110) * symScale;
        const xEnd = symCx + (b.xEnd - 110) * symScale;
        for (let i = 0; i < 30; i++) {
          const t = i / 30;
          points.push({ x: xStart + t * (xEnd - xStart), y: yPos });
        }
      });

      return points;
    };

    const targetPoints = generateSymbolPoints();

    const initParticles = () => {
      particles = [];
      sparks = [];
      sparkTriggered = false;
      const totalParticles = targetPoints.length;

      for (let i = 0; i < totalParticles; i++) {
        const point = targetPoints[i];
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 240 + 60;
        const speed = Math.random() * 2 + 1;

        particles.push({
          x: symCx + Math.cos(angle) * dist,
          y: symCy + Math.sin(angle) * dist,
          originX: symCx + Math.cos(angle) * dist,
          originY: symCy + Math.sin(angle) * dist,
          targetX: point.x,
          targetY: point.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2.4 + 1.1,
          alpha: Math.random() * 0.85 + 0.15,
          color: Math.random() > 0.35 ? '#22D3EE' : '#2563EB',
          delay: Math.random() * 350,
        });
      }
    };

    const spawnSparksAtNodes = () => {
      const nodeCoords = [
        { x: symCx + (12 - 110) * symScale, y: symCy + (72 - 100) * symScale },
        { x: symCx + (2 - 110) * symScale, y: symCy + (100 - 100) * symScale },
        { x: symCx + (18 - 110) * symScale, y: symCy + (128 - 100) * symScale },
        { x: symCx + (120 - 110) * symScale, y: symCy + (88 - 100) * symScale },
      ];

      nodeCoords.forEach((n) => {
        for (let k = 0; k < 15; k++) {
          const a = Math.random() * Math.PI * 2;
          const spd = Math.random() * 4 + 1.5;
          sparks.push({
            x: n.x,
            y: n.y,
            vx: Math.cos(a) * spd,
            vy: Math.sin(a) * spd,
            life: 0,
            maxLife: Math.random() * 25 + 15,
            color: Math.random() > 0.5 ? '#22D3EE' : '#38BDF8',
            size: Math.random() * 2.5 + 1,
          });
        }
      });
    };

    initParticles();
    animationStateRef.current.startTime = Date.now();

    const drawSymbolPath = (progress: number, glowAmount: number, floatY: number) => {
      ctx.save();
      ctx.translate(symCx, symCy + floatY);
      ctx.scale(symScale, symScale);
      ctx.translate(-110, -100);

      const grad = ctx.createLinearGradient(0, 0, 200, 200);
      grad.addColorStop(0, '#1D4ED8');
      grad.addColorStop(0.4, '#2563EB');
      grad.addColorStop(1, '#22D3EE');

      const arrowGrad = ctx.createLinearGradient(0, 20, 0, 0);
      arrowGrad.addColorStop(0, '#2563EB');
      arrowGrad.addColorStop(1, '#38BDF8');

      ctx.strokeStyle = grad;
      ctx.fillStyle = grad;
      ctx.lineWidth = 15;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (glowAmount > 0) {
        ctx.shadowColor = '#22D3EE';
        ctx.shadowBlur = glowAmount;
      }

      ctx.globalAlpha = Math.min(1, progress);

      // 1. LEFT AI CIRCUIT BRANCHES
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(12, 72); ctx.lineTo(48, 72); ctx.stroke();
      ctx.beginPath(); ctx.arc(12, 72, 4.5, 0, Math.PI * 2); ctx.stroke();

      ctx.beginPath(); ctx.moveTo(2, 100); ctx.lineTo(44, 100); ctx.stroke();
      ctx.beginPath(); ctx.arc(2, 100, 4.5, 0, Math.PI * 2); ctx.stroke();

      ctx.beginPath(); ctx.moveTo(18, 128); ctx.lineTo(48, 128); ctx.stroke();
      ctx.beginPath(); ctx.arc(18, 128, 4.5, 0, Math.PI * 2); ctx.stroke();

      // Brackets
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.moveTo(46, 68); ctx.lineTo(56, 72); ctx.lineTo(46, 76); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(42, 96); ctx.lineTo(52, 100); ctx.lineTo(42, 104); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(46, 124); ctx.lineTo(56, 128); ctx.lineTo(46, 132); ctx.closePath(); ctx.fill();

      // 2. Q CIRCLE
      ctx.lineWidth = 16;
      ctx.beginPath(); ctx.arc(110, 100, 66, 0, Math.PI * 2); ctx.stroke();

      // 3. K STEM & ARMS
      ctx.lineWidth = 15;
      ctx.beginPath(); ctx.moveTo(80, 56); ctx.lineTo(80, 144); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(80, 100); ctx.lineTo(136, 54); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(80, 100); ctx.lineTo(148, 144); ctx.lineTo(172, 168); ctx.stroke();

      // 4. INTERNAL GROWTH ARROW
      if (progress > 0.3) {
        ctx.strokeStyle = arrowGrad;
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(120, 104);
        ctx.lineTo(120, 88);
        ctx.moveTo(114, 94);
        ctx.lineTo(120, 87);
        ctx.lineTo(126, 94);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawWordmark = (alpha: number, sweepProgress: number, pulseScale: number, floatY: number) => {
      const isDark = theme === 'dark';
      const textX = width < 600 ? width * 0.5 : width * 0.48;
      const textY = (width < 600 ? height * 0.76 : height * 0.5) + floatY;

      ctx.save();
      ctx.globalAlpha = Math.min(1, Math.max(0, alpha));

      ctx.translate(textX, textY);
      if (pulseScale !== 1) {
        ctx.scale(pulseScale, pulseScale);
      }

      const isMobile = width < 600;
      ctx.font = `800 ${isMobile ? '38px' : '56px'} 'Sora', sans-serif`;
      ctx.textAlign = isMobile ? 'center' : 'left';
      ctx.textBaseline = 'middle';

      // Kaizen Main Text
      ctx.fillStyle = isDark ? '#FFFFFF' : '#0B1220';
      ctx.fillText('Kaizen', 0, 0);

      // Q Gradient Accent
      const kaizenWidth = ctx.measureText('Kaizen ').width;
      const qGrad = ctx.createLinearGradient(kaizenWidth, -20, kaizenWidth + 50, 20);
      qGrad.addColorStop(0, '#2563EB');
      qGrad.addColorStop(1, '#22D3EE');
      ctx.fillStyle = qGrad;
      ctx.fillText('Q', kaizenWidth, 0);

      // Tagline: — LEARN • BUILD • EVOLVE —
      ctx.font = `700 ${isMobile ? '9px' : '12px'} 'Sora', sans-serif`;
      const taglineText = 'LEARN  •  BUILD  •  EVOLVE';
      
      const lineY = isMobile ? 26 : 32;
      ctx.fillStyle = isDark ? '#CBD5E1' : '#1E293B';

      if (!isMobile) {
        // Left & Right accent rule lines
        const ruleGrad = ctx.createLinearGradient(0, lineY, 40, lineY);
        ruleGrad.addColorStop(0, '#2563EB');
        ruleGrad.addColorStop(1, '#22D3EE');

        ctx.strokeStyle = ruleGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(36, lineY);
        ctx.stroke();

        ctx.fillText(taglineText, 48, lineY);

        const taglineW = ctx.measureText(taglineText).width;
        ctx.beginPath();
        ctx.moveTo(48 + taglineW + 12, lineY);
        ctx.lineTo(48 + taglineW + 48, lineY);
        ctx.stroke();
      } else {
        ctx.fillText(taglineText, 0, lineY);
      }

      // Realistic Lens Sweep
      if (sweepProgress > 0 && sweepProgress < 1) {
        const sweepX = (sweepProgress * (width * 0.85)) - (width * 0.2);
        const sweepGrad = ctx.createLinearGradient(sweepX - 40, -50, sweepX + 60, 50);
        sweepGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        sweepGrad.addColorStop(0.3, 'rgba(34, 211, 238, 0.25)');
        sweepGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.7)');
        sweepGrad.addColorStop(0.7, 'rgba(37, 99, 235, 0.25)');
        sweepGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = sweepGrad;
        ctx.fillRect(-100, -60, width * 0.9, 120);
      }

      ctx.restore();
    };

    const animate = () => {
      const now = Date.now();
      const elapsed = now - animationStateRef.current.startTime;

      const floatY = Math.sin(now * 0.0025) * 4;

      const isDark = theme === 'dark';
      ctx.clearRect(0, 0, width, height);
      // Canvas background is kept transparent

      let stepIndex = 0;

      const mouse = animationStateRef.current.mouse;
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      if (elapsed < 800) {
        stepIndex = 0;
        const t = elapsed / 800;

        particles.forEach((p) => {
          p.x = p.originX + Math.sin(elapsed * 0.006 + p.delay) * 16;
          p.y = p.originY + Math.cos(elapsed * 0.006 + p.delay) * 16;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.globalAlpha = p.alpha * t;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      } else if (elapsed < 2200) {
        stepIndex = 1;
        const t = (elapsed - 800) / 1400;
        const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        particles.forEach((p) => {
          p.x = p.originX + (p.targetX - p.originX) * easeT;
          p.y = p.originY + (p.targetY - p.originY) * easeT;

          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0.15, 1 - easeT * 0.7);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - easeT * 0.3), 0, Math.PI * 2);
          ctx.fill();
        });

        drawSymbolPath(easeT * 0.6, 0, floatY);
      } else if (elapsed < 2800) {
        stepIndex = 2;
        const t = (elapsed - 2200) / 600;
        const circuitGlow = Math.sin(t * Math.PI) * 22 + 10;

        if (!sparkTriggered && elapsed > 2400) {
          spawnSparksAtNodes();
          sparkTriggered = true;
        }

        drawSymbolPath(0.7, circuitGlow, floatY);
      } else if (elapsed < 3400) {
        stepIndex = 3;
        const t = (elapsed - 2800) / 600;
        drawSymbolPath(0.7 + t * 0.3, 12 * (1 - t * 0.5), floatY);
      } else if (elapsed < 4200) {
        stepIndex = 4;
        const textProgress = (elapsed - 3400) / 800;
        drawSymbolPath(1, 6, floatY);
        drawWordmark(textProgress, 0, 1, floatY);
      } else if (elapsed < 4800) {
        stepIndex = 5;
        const sweepProgress = (elapsed - 4200) / 600;
        drawSymbolPath(1, 8, floatY);
        drawWordmark(1, sweepProgress, 1, floatY);
      } else if (elapsed < 5400) {
        stepIndex = 6;
        const pulseT = (elapsed - 4800) / 600;
        const scale = 1 + Math.sin(pulseT * Math.PI) * 0.04;
        drawSymbolPath(1, 10 * Math.sin(pulseT * Math.PI), floatY);
        drawWordmark(1, 0, scale, floatY);
      } else {
        stepIndex = 7;
        drawSymbolPath(1, 6, floatY);

        let scale = 1;
        if (mouse.x > 0) {
          const dx = mouse.x - width / 2;
          const dy = mouse.y - height / 2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            scale = 1 + (1 - dist / mouse.radius) * 0.03;
          }
        }

        drawWordmark(1, 0, scale, floatY);

        if (animationStateRef.current.isPlaying) {
          animationStateRef.current.isPlaying = false;
          if (onSequenceComplete) onSequenceComplete();
        }
      }

      sparks.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.06;
        s.life += 1;
        const alpha = 1 - s.life / s.maxLife;

        if (alpha > 0) {
          ctx.fillStyle = s.color;
          ctx.shadowColor = s.color;
          ctx.shadowBlur = 8;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(s.x, s.y + floatY, s.size * alpha, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
      sparks = sparks.filter((s) => s.life < s.maxLife);

      setCurrentStepIndex(stepIndex);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / dpr / rect.width;
      const scaleY = canvas.height / dpr / rect.height;
      animationStateRef.current.mouse.targetX = (e.clientX - rect.left) * scaleX;
      animationStateRef.current.mouse.targetY = (e.clientY - rect.top) * scaleY;
    };

    const handleMouseLeave = () => {
      animationStateRef.current.mouse.targetX = -1000;
      animationStateRef.current.mouse.targetY = -1000;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [width, height, theme, onSequenceComplete]);

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1220]">
        <canvas ref={canvasRef} className="block max-w-full cursor-pointer" onClick={restartAnimation} />

        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-md border border-white/10 text-xs font-semibold font-['Sora'] text-cyan-400 flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{stepsList[currentStepIndex]}</span>
        </div>

        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <button
            onClick={restartAnimation}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-['Sora'] text-xs font-bold tracking-wide shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
            Replay Animation (60 FPS)
          </button>
        </div>
      </div>
    </div>
  );
};
